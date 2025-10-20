import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Get credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPassword) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Validate credentials
    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create a simple token (in production, use JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64")

    return NextResponse.json({
      token,
      username,
    })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
