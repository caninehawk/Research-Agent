import { useCallback } from "react"
import {
  CircleUserRound,
  Menu,
  PanelRight,
  PanelRightClose,
  Search,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useI18n } from "@/contexts/i18n-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { useUIStore } from "@/stores/ui-store"

export function Header() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const toggleRightPanel = useUIStore((state) => state.toggleRightPanel)
  const rightPanelOpen = useUIStore((state) => state.rightPanelOpen)
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { t } = useI18n()
  const navigate = useNavigate()

  const handleSearchFocus = useCallback(() => {
    setCommandPaletteOpen(true)
  }, [setCommandPaletteOpen])

  return (
    <header
      className="flex h-16 shrink-0 items-center border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6"
      role="banner"
    >
      <div className="flex items-center gap-2">
        {!isDesktop && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          className="hidden items-center gap-2 px-2 font-serif text-lg font-semibold sm:inline-flex"
          onClick={() => navigate("/chat")}
        >
          <span className="h-3 w-3 rounded-full bg-primary shadow" aria-hidden />
          {t("app.title", "Research Agent")}
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-3 hidden h-5 sm:block" />

      <div className="relative flex w-full max-w-xl items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          data-testid="global-search"
          placeholder={t("app.searchPlaceholder", "Search papers, chats, and actions…")}
          className="h-10 w-full rounded-md pl-9 pr-20 font-sans"
          onFocus={handleSearchFocus}
          readOnly
        />
        <kbd className="pointer-events-none absolute right-3 hidden select-none items-center gap-1 rounded border border-border bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘
          <span>K</span>
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2 pl-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={rightPanelOpen ? "Hide info panel" : "Show info panel"}
          onClick={toggleRightPanel}
        >
          {rightPanelOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Account">
              <CircleUserRound className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => navigate("/settings")}>Settings</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/about")}>About</DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                console.info("Sign out coming soon")
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
