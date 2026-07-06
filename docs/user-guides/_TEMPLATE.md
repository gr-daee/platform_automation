<!--
  DAEE module guide TEMPLATE — Stripe "Get started" style.
  Voice: task-oriented, second person ("you"), imperative steps, screenshot per step.
  Shared source: wrap internal-only content in <!-- INTERNAL:START --> … <!-- INTERNAL:END -->.
  Screenshot slot (consumed by the capture harness):
    ![Step caption](../assets/<module>/<step-id>.png)
    <!-- capture: { "project": "iacs-md", "route": "/o2c/indents", "action": "open-create-dialog", "highlight": "button:has-text('Create')" } -->
  Callouts: > **Note** … / > **Tip** … / > **Caution** …
-->

# <Module Name>

> One-sentence value proposition — what you accomplish with this module.

## What you can do
Card-style list of the main jobs this module supports (each links to a guide below):
- **<Task A>** — short outcome.
- **<Task B>** — short outcome.

## Before you begin
Prerequisites (master data, config, upstream documents) + the **role** you need.
<!-- INTERNAL:START -->
RBAC: `module:action` gates; RLS/tenant isolation; required config (posting profiles, settings).
<!-- INTERNAL:END -->

---

## Quickstart: <the single most common task>
**You'll:** <one line> · **Time:** ~N min · **Role:** <persona>

1. Step one.
   ![<caption>](../assets/<module>/qs-01.png)
   <!-- capture: { "project": "…", "route": "…", "action": "…" } -->
2. Step two.
   > **Tip** Helpful shortcut or default.
3. Step three → outcome.

**Next steps:** [Guide X](#), [related module](#).

---

## Guides
Task-oriented how-tos. One H3 per task; numbered steps; a screenshot per meaningful step;
callouts for gotchas.

### How to <task>
**Before:** <pre-state> · **Result:** <post-state>
1. …
   ![…](../assets/<module>/<task>-01.png)
   <!-- capture: { … } -->
2. …
   > **Caution** Irreversible / compliance-sensitive action.

(repeat per task — cover **every page** in this module's section of MODULE-MAP.md)

---

## Common use cases
Scenario-driven entry points (may link out to cross-module use cases in `use-cases/`):
- **<Scenario>** → follow [Guide …](#). Why/when you'd do this.

## Reference
- **Fields:** field → meaning → required? → validation (per screen).
- **Statuses:** state → meaning → who can transition.
- **Reports & outputs:** what this module produces.
<!-- INTERNAL:START -->
- **Permissions matrix**, **data model**, **edge functions**, **audit tables**, **GL effects**.
<!-- INTERNAL:END -->

## Troubleshooting
| Message | Cause | Fix |
|---|---|---|

## Next steps & related
Links to the next logical module/guide.
