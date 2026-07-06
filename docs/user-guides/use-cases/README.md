# Common use cases

> Learn DAEE by doing. A **use case** is a real business goal that spans several modules end to end —
> the fastest way to see how the pieces fit together, not just what each screen does.

> **Audience:** Customer + Internal · **Section:** Use cases · **Status:** 🟢 Authored
> **Verified:** against the authored module guides on 2026-06-18.

## How to use this section
Each use-case guide follows one shape so you always know where you are:

**Goal → What you'll achieve → Who does it → Before you begin → Steps (across modules, each with a
screenshot) → Expected results → Common mistakes → Related guides.**

Pick a journey below. Every step links to the detailed **module guide** if you want more depth on a
single screen.

## Available now

| Use case | Spans | Who leads it | About |
|---|---|---|---|
| **[Onboard a dealer & fulfil the first order](./onboard-dealer-first-order.md)** | Dealer Applications → Dealers → O2C → Finance | Sales & Finance | The most common "new relationship" journey — application to a delivered, invoiced, paid first order. |
| **[Sell, invoice & move goods compliantly](../o2c/order-to-cash.md#common-use-cases)** | Order to Cash | Sales & Finance | Raise an order and produce a compliant **E-Invoice (IRN)** and **E-Way Bill** from the real transaction. |

## Planned journeys

These cross-module walkthroughs are being authored next. Until each dedicated guide is published, the
linked **module guides** already cover the individual steps — so you're never blocked.

| Use case | Spans | Use today |
|---|---|---|
| Collect payment with early-payment discount (EPD) | O2C → Finance (AR) | [Receipts, credits & discounts](../finance/receipts-credits-discounts.md) |
| Handle a damaged-goods sales return | O2C → Warehouse → Finance | [O2C](../o2c/order-to-cash.md) · [Managing inventory](../warehouse-management/inventory.md) |
| Procure to pay: PO → GRN → 3-way match → pay | P2P → Suppliers → Finance (AP) | [Three-way matching & payments](../p2p/three-way-matching-and-payments.md) · [Suppliers](../suppliers/suppliers.md) |
| Run a production order with batch traceability | Plant Production → Warehouse | [Plant Production](../plant-production/README.md) · [QR & batch traceability](../plant-production/qr-and-batch-traceability.md) |
| Move stock between warehouses | Warehouse | [Inter-warehouse transfer](../warehouse-management/iwt.md) |
| Build & approve a price list | Products → Price Lists | [Price Lists](../price-lists/README.md) |
| Onboard an employee & run payroll | HR → Finance | [Human Resources](../hrms/README.md) · [Payroll Accounting](../finance/payroll.md) |
| Month-end: close the books & file GST | Finance | [Finance & Accounts](../finance/README.md) |

---

## Related
Start with the **[platform overview](../README.md)** for the big picture, or jump straight to a
module from **[Explore the guides](../README.md#explore-the-guides)**.

<!-- INTERNAL:START -->
**For the DAEE team (internal):** Use cases are the cross-module "proof" layer over the per-module
guides — they exist to demonstrate that operational events and the books stay one connected truth across
module boundaries (application → dealer master → order → compliant invoice → ledger). When authoring a
new journey, reuse the per-module guides for step depth and keep the use-case page focused on the
hand-offs *between* modules (where data crosses a boundary, who owns each leg, and what could break at
the seam). The "Planned journeys" table is the backlog; promote a row to "Available now" only when its
dedicated walkthrough is written and its screenshots are captured from staging.
<!-- INTERNAL:END -->
