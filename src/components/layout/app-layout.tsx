import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

import { useMediaQuery } from "@/hooks/use-media-query"
import { useUIStore } from "@/stores/ui-store"
import { Header } from "@/components/layout/header"
import { LeftSidebar } from "@/components/layout/left-sidebar"
import { RightPanel } from "@/components/layout/right-panel"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"

interface AppLayoutProps {
  onOpenUpload: () => void
  attachedPaperIds?: string[]
  children: React.ReactNode
}

export function AppLayout({
  onOpenUpload,
  attachedPaperIds = [],
  children,
}: AppLayoutProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const rightPanelOpen = useUIStore((state) => state.rightPanelOpen)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
  const setRightPanelOpen = useUIStore((state) => state.setRightPanelOpen)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const showRightPanel = rightPanelOpen && isDesktop

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {isDesktop ? (
          <PanelGroup direction="horizontal" className="flex-1" autoSaveId="app-layout">
            {sidebarOpen ? (
              <>
                <Panel defaultSize={22} minSize={18} maxSize={30} className="hidden h-full sm:flex">
                  <LeftSidebar onOpenUpload={onOpenUpload} />
                </Panel>
                <PanelResizeHandle className="hidden w-[1px] bg-border sm:block" />
              </>
            ) : (
              <div className="hidden items-center border-r border-border bg-muted/30 px-3 sm:flex">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                  Open sidebar
                </Button>
              </div>
            )}
            <Panel minSize={40} defaultSize={showRightPanel ? 56 : 70}>
              <div className="flex h-full flex-col bg-background" role="main" id="main-content">
                {children}
              </div>
            </Panel>
            {showRightPanel ? (
              <>
                <PanelResizeHandle className="hidden w-[1px] bg-border lg:block" />
                <Panel defaultSize={24} minSize={20} maxSize={32} className="hidden lg:flex">
                  <RightPanel paperIds={attachedPaperIds} />
                </Panel>
              </>
            ) : (
              isDesktop && (
                <div className="hidden items-center border-l border-border bg-muted/30 px-3 lg:flex">
                  <Button variant="ghost" size="sm" onClick={() => setRightPanelOpen(true)}>
                    Open insights
                  </Button>
                </div>
              )
            )}
          </PanelGroup>
        ) : (
          <div className="flex h-full w-full flex-col">
            <div className="flex-1">
              <div className="flex h-full flex-col bg-background" role="main" id="main-content">
                {children}
              </div>
            </div>
            {rightPanelOpen && (
              <div className="h-[45vh] border-t border-border">
                <RightPanel paperIds={attachedPaperIds} />
              </div>
            )}
          </div>
        )}
      </div>
      {!isDesktop && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="fixed bottom-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full shadow-lg"
              size="icon"
              aria-label="Open navigation"
              variant="secondary"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <LeftSidebar onOpenUpload={onOpenUpload} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
