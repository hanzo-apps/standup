# daily-standup — agent notes

An async standup tracker for small teams, built on the canonical Hanzo app
stack: Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base`
(data). Teammates post yesterday/today/blockers once a day; the team reads one
rollup. Keep it minimal and REAL — every surface must build and run, no
fabricated UI.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam is what makes every
  `useQuery`/`useMutation` org-scoped to the signed-in user.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`.
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind). Shared presentational pieces live in `src/views/kit.tsx` (`Dot`,
  `Kicker`, `Mono`, `Column`, `UpdateCard`, `Segment`); the three views are
  `feed` (Today), `post` (your check-in), `history`.

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web. No Tamagui compiler,
  no `one`, no Expo — the optimizer is a perf pass, not a correctness one.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`alignSelf`/
  `borderRadius`/`textAlign` — NOT the `items`/`justify`/`bg`/`p`/`self`/
  `rounded`/`text` shorthands. Shorthands pass at runtime but FAIL `tsc`.
  `Button` uses `onPress`; `Input`/`TextArea` use `value`/`onChangeText`.
- **Mono accents** use a raw monospace `fontFamily` stack (`MONO` in
  `src/lib/standup.ts`). The v5 config only registers `body`/`heading`, so a
  `$mono` token would typecheck but render as the body font — pass the string.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into the `updates` Base collection (`provisionBaseFromDDL`),
  org-scoped by `@request.auth.org_id = org`. Keep it in lockstep with the
  `Update` type in `src/lib/standup.ts`.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage (the `*.hanzo.app` published-sites edge). No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collection
  (org-scoped, IAM-native). Runtime read/write is browser → `VITE_HANZO_BASE_URL`
  with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback`. Production needs a `https://*.hanzo.app/auth/callback`
  wildcard on the shared client (or a per-app `hanzo-<app>` client).

## Proven

`tsc --noEmit` clean · `vite build` → `dist/` · renders under Vite with the
signed-out rollup preview · `login()` performs a real PKCE S256 redirect to
`https://hanzo.id/login/oauth/authorize`.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
