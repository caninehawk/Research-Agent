import { useEffect, useMemo, useRef } from "react"
import { Paperclip, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Badge } from "@/components/ui/badge"
import type { Chat, PaperMeta } from "@/types"
import type { IntentHint } from "@/types"

interface ChatComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  mode: Chat["mode"]
  onModeChange: (mode: Chat["mode"]) => void
  attachedPapers: PaperMeta[]
  onRemovePaper: (paperId: string) => void
  onAddPaper: () => void
  intentHints?: IntentHint[]
  enterToSend?: boolean
  onHintAction?: (hint: IntentHint) => void
}

const MODES: Array<{ label: string; value: Chat["mode"]; description: string }> = [
  { label: "QA", value: "qa", description: "Targeted questions on methods and results" },
  { label: "Explainer", value: "explainer", description: "Pedagogical walkthroughs" },
  { label: "Reviewer", value: "reviewer", description: "Critical assessment and limitations" },
  { label: "Ideation", value: "ideation", description: "Project ideas and gaps" },
]

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  mode,
  onModeChange,
  attachedPapers,
  onRemovePaper,
  onAddPaper,
  intentHints = [],
  enterToSend = true,
  onHintAction,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`
  }, [value])

  const hint = useMemo(() => intentHints[0], [intentHints])

  return (
    <div className="border-t border-border bg-background/90 px-4 py-4" data-testid="chat-composer">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {attachedPapers.map((paper) => (
            <Badge key={paper.id} variant="outline" className="flex items-center gap-2 bg-muted/60 py-1">
              <Paperclip className="h-3.5 w-3.5" />
              <span className="max-w-[180px] truncate text-xs font-medium">{paper.title}</span>
              <button
                type="button"
                className="rounded-full border border-border p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onRemovePaper(paper.id)}
                aria-label={`Remove ${paper.title}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={onAddPaper} className="gap-2">
            <Paperclip className="h-4 w-4" />
            Attach paper
          </Button>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card/60 p-3 shadow-sm">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Ask about datasets, ablations, limitations, or reproducibility steps…"
            className="min-h-[120px] resize-none border-none bg-transparent px-0 text-sm focus-visible:ring-0"
            onKeyDown={(event) => {
              const isModifier = event.metaKey || event.ctrlKey
              if (enterToSend) {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  if (!disabled && value.trim().length > 0) {
                    onSubmit()
                  }
                }
              } else if (isModifier && event.key.toLowerCase() === "enter") {
                event.preventDefault()
                if (!disabled && value.trim().length > 0) {
                  onSubmit()
                }
              }
              if (isModifier && event.key.toLowerCase() === "k") {
                event.preventDefault()
                onAddPaper()
              }
            }}
            disabled={disabled}
          />
            {hint ? (
              <div className="flex items-center gap-2 rounded-md bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium uppercase tracking-wide text-secondary-foreground">
                  Suggestion
                </span>
                <span>{hint.description}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-7 px-2 text-xs"
                  onClick={() => {
                    if (onHintAction) onHintAction(hint)
                    else onAddPaper()
                  }}
                >
                  {hint.action}
                </Button>
              </div>
            ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Label htmlFor="mode" className="text-xs uppercase tracking-wide">
                Mode
              </Label>
              <ToggleGroup
                type="single"
                id="mode"
                value={mode}
                onValueChange={(value) => {
                  if (value) onModeChange(value as Chat["mode"])
                }}
                className="flex items-center gap-1"
              >
                {MODES.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    aria-label={option.description}
                    className="px-3 py-1 text-xs"
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {enterToSend ? "Enter to send · Shift+Enter = newline" : "Ctrl/Cmd+Enter to send"}
              </span>
              <Button
                type="button"
                onClick={onSubmit}
                disabled={disabled || value.trim().length === 0}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
