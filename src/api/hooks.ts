import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useMockBackend } from "@/mocks/mock-backend-provider"
import type { AskRequest, Chat, ChatFolder, Message } from "@/types"

export function usePaperLibrary() {
  const backend = useMockBackend()
  return useQuery({
    queryKey: ["papers"],
    queryFn: () => backend.listPapers(),
  })
}

export function usePaper(paperId: string | undefined) {
  const backend = useMockBackend()
  return useQuery({
    enabled: Boolean(paperId),
    queryKey: ["papers", paperId],
    queryFn: () => backend.getPaper(paperId!),
  })
}

export function useChatList() {
  const backend = useMockBackend()
  return useQuery({
    queryKey: ["chats"],
    queryFn: () => backend.listChats(),
  })
}

export function useFolders() {
  const backend = useMockBackend()
  return useQuery<ChatFolder[]>({
    queryKey: ["folders"],
    queryFn: () => backend.listFolders(),
  })
}

export function useChat(chatId: string | undefined) {
  const backend = useMockBackend()
  return useQuery({
    enabled: Boolean(chatId),
    queryKey: ["chats", chatId],
    queryFn: () => backend.getChat(chatId!),
  })
}

export function useMessages(chatId: string | undefined) {
  const backend = useMockBackend()
  return useQuery<Message[]>({
    enabled: Boolean(chatId),
    queryKey: ["chats", chatId, "messages"],
    queryFn: () => backend.listMessages(chatId!),
  })
}

export function useCreateChat() {
  const backend = useMockBackend()
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload?: Partial<Pick<Chat, "name" | "paperIds" | "mode">>) =>
      backend.createChat(payload),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["chats"] })
    },
  })
}

export function useUpdateChat() {
  const backend = useMockBackend()
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: string; data: Partial<Chat> }) =>
      backend.updateChat(chatId, data),
    onSuccess: async (_, variables) => {
      await client.invalidateQueries({ queryKey: ["chats"] })
      await client.invalidateQueries({ queryKey: ["chats", variables.chatId] })
    },
  })
}

export function useDeleteChat() {
  const backend = useMockBackend()
  const client = useQueryClient()
  return useMutation({
    mutationFn: (chatId: string) => backend.deleteChat(chatId),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["chats"] })
    },
  })
}

export function useDuplicateChat() {
  const backend = useMockBackend()
  const client = useQueryClient()
  return useMutation({
    mutationFn: (chatId: string) => backend.duplicateChat(chatId),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["chats"] })
    },
  })
}

export function useAppendMessage() {
  const backend = useMockBackend()
  const client = useQueryClient()
  return useMutation({
    mutationFn: (message: Message) => backend.appendMessage(message),
    onSuccess: async (_, message) => {
      await client.invalidateQueries({ queryKey: ["chats", message.chatId, "messages"] })
      await client.invalidateQueries({ queryKey: ["chats"] })
    },
  })
}

export function useAsk() {
  const backend = useMockBackend()
  return useMutation({
    mutationFn: (request: AskRequest) => backend.ask(request),
  })
}

export function useFacts(paperId: string | undefined) {
  const backend = useMockBackend()
  return useQuery({
    enabled: Boolean(paperId),
    queryKey: ["papers", paperId, "facts"],
    queryFn: () => backend.getFacts(paperId!),
  })
}

export function useReproCard(paperId: string | undefined) {
  const backend = useMockBackend()
  return useQuery({
    enabled: Boolean(paperId),
    queryKey: ["papers", paperId, "repro-card"],
    queryFn: () => backend.getReproCard(paperId!),
  })
}

export function useGaps(paperId: string | undefined) {
  const backend = useMockBackend()
  return useQuery({
    enabled: Boolean(paperId),
    queryKey: ["papers", paperId, "gaps"],
    queryFn: () => backend.getGaps(paperId!),
  })
}

export function useIngestPaper() {
  const backend = useMockBackend()
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; source: "upload" | "url" }) =>
      backend.ingestPaper(input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["papers"] })
    },
  })
}
