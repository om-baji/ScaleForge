import type { NextRequest } from "next/server"

export async function createContext(opts?: { req: NextRequest }) {
  const token = opts?.req?.headers.get("authorization")?.replace("Bearer ", "")

  let isAuthenticated = false
  if (token) {
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8")
      isAuthenticated = decoded.includes(":")
    } catch {
      isAuthenticated = false
    }
  }

  return {
    token,
    isAuthenticated,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
