export type PaperId = string

export interface PaperMeta {
  id: PaperId
  title: string
  authors: string[]
  venue?: string
  year?: number
  doi?: string
  arxivId?: string
  status: "indexed" | "processing" | "error" | "queued"
  pages?: number
  thumbUrl?: string
  addedAt: string
  sizeInKb?: number
}

export interface Chat {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  paperIds: PaperId[]
  mode: "qa" | "explainer" | "reviewer" | "ideation"
  folderId?: string | null
}

export interface ChatFolder {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  chatId: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: string
  parentId?: string
  citations?: Citation[]
  isDraft?: boolean
  speculative?: boolean
}

export interface Citation {
  ref: number
  paperId: PaperId
  page: number
  snippet: string
  speculative?: boolean
}

export interface AskRequest {
  chatId: string
  question: string
  paperIds: PaperId[]
  mode: Chat["mode"]
}

export type AskResponseStreamChunk =
  | {
      type: "token"
      data: string
    }
  | {
      type: "final"
      data: string
    }
  | {
      type: "error"
      data: { message: string }
    }
  | {
      type: "sources"
      data: SourcePayload
    }

export interface SourcePayload {
  citations: Citation[]
}

export interface EvidenceItem {
  citation: Citation
  heading: string
  content: string
}

export interface ResearchFacts {
  datasets: string[]
  metrics: Array<{ name: string; value: string; citation?: number }>
  codeRepositories: string[]
  license?: string
}

export interface ReproCard {
  task: string
  model: string
  data: string
  metrics: string[]
  baselines: string[]
  hardware: string
  hyperparams: Record<string, string | number>
  ablations: string[]
}

export interface GapInsight {
  id: string
  label: "grounded" | "speculative"
  summary: string
  citation?: number
}

export interface IntentHint {
  id: string
  match: string
  action: string
  description: string
  icon: string
}

export type ThemeMode = "light" | "dark" | "system"
