"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export function useWebSocket() {
  const [data, setData] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  const connect = useCallback((url: string) => {
    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        setIsConnected(true)
      }

      ws.current.onmessage = (event) => {
        setData(event.data)
      }

      ws.current.onerror = () => {
        setIsConnected(false)
      }

      ws.current.onclose = () => {
        setIsConnected(false)
      }
    } catch (error) {
      console.error("WebSocket connection error:", error)
      setIsConnected(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close()
      setIsConnected(false)
    }
  }, [])

  const sendMessage = useCallback(
    (message: string) => {
      if (ws.current && isConnected) {
        ws.current.send(message)
      }
    },
    [isConnected],
  )

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    data,
    isConnected,
    connect,
    disconnect,
    sendMessage,
  }
}
