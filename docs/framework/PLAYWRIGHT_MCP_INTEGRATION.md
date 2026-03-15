# Playwright MCP Integration Guide

This project is configured to use a **browser MCP server** with Cursor so the AI can interact with a real browser for test authoring and debugging.

## Config Location

- **Project-level:** `.cursor/mcp.json` (this repo) — includes both **playwright** and **linear** MCP servers.
- **Global (optional):** `~/.cursor/mcp.json` — add the same entries if you want these MCPs in all projects.

For full MCP setup (Playwright + Linear), see [MCP Setup](./MCP_SETUP.md).

## First-Time Setup

1. **Install browsers (if not already):**  
   From `platform_automation`:  
   `npx playwright install`  
   The MCP server can also install browsers on first use.

2. **Restart Cursor** (or reload window) after adding or changing `.cursor/mcp.json`.

3. **Confirm MCP is loaded:**  
   In Cursor, check that the Playwright MCP server is available (e.g. in MCP or Composer settings).

## How to Use With This Framework

### Allowed Uses

- **Live DOM / accessibility snapshot** — Ask the AI to open your app URL (e.g. `TEST_BASE_URL/o2c/indents`) and get a snapshot. Use the result to choose **semantic locators** (getByRole, getByLabel) for new or updated POMs.
- **Screenshot debugging** — “Take a screenshot of the page” to see why a step failed or what the UI looked like.
- **Draft test flows** — Have the AI navigate in the browser and generate draft Gherkin or steps. You then **refactor** into this framework’s patterns (BasePage, component library, step defs, docs).

### Framework Rules Still Apply

- **Final tests** must live in `e2e/features`, `e2e/src/steps`, and `e2e/src/pages` and follow:
  - `.cursor/rules/sr-automation-engineer-persona.mdc`
  - `.cursor/rules/automation-patterns.mdc`
  - `.cursor/rules/framework-workflows.mdc`
- Use **semantic locators** (no CSS classes / XPath).
- Use **BasePage** and the **component library** (Select, Dialog, Toast).
- Update **documentation** (test-cases.md, knowledge.md, TEST_CASE_REGISTRY, etc.) as per the persona.

### Typical Workflow

1. Start the web app: `cd ../web_app && npm run dev`.
2. In Cursor, ask the AI to use Playwright MCP to e.g. “Open BASE_URL/o2c/indents and get an accessibility snapshot.”
3. Use the snapshot to implement or fix locators in the right Page Object and step definitions.
4. Run tests: `npm run test:dev -- e2e/features/o2c/indents.feature`.

### Cash receipt apply (multi-invoice)

- **FIN-CR-TC-005** (combined): Single submit—select both invoices, set amounts and EPD (first on, second off), wait for "Apply Payments (2)" and for the button to be **enabled**, then click once. CR detail page load is waited explicitly via `waitForDetailPageLoaded()` (loading text hidden, then title visible). Use step `I wait for the Apply Payments button to be enabled` so React state and validation are committed before submit.
- Use **MCP snapshot** on the apply page to confirm invoice rows, checkboxes, and "Apply Payments (N)" button state.

## MCP Server Details

- **Configured server name:** `cursor-ide-browser`
- **Config source:** `.cursor/mcp.json` in this repo
- **Behavior:** Provides browser automation tools (navigate, click, type, snapshot, etc.) that Cursor exposes as `browser_*` tools.

## Leveraging Playwright MCP + CLI for Development & Maintenance

### MCP (in Cursor)

When the **cursor-ide-browser** or **playwright** MCP is available in Cursor, use it to:

| Use case | MCP action | Outcome |
|----------|------------|--------|
| **Derive semantic locators** | `browser_navigate` → `browser_snapshot` (accessibility snapshot) | Use snapshot to pick `getByRole`, `getByLabel`, `getByText` for POMs and steps |
| **Debug failures** | `browser_navigate` to failing URL → `browser_take_screenshot` | Inspect UI state without re-running the full test |
| **Draft flows** | Navigate and interact in browser, then ask AI to generate Gherkin/steps | Refactor into framework patterns (BasePage, component library, docs) |
| **Verify selectors** | `browser_snapshot` with optional `selector` to scope | Confirm structure before changing locators in code |

**Workflow:** `browser_navigate` → (optional) `browser_lock` → `browser_snapshot` / `browser_click` / `browser_fill` / etc. → (if locked) `browser_unlock`.

### Playwright CLI (terminal)

Use these alongside MCP for authoring and debugging:

| Command | Purpose |
|--------|--------|
| `npm run test:ui` | **Playwright UI Mode** – run/debug tests interactively, time-travel, pick locators |
| `npm run test:dev -- --grep '@TAG'` | Headed run with Monocart report (video, trace, screenshots) |
| `npx playwright show-trace test-results/…/trace.zip` | Inspect trace for a failed run (DOM, console, network) |
| `npx playwright codegen [URL]` | Record actions and generate selector code (then adapt to BasePage/semantic locators) |

**Suggested flow:** Use **codegen** or **UI mode** to discover interactions and selectors; use **MCP snapshot** in Cursor to confirm accessibility tree and refine to semantic locators; use **show-trace** when debugging a failing run.

## Troubleshooting

- **“Playwright not found” / server not starting:**  
  Run `npx playwright install` in this repo (or globally) and restart Cursor.

- **Base URL:**  
  Use the same URL as your tests (e.g. from `.env.local`: `TEST_BASE_URL` or `http://localhost:3000`).

- **Cursor 60-char tool name limit:**  
  The Execute Automation server keeps tool names short; if you add another MCP server, keep combined `server_name:tool_name` under 60 characters.
