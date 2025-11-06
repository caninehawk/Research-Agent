import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useUIStore } from "@/stores/ui-store"

export function ThemeToggle() {
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)
  const systemPrefersDark =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark)

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Toggle light theme"
        className={theme === "light" ? "bg-secondary" : undefined}
        onClick={() => setTheme("light")}
      >
        <Sun className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Toggle system theme"
        className={theme === "system" ? "bg-secondary" : undefined}
        onClick={() => setTheme("system")}
      >
        <span className="text-xs font-medium">Sys</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Toggle dark theme"
        className={isDark ? "bg-secondary" : undefined}
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-5 w-5" />
      </Button>
    </div>
  )
}
