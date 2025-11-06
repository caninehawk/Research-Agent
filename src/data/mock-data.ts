import type {
  Chat,
  Citation,
  GapInsight,
  Message,
  PaperMeta,
  ReproCard,
  ResearchFacts,
} from "@/types"

const now = new Date()

const paperOneAdded = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString()
const paperTwoAdded = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString()

export const mockPapers: PaperMeta[] = [
  {
    id: "paper-1",
    title:
      "SimVLM: Simple Visual Language Model Pretraining with Weak Supervision",
    authors: ["Z. Chen", "R. Pang", "S. Xie", "N. Kalluri", "J. N. Devlin"],
    venue: "ICLR",
    year: 2022,
    doi: "10.48550/arXiv.2108.10904",
    arxivId: "2108.10904",
    status: "indexed",
    pages: 18,
    addedAt: paperOneAdded,
    sizeInKb: 3200,
  },
  {
    id: "paper-2",
    title:
      "DoReMi: Optimizing Data Mixtures Speeds Up Language Model Pretraining",
    authors: ["N. Santhanam", "Z. Dai", "Y. Tay", "S. Narang"],
    venue: "NeurIPS",
    year: 2023,
    status: "indexed",
    pages: 24,
    addedAt: paperTwoAdded,
    sizeInKb: 4120,
  },
]

const baseChatCreated = new Date(
  now.getTime() - 1000 * 60 * 60 * 24 * 3,
).toISOString()

export const mockChats: Chat[] = [
  {
    id: "chat-1",
    name: "Dataset coverage analysis",
    createdAt: baseChatCreated,
    updatedAt: new Date(
      now.getTime() - 1000 * 60 * 60 * 2,
    ).toISOString(),
    paperIds: ["paper-1"],
    mode: "qa",
    folderId: null,
  },
  {
    id: "chat-2",
    name: "Reviewer notes on DoReMi",
    createdAt: new Date(
      now.getTime() - 1000 * 60 * 60 * 24 * 2,
    ).toISOString(),
    updatedAt: new Date(
      now.getTime() - 1000 * 60 * 60 * 12,
    ).toISOString(),
    paperIds: ["paper-2"],
    mode: "reviewer",
    folderId: null,
  },
]

export const mockCitations: Citation[] = [
  {
    ref: 1,
    paperId: "paper-1",
    page: 5,
    snippet:
      "The ALIGN dataset accounts for 60% of pretraining examples, emphasizing web-scale weak supervision.",
  },
  {
    ref: 2,
    paperId: "paper-1",
    page: 7,
    snippet:
      "SimVLM achieves a 83.4 CIDEr score on COCO Captions without task-specific finetuning.",
  },
]

export const mockMessages: Message[] = [
  {
    id: "chat-1-msg-1",
    chatId: "chat-1",
    role: "user",
    content: "What datasets were used to pretrain SimVLM?",
    createdAt: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "chat-1-msg-2",
    chatId: "chat-1",
    role: "assistant",
    content:
      "SimVLM relies primarily on the ALIGN corpus (weakly-labeled web image-text pairs) complemented by Conceptual Captions and additional web mixes for robustness. The paper stresses that ALIGN constitutes the majority of pretraining data, balancing scale with noisy supervision while smaller curated datasets cover long-tail phenomena.[1][2]",
    createdAt: new Date(now.getTime() - 1000 * 60 * 44).toISOString(),
    citations: mockCitations,
  },
  {
    id: "chat-1-msg-3",
    chatId: "chat-1",
    role: "user",
    content: "Any reproducibility red flags?",
    createdAt: new Date(now.getTime() - 1000 * 60 * 25).toISOString(),
  },
]

export const mockFacts: Record<string, ResearchFacts> = {
  "paper-1": {
    datasets: ["ALIGN", "Conceptual Captions 3M", "COCO Captions"],
    metrics: [
      { name: "CIDEr", value: "83.4", citation: 2 },
      { name: "BLEU-4", value: "38.8", citation: 2 },
    ],
    codeRepositories: ["https://github.com/google-research/simvlm"],
    license: "Apache-2.0",
  },
  "paper-2": {
    datasets: ["Pile", "C4", "Books"],
    metrics: [
      { name: "Perplexity", value: "15.2", citation: 1 },
      { name: "Accuracy", value: "67.5%", citation: 1 },
    ],
    codeRepositories: ["https://github.com/google-research/doremi"],
    license: "MIT",
  },
}

export const mockReproCards: Record<string, ReproCard> = {
  "paper-1": {
    task: "Vision-language pretraining",
    model: "SimVLM (Base/1.4B)",
    data: "ALIGN (1.8B pairs) + CC3M",
    metrics: ["CIDEr", "BLEU-4", "VQA accuracy"],
    baselines: ["ViT-GPT2", "OFA"],
    hardware: "TPU v4 Pods",
    hyperparams: {
      optimizer: "Adam",
      lr: "1e-4 warmup, cosine decay",
      batch_size: "4096",
    },
    ablations: ["Data mixture ratios", "Caption length truncation"],
  },
  "paper-2": {
    task: "Language model pretraining efficiency",
    model: "DoReMi mixture policy",
    data: "Mixture of Pile, C4, curated corpora",
    metrics: ["Valid perplexity", "BIG-bench hard score"],
    baselines: ["Uniform sampling", "Temperature-based sampling"],
    hardware: "A100 (32GB) cluster",
    hyperparams: {
      optimizer: "AdamW",
      lr: "5e-4",
      batch_size: "2048 tokens per device",
    },
    ablations: ["Mixture adaptation steps", "Reward smoothing"],
  },
}

export const mockGaps: Record<string, GapInsight[]> = {
  "paper-1": [
    {
      id: "gap-1",
      label: "grounded",
      summary:
        "Reproducibility limited by access to ALIGN data; paper does not provide sampling shards or licensing details.",
      citation: 1,
    },
    {
      id: "gap-2",
      label: "speculative",
      summary:
        "Alignment strategy may struggle with low-resource languages due to English-dominant captions.",
      citation: 2,
    },
  ],
  "paper-2": [
    {
      id: "gap-3",
      label: "grounded",
      summary:
        "Training cost estimates are reported without variance, making budgeting uncertain.",
      citation: 1,
    },
  ],
}
