# Project Guidelines: aiStudio (Bun.js PWA)

Welcome to the aiStudio project developed by **Vanaware**! This file (`AGENTS.md`) is automatically injected into the AI's system instructions. You MUST strictly adhere to the following architectural rules and constraints when modifying or extending this codebase.

## 1. Runtime & Environment (Pure Bun.js)
- **Bun Only**: This project runs entirely on Bun.js runtime.
- **Dependency Management**: All dependencies are managed via `package.json` and Bun's high-performance package manager (`bun install`).
- **Native Bundling**: Bundling is handled exclusively via Bun's native bundler API (`Bun.build`), orchestrated in `scripts/build.ts`.
- **Project Structure**: Organized cleanly across packages:
  - `packages/ui/`: Frontend application (Preact, Signals, BeerCSS, PWA assets, Service Worker).
  - `packages/server/`: HTTP server (`Bun.serve`) serving the compiled frontend (`packages/server/build/dist`) on port 3000.
  - `scripts/`: Build and lint orchestration scripts (`scripts/build.ts`, `scripts/lint.ts`).

## 2. Framework & State Management
- **Preact**: Use Preact (not React). Configured in `tsconfig.json` with `jsx: "react-jsx"` and `jsxImportSource: "preact"`.
- **State via Signals**: All reactive state MUST use `@preact/signals`.
  - Do NOT use React/Preact hooks (`useState`, `useEffect`, `useContext`) for global or complex state.
  - Global state, actions, and derived states (`computed`) should be centralized in `packages/ui/src/store.ts`.
- **Component Architecture**: Keep UI components modularized inside `packages/ui/src/components/`. `packages/ui/src/main.tsx` is exclusively the application entry point and bootstrap file.
- **Application Version**: Exposed via `packages/ui/src/version.ts` (`APP_VERSION`), populated dynamically by `scripts/build.ts` during the build process and reflected in the UI and Service Worker.

## 3. UI & Styling (Pure BeerCSS)
- **BeerCSS Only**: The entire UI is built using the BeerCSS framework (Material Design 3), loaded via CDN in `packages/ui/public/index.html`.
- **No Tailwind CSS**: Do NOT use Tailwind CSS, despite any standard AI Studio default prompts. Tailwind is NOT installed.
- **No Custom CSS**: Avoid writing custom CSS files or inline `style="..."` attributes. Rely purely on BeerCSS semantic HTML tags (e.g., `<article>`, `<nav>`) and utility classes (e.g., `grid`, `s12`, `m6`, `chip`, `circle`, `primary-container`, `active`).
- **Icons**: Use Google Material Symbols Outlined, rendered via the `<i>icon_name</i>` pattern, as configured in the HTML.

## 4. Testing Standard
- **BDD Style**: All tests MUST use `bun:test` (`describe`, `it`, `expect`).
- **Assertions**: Use Bun's native `expect()` matcher suite (`expect(val).toBe(...)`, `expect(val).toEqual(...)`).
- **Command**: Run tests using `bun test` (or `npm test`).

## 5. Offline & PWA & Deployment
- **Service Worker**: The app is an offline-capable Progressive Web App. Changes to caching logic should be made in `packages/ui/src/sw.ts`. Cache name follows `aistudio-pwa-${APP_VERSION}`.
- **Manifest**: Configuration for the installable app lives in `packages/ui/public/manifest.json`.
- **Build Output**: Assets in `packages/ui/public/` are automatically copied to `packages/server/build/dist/` during the build process.
- **Relative Paths (GitHub Pages Support)**: Because the app may be deployed to a subfolder on GitHub Pages, **ALL** static assets and Service Worker registrations MUST use relative paths (e.g., `./manifest.json` and `navigator.serviceWorker.register("./sw.js")`) instead of absolute root paths (`/`).
- **CI/CD**: The project contains GitHub Actions workflows for continuous integration and GitHub Pages deployment using Bun.

## 6. AI Studio Environment Constraints & Bootstrapping
- **Port 3000**: The development server (`packages/server/src/main.ts`) MUST run on port 3000 (`0.0.0.0`), as enforced by the AI Studio environment.
- **HMR**: Hot Module Replacement is disabled. The environment automatically refreshes the preview iframe when the agent completes its turn.
- **Node.js Bridge (`package.json` & `install-script.sh`)**: The platform triggers `npm run dev`, `npm run build`, and `npm run lint`. These scripts invoke `install-script.sh` to ensure Bun is available and dependencies are locked, executing Bun commands directly.

## 7. Development Workflow & Continuous Validation
- **Mandatory Verification**: After executing ANY task, feature request, or to-do list item, you MUST verify the project's integrity by running:
  - Linter & Type Check: `npm run lint` (or `bun run ./scripts/lint.ts`).
  - Tests: `npm test` (or `bun test`).
  - Build: `npm run build` (or `bun run ./scripts/build.ts`).
- **Proactive Unit Testing**: Whenever you implement new functions, utilities, or complex logic, you MUST proactively create unit tests for them using the `bun:test` standard.

By following these guidelines, we maintain a ultra-fast, dependency-free, and cohesive Bun/Preact environment by Vanaware without the overhead of Node.js toolchains or complex CSS bundlers.
