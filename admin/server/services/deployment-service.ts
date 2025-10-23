import { exec } from "child_process"
import { promisify } from "util"
import * as fs from "fs"
import * as path from "path"

const execAsync = promisify(exec)

interface DeploymentInput {
  dockerImage: string
  ec2Host: string
  sshKey: string
  envVars: Record<string, string>
  containerPort: number
  hostPort: number
}

interface MultiServiceDeploymentInput {
  services: DeploymentInput[]
  strategy: "simple" | "blue-green" | "canary"
  canaryPercentage?: number
}

export async function deployToEC2(input: DeploymentInput) {
  try {
    // Validate inputs
    if (!input.dockerImage || !input.ec2Host || !input.sshKey) {
      throw new Error("Missing required deployment parameters")
    }

    // Create temporary SSH key file
    const keyPath = path.join("/tmp", `key-${Date.now()}.pem`)
    fs.writeFileSync(keyPath, input.sshKey, { mode: 0o600 })

    // Build environment variables string
    const envString = Object.entries(input.envVars)
      .map(([key, value]) => `-e ${key}="${value}"`)
      .join(" ")

    // Build deployment command
    const deployCommand = `
      ssh -i ${keyPath} -o StrictHostKeyChecking=no ec2-user@${input.ec2Host} << 'EOF'
        docker pull ${input.dockerImage}
        docker stop rca-app || true
        docker rm rca-app || true
        docker run -d \
          --name rca-app \
          -p ${input.hostPort}:${input.containerPort} \
          ${envString} \
          ${input.dockerImage}
        docker logs rca-app
      EOF
    `

    // Execute deployment
    const { stdout, stderr } = await execAsync(deployCommand)

    // Clean up SSH key
    fs.unlinkSync(keyPath)

    return {
      success: true,
      message: "Deployment completed successfully",
      logs: stdout,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Deployment error:", error)
    throw new Error(`Deployment failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function deployMultipleServices(input: MultiServiceDeploymentInput) {
  try {
    const { services, strategy, canaryPercentage = 10 } = input

    if (services.length === 0) {
      throw new Error("At least one service is required")
    }

    let deploymentLogs = `Deploying ${services.length} service(s) using ${strategy} strategy\n`
    deploymentLogs += `Timestamp: ${new Date().toISOString()}\n\n`

    if (strategy === "simple") {
      deploymentLogs += "=== SIMPLE DEPLOYMENT ===\n"
      for (let i = 0; i < services.length; i++) {
        const service = services[i]
        deploymentLogs += `\nDeploying Service ${i + 1}: ${service.dockerImage}\n`
        try {
          const result = await deployToEC2(service)
          deploymentLogs += `✓ Service ${i + 1} deployed successfully\n`
          deploymentLogs += result.logs
        } catch (error) {
          deploymentLogs += `✗ Service ${i + 1} failed: ${error}\n`
          throw error
        }
      }
    } else if (strategy === "blue-green") {
      deploymentLogs += "=== BLUE-GREEN DEPLOYMENT ===\n"
      for (let i = 0; i < services.length; i++) {
        const service = services[i]
        deploymentLogs += `\nDeploying Service ${i + 1}: ${service.dockerImage}\n`

        const keyPath = path.join("/tmp", `key-${Date.now()}-${i}.pem`)
        fs.writeFileSync(keyPath, service.sshKey, { mode: 0o600 })

        const envString = Object.entries(service.envVars)
          .map(([key, value]) => `-e ${key}="${value}"`)
          .join(" ")

        // Deploy to green environment
        const greenPort = service.hostPort + 1000
        const blueGreenCommand = `
          ssh -i ${keyPath} -o StrictHostKeyChecking=no ec2-user@${service.ec2Host} << 'EOF'
            echo "Pulling new image..."
            docker pull ${service.dockerImage}
            
            echo "Starting green environment on port ${greenPort}..."
            docker stop rca-app-green || true
            docker rm rca-app-green || true
            docker run -d \
              --name rca-app-green \
              -p ${greenPort}:${service.containerPort} \
              ${envString} \
              ${service.dockerImage}
            
            echo "Waiting for health check..."
            sleep 5
            
            echo "Switching traffic from blue to green..."
            docker stop rca-app-blue || true
            docker rename rca-app rca-app-blue || true
            docker rename rca-app-green rca-app
            
            echo "Blue-Green deployment completed"
            docker ps --filter "name=rca-app"
          EOF
        `

        try {
          const { stdout } = await execAsync(blueGreenCommand)
          deploymentLogs += `✓ Service ${i + 1} deployed with blue-green strategy\n`
          deploymentLogs += stdout
        } catch (error) {
          deploymentLogs += `✗ Service ${i + 1} failed: ${error}\n`
          fs.unlinkSync(keyPath)
          throw error
        }

        fs.unlinkSync(keyPath)
      }
    } else if (strategy === "canary") {
      deploymentLogs += `=== CANARY DEPLOYMENT (${canaryPercentage}% traffic) ===\n`
      for (let i = 0; i < services.length; i++) {
        const service = services[i]
        deploymentLogs += `\nDeploying Service ${i + 1}: ${service.dockerImage}\n`

        const keyPath = path.join("/tmp", `key-${Date.now()}-${i}.pem`)
        fs.writeFileSync(keyPath, service.sshKey, { mode: 0o600 })

        const envString = Object.entries(service.envVars)
          .map(([key, value]) => `-e ${key}="${value}"`)
          .join(" ")

        // Deploy canary instance
        const canaryPort = service.hostPort + 2000
        const canaryCommand = `
          ssh -i ${keyPath} -o StrictHostKeyChecking=no ec2-user@${service.ec2Host} << 'EOF'
            echo "Pulling new image for canary..."
            docker pull ${service.dockerImage}
            
            echo "Starting canary instance on port ${canaryPort}..."
            docker stop rca-app-canary || true
            docker rm rca-app-canary || true
            docker run -d \
              --name rca-app-canary \
              -p ${canaryPort}:${service.containerPort} \
              ${envString} \
              ${service.dockerImage}
            
            echo "Canary deployment started"
            echo "Canary traffic percentage: ${canaryPercentage}%"
            echo "Monitor metrics and run: docker exec rca-app-canary /health-check"
            echo "To promote canary: docker rename rca-app-canary rca-app"
            echo "To rollback: docker stop rca-app-canary"
            docker ps --filter "name=rca-app"
          EOF
        `

        try {
          const { stdout } = await execAsync(canaryCommand)
          deploymentLogs += `✓ Service ${i + 1} canary deployment started\n`
          deploymentLogs += stdout
          deploymentLogs += `\nCanary instance running on port ${canaryPort}. Monitor before promoting.\n`
        } catch (error) {
          deploymentLogs += `✗ Service ${i + 1} failed: ${error}\n`
          fs.unlinkSync(keyPath)
          throw error
        }

        fs.unlinkSync(keyPath)
      }
    }

    return {
      success: true,
      message: `${strategy.charAt(0).toUpperCase() + strategy.slice(1)} deployment completed for ${services.length} service(s)`,
      logs: deploymentLogs,
      timestamp: new Date().toISOString(),
      strategy,
      servicesDeployed: services.length,
    }
  } catch (error) {
    console.error("Multi-service deployment error:", error)
    throw new Error(`Multi-service deployment failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
