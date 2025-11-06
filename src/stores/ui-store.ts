import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { ThemeMode } from "@/types"

interface LayoutState {
  sidebarOpen: boolean
  rightPanelOpen: boolean
  compactMode: boolean
}

interface UIState extends LayoutState {
  theme: ThemeMode
  commandPaletteOpen: boolean
  rightPanelTab: "info" | "facts" | "repro" | "gaps"
  enterToSend: boolean
  streamingEnabled: boolean
  showTokenCount: boolean
  toggleSidebar: () => void
  toggleRightPanel: () => void
  setSidebarOpen: (open: boolean) => void
  setRightPanelOpen: (open: boolean) => void
  setRightPanelTab: (tab: UIState["rightPanelTab"]) => void
  setTheme: (theme: ThemeMode) => void
  setCommandPaletteOpen: (open: boolean) => void
  setCompactMode: (compact: boolean) => void
  setEnterToSend: (value: boolean) => void
  setStreamingEnabled: (value: boolean) => void
  setShowTokenCount: (value: boolean) => void
  applyPreferences: (prefs: Partial<UIState>) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      rightPanelOpen: true,
      compactMode: false,
      theme: "system",
      commandPaletteOpen: false,
      rightPanelTab: "info",
      enterToSend: true,
      streamingEnabled: true,
      showTokenCount: false,
      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),
      setSidebarOpen: (sidebarOpen) =>
        set(() => ({
          sidebarOpen,
        })),
      toggleRightPanel: () =>
        set((state) => ({
          rightPanelOpen: !state.rightPanelOpen,
        })),
      setRightPanelOpen: (rightPanelOpen) =>
        set(() => ({
          rightPanelOpen,
        })),
      setRightPanelTab: (tab) =>
        set(() => ({
          rightPanelTab: tab,
        })),
      setTheme: (theme) =>
        set(() => ({
          theme,
        })),
      setCommandPaletteOpen: (commandPaletteOpen) =>
        set(() => ({
          commandPaletteOpen,
        })),
      setCompactMode: (compactMode) =>
        set(() => ({
          compactMode,
        })),
      setEnterToSend: (enterToSend) =>
        set(() => ({
          enterToSend,
        })),
      setStreamingEnabled: (streamingEnabled) =>
        set(() => ({
          streamingEnabled,
        })),
      setShowTokenCount: (showTokenCount) =>
        set(() => ({
          showTokenCount,
        })),
      applyPreferences: (prefs) =>
        set((state) => ({
          ...state,
          ...prefs,
        })),
    }),
    {
      name: "research-agent-ui",
      partialize: (state) => ({
        theme: state.theme,
        compactMode: state.compactMode,
        enterToSend: state.enterToSend,
        streamingEnabled: state.streamingEnabled,
        showTokenCount: state.showTokenCount,
      }),
    },
  ),
)
