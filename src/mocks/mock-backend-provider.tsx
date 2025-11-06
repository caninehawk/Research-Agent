/* eslint-disable react-refresh/only-export-components */
import type { PropsWithChildren } from "react"
import { createContext, useContext, useMemo } from "react"

import { MockBackend } from "@/mocks/mock-backend"

const MockBackendContext = createContext<MockBackend | null>(null)

export function MockBackendProvider({ children }: PropsWithChildren) {
  const client = useMemo(() => new MockBackend(), [])
  return (
    <MockBackendContext.Provider value={client}>
      {children}
    </MockBackendContext.Provider>
  )
}

export function useMockBackend() {
  const client = useContext(MockBackendContext)
  if (!client) {
    throw new Error("useMockBackend must be used within MockBackendProvider")
  }
  return client
}
