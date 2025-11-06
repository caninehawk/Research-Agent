import { useEffect } from "react"

import { useUIStore } from "@/stores/ui-store"

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

function getSystemScheme() {
  return mediaQuery.matches ? "dark" : "light"
}

export function useThemeWatcher() {
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = (mode: "light" | "dark") => {
      root.classList.remove("light", "dark")
      root.classList.add(mode)
    }

    if (theme === "system") {
      applyTheme(getSystemScheme())
    } else {
      applyTheme(theme)
    }
  }, [theme])

  useEffect(() => {
    if (theme !== "system") return
    const handler = () => {
      const root = document.documentElement
      root.classList.toggle("dark", mediaQuery.matches)
      root.classList.toggle("light", !mediaQuery.matches)
    }
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [theme])
}
