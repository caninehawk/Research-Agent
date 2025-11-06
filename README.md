# Research Agent Workspace

A production-ready React + TypeScript + Vite single-page application that helps professors explore and triage research papers through a chat-first workflow. The app ships with a mocked backend so you can validate UX flows (upload, ingest, retrieval-augmented chat) before wiring real services.

## Highlights

- **Chat workspace** with streaming answers, inline numeric citations, citation popovers, and per-mode prompting (QA / Explainer / Reviewer / Ideation).
- **Paper library** for uploads and link-based ingestion, including status transitions, filters, and bulk-ready table layout.
- **Right-side insights** with tabs for metadata, datasets/metrics, reproducibility cards, and gap analysis.
- **Command palette** (`⌘/Ctrl K`) to jump between chats, attach papers, or trigger workspace actions.
- **Settings** page with persisted UI preferences (theme, density, enter-to-send, streaming) stored via Zustand.
- **Responsive and accessible** layout with skip links, keyboard-friendly dialogs, and mobile sidebar/right panel behaviors.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui component primitives
- Zustand for UI state and local preferences
- @tanstack/react-query for data fetching + caching
- MSW-style mocked backend (`MockBackend`) for ingest/chat streaming simulation
- react-markdown + Shiki for markdown rendering with syntax highlighting

## Getting Started

```bash
# install dependencies
npm install

# start dev server
npm run dev

# run the unit-free lint suite
npm run lint

# create a production build
npm run build
```

> **Note:** Vite v7 requires Node.js ≥ 20.19 or ≥ 22.12. Current Node 20.16 works but prints a warning; upgrade when possible.

## Mock Backend

`src/mocks/mock-backend.ts` seeds sample papers, chats, messages, and provides async helpers:

- `listPapers`, `listChats`, `listMessages`, `createChat`, `duplicateChat`, `updateChat`, etc.
- `ingestPaper()` simulates upload → processing → indexed transitions with progress events.
- `ask()` streams tokens, emits final citations, and stores assistant responses for later retrieval.

The provider lives in `src/mocks/mock-backend-provider.tsx` and is wired through `AppProviders` so hooks in `src/api/hooks.ts` always operate on the same in-memory backend.

## Key Directories

- `src/app` – application shell (`App`, router, providers).
- `src/components` – shared UI primitives (buttons, inputs, layout) and markdown/citation renderers.
- `src/features` – domain-specific components (chat thread/composer, library upload dialog, command palette).
- `src/pages` – routed views (chat, library, settings, about, onboarding).
- `src/stores` – Zustand slices for UI preferences and layout toggles.
- `src/hooks` – utilities such as media queries and theme synchronization.
- `src/data/mock-data.ts` – seed data for papers, chats, facts, reproducibility cards, gaps.

## Accessibility & Responsiveness

- Landmark structure with skip links, keyboard-focus styles, and tooltip/sheet focus trapping.
- Mobile: left sidebar collapses into a sheet, right panel into a bottom drawer.
- Tablet/desktop: draggable three-pane layout (react-resizable-panels) with collapsible sidebars.

## Testing Hooks

Major components include `data-testid` attributes (`chat-thread`, `chat-composer`, `library-table`, `upload-dialog`) for future integration testing. The mock backend is deterministic to simplify snapshot or e2e scripting later.

## Next Steps

- Replace MockBackend with real APIs/SSE streams.
- Persist files + metadata to storage/indexing service.
- Expand evaluation tooling (hallucination tracking, accuracy metrics).
- Harden authentication/authorization around uploads and chat history.
