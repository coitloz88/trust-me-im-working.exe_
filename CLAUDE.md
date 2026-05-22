# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

The repo is in pre-implementation phase. The git root currently contains only `PLAN.md` (the canonical design doc, in Korean) and this file — there is no `package.json`, `src/`, or any other code yet. The Vite + React + TypeScript scaffold described in `PLAN.md` §7–8 has not been generated. Before doing anything beyond planning, check whether the user wants the scaffold initialized.

When the project is scaffolded, it must be initialized **at the git root itself** (the layout in `PLAN.md` §8 is flat — `package.json`, `src/`, `index.html`, etc. all live directly under the git root). Do not create a nested project subdirectory.

## Expected commands (once scaffolded)

Package manager is **pnpm**. Commands run from the git root:

```powershell
pnpm install
pnpm dev      # vite dev server
pnpm build    # tsc -b && vite build
pnpm lint     # eslint .
pnpm preview  # serve production build
```

## Architecture intent (from PLAN.md)

The product is a VSCode-skinned shell that hosts multiple disguised mini-games. The shell is shared; games plug into it via a registry. Read `PLAN.md` for the full design — there is no code yet, so reading the codebase alone tells you nothing.

Invariants to preserve as the codebase grows:

- **The shell is game-agnostic.** `src/shared/` (IDE chrome: menu bar, sidebar, tabs, status bar, terminal) and the boss-key system are shared across every game. Game-specific code goes under `src/games/<game-name>/`.
- **Boss key (`Esc`) is a shell-level feature, not per-game.** Pressing `Esc` swaps the entire UI to a decoy "really working" VSCode view within ~0.1s. The game must keep running in the background (score, timers, spawns continue). When adding new games, do not re-implement boss-key handling — it must work automatically.
- **Games register themselves in `src/games/registry.ts`.** The sidebar reads from the registry and renders games as fake files. Adding a game = create folder under `src/games/`, implement `index.tsx` entry, add metadata to the registry. No other wiring should be required.
- **Game-visible UI must look like real VSCode Dark+.** Score, combo, and game state are surfaced *inside* IDE chrome (status bar segments, terminal log lines, problem-panel entries) — never as floating game HUDs. The "0.5-second glance test" from PLAN.md §2 governs all UI decisions.
- **State separation:** Zustand stores split into `src/shared/store/shellStore.ts` (shell + boss-key + cross-game stats) and `src/games/<game>/store/gameStore.ts` (per-game state). Do not leak game state into the shell store.
- **Content is data, not code.** Filenames, fake comments, code snippets, achievements live in `src/games/<game>/content/*.json` so they can be added via content-only PRs.

## Tech stack (planned)

React 19 + TypeScript + Vite, Tailwind CSS v4, Zustand for state, Framer Motion for entry/exit animations of game entities, React Router so each game has its own URL. Target is desktop web only, deployed to GitHub Pages. **No** game engine, **no** backend, **no** monorepo tooling — intentionally.

## Out of scope (do not introduce)

PLAN.md §11 lists hard "never" items: jokes about quitting/transferring, references to specific companies/people/Slack-brand-likes, real VSCode/Microsoft logos (the *name* "vscode" in a parody context is OK; the trade dress is not), payments, ads. Keep parody attribution ("Not affiliated with Microsoft") in the README when one exists.

## Working language

`PLAN.md`, README copy, and in-game text are written in Korean. Code identifiers and comments in source files are English by default, with Korean only inside the *fake* code/comments that the game displays to the player (see PLAN.md §5.2 for examples).
