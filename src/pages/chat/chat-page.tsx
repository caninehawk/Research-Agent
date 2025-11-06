import { useEffect, useMemo, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, PlusCircle } from "lucide-react"
import { useOutletContext, useParams } from "react-router-dom"

import {
  useAppendMessage,
  useAsk,
  useChat,
  useMessages,
  usePaperLibrary,
  useUpdateChat,
} from "@/api/hooks"
import { ChatThread } from "@/features/chat/components/chat-thread"
import { ChatComposer } from "@/features/chat/components/chat-composer"
import { detectIntentHints } from "@/features/chat/intent"
import type { ShellContext } from "@/app/router"
import { compactDate } from "@/lib/utils"
import { uid } from "@/lib/id"
import type { Chat, Citation, IntentHint, Message } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useUIStore } from "@/stores/ui-store"

export function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const shellContext = useOutletContext<ShellContext>()
  const openUploadDialog = shellContext.openUploadDialog
  const updateAttachedPaperIds = shellContext.setAttachedPaperIds
  const { data: chat, isLoading: chatLoading } = useChat(chatId)
  const { data: messages, isLoading: messagesLoading } = useMessages(chatId)
  const { data: library } = usePaperLibrary()
  const { mutateAsync: appendMessage } = useAppendMessage()
  const askMutation = useAsk()
  const updateChat = useUpdateChat()
  const queryClient = useQueryClient()
  const [composerValue, setComposerValue] = useState("")
  const [streaming, setStreaming] = useState<{
    id: string
    content: string
    citations?: Citation[]
  } | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [pendingMode, setPendingMode] = useState<string | null>(null)
  const setRightPanelTab = useUIStore((state) => state.setRightPanelTab)
  const setRightPanelOpen = useUIStore((state) => state.setRightPanelOpen)
  const enterToSendPref = useUIStore((state) => state.enterToSend)
  const streamingEnabled = useUIStore((state) => state.streamingEnabled)
  const [isRenaming, setIsRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState("")

  const attachedPapers = useMemo(() => {
    if (!chat || !library) return []
    return library.filter((paper) => chat.paperIds.includes(paper.id))
  }, [chat, library])

  useEffect(() => {
    if (chat) {
      setPendingMode(chat.mode)
      setNameDraft(chat.name)
    }
  }, [chat])

  const intentHints = useMemo(
    () => detectIntentHints(composerValue),
    [composerValue],
  )
  const attachedPaperIdsMemo = useMemo(
    () => attachedPapers.map((paper) => paper.id),
    [attachedPapers],
  )
  const attachedPaperKey = attachedPaperIdsMemo.join("|")
  const lastAttachedKeyRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!chatId) return
    const stored = sessionStorage.getItem(`chat-draft-${chatId}`)
    if (stored) {
      setComposerValue(stored)
    } else {
      setComposerValue("")
    }
  }, [chatId])

  useEffect(() => {
    if (!chatId) return
    sessionStorage.setItem(`chat-draft-${chatId}`, composerValue)
  }, [chatId, composerValue])

  useEffect(() => {
    if (lastAttachedKeyRef.current === attachedPaperKey) return
    lastAttachedKeyRef.current = attachedPaperKey
    updateAttachedPaperIds(attachedPaperIdsMemo)
  }, [attachedPaperKey, attachedPaperIdsMemo, updateAttachedPaperIds])

  const handleSend = async () => {
    if (!chat || !chatId) return
    const trimmed = composerValue.trim()
    if (!trimmed) return
    const userMessage: Message = {
      id: uid("msg"),
      chatId,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    setComposerValue("")
    sessionStorage.removeItem(`chat-draft-${chatId}`)
    await appendMessage(userMessage)
    setIsStreaming(true)
    const generator = await askMutation.mutateAsync({
      chatId,
      question: trimmed,
      paperIds: chat.paperIds,
      mode: chat.mode,
    })
    const streamId = uid("msg-stream")
    if (streamingEnabled) {
      setStreaming({
        id: streamId,
        content: "",
        citations: [],
      })
    }
    let aggregated = ""
    let aggregatedCitations: Citation[] = []
    try {
      for await (const chunk of generator) {
        if (chunk.type === "token") {
          if (streamingEnabled) {
            setStreaming((prev) =>
              prev
                ? {
                    ...prev,
                    content: prev.content + chunk.data,
                  }
                : prev,
            )
          } else {
            aggregated += chunk.data
          }
        }
        if (chunk.type === "sources") {
          aggregatedCitations = chunk.data.citations
          if (streamingEnabled) {
            setStreaming((prev) =>
              prev
                ? {
                    ...prev,
                    citations: chunk.data.citations,
                  }
                : prev,
            )
          }
          if (chunk.data.citations.length > 0) {
            const first = chunk.data.citations[0]
            if (first) {
              setRightPanelOpen(true)
              setRightPanelTab("info")
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming failed", error)
    } finally {
      if (streamingEnabled) {
        setStreaming(null)
      } else if (aggregated.length > 0) {
        setStreaming({
          id: streamId,
          content: aggregated,
          citations: aggregatedCitations,
        })
        setTimeout(() => setStreaming(null), 50)
      }
      setIsStreaming(false)
      await queryClient.invalidateQueries({
        queryKey: ["chats", chatId, "messages"],
      })
      await queryClient.invalidateQueries({
        queryKey: ["chats"],
      })
    }
  }

  const handleRemovePaper = async (paperId: string) => {
    if (!chatId || !chat) return
    const next = chat.paperIds.filter((id) => id !== paperId)
    await updateChat.mutateAsync({ chatId, data: { paperIds: next } })
  }

  const handleModeChange = async (mode: Chat["mode"]) => {
    if (!chatId) return
    setPendingMode(mode)
    await updateChat.mutateAsync({ chatId, data: { mode } })
    await queryClient.invalidateQueries({ queryKey: ["chats", chatId] })
  }

  const handleHintAction = (hint: IntentHint) => {
    setRightPanelOpen(true)
    if (hint.match === "dataset" || hint.match === "license") {
      setRightPanelTab("facts")
    } else if (hint.match === "gaps") {
      setRightPanelTab("gaps")
    } else if (hint.match === "repro") {
      setRightPanelTab("repro")
    } else {
      setRightPanelTab("info")
    }
  }

  if (!chatId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Select or create a chat to get started.</p>
      </div>
    )
  }

  if (chatLoading || !chat || messagesLoading) {
    return (
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-1 flex-col gap-4 px-4 py-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-36 w-full rounded-lg" />
        </div>
        <ChatComposer
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          disabled
          mode="qa"
          onModeChange={() => {}}
          attachedPapers={[]}
          onRemovePaper={() => {}}
          onAddPaper={() => {}}
        />
      </div>
    )
  }

  const hasPapers = chat.paperIds.length > 0

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex flex-col gap-1">
          {isRenaming ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                autoFocus
                onKeyDown={async (event) => {
                  if (event.key === "Enter") {
                    await updateChat.mutateAsync({ chatId, data: { name: nameDraft.trim() || chat.name } })
                    setIsRenaming(false)
                  }
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsRenaming(false)
                  setNameDraft(chat.name)
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  await updateChat.mutateAsync({ chatId, data: { name: nameDraft.trim() || chat.name } })
                  setIsRenaming(false)
                }}
              >
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-semibold">{chat.name}</h1>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setNameDraft(chat.name)
                  setIsRenaming(true)
                }}
              >
                Rename
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Created {compactDate(chat.createdAt)} · Updated {compactDate(chat.updatedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={openUploadDialog}
          >
            <PlusCircle className="h-4 w-4" />
            Attach paper
          </Button>
        </div>
      </header>
      {!hasPapers ? (
        <div className="mx-4 mt-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <div>
            <p className="font-medium">No papers attached</p>
            <p className="text-xs text-muted-foreground">
              Attach a paper to ground answers. Responses will rely on general knowledge until then.
            </p>
          </div>
        </div>
      ) : null}
      {attachedPapers.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 text-xs">
          <span className="font-semibold uppercase tracking-wide text-muted-foreground">
            Context
          </span>
          {attachedPapers.map((paper) => (
            <Badge
              key={paper.id}
              variant="outline"
              className="flex items-center gap-1 bg-muted/40"
            >
              {paper.title}
              <button
                type="button"
                className="ml-1 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemovePaper(paper.id)}
                aria-label={`Detach ${paper.title}`}
              >
                Ã—
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
      <ChatThread
        messages={messages ?? []}
        streamingMessage={streaming ?? undefined}
        onOpenCitation={() => {
          setRightPanelOpen(true)
          setRightPanelTab("info")
        }}
      />
      <Separator />
      <ChatComposer
        value={composerValue}
        onChange={setComposerValue}
        onSubmit={handleSend}
        disabled={isStreaming}
        mode={(pendingMode as Chat["mode"]) ?? chat.mode}
        onModeChange={handleModeChange}
        attachedPapers={attachedPapers}
        onRemovePaper={handleRemovePaper}
        onAddPaper={openUploadDialog}
        intentHints={intentHints}
        enterToSend={enterToSendPref}
        onHintAction={handleHintAction}
      />
    </div>
  )
}


