import type { IntentHint } from "@/types"

const KEYWORDS: Array<{ match: RegExp; hint: Omit<IntentHint, "id"> }> = [
  {
    match: /\b(dataset|data set|corpus|corpora|data split|split)\b/i,
    hint: {
      match: "dataset",
      icon: "Database",
      action: "Open Facts tab",
      description: "Inspect datasets, splits, and licenses in Facts.",
    },
  },
  {
    match: /\b(license|licence|open source|code|repository)\b/i,
    hint: {
      match: "license",
      icon: "FileCode",
      action: "Review license",
      description: "Check licensing and code links in Facts.",
    },
  },
  {
    match: /\b(limitation|risk|gap|concern)\b/i,
    hint: {
      match: "gaps",
      icon: "TriangleAlert",
      action: "Open Gaps tab",
      description: "See grounded and speculative gaps in the Gaps view.",
    },
  },
  {
    match: /\b(reproduce|reproducibility|baseline|hyperparam|training|hardware)\b/i,
    hint: {
      match: "repro",
      icon: "Cpu",
      action: "Open Repro card",
      description: "Review hardware, baselines, and hyperparameters.",
    },
  },
]

export function detectIntentHints(prompt: string): IntentHint[] {
  if (!prompt.trim()) return []
  const matches: IntentHint[] = []
  KEYWORDS.forEach(({ match, hint }) => {
    if (match.test(prompt)) {
      matches.push({
        id: `${hint.match}-${matches.length}`,
        ...hint,
      })
    }
  })
  return matches
}
