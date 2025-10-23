import { router, protectedProcedure } from "../trpc"
import { z } from "zod"
import { deployToEC2, deployMultipleServices } from "@/server/services/deployment-service"

export const deploymentRouter = router({
  deploy: protectedProcedure
    .input(
      z.object({
        dockerImage: z.string().min(1, "Docker image is required"),
        ec2Host: z.string().min(1, "EC2 host is required"),
        sshKey: z.string().min(1, "SSH key is required"),
        envVars: z.record(z.string()),
        containerPort: z.number().default(3000),
        hostPort: z.number().default(3000),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const result = await deployToEC2(input)
        return result
      } catch (error) {
        throw new Error(`Deployment failed: ${error}`)
      }
    }),

  deployMultiple: protectedProcedure
    .input(
      z.object({
        services: z.array(
          z.object({
            dockerImage: z.string().min(1),
            ec2Host: z.string().min(1),
            sshKey: z.string().min(1),
            envVars: z.record(z.string()),
            containerPort: z.number().default(3000),
            hostPort: z.number().default(3000),
          }),
        ),
        strategy: z.enum(["simple", "blue-green", "canary"]).default("simple"),
        canaryPercentage: z.number().min(1).max(100).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const result = await deployMultipleServices(input)
        return result
      } catch (error) {
        throw new Error(`Multi-service deployment failed: ${error}`)
      }
    }),

  getDeploymentHistory: protectedProcedure.query(async () => {
    // In production, fetch from database
    return {
      deployments: [
        {
          id: "1",
          image: "myapp:v1.0.0",
          host: "ec2-52-1-2-3.compute-1.amazonaws.com",
          status: "success",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          logs: "Deployment completed successfully",
        },
        {
          id: "2",
          image: "myapp:v0.9.0",
          host: "ec2-52-1-2-3.compute-1.amazonaws.com",
          status: "success",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          logs: "Deployment completed successfully",
        },
      ],
    }
  }),
})
