# How GroundCheck works

A short walkthrough of the code, in the order data flows through the app.

## 1. Data: from Open-Meteo to typed points

`src/api/openMeteo.ts`

1. `forecastUrl()` builds the request: hourly temperature, precipitation, wind and gusts, `timezone=auto`, 2 days.
2. `fetchForecast()` calls the API and validates the JSON with a **Zod schema** (`forecastResponseSchema`). If the shape is wrong, it throws instead of letting bad data reach the UI.
3. `toPoints()` turns Open-Meteo's column format (`time[]`, `temperature_2m[]` …) into a list of `HourlyPoint` objects and skips hours with missing values.
4. `localNow()` gives the current time *at the forecast location*, so the "current hour" is right even if the user's device is in another time zone.

`src/api/useForecast.ts` wraps this in **TanStack Query**: the forecast is cached for 15 minutes, shared between Home and Result, retried twice on failure and refetched in the background.

## 2. Decision: a pure function

`src/domain/evaluate.ts` — `evaluate(task, points, thresholds, nowLocal) → Decision`

- `selectWindow()` takes the current hour plus the next three.
- `limitsOf()` turns the six thresholds into a list of limits (null = "no limit"); gusts are checked against the max wind.
- `check()` marks each value `ok`, `near` (inside the margin) or `breach`.
- Rules in order: NO-GO if the current hour breaks a limit → CAUTION if a later hour breaks one (or gusts do) → CAUTION if a value is near a limit → GO.
- It returns the state, a one-sentence headline, the time the status is valid until, and every check (used by "Why this status?").

It has no React, no network and no dates from the system clock, which is why it is easy to test: `evaluate.test.ts` covers all states, margins, precedence and edge cases with small hand-made forecasts.

## 3. State: three small contexts

`src/context/`

| Context | Holds | Saved in |
| --- | --- | --- |
| `AuthContext` | the signed-in user (name, email) | `sessionStorage` (`gc.user`), so opening the app again starts at Welcome |
| `ThresholdsContext` | the six limits per task | `localStorage` (`gc.thresholds`) |
| `ThemeContext` | light or dark | `localStorage` (`gc.theme`), otherwise the system setting |

`storage.ts` validates everything read back from browser storage with Zod, so a corrupted or outdated value falls back to defaults instead of crashing the app.

Login goes through the `AuthService` interface in `authService.ts`. Today it is a mock; a real backend only needs a second implementation of the same three methods.

Server data (the forecast) lives in TanStack Query, not in a context: it has its own caching and loading states.

## 4. UI: screens, components, tokens

- `src/screens/` — one file per Figma screen. `App.tsx` holds the routes; `RequireAuth` protects signed-in screens and `GuestOnly` skips Welcome/Log in when already signed in.
- `src/components/` — reusable pieces (`Button`, `TextField`, `DecisionCard`, `StatCards`, `ThresholdField` …). Each has its own CSS Module.
- `src/styles/tokens.css` — the Figma variables as CSS custom properties, with a dark set under `[data-theme='dark']`. Components only use tokens, so dark mode needs no component changes.
- `Decor` places the Figma illustrations using their Figma coordinates (with the shadow padding of each export), behind the content and hidden from screen readers. Content itself uses flexbox/grid, so it stays responsive.
- `useIsDesktop()` switches between the 390 px and 1280 px layouts at 1024 px. Between 1024 and 1280 px the desktop design is scaled evenly with CSS `zoom` (down to 80 %, set from `index.html`); wider windows keep full size and centre the design.

## 5. Tests

| Level | Tool | Files |
| --- | --- | --- |
| Unit | Vitest | `domain/evaluate.test.ts`, `api/openMeteo.test.ts` |
| Component | Vitest + Testing Library | `components/DecisionCard.test.tsx`, `screens/Thresholds.test.tsx` |
| Flow | Vitest + Testing Library | `App.test.tsx` (demo login → Home → result; error state; route guard) |
| End-to-end | Playwright (mobile + desktop) | `e2e/demo.spec.ts`, `e2e/layout.spec.ts` (desktop at 1024, 1280, 1512 px) |

Network calls are never real in tests: a recorded Open-Meteo response (`api/fixtures/aschaffenburg.json`) and a fixed clock make results repeatable.
