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

## Architecture

### PDF Extraction

The current build ships with a **simulated ingest pipeline** and does not include an actual PDF extraction library. When a user uploads a paper or provides a URL, `MockBackend.ingestPaper()` (`src/mocks/mock-backend.ts`) fakes the processing lifecycle by emitting timed status events (`queued → processing → indexed`) and populating stub metadata. No file bytes are read or parsed.

When a real backend is wired in, a server-side PDF extraction library (e.g. **PyMuPDF**, **pdfplumber**, or **Apache Tika**) should handle text extraction, section splitting, and figure/table detection before indexing content for retrieval-augmented chat.

### Data Storage

All application data lives **in memory** inside the `MockBackend` class, using JavaScript `Map` collections:

| Collection | Key | Value type | Purpose |
|---|---|---|---|
| `papers` | `PaperId` | `PaperMeta` | Uploaded/linked paper metadata |
| `chats` | chat id | `Chat` | Chat sessions with mode and attached papers |
| `messages` | chat id | `Message[]` | Ordered messages per chat |
| `folders` | folder id | `ChatFolder` | User-created chat folders |
| `facts` | `PaperId` | `ResearchFacts` | Extracted datasets, metrics, repos |
| `reproCards` | `PaperId` | `ReproCard` | Reproducibility summary per paper |
| `gaps` | `PaperId` | `GapInsight[]` | Grounded/speculative gap insights |
| `drafts` | chat id | `ChatDraft` | Unsent message drafts |

Data is seeded from `src/data/mock-data.ts` at construction time and is lost on page refresh.

**UI preferences** (theme, compact mode, enter-to-send, streaming toggle, token count visibility) are persisted to `localStorage` via Zustand's `persist` middleware in `src/stores/ui-store.ts` under the key `research-agent-ui`.

### Ranking & Sorting

There is no relevance-scoring or machine-learned ranking model. Items are ordered **chronologically**:

| Collection | Sort field | Direction | Location |
|---|---|---|---|
| Papers | `addedAt` | Newest first | `MockBackend.listPapers()` |
| Chats | `updatedAt` | Most-recently-updated first | `MockBackend.listChats()` |
| Messages | `createdAt` | Oldest first (conversation order) | `MockBackend.listMessages()` |

A future backend could layer relevance ranking (e.g. BM25, vector similarity, or citation-graph PageRank) on top of these default orderings.

## Next Steps

- Replace MockBackend with real APIs/SSE streams.
- Persist files + metadata to storage/indexing service.
- Expand evaluation tooling (hallucination tracking, accuracy metrics).
- Harden authentication/authorization around uploads and chat history.
