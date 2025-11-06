import { useMemo } from "react"
import { Monitor, Moon, SunMedium } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useUIStore } from "@/stores/ui-store"

export function SettingsPage() {
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)
  const compact = useUIStore((state) => state.compactMode)
  const setCompact = useUIStore((state) => state.setCompactMode)
  const enterToSend = useUIStore((state) => state.enterToSend)
  const setEnterToSend = useUIStore((state) => state.setEnterToSend)
  const streamingEnabled = useUIStore((state) => state.streamingEnabled)
  const setStreamingEnabled = useUIStore((state) => state.setStreamingEnabled)
  const showTokenCount = useUIStore((state) => state.showTokenCount)
  const setShowTokenCount = useUIStore((state) => state.setShowTokenCount)

  const themeOptions = useMemo(
    () => [
      { label: "Light", value: "light" as const, icon: <SunMedium className="h-4 w-4" /> },
      { label: "Dark", value: "dark" as const, icon: <Moon className="h-4 w-4" /> },
      { label: "System", value: "system" as const, icon: <Monitor className="h-4 w-4" /> },
    ],
    [],
  )

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6">
      <header>
        <h1 className="font-serif text-3xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tailor the workspace experience and export your data.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Theme, density, and typography preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Theme
              </p>
              <Select value={theme} onValueChange={(value) => setTheme(value as typeof theme)}>
                <SelectTrigger>
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
              <div>
                <p className="font-medium">Compact layout</p>
                <p className="text-xs text-muted-foreground">
                  Reduce spacing for dense reading lists.
                </p>
              </div>
              <Switch checked={compact} onCheckedChange={setCompact} />
            </div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Behavior</CardTitle>
            <CardDescription>Composer preferences and streaming.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
              <div>
                <p className="font-medium">Enter to send</p>
                <p className="text-xs text-muted-foreground">
                  Disable to require Ctrl/Cmd+Enter to send.
                </p>
              </div>
              <Switch checked={enterToSend} onCheckedChange={setEnterToSend} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
              <div>
                <p className="font-medium">Streaming responses</p>
                <p className="text-xs text-muted-foreground">
                  Toggle incremental token streaming from the backend.
                </p>
              </div>
              <Switch checked={streamingEnabled} onCheckedChange={setStreamingEnabled} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
              <div>
                <p className="font-medium">Show token estimates</p>
                <p className="text-xs text-muted-foreground">
                  Display rough token counts beside each exchange.
                </p>
              </div>
              <Switch checked={showTokenCount} onCheckedChange={setShowTokenCount} />
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Data</CardTitle>
            <CardDescription>Export conversations or clear cached preferences.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-4 py-3">
              <div>
                <p className="font-medium">Export chat history</p>
                <p className="text-xs text-muted-foreground">
                  Downloads a Markdown copy of the active chat transcript.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  console.info("Export chat placeholder. Wire to backend later.")
                }}
              >
                Export Markdown
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-4 py-3">
              <div>
                <p className="font-medium text-destructive">Clear cached settings</p>
                <p className="text-xs text-muted-foreground">
                  Removes locally stored preferences. Chat data remains untouched.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  localStorage.removeItem("research-agent-ui")
                  location.reload()
                }}
              >
                Clear cache
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
