import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function OnboardingPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">
            Welcome to Research Agent
          </CardTitle>
          <CardDescription>
            Upload a paper or start a chat to explore datasets, methods, and reproducibility gaps.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button size="lg">Upload a paper</Button>
          <Button variant="outline" size="lg">
            Start a new chat
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
