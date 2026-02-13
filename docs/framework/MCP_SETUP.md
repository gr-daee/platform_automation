# MCP Setup (Playwright + Linear)

This project configures two MCP servers in `.cursor/mcp.json` for use with Cursor.

## Configured Servers

| Server     | Purpose | Config |
|-----------|---------|--------|
| **playwright** | Browser automation for test authoring/debugging (snapshots, screenshots, draft flows) | `npx -y @executeautomation/playwright-mcp-server` |
| **linear**     | Linear issue context (read/create issues, link tests to DAEE-114 etc.) | `npx -y mcp-remote https://mcp.linear.app/mcp` |

## 1. Playwright MCP

- **Details:** [PLAYWRIGHT_MCP_INTEGRATION.md](./PLAYWRIGHT_MCP_INTEGRATION.md)
- **First time:** Run `npx playwright install` from `platform_automation`, then restart Cursor.
- **Verify:** In Cursor → Settings → MCP, confirm the **playwright** server is listed and enabled.

## 2. Linear MCP

- **Docs:** [Linear Cursor MCP](https://linear.app/integrations/cursor-mcp)
- **Auth:** Linear uses OAuth through Cursor. When you first use Linear MCP, Cursor will prompt you to sign in to Linear (e.g. **daee-issues** workspace).
- **Verify:** In Cursor → Settings → MCP, confirm the **linear** server is listed. You can ask the AI to “get Linear issue DAEE-114” to confirm the connection.
- **Note:** Remote MCP connections can sometimes fail or need a client restart; if Linear tools fail, try disabling/re-enabling the server or restarting Cursor.

## After Changing `.cursor/mcp.json`

1. Restart Cursor (or reload window: Command Palette → “Developer: Reload Window”).
2. Check Settings → MCP that both servers appear and are enabled.

## Reference: DAEE-114 (Order to Cash)

- **URL:** https://linear.app/daee-issues/issue/DAEE-114/order-to-cash
- **Title:** [Order to Cash]
- **Epic:** Covers full O2C lifecycle: Indent → Sales Order → Allocated → Picked → Packed → Shipped → Delivered (including GRN and discrepancy handling).
- Use the Linear MCP to pull issue description and context when writing or updating O2C tests.
