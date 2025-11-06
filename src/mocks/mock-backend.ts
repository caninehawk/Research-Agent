import {
  mockChats,
  mockFacts,
  mockGaps,
  mockMessages,
  mockPapers,
  mockReproCards,
} from "@/data/mock-data"
import { uid } from "@/lib/id"
import type {
  AskRequest,
  AskResponseStreamChunk,
  Chat,
  ChatFolder,
  Citation,
  GapInsight,
  Message,
  PaperId,
  PaperMeta,
  ReproCard,
  ResearchFacts,
  SourcePayload,
} from "@/types"

type IngestSubscriber = (payload: {
  paperId: PaperId
  status: PaperMeta["status"]
  progress: number
  error?: string
}) => void

interface AskSession {
  finalAnswer: string
  citations: Citation[]
}

interface ChatDraft {
  chatId: string
  text: string
  updatedAt: string
}

const STREAM_LATENCY = 350

export class MockBackend {
  private papers = new Map<PaperId, PaperMeta>()
  private chats = new Map<string, Chat>()
  private messages = new Map<string, Message[]>()
  private folders = new Map<string, ChatFolder>()
  private facts = new Map<string, ResearchFacts>()
  private reproCards = new Map<string, ReproCard>()
  private gaps = new Map<string, GapInsight[]>()
  private ingestSubscribers = new Map<string, Set<IngestSubscriber>>()
  private drafts = new Map<string, ChatDraft>()

  constructor() {
    mockPapers.forEach((paper) => this.papers.set(paper.id, paper))
    mockChats.forEach((chat) => this.chats.set(chat.id, chat))
    mockMessages.forEach((message) => {
      const items = this.messages.get(message.chatId) ?? []
      items.push(message)
      this.messages.set(message.chatId, items)
    })
    Object.entries(mockFacts).forEach(([paperId, facts]) =>
      this.facts.set(paperId, facts),
    )
    Object.entries(mockReproCards).forEach(([paperId, card]) =>
      this.reproCards.set(paperId, card),
    )
    Object.entries(mockGaps).forEach(([paperId, insights]) =>
      this.gaps.set(paperId, insights),
    )
  }

  async listPapers(): Promise<PaperMeta[]> {
    return [...this.papers.values()].sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    )
  }

  async getPaper(paperId: PaperId): Promise<PaperMeta | undefined> {
    return this.papers.get(paperId)
  }

  async ingestPaper(input: { name: string; source: "upload" | "url" }) {
    const id = uid("paper")
    const created: PaperMeta = {
      id,
      title: input.name,
      authors: [],
      status: "processing",
      addedAt: new Date().toISOString(),
    }
    this.papers.set(id, created)
    this.emitIngest(id, { paperId: id, status: "queued", progress: 0 })
    setTimeout(() => {
      this.emitIngest(id, { paperId: id, status: "processing", progress: 40 })
    }, 600)
    setTimeout(() => {
      this.emitIngest(id, { paperId: id, status: "indexed", progress: 100 })
      const existing = this.papers.get(id)
      if (existing) {
        existing.status = "indexed"
        existing.title = `${input.name} (mock)`
        existing.authors = ["Mock Author"]
        existing.year = new Date().getFullYear()
        existing.addedAt = new Date().toISOString()
        this.papers.set(id, existing)
      }
    }, 1600)
    return { paperId: id, status: "processing" }
  }

  subscribeToIngest(paperId: PaperId, listener: IngestSubscriber) {
    const set = this.ingestSubscribers.get(paperId) ?? new Set()
    set.add(listener)
    this.ingestSubscribers.set(paperId, set)
    return () => {
      const current = this.ingestSubscribers.get(paperId)
      if (!current) return
      current.delete(listener)
      if (current.size === 0) {
        this.ingestSubscribers.delete(paperId)
      }
    }
  }

  private emitIngest(paperId: PaperId, payload: Parameters<IngestSubscriber>[0]) {
    const listeners = this.ingestSubscribers.get(paperId)
    if (!listeners) return
    listeners.forEach((listener) => listener(payload))
  }

  async listChats(): Promise<Chat[]> {
    return [...this.chats.values()].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }

  async getChat(chatId: string) {
    return this.chats.get(chatId)
  }

  async createChat(payload?: Partial<Pick<Chat, "name" | "paperIds" | "mode">>) {
    const id = uid("chat")
    const now = new Date().toISOString()
    const chat: Chat = {
      id,
      name: payload?.name ?? "Untitled chat",
      createdAt: now,
      updatedAt: now,
      paperIds: payload?.paperIds ?? [],
      mode: payload?.mode ?? "qa",
      folderId: null,
    }
    this.chats.set(id, chat)
    this.messages.set(id, [])
    return chat
  }

  async updateChat(chatId: string, data: Partial<Chat>) {
    const chat = this.chats.get(chatId)
    if (!chat) throw new Error("Chat not found")
    const updated = { ...chat, ...data, updatedAt: new Date().toISOString() }
    this.chats.set(chatId, updated)
    return updated
  }

  async deleteChat(chatId: string) {
    this.chats.delete(chatId)
    this.messages.delete(chatId)
    this.drafts.delete(chatId)
  }

  async duplicateChat(chatId: string) {
    const chat = this.chats.get(chatId)
    if (!chat) throw new Error("Chat not found")
    const id = uid("chat")
    const now = new Date().toISOString()
    const duplicated: Chat = {
      ...chat,
      id,
      name: `${chat.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    }
    this.chats.set(id, duplicated)
    const messages = (this.messages.get(chatId) ?? []).map((message) => ({
      ...message,
      id: uid("msg"),
      chatId: id,
    }))
    this.messages.set(id, messages)
    return duplicated
  }

  async listMessages(chatId: string) {
    return [...(this.messages.get(chatId) ?? [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  }

  async appendMessage(message: Message) {
    const list = this.messages.get(message.chatId) ?? []
    list.push(message)
    this.messages.set(message.chatId, list)
    const chat = this.chats.get(message.chatId)
    if (chat) {
      chat.updatedAt = message.createdAt
      this.chats.set(chat.id, chat)
    }
    return message
  }

  async getFacts(paperId: PaperId) {
    return this.facts.get(paperId)
  }

  async getReproCard(paperId: PaperId) {
    return this.reproCards.get(paperId)
  }

  async getGaps(paperId: PaperId) {
    return this.gaps.get(paperId) ?? []
  }

  async listFolders() {
    return [...this.folders.values()]
  }

  async createFolder(name: string) {
    const id = uid("folder")
    const now = new Date().toISOString()
    const folder: ChatFolder = {
      id,
      name,
      createdAt: now,
      updatedAt: now,
    }
    this.folders.set(id, folder)
    return folder
  }

  async saveDraft(chatId: string, text: string) {
    const now = new Date().toISOString()
    this.drafts.set(chatId, { chatId, text, updatedAt: now })
    return this.drafts.get(chatId)
  }

  async getDraft(chatId: string) {
    return this.drafts.get(chatId)
  }

  async ask(request: AskRequest): Promise<AsyncGenerator<AskResponseStreamChunk>> {
    const session = this.buildAskSession(request)
    const answers = this.tokenize(session.finalAnswer)
    const generator = this.streamTokens(answers, session.citations)
    const now = new Date().toISOString()
    await this.appendMessage({
      id: uid("msg"),
      chatId: request.chatId,
      role: "assistant",
      content: session.finalAnswer,
      createdAt: now,
      citations: session.citations,
    })
    return generator
  }

  private *tokenize(answer: string) {
    const parts = answer.split(/(\s+)/)
    for (const part of parts) {
      if (part) yield part
    }
  }

  private async *streamTokens(
    tokens: Generator<string>,
    citations: Citation[],
  ): AsyncGenerator<AskResponseStreamChunk> {
    for (const token of tokens) {
      await new Promise((resolve) => setTimeout(resolve, STREAM_LATENCY))
      yield { type: "token", data: token }
    }
    await new Promise((resolve) => setTimeout(resolve, STREAM_LATENCY))
    const payload: SourcePayload = { citations }
    yield { type: "sources", data: payload }
    yield { type: "final", data: "" }
  }

  private buildAskSession(request: AskRequest): AskSession {
    const papers = request.paperIds
      .map((id) => this.papers.get(id))
      .filter((paper): paper is PaperMeta => Boolean(paper))
    const baseAnswer =
      request.mode === "reviewer"
        ? "The paper demonstrates strong empirical results but requires more detail on reproducibility. Key datasets and evaluation metrics are summarised below."
        : request.mode === "ideation"
          ? "Here are some follow-up project directions and dataset considerations inspired by the attached papers."
          : request.mode === "explainer"
            ? "Let me unpack the methodology and its implications."
            : "Summary of relevant findings:"
    const paperTitles = papers.map((paper) => paper.title).join("; ")
    const citations =
      papers.length > 0
        ? papers.map((paper, index) => ({
            ref: index + 1,
            paperId: paper.id,
            page: 2 + index * 3,
            snippet: `Key methodological insight from ${paper.title} around ${
              paper.year ?? "recent"
            } evaluation.`,
          }))
        : []
    const finalAnswer = `${baseAnswer} ${
      paperTitles ? `Focusing on: ${paperTitles}.` : "Add a paper to ground the discussion."
    }`
    return { finalAnswer, citations }
  }
}
