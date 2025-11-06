import { useEffect, useState } from "react"
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from "react-router-dom"

import { AppLayout } from "@/components/layout/app-layout"
import { useChatList } from "@/api/hooks"
import { ChatPage } from "@/pages/chat/chat-page"
import { LibraryPage } from "@/pages/library/library-page"
import { SettingsPage } from "@/pages/settings/settings-page"
import { AboutPage } from "@/pages/about/about-page"
import { OnboardingPage } from "@/pages/onboarding/onboarding-page"
import { NotFoundPage } from "@/pages/not-found/not-found-page"
import { UploadDialog } from "@/features/library/upload-dialog"
import { CommandPalette } from "@/components/command/command-palette"

export interface ShellContext {
  setAttachedPaperIds: (paperIds: string[]) => void
  openUploadDialog: () => void
  closeUploadDialog: () => void
}

function Shell() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [attachedPaperIds, setAttachedPaperIds] = useState<string[]>([])
  const shellContext: ShellContext = {
    setAttachedPaperIds,
    openUploadDialog: () => setUploadOpen(true),
    closeUploadDialog: () => setUploadOpen(false),
  }
  return (
    <>
      <AppLayout
        onOpenUpload={() => setUploadOpen(true)}
        attachedPaperIds={attachedPaperIds}
      >
        <Outlet context={shellContext satisfies ShellContext} />
      </AppLayout>
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <CommandPalette shell={shellContext} />
    </>
  )
}

function RootRedirect() {
  const { data: chats, isLoading } = useChatList()
  const navigate = useNavigate()
  useEffect(() => {
    if (isLoading) return
    if (!chats || chats.length === 0) {
      navigate("/onboarding", { replace: true })
      return
    }
    navigate(`/chat/${chats[0].id}`, { replace: true })
  }, [chats, isLoading, navigate])

  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Redirecting...
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: (
      <Shell />
    ),
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
      {
        path: "chat",
        element: <RootRedirect />,
      },
      {
        path: "chat/:chatId",
        element: <ChatPage />,
      },
      {
        path: "library",
        element: <LibraryPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "onboarding",
        element: <OnboardingPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
