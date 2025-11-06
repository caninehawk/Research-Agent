import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Clock,
  FilePlus2,
  Library,
  MessageSquarePlus,
  MoreHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { usePaperLibrary, useChatList, useCreateChat, useDeleteChat, useDuplicateChat } from "@/api/hooks"
import { compactDate } from "@/lib/utils"
import type { Chat } from "@/types"

interface LeftSidebarProps {
  onOpenUpload: () => void
}

export function LeftSidebar({ onOpenUpload }: LeftSidebarProps) {
  const { chatId } = useParams<{ chatId: string }>()
  const { data: papers } = usePaperLibrary()
  const { data: chats } = useChatList()
  const navigate = useNavigate()
  const createChat = useCreateChat()
  const deleteChat = useDeleteChat()
  const duplicateChat = useDuplicateChat()

  const groups = useMemo(() => groupChats(chats ?? []), [chats])

  return (
    <aside className="flex h-full w-full flex-col bg-background" aria-label="Sidebar with paper library and chat history">
      <div className="flex items-center gap-2 px-3 py-3">
        <Button
          className="flex-1"
          onClick={async () => {
            const chat = await createChat.mutateAsync({})
            navigate(`/chat/${chat.id}`)
          }}
        >
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Upload paper"
          onClick={onOpenUpload}
        >
          <FilePlus2 className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-4 px-3 pb-6 pt-2 text-sm">
          <section aria-label="Paper library" className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                Paper Library
              </span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onOpenUpload}>
                Add
              </Button>
            </div>
            <div className="space-y-1">
              {papers?.map((paper) => (
                <button
                  key={paper.id}
                  type="button"
                  className="group flex w-full flex-col rounded-md border border-transparent px-2 py-2 text-left transition hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="truncate font-medium text-sm">{paper.title}</span>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{paper.authors.slice(0, 2).join(", ")}</span>
                    <Badge variant={paper.status === "indexed" ? "outline" : "muted"}>
                      {paper.status}
                    </Badge>
                  </div>
                </button>
              ))}
              {papers?.length === 0 && (
                <p className="rounded-md border border-dashed border-border px-2 py-6 text-center text-xs text-muted-foreground">
                  Upload a paper to begin.
                </p>
              )}
            </div>
          </section>
          <Separator />
          <section aria-label="Chat history" className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="h-4 w-4" /> Recent Chats
            </h2>
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.label} className="space-y-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">
                    {group.label}
                  </p>
                  {group.chats.map((chat) => {
                    const isActive = chat.id === chatId
                    return (
                      <div
                        key={chat.id}
                        className={`group flex items-center gap-2 rounded-md px-2 py-2 text-left transition ${isActive ? "bg-secondary/70 text-foreground" : "hover:bg-muted/60"}`}
                      >
                        <button
                          type="button"
                          className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => navigate(`/chat/${chat.id}`)}
                        >
                          <span className="truncate text-sm font-medium">
                            {chat.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {compactDate(chat.updatedAt)}
                          </span>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Chat actions" className="h-7 w-7 opacity-0 transition group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onSelect={() => navigate(`/chat/${chat.id}`)}>
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={async () => {
                                const duplicated = await duplicateChat.mutateAsync(chat.id)
                                navigate(`/chat/${duplicated.id}`)
                              }}
                            >
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10"
                              onSelect={() => deleteChat.mutate(chat.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })}
                </div>
              ))}
              {groups.length === 0 && (
                <p className="rounded-md border border-dashed border-border px-2 py-6 text-center text-xs text-muted-foreground">
                  Start a new chat to see it here.
                </p>
              )}
            </div>
          </section>
        </nav>
      </ScrollArea>
    </aside>
  )
}

function groupChats(chats: Chat[]) {
  if (chats.length === 0) return []
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

  const today: Chat[] = []
  const thisWeek: Chat[] = []
  const earlier: Chat[] = []

  chats.forEach((chat) => {
    const updated = new Date(chat.updatedAt)
    if (updated >= startOfToday) {
      today.push(chat)
    } else if (updated >= startOfWeek) {
      thisWeek.push(chat)
    } else {
      earlier.push(chat)
    }
  })

  const groups = []
  if (today.length) groups.push({ label: "Today", chats: today })
  if (thisWeek.length) groups.push({ label: "This week", chats: thisWeek })
  if (earlier.length) groups.push({ label: "Earlier", chats: earlier })
  return groups
}
