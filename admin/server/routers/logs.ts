import { router, publicProcedure } from "../trpc"
import { z } from "zod"
import { searchLogs } from "@/server/services/pinecone-service"

export const logsRouter = router({
  search: publicProcedure
    .input(z.object({ query: z.string(), topK: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const results = await searchLogs(input.query, input.topK)
        return results
      } catch (error) {
        throw new Error(`Log search failed: ${error}`)
      }
    }),
})
