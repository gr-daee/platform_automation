# Playwright MCP Integration Guide

This project is configured to use the **Playwright MCP Server** (`@executeautomation/playwright-mcp-server`) with Cursor so the AI can interact with a real browser for test authoring and debugging.

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

## MCP Server Details

- **Package:** [@executeautomation/playwright-mcp-server](https://www.npmjs.com/package/@executeautomation/playwright-mcp-server)
- **Docs:** [executeautomation/mcp-playwright](https://github.com/executeautomation/mcp-playwright)
- **Stdio mode:** Used here so Cursor can talk to the server without running a separate HTTP process. Logs may go to `~/playwright-mcp-server.log` when running in stdio.

## Troubleshooting

- **“Playwright not found” / server not starting:**  
  Run `npx playwright install` in this repo (or globally) and restart Cursor.

- **Base URL:**  
  Use the same URL as your tests (e.g. from `.env.local`: `TEST_BASE_URL` or `http://localhost:3000`).

- **Cursor 60-char tool name limit:**  
  The Execute Automation server keeps tool names short; if you add another MCP server, keep combined `server_name:tool_name` under 60 characters.
