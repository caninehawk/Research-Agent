import { useCallback, useState } from "react"
import { Upload, Link as LinkIcon, Loader2, CheckCircle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useIngestPaper } from "@/api/hooks"
import { uid } from "@/lib/id"

interface UploadItem {
  id: string
  name: string
  status: "queued" | "uploading" | "processing" | "done"
  progress: number
  source: "upload" | "url"
}

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const ingest = useIngestPaper()
  const [items, setItems] = useState<UploadItem[]>([])
  const [url, setUrl] = useState("")

  const enqueueItem = useCallback((name: string, source: UploadItem["source"]) => {
    const id = uid("upload")
    const next: UploadItem = {
      id,
      name,
      status: "queued",
      progress: 0,
      source,
    }
    setItems((prev) => [next, ...prev].slice(0, 6))
    ;(async () => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "uploading", progress: 10 } : item,
        ),
      )
      await ingest.mutateAsync({ name, source })
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "processing", progress: 70 } : item,
        ),
      )
      setTimeout(() => {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "done", progress: 100 } : item,
          ),
        )
      }, 900)
    })()
  }, [ingest])

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      enqueueItem(file.name, "upload")
    })
  }

  const handleUrlSubmit = () => {
    if (!url.trim()) return
    enqueueItem(url.trim(), "url")
    setUrl("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="upload-dialog">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add papers</DialogTitle>
          <DialogDescription>
            Upload a PDF or paste an arXiv / DOI link. The mock backend simulates processing so you can test UX flows.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <Upload className="h-4 w-4" />
              Upload PDF
            </div>
            <p className="text-xs text-muted-foreground">
              Drop a paper here or browse your files. Max 20 MB per upload in this mock.
            </p>
            <Label
              htmlFor="upload-input"
              className="flex cursor-pointer flex-1 flex-col items-center justify-center gap-2 rounded-md border border-border bg-background py-6 text-center text-sm hover:bg-muted/60"
            >
              <span>Select files</span>
              <span className="text-xs text-muted-foreground">Supported: PDF</span>
              <input
                id="upload-input"
                type="file"
                accept="application/pdf"
                multiple
                className="sr-only"
                onChange={(event) => handleFiles(event.target.files)}
              />
            </Label>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <LinkIcon className="h-4 w-4" />
              Paste link
            </div>
            <p className="text-xs text-muted-foreground">
              Works with arXiv, DOI, and open-access URLs. Processing is mocked.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://arxiv.org/abs/2108.10904"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
              <Button type="button" onClick={handleUrlSubmit} disabled={!url.trim()}>
                Add
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
            <span>Recent activity</span>
            <span>{items.length} item(s)</span>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={item.source === "upload" ? "accent" : "outline"}>
                    {item.source}
                  </Badge>
                  <p className="flex-1 truncate font-medium">{item.name}</p>
                  {item.status === "done" ? (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Indexed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {item.status}
                    </span>
                  )}
                </div>
                <Progress value={item.progress} className="mt-2" />
              </div>
            ))}
            {items.length === 0 && (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                Your uploads will appear here with simulated progress steps.
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
