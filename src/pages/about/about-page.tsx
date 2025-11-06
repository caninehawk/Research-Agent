export function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="font-serif text-2xl font-semibold">About</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Research Agent is a prototype workspace for academic discovery. Upload
        papers, explore datasets, and surface reproducibility gaps before you
        commit to a new project. This build ships with a mocked backend so you
        can iterate on UX before wiring real services.
      </p>
      <p className="text-sm text-muted-foreground">
        Keyboard shortcuts, retrieval workflows, and safety considerations are
        documented inline across the interface.
      </p>
    </div>
  )
}
