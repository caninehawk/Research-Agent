import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-6 text-center">
      <div>
        <h1 className="font-serif text-3xl font-semibold">404</h1>
        <p className="text-sm text-muted-foreground">
          The workspace you are looking for does not exist.
        </p>
      </div>
      <Button asChild>
        <Link to="/chat">Back to workspace</Link>
      </Button>
    </div>
  )
}
