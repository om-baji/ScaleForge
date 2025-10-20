import type { NextRequest } from "next/server"

export async function createContext(opts?: { req: NextRequest }) {
  const token = opts?.req?.headers.get("authorization")?.replace("Bearer ", "")

  return {
    token,
    isAuthenticated: !!token,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
