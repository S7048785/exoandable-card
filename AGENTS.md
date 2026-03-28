# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a TanStack Start application (full-stack React framework with SSR support). It uses:
- **Routing**: TanStack Router with file-based routing
- **Data Fetching**: TanStack Query
- **Styling**: Tailwind CSS v4 with shadcn/ui components and CSS variables
- **Build**: Vite with `@tanstack/react-start/plugin/vite`

## Development Commands

```bash
bun --bun run dev      # Start dev server on port 3000
bun --bun run build    # Production build
bun --bun run test     # Run Vitest tests
bun --bun run lint     # Run ESLint
bun --bun run format   # Check Prettier formatting
bun --bun run check    # Format + lint fix
```

## Architecture

### File-based Routing
Routes are defined in `src/routes/` as files. TanStack Router auto-generates `src/routeTree.gen.ts` - do not edit this manually.

Route hierarchy:
- `__root.tsx` - Root layout with shell component (Header, Footer, devtools)
- Files like `index.tsx`, `about.tsx` create top-level routes
- Files like `posts.$postId.tsx` create nested routes under `posts.tsx`
- `demo/` subdirectory contains demo routes

### TanStack Query Integration
QueryClient is created in `src/integrations/tanstack-query/root-provider.tsx` and injected via router context (`src/router.tsx`). Use `useQuery`, `useMutation`, etc. from `@tanstack/react-query`.

### Path Aliases
- `#/*` maps to `./src/*`
- `@/*` maps to `./src/*`

### Styling
- CSS variables defined in `src/styles.css` under `:root` and `:root[data-theme="dark"]`
- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- shadcn components installed via `npx shadcn@latest`
- Animation via `motion` and `tw-animate-css`

## Key Files

- `src/router.tsx` - Router creation with context injection
- `src/routes/__root.tsx` - Root layout with theme initialization
- `src/integrations/tanstack-query/root-provider.tsx` - QueryClient setup
- `vite.config.ts` - Vite config with TanStack Start, Tailwind, React compiler
