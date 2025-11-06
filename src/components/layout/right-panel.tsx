import { useEffect, useMemo, useState } from "react"
import { FileText, Info, LayoutDashboard, Lightbulb, Link } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGaps, usePaper, useReproCard, useFacts, usePaperLibrary } from "@/api/hooks"
import { useUIStore } from "@/stores/ui-store"
import { Separator } from "@/components/ui/separator"

interface RightPanelProps {
  paperIds: string[]
}

export function RightPanel({ paperIds }: RightPanelProps) {
  const tab = useUIStore((state) => state.rightPanelTab)
  const setTab = useUIStore((state) => state.setRightPanelTab)
  const [selectedPaperId, setSelectedPaperId] = useState<string | undefined>(paperIds[0])
  const { data: library } = usePaperLibrary()
  const { data: paper } = usePaper(selectedPaperId)
  const { data: facts } = useFacts(selectedPaperId)
  const { data: repro } = useReproCard(selectedPaperId)
  const { data: gaps } = useGaps(selectedPaperId)

  const keywords = useMemo(() => {
    if (!paper) return []
    return paper.title
      .split(" ")
      .slice(0, 6)
      .map((word) => word.replace(/[^a-zA-Z]/g, ""))
      .filter(Boolean)
  }, [paper])

  useEffect(() => {
    if (paperIds.length === 0) {
      setSelectedPaperId(undefined)
      return
    }
    if (!selectedPaperId || !paperIds.includes(selectedPaperId)) {
      setSelectedPaperId(paperIds[0])
    }
  }, [paperIds, selectedPaperId])

  return (
    <aside
      className="flex h-full flex-col border-l border-border bg-background"
      aria-label="Paper insights panel"
    >
      <Tabs value={tab} onValueChange={(nextTab) => setTab(nextTab as typeof tab)} className="flex h-full flex-col">
        <TabsList className="mx-3 mt-3 grid grid-cols-4">
          <TabsTrigger value="info" className="flex items-center gap-2 text-xs">
            <Info className="h-4 w-4" />
            Info
          </TabsTrigger>
          <TabsTrigger value="facts" className="flex items-center gap-2 text-xs">
            <LayoutDashboard className="h-4 w-4" />
            Facts
          </TabsTrigger>
          <TabsTrigger value="repro" className="flex items-center gap-2 text-xs">
            <FileText className="h-4 w-4" />
            Repro Card
          </TabsTrigger>
          <TabsTrigger value="gaps" className="flex items-center gap-2 text-xs">
            <Lightbulb className="h-4 w-4" />
            Gaps
          </TabsTrigger>
        </TabsList>
        <div className="px-3 pt-3">
          {paperIds.length > 0 ? (
            <Select value={selectedPaperId} onValueChange={(value) => setSelectedPaperId(value)}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select a paper" />
              </SelectTrigger>
              <SelectContent>
                {paperIds.map((id) => {
                  const meta = library?.find((item) => item.id === id)
                  return (
                    <SelectItem key={id} value={id}>
                      <span className="flex max-w-[200px] items-center truncate font-medium">
                        {meta?.title ?? id}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          ) : (
            <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
              Attach a paper to see metadata and reproducibility insights.
            </p>
          )}
        </div>
        <ScrollArea className="flex-1 px-3 pb-6">
          <TabsContent value="info" className="mt-3 border-none bg-transparent p-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{paper?.title ?? "No paper selected"}</CardTitle>
                {paper?.venue ? (
                  <CardDescription>
                    {paper.venue} · {paper.year}
                  </CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{paper?.authors.join(", ")}</p>
                {paper?.doi && (
                  <p>
                    DOI: <a href={`https://doi.org/${paper.doi}`} className="text-primary underline" target="_blank" rel="noreferrer">{paper.doi}</a>
                  </p>
                )}
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {keywords.map((keyword) => (
                      <Badge key={keyword} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="facts" className="mt-3 border-none bg-transparent p-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datasets &amp; Metrics</CardTitle>
                <CardDescription>
                  Key datasets, metrics, and code artifacts detected from ingestion.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <section>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Datasets
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {facts && facts.datasets && facts.datasets.length > 0 ? (
                      facts.datasets.map((dataset) => (
                        <Badge key={dataset} variant="outline">
                          {dataset}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Dataset metadata pending.
                      </p>
                    )}
                  </div>
                </section>
                <Separator />
                <section>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Metrics
                  </p>
                  <div className="mt-2 space-y-2">
                    {facts && facts.metrics && facts.metrics.length > 0 ? (
                      facts.metrics.map((metric) => (
                        <div
                          key={`${metric.name}-${metric.value}`}
                          className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                        >
                          <span className="font-medium text-foreground">{metric.name}</span>
                          <span className="text-xs text-muted-foreground">{metric.value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Metrics not yet extracted.
                      </p>
                    )}
                  </div>
                </section>
                <Separator />
                <section>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Code &amp; License
                  </p>
                  <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                    {facts && facts.codeRepositories && facts.codeRepositories.length > 0 ? (
                      facts.codeRepositories.map((repo) => (
                        <a
                          key={repo}
                          href={repo}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-primary underline"
                        >
                          <Link className="h-3.5 w-3.5" />
                          {repo}
                        </a>
                      ))
                    ) : (
                      <p>No code repositories detected.</p>
                    )}
                    <p>
                      <span className="font-medium text-foreground">License:</span>{" "}
                      {facts?.license ?? "Unknown"}
                    </p>
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="repro" className="mt-3 border-none bg-transparent p-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reproducibility card</CardTitle>
                <CardDescription>Extracted experiment setup and baselines.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {repro ? (
                  <>
                    <InfoRow label="Task" value={repro.task} />
                    <InfoRow label="Model" value={repro.model} />
                    <InfoRow label="Data" value={repro.data} />
                    <InfoRow label="Hardware" value={repro.hardware} />
                    <InfoRow label="Baselines" value={repro.baselines.join(", ")} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Hyperparameters
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(repro.hyperparams).map(([key, value]) => (
                          <div key={key} className="rounded-md border border-border bg-muted/40 px-3 py-2">
                            <p className="font-medium text-foreground">{key}</p>
                            <p>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Ablations
                      </p>
                      {repro.ablations.length > 0 ? (
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                          {repro.ablations.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No ablations recorded.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p>No reproducibility metadata yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gaps" className="mt-3 border-none bg-transparent p-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Research gaps</CardTitle>
                <CardDescription>
                  Observed limitations flagged during mock ingestion. Speculative insights are marked.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {gaps && gaps.length > 0 ? (
                  gaps.map((gap) => (
                    <div
                      key={gap.id}
                      className="rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                        <Badge
                          variant={gap.label === "speculative" ? "accent" : "outline"}
                          className="text-[11px]"
                        >
                          {gap.label}
                        </Badge>
                        {gap.citation ? <span>[{gap.citation}]</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-foreground">{gap.summary}</p>
                    </div>
                  ))
                ) : (
                  <p>No gaps logged yet. Ask the assistant about limitations to populate this view.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </aside>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  )
}
