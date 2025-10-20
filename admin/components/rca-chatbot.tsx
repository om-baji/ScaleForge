"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader, Zap } from "lucide-react"
import { trpc } from "@/lib/trpc-client"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function RCAChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your RCA Assistant. I can help you analyze incidents, identify root causes, and suggest remediation steps. What incident would you like to investigate?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestedPrompts = [
    "Analyze database connection issues",
    "What causes memory leaks?",
    "How to prevent latency spikes?",
    "Troubleshoot API timeouts",
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Convert messages to format expected by tRPC
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Call the tRPC chat mutation
      const response = await trpc.rca.chat.mutate({
        message: input,
        history: history,
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">AI RCA Assistant</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Ask questions about incidents and get intelligent analysis powered by AI
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-2xl px-4 py-3 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-card border border-border text-foreground rounded-bl-none"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
              >
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border text-foreground px-4 py-3 rounded-lg flex items-center gap-2 rounded-bl-none">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing...</span>
            </div>
          </div>
        )}
        {messages.length === 1 && !isLoading && (
          <div className="mt-8 space-y-3">
            <p className="text-muted-foreground text-sm font-medium">Suggested prompts:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="flex items-center gap-2 p-3 bg-secondary border border-border rounded-lg hover:bg-muted transition-colors text-left text-sm text-foreground"
                >
                  <Zap className="w-4 h-4 text-accent flex-shrink-0" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border px-6 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask about incidents, root causes, or remediation..."
            className="flex-1 bg-secondary text-foreground placeholder-muted-foreground rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary border border-border"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
