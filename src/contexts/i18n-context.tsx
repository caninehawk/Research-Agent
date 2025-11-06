/* eslint-disable react-refresh/only-export-components */
import type { PropsWithChildren } from "react"
import { createContext, useContext, useMemo } from "react"

import { en } from "@/locales/en"

const translations = {
  en,
}

type LocaleKey = keyof typeof translations

type NestedKeyOf<ObjectType extends Record<string, unknown>> = {
  [Key in keyof ObjectType & string]: ObjectType[Key] extends Record<
    string,
    unknown
  >
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & string]

type TranslationKey = NestedKeyOf<typeof en>

function getValue(path: string, obj: Record<string, unknown>) {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

interface I18nContextValue {
  locale: LocaleKey
  t: (key: TranslationKey, fallback?: string) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider({ children }: PropsWithChildren) {
  const value = useMemo<I18nContextValue>(
    () => ({
      locale: "en",
      t: (key, fallback) => {
        const result = getValue(key, translations.en)
        if (typeof result === "string") return result
        return fallback ?? key
      },
    }),
    [],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error("useI18n must be used within I18nProvider")
  return context
}
