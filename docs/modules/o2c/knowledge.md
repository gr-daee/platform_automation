# O2C (Order-to-Cash) Module - Application Knowledge

## Overview
The O2C module handles the complete order-to-cash process including indent creation, order processing, invoicing, and payment collection.

## Key Components

### Indents
- **Purpose**: Purchase requisitions from dealers
- **Status Flow**: draft → submitted → approved → processed / converted / back_order_created
- **Key Fields**: dealer_id, products, quantities, status, preferred_warehouse_id, transporter

### Orders (Sales Orders)
- **Purpose**: Confirmed purchase orders
- **Created From**: Approved indents via "Process Workflow"
- **Key Fields**: indent_id, order_number, status

### Indent → Sales Order Flow (Full Lifecycle)
1. **Indent raised** for dealer (Create Indent → select dealer → land on detail or existing draft).
2. **Edit Indent** (draft only): Add Product → search by product name/code (Add Products modal) → product added → quantity adjusted → **Save**.
3. **Submit Indent**: Button "Submit Indent" (enabled when items present and total amount > 0); status → **submitted**.
4. **Warehouse & Transporter**: For **submitted** indent, "Warehouse Selection" card is shown; user must select warehouse before **Approve** is enabled. Transporter can be pre-filled from dealer's preferred transporter.
5. **Approve / Reject**: Buttons visible for submitted indent (with `indents:approve` permission). **Approve** (optional comments) or **Reject** (comments required). Dialog: "Approve Indent" / "Reject Indent" with Comments textarea. Approval is blocked if dealer has any invoice with pending payment 90+ days; **credit limit** is also checked (UI shows "Credit OK" / "Credit Warning").
6. **Process Workflow** (approved indent only): Button "Process Workflow" opens dialog; "Confirm & Process" creates **Sales Order** for in-stock items and **Back Order** for items with no stock. Stock is evaluated for the selected warehouse.

## Business Rules

### Indent Creation
- Must select a dealer
- Must add at least one product
- Quantities must be positive numbers
- Dealer must be active and approved

### Indent Submission
- All required fields must be filled (items, total amount > 0)
- Submit Indent button disabled when no items or zero amount
- Dealer is already selected (from create flow)

### Indent Approval
- Requires `indents:approve` permission
- **Warehouse must be selected** before Approve is enabled (submitted indent)
- Reject requires comments; Approve comments optional
- **Blocked if** dealer has pending invoice 90+ days (server-side)
- **Credit limit** checked; UI shows Credit OK vs Credit Warning
- Can approve with back orders (partial/zero stock) – "Approve with Back Orders" when inventory insufficient

## Database Schema

### indents
- `id`: UUID (primary key)
- `dealer_id`: UUID (foreign key)
- `status`: Enum (draft, submitted, approved, rejected)
- `created_at`: Timestamp
- `submitted_at`: Timestamp
- `approved_at`: Timestamp

### indent_items
- `id`: UUID (primary key)
- `indent_id`: UUID (foreign key to indents)
- `product_id`: UUID (foreign key)
- `quantity`: Numeric
- `unit_price`: Numeric

## API Endpoints

### POST /api/o2c/indents
- **Purpose**: Create new indent
- **Request**: `{ dealer_id: string, items: Array<{product_id, quantity}> }`
- **Response**: `{ id: string, indent_number: string }`

### POST /api/o2c/indents/:id/submit
- **Purpose**: Submit indent for approval
- **Response**: `{ success: boolean }`

## Test Patterns

### Indent Creation Pattern
1. Navigate to indent creation page
2. Select dealer (Radix Select)
3. Add products with quantities
4. Submit form
5. Verify success toast
6. Verify indent created in database

### Sandwich Method for Indents
1. **DB BEFORE**: Count existing indents
2. **UI ACTION**: Create indent
3. **DB AFTER**: Verify new indent with correct data

## Related Modules
- **Dealers**: Indents require dealer selection
- **Products**: Indents include product line items
- **Inventory**: Affects inventory levels

## Known Issues / Gaps
- [To be documented as discovered]

## Test Coverage
- ⏳ Indent creation (pending)
- ⏳ Indent submission (pending)
- ⏳ Indent approval (pending)
