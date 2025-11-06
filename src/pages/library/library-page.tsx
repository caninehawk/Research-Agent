import { useMemo, useState } from "react"
import { FilePlus2, RefreshCw } from "lucide-react"
import { useOutletContext } from "react-router-dom"

import { usePaperLibrary } from "@/api/hooks"
import type { ShellContext } from "@/app/router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { compactDate } from "@/lib/utils"
import type { PaperMeta } from "@/types"

type StatusFilter = PaperMeta["status"] | "all"

export function LibraryPage() {
  const context = useOutletContext<ShellContext>()
  const { data: papers = [], isLoading, refetch } = usePaperLibrary()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [year, setYear] = useState<string>("all")

  const years = useMemo(() => {
    const unique = new Set(
      papers
        .map((paper) => paper.year)
        .filter((value): value is number => Boolean(value)),
    )
    return Array.from(unique).sort((a, b) => b - a)
  }, [papers])

  const filtered = useMemo(() => {
    return papers.filter((paper) => {
      const matchesQuery =
        query.length === 0 ||
        paper.title.toLowerCase().includes(query.toLowerCase()) ||
        paper.authors.join(" ").toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === "all" || paper.status === status
      const matchesYear = year === "all" || `${paper.year ?? ""}` === year
      return matchesQuery && matchesStatus && matchesYear
    })
  }, [papers, query, status, year])

  return (
    <div className="flex h-full flex-col gap-4 px-5 py-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Paper Library</h1>
          <p className="text-sm text-muted-foreground">
            Upload PDFs or paste links to keep your research workspace grounded.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2" onClick={context.openUploadDialog}>
            <FilePlus2 className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </header>
      <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="library-search" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Search
            </label>
            <Input
              id="library-search"
              placeholder="Title, author, or source"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </label>
            <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="indexed">Indexed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Year
            </label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((item) => (
                  <SelectItem key={item} value={`${item}`}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
      <ScrollArea className="flex-1 rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border text-sm" data-testid="library-table">
          <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Title</th>
              <th className="px-4 py-3 text-left font-semibold">Authors</th>
              <th className="px-4 py-3 text-left font-semibold">Year</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Size</th>
              <th className="px-4 py-3 text-left font-semibold">Added</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Loading papers…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No papers matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((paper) => (
                <tr key={paper.id} className="hover:bg-muted/40">
                  <td className="max-w-xs px-4 py-3">
                    <div className="flex flex-col">
                      <span className="truncate font-medium text-foreground">{paper.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {paper.doi ? `doi:${paper.doi}` : paper.arxivId ? `arXiv:${paper.arxivId}` : "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {paper.authors.length > 0 ? paper.authors.slice(0, 3).join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3">{paper.year ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={paper.status} />
                  </td>
                  <td className="px-4 py-3">
                    {paper.sizeInKb ? `${Math.round(paper.sizeInKb / 1024)} MB` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {compactDate(paper.addedAt)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => context.openUploadDialog()}
                      >
                        Re-ingest
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  )
}

function StatusBadge({ status }: { status: PaperMeta["status"] }) {
  const variants: Record<PaperMeta["status"], { label: string; variant: "outline" | "muted" | "accent" | "destructive" }> = {
    indexed: { label: "Indexed", variant: "outline" },
    processing: { label: "Processing", variant: "accent" },
    queued: { label: "Queued", variant: "muted" },
    error: { label: "Error", variant: "destructive" },
  }
  const { label, variant } = variants[status]
  return <Badge variant={variant === "outline" ? "outline" : variant}>{label}</Badge>
}
