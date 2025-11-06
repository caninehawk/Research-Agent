import { useEffect, useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import type { ReactNode } from "react"
import remarkGfm from "remark-gfm"
import { visit } from "unist-util-visit"
import type { Root, Text } from "mdast"
import type { Parent } from "unist"

import type { Citation } from "@/types"
import { CitationBadge } from "@/features/chat/components/citation-badge"
import { useUIStore } from "@/stores/ui-store"

interface MarkdownWithCitationsProps {
  content: string
  citations?: Citation[]
  onOpenCitation?: (citation: Citation) => void
}

type CitationNode = {
  type: "citation"
  data: {
    ref: number
  }
}

type ShikiHighlighter = {
  codeToHtml: (code: string, options: { lang: string; theme: string }) => string
}

const THEMES = {
  light: "github-light-default",
  dark: "github-dark-default",
}

function createRemarkCitations() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (typeof index !== "number" || !parent) return
      const value = node.value
      if (typeof value !== "string") return
      const matches = [...value.matchAll(/\[(\d+)\]/g)]
      if (matches.length === 0) return
      const children: Array<Text | CitationNode> = []
      let lastIndex = 0
      matches.forEach((match) => {
        const start = match.index ?? 0
        if (start > lastIndex) {
          children.push({
            type: "text",
            value: value.slice(lastIndex, start),
          })
        }
        const ref = Number.parseInt(match[1], 10)
        children.push({
          type: "citation",
          data: { ref: Number.isFinite(ref) ? ref : 0 },
        })
        lastIndex = start + match[0].length
      })
      if (lastIndex < value.length) {
        children.push({
          type: "text",
          value: value.slice(lastIndex),
        })
      }
      parent.children.splice(index, 1, ...children)
    })
  }
}

async function loadHighlighter(): Promise<ShikiHighlighter | null> {
  try {
    const shiki = await import("shiki")
    const highlighter = await shiki.createHighlighter({
      themes: [THEMES.light, THEMES.dark],
      langs: ["javascript", "typescript", "python", "bash", "json", "markdown"],
    })
    return highlighter
  } catch (error) {
    console.warn("Failed to load Shiki highlighter", error)
    return null
  }
}

export function MarkdownWithCitations({
  content,
  citations = [],
  onOpenCitation,
}: MarkdownWithCitationsProps) {
  const themeMode = useUIStore((state) => state.theme)
  const systemPrefersDark =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  const [highlighter, setHighlighter] = useState<ShikiHighlighter | null>(null)

  useEffect(() => {
    let mounted = true
    loadHighlighter().then((loaded) => {
      if (mounted) setHighlighter(loaded)
    })
    return () => {
      mounted = false
    }
  }, [])

  const theme = useMemo(() => {
    if (themeMode === "system") {
      return systemPrefersDark ? THEMES.dark : THEMES.light
    }
    return themeMode === "dark" ? THEMES.dark : THEMES.light
  }, [systemPrefersDark, themeMode])

  const components = useMemo(() => {
    const codeRenderer = ({
      inline,
      className,
      children,
    }: {
      inline?: boolean
      className?: string
      children: ReactNode
    }) => {
      const code = String(children).trim()
      const match = /language-(\w+)/.exec(className ?? "")
      if (inline || !code) {
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 text-[13px] font-mono">
            {children}
          </code>
        )
      }
      if (highlighter && match) {
        const html = highlighter.codeToHtml(code, { lang: match[1], theme })
        return (
          <div
            className="shiki not-prose my-4 overflow-hidden rounded-md border border-border font-mono text-sm [&_pre]:m-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      }
      return (
        <pre className="my-4 overflow-auto rounded-md border border-border bg-muted/60 p-3 font-mono text-sm">
          <code>{code}</code>
        </pre>
      )
    }

    type AnchorRenderer = NonNullable<Components["a"]>
    const linkRenderer: AnchorRenderer = ({ href, children, ...props }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-primary underline underline-offset-4"
        {...props}
      >
        {children}
      </a>
    )

    const citationRenderer = ({ node }: { node?: CitationNode }) => {
      if (!node || typeof node !== "object" || !("data" in node)) return null
      const ref = node.data.ref
      const citation = citations.find((c) => c.ref === ref)
      if (!citation) {
        return <sup className="text-xs text-muted-foreground">[{ref}]</sup>
      }
      return (
        <CitationBadge
          key={citation.ref}
          citation={citation}
          onOpenContext={onOpenCitation}
        />
      )
    }

    return {
      code: codeRenderer as Components["code"],
      a: linkRenderer,
      citation: citationRenderer,
    } as Components & {
      citation: ({ node }: { node?: CitationNode }) => ReturnType<typeof citationRenderer>
    }
  }, [citations, highlighter, onOpenCitation, theme])

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, createRemarkCitations]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}
