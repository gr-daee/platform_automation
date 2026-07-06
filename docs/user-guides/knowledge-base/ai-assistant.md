# AI Assistant Guide

> **Audience:** Customer + Internal | **Section:** Knowledge Base | **Status:** Authored
>
> Part of the **[Knowledge Base](../knowledge-base.md)**.

> ⚠️ **Status: planned.** The AI assistant described here is the target design — it is not yet live. Until it ships, use Knowledge Base search + the articles below. The assistant will answer only from published, approved KB content, with citations.


DAEE ERP includes an intelligent AI Assistant that helps users navigate the system, understand business processes, and troubleshoot issues.

## How to Use the AI Assistant

### Asking Questions
The AI Assistant understands natural language questions about:
- **How-to**: Step-by-step guidance for tasks
- **What-is**: Explanations of concepts and features
- **Why**: Business logic and system behavior
- **Troubleshooting**: Issue diagnosis and resolution

### Best Practices
1. **Be specific**: "How do I create an E-Invoice?" is better than "Help with invoices"
2. **Provide context**: Include module name when asking (e.g., "In O2C, how do I...")
3. **Use business terms**: The assistant understands ERP terminology

---

## Question Categories

### Quick Links
- Order to Cash Questions
- Procure to Pay Questions
- Inventory Questions
- Finance Questions
- Administration Questions
- Government Compliance Questions

---

## Sample Conversations

### Example 1: Creating a Sales Order
**User**: How do I create a sales order for a dealer?

**Assistant**: To create a sales order in DAEE:

1. **Navigate**: Go to **O2C > Sales Orders > New**
2. **Select Dealer**: Choose the dealer from the dropdown
3. **Add Products**: Search and add products with quantities
4. **Review Pricing**: System applies price list and discounts automatically
5. **Submit**: Click "Create Order" to trigger FEFO allocation

The system will:
- Check credit limit and block if exceeded
- Allocate inventory using FEFO (First Expiry First Out)
- Create back orders for any shortages
- Generate picklist for warehouse team

---

### Example 2: Understanding Payment Status
**User**: Why is an invoice showing "Partially Paid"?

**Assistant**: An invoice shows "Partially Paid" when:

1. **Payment received** is less than invoice amount
2. **Payment allocated** using FIFO didn't fully cover this invoice
3. **Earlier invoices** consumed the payment first

To check allocation:
1. Go to **Finance > Dealer Ledger**
2. Select the dealer
3. View transaction history

To allocate remaining:
1. Wait for next payment, or
2. Manually allocate available credit balance

---

### Example 3: E-Invoice Error
**User**: E-Invoice generation failed. What should I check?

**Assistant**: Common E-Invoice failure reasons:

**1. GSTIN Issues**
- Verify dealer GSTIN is valid and active
- Check GSTIN format (15 characters)
- Ensure GSTIN matches registered state

**2. HSN Code Issues**
- All products must have valid HSN codes
- HSN codes must be 4-8 digits

**3. Address Issues**
- PIN code must be valid
- State code must match GSTIN

**4. Amount Issues**
- Invoice amount > INR 0
- Tax calculations must be correct

**To retry**:
1. Go to invoice details
2. Fix any highlighted errors
3. Click "Regenerate E-Invoice"

---

## AI Capabilities

### What the AI Can Do
- Answer questions about DAEE features
- Explain business processes and workflows
- Provide step-by-step guidance
- Explain error messages and suggest fixes
- Navigate to relevant documentation
- Explain GST and compliance requirements

### What the AI Cannot Do
- Make changes to data (read-only assistant)
- Access specific transaction details (privacy)
- Override business rules or approvals
- Process payments or create orders
- Access data from other tenants

---

## Feedback
Help us improve the AI Assistant by rating responses and providing feedback. Your input helps us better understand user needs.
