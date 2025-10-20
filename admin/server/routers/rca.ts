import { router, publicProcedure } from "../trpc"
import { z } from "zod"
import { analyzeLogs } from "@/server/services/rca-service"

export const rcaRouter = router({
  analyze: publicProcedure.input(z.object({ issue: z.string() })).mutation(async ({ input }) => {
    try {
      const result = await analyzeLogs(input.issue)
      return result
    } catch (error) {
      throw new Error(`RCA analysis failed: ${error}`)
    }
  }),

  chat: publicProcedure
    .input(z.object({ message: z.string(), history: z.array(z.object({ role: z.string(), content: z.string() })) }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gemma2-9b-it",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert SRE assistant helping with incident analysis and troubleshooting. Be concise and practical.",
              },
              ...input.history,
              { role: "user", content: input.message },
            ],
            temperature: 0.3,
            max_tokens: 1024,
          }),
        })

        const data = await response.json()
        return {
          message: data.choices[0].message.content,
        }
      } catch (error) {
        throw new Error(`Chat failed: ${error}`)
      }
    }),
})
