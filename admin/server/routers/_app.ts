import { router } from "../trpc"
import { rcaRouter } from "./rca"
import { logsRouter } from "./logs"
import { deploymentRouter } from "./deployment"

export const appRouter = router({
  rca: rcaRouter,
  logs: logsRouter,
  deployment: deploymentRouter,
})

export type AppRouter = typeof appRouter
