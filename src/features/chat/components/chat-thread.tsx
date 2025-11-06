import { useEffect, useMemo, useRef } from "react"
import { ClipboardIcon, RefreshCw, Reply } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MarkdownWithCitations } from "@/components/markdown/markdown-with-citations"
import type { Citation, Message } from "@/types"
import { timeAgo } from "@/lib/utils"

interface ChatThreadProps {
  messages: Message[]
  streamingMessage?: {
    id: string
    content: string
    citations?: Citation[]
  }
  onRegenerate?: (message: Message) => void
  onQuote?: (message: Message) => void
  onOpenCitation?: (citation: Citation) => void
}

export function ChatThread({
  messages,
  streamingMessage,
  onRegenerate,
  onQuote,
  onOpenCitation,
}: ChatThreadProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const fullMessages = useMemo(() => {
    if (!streamingMessage) return messages
    const existing = messages.filter((message) => message.id !== streamingMessage.id)
    return [
      ...existing,
      {
        id: streamingMessage.id,
        chatId: streamingMessage.id,
        role: "assistant" as const,
        content: streamingMessage.content,
        createdAt: new Date().toISOString(),
        citations: streamingMessage.citations,
      },
    ]
  }, [messages, streamingMessage])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [fullMessages])

  return (
    <div
      ref={containerRef}
      className="flex-1 space-y-6 overflow-y-auto px-4 py-6 scrollbar-thin"
      role="log"
      aria-live="polite"
      data-testid="chat-thread"
    >
      {fullMessages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onRegenerate={onRegenerate}
          onQuote={onQuote}
          onOpenCitation={onOpenCitation}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

interface MessageItemProps {
  message: Message
  onRegenerate?: (message: Message) => void
  onQuote?: (message: Message) => void
  onOpenCitation?: (citation: Citation) => void
}

function MessageItem({ message, onRegenerate, onQuote, onOpenCitation }: MessageItemProps) {
  const isAssistant = message.role === "assistant"
  const isUser = message.role === "user"
  const initials = isUser ? "You" : "RA"

  return (
    <article className="group flex gap-3 rounded-lg border border-transparent px-2 py-3 transition hover:border-border" aria-live="polite">
      <Avatar className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
        <AvatarFallback>{initials.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col gap-2">
        <header className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium uppercase tracking-wide">{isUser ? "Professor" : "Research Agent"}</span>
          <span aria-hidden="true">•</span>
          <time dateTime={message.createdAt}>{timeAgo(message.createdAt)}</time>
        </header>
        <div className="prose prose-sm max-w-none leading-relaxed dark:prose-invert">
          {isAssistant ? (
            <MarkdownWithCitations
              content={message.content}
              citations={message.citations}
              onOpenCitation={onOpenCitation}
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          )}
        </div>
        <footer className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={async () => {
              await navigator.clipboard.writeText(message.content)
            }}
          >
            <ClipboardIcon className="h-3.5 w-3.5" />
            Copy
          </Button>
          {isAssistant && onQuote ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onQuote(message)}
            >
              <Reply className="h-3.5 w-3.5" />
              Quote
            </Button>
          ) : null}
          {isAssistant && onRegenerate ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onRegenerate(message)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </Button>
          ) : null}
        </footer>
      </div>
    </article>
  )
}
