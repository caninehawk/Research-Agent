import type { PropsWithChildren } from "react"
import { useMemo } from "react"
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import { I18nProvider } from "@/contexts/i18n-context"
import { useThemeWatcher } from "@/hooks/use-theme"
import { MockBackendProvider } from "@/mocks/mock-backend-provider"

function ThemeBridge() {
  useThemeWatcher()
  return null
}

export function AppProviders({ children }: PropsWithChildren) {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      }),
    [],
  )

  return (
    <MockBackendProvider>
      <QueryClientProvider client={client}>
        <I18nProvider>
          <ThemeBridge />
          {children}
        </I18nProvider>
      </QueryClientProvider>
    </MockBackendProvider>
  )
}
