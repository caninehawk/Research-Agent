import { useCallback, useState } from "react"
import { BookOpenText, Copy, ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePaper } from "@/api/hooks"
import type { Citation } from "@/types"

interface CitationBadgeProps {
  citation: Citation
  onOpenContext?: (citation: Citation) => void
}

export function CitationBadge({ citation, onOpenContext }: CitationBadgeProps) {
  const [copied, setCopied] = useState(false)
  const { data: paper } = usePaper(citation.paperId)

  const handleCopy = useCallback(async () => {
    const label = paper
      ? `${paper.authors[0] ?? paper.title} et al., ${paper.year ?? "n.d."}, p. ${citation.page}`
      : `p. ${citation.page}`
    await navigator.clipboard.writeText(label)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [citation.page, paper])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <sup>
            <Badge
              role="listitem"
              aria-label={`Citation ${citation.ref}`}
              className="ml-1 cursor-help rounded-sm bg-secondary font-mono text-[11px] leading-none"
            >
              {citation.ref}
            </Badge>
          </sup>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs space-y-2 p-4 text-left">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Page {citation.page}
            </p>
            <p className="text-xs leading-relaxed text-foreground">
              {citation.snippet}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-2"
              onClick={() => onOpenContext?.(citation)}
            >
              <BookOpenText className="h-3.5 w-3.5" />
              Open context
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1"
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied" : "Copy"}
            </Button>
            {paper?.doi ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1"
                asChild
              >
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Source
                </a>
              </Button>
            ) : null}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
