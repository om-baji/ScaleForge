import { router } from "../trpc"
import { rcaRouter } from "./rca"
import { logsRouter } from "./logs"

export const appRouter = router({
  rca: rcaRouter,
  logs: logsRouter,
})

export type AppRouter = typeof appRouter
