import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { BookOpen, MessageSquarePlus, PanelRight, PlusCircle, Search } from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandDialogHeader,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { usePaperLibrary, useChatList, useCreateChat, useUpdateChat } from "@/api/hooks"
import { useUIStore } from "@/stores/ui-store"
import type { ShellContext } from "@/app/router"

interface CommandPaletteProps {
  shell: ShellContext
}

export function CommandPalette({ shell }: CommandPaletteProps) {
  const open = useUIStore((state) => state.commandPaletteOpen)
  const setOpen = useUIStore((state) => state.setCommandPaletteOpen)
  const toggleRightPanel = useUIStore((state) => state.toggleRightPanel)
  const { data: papers = [] } = usePaperLibrary()
  const { data: chats = [] } = useChatList()
  const createChat = useCreateChat()
  const updateChat = useUpdateChat()
  const navigate = useNavigate()
  const params = useParams<{ chatId: string }>()

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen(!open)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, setOpen])

  async function handleNewChat() {
    const chat = await createChat.mutateAsync({})
    setOpen(false)
    navigate(`/chat/${chat.id}`)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandDialogHeader
          title="Quick actions"
          description="Search papers, chats, or trigger workspace commands."
        />
        <CommandInput placeholder="Search library or chats…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={handleNewChat}
              className="gap-2"
            >
              <MessageSquarePlus className="h-4 w-4" />
              New chat
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false)
                shell.openUploadDialog()
              }}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Attach paper
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false)
                toggleRightPanel()
              }}
              className="gap-2"
            >
              <PanelRight className="h-4 w-4" />
              Toggle insights panel
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Chats">
            {chats.map((chat) => (
              <CommandItem
                key={chat.id}
                value={chat.name}
                onSelect={() => {
                  setOpen(false)
                  navigate(`/chat/${chat.id}`)
                }}
                className="gap-2"
              >
                <Search className="h-4 w-4 opacity-60" />
                <span className="flex-1 truncate">{chat.name}</span>
                {params.chatId === chat.id ? (
                  <span className="text-xs text-muted-foreground">current</span>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Library">
            {papers.map((paper) => (
              <CommandItem
                key={paper.id}
                value={paper.title}
                onSelect={() => {
                  setOpen(false)
                  if (params.chatId) {
                    const chat = chats.find((item) => item.id === params.chatId)
                    if (chat && !chat.paperIds.includes(paper.id)) {
                      updateChat.mutate({
                        chatId: chat.id,
                        data: { paperIds: [...chat.paperIds, paper.id] },
                      })
                    }
                    navigate(`/chat/${params.chatId}`)
                  } else {
                    navigate("/library")
                  }
                }}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4 opacity-60" />
                <span className="flex-1 truncate">{paper.title}</span>
                {paper.year ? (
                  <span className="text-xs text-muted-foreground">{paper.year}</span>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
