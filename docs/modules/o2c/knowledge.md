# O2C (Order-to-Cash) Module - Application Knowledge

## Overview
The O2C module handles the complete order-to-cash process including indent creation, order processing, invoicing, and payment collection.

## Key Components

### Indents
- **Purpose**: Purchase requisitions from dealers
- **Status Flow**: draft → submitted → approved → processed
- **Key Fields**: dealer_id, products, quantities, status

### Orders
- **Purpose**: Confirmed purchase orders
- **Created From**: Approved indents
- **Key Fields**: indent_id, order_number, status

## Business Rules

### Indent Creation
- Must select a dealer
- Must add at least one product
- Quantities must be positive numbers
- Dealer must be active and approved

### Indent Submission
- All required fields must be filled
- Products must have valid quantities
- Dealer must be selected

### Indent Approval
- Requires appropriate permissions
- Can be rejected with reason
- Updates dealer credit limits

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
