# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Commands

```bash
npm start          # Dev server on port 3000
npm run build      # Type check + Vite build → build/
npm run check      # TypeScript type check only
npm run lint       # ESLint on src/
npm test           # Vitest single run
npm run coverage   # Vitest with coverage

# Run a single test file
npx vitest run src/features/request/RequestLogic.test.ts
```

## Architecture

A React 19 + TypeScript SPA for managing conference video viewing parties (MobConfVideo). Backed by Firebase (Firestore + Cloud Functions + Auth).

**Stack:** Vite 8, React Router v7, MUI 5 + Emotion, RxJS 7, Vitest + happy-dom

**Feature-based structure under `src/`:**
- `features/` — one directory per page/feature (home, request, request_detail, request_submission, session, session_detail, sign_in)
- `entities/` — domain models (Event, Request, Session, Conference, Config)
- `utils/` — shared patterns and helpers
- `App.tsx` — top-level routing
- `Firebase.ts` / `FirebaseAuth.ts` / `Firestore.ts` — Firebase integration

## State Management Pattern

Each feature follows a consistent layered pattern:

1. **`XxxLogic` interface** — declares the feature's behavior as RxJS observables
2. **`AppXxxLogic`** — implements the interface using RxJS, connects to a repository
3. **`NullXxxLogic`** — null object used as the initial context value
4. **`XxxContext` + `XxxProvider`** — React context and provider (via `LogicProvider` utility)
5. **`XxxRepository` interface** + **`FirestoreXxxRepository`** — data access abstraction
6. **`MockXxxRepository`** — test double for unit tests

Components subscribe to observables via `useContext()` + `useObservableState()` from `observable-hooks`.

Async states use the `IRDE<I,R,D,E>` union type (Initial / Running / Done / Error).

## Testing Pattern

Tests instantiate `AppXxxLogic` with a `MockXxxRepository`, then use `EventuallyObserver<T>` (in `src/utils/`) to assert on observable emissions asynchronously.

## Environment

Firebase config is loaded from the `VITE_FIREBASE_CONFIG` env variable. Set this in `.env.development.local` for local development.

SVG files are imported as React components via `vite-plugin-svgr`.
