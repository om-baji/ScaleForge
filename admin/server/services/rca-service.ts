import { searchLogs } from "./pinecone-service"

export async function analyzeLogs(issueDescription: string) {
  try {
    // Search for relevant logs
    const logs = await searchLogs(issueDescription, 10)

    // Format logs for LLM context
    const logsContext = formatLogsForPrompt(logs)

    // Call Groq API for analysis
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
              "You are an expert SRE assisting with incident triage. Be precise and concise. Use ONLY the provided logs context and the described symptoms. Return pragmatic findings and concrete fixes.",
          },
          {
            role: "user",
            content: `Symptoms:\n${issueDescription}\n\nRelevant logs (top-k):\n${logsContext}\n\nProvide a structured root-cause assessment with: 1) Root Cause, 2) Affected Service, 3) Severity, 4) Possible Fixes.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    })

    const data = await response.json()

    return {
      analysis: data.choices[0].message.content,
      logs: logs,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("RCA analysis error:", error)
    throw error
  }
}

function formatLogsForPrompt(logs: any[]): string {
  if (!logs || logs.length === 0) {
    return "No relevant logs were retrieved from the vector store."
  }

  const lines = logs.map((log) => {
    const prefix = `[${log.index}] id=${log.id} score=${log.score?.toFixed(3)} service=${log.service} level=${log.level} ts=${log.timestamp}`
    const text = log.text ? `    ${log.text.substring(0, 200)}` : ""
    return [prefix, text].filter(Boolean).join("\n")
  })

  return lines.join("\n")
}
