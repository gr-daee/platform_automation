# Troubleshooting Guide

> **Audience:** Customer + Internal | **Section:** Knowledge Base | **Status:** Authored
>
> Part of the **[Knowledge Base](../knowledge-base.md)**.


Common issues and their solutions in DAEE ERP.

---

## Order to Cash (O2C) Issues

### Sales Order Won't Create

**Symptoms**: Error when trying to create sales order from indent

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Credit limit exceeded | Check dealer credit limit in Master Data > Dealers |
| Dealer is inactive | Reactivate dealer or contact admin |
| No inventory available | Check stock levels or create back order |
| Price list not assigned | Assign price list to dealer category |
| Approval pending | Complete indent approval workflow |

**Steps to Diagnose**:
1. Go to **O2C > Sales Indents** and check indent status
2. Verify dealer status in **Master Data > Dealers**
3. Check credit limit vs outstanding balance
4. Verify inventory availability for products

---

### FEFO Allocation Failed

**Symptoms**: Order shows "Allocation Failed" or creates unexpected back orders

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| No available inventory | Check stock in all warehouses |
| All batches expired | Remove expired inventory, restock |
| Batch on hold/quarantine | Release batch or use different batch |
| Reserved by another order | Wait for other order or reallocate |
| Wrong warehouse selected | Change warehouse in order |

**Steps to Diagnose**:
1. Go to **Inventory > Stock** and filter by product
2. Check batch expiry dates and status
3. Verify available vs reserved quantities
4. Check for pending allocations

---

### E-Invoice Generation Failed

**Symptoms**: "E-Invoice Failed" error, no IRN generated

**Common Error Messages**:

| Error | Cause | Solution |
|-------|-------|----------|
| "GSTIN not active" | Dealer GSTIN is invalid | Verify GSTIN on GST portal |
| "HSN code invalid" | Product HSN missing or wrong | Update HSN in product master |
| "PIN code mismatch" | Address PIN doesn't match state | Correct dealer address |
| "Duplicate IRN" | Invoice already has IRN | Invoice already processed |
| "Amount mismatch" | Tax calculation error | Review invoice calculations |
| "Timeout" | Portal slow/unavailable | Retry after few minutes |

**Steps to Diagnose**:
1. Check invoice in **O2C > Invoices**
2. View E-Invoice status and error message
3. Click **View Error Details** for specific issue
4. Fix the issue and click **Retry E-Invoice**

---

### Payment Not Allocated

**Symptoms**: Payment received but invoices still show "Unpaid"

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Payment not posted | Check payment status, post if draft |
| Wrong dealer selected | Correct dealer on payment receipt |
| Payment on hold | Release hold on payment |
| Manual allocation needed | Go to Payment Allocation and allocate |
| System error | Contact support with payment ID |

**Steps to Diagnose**:
1. Go to **Finance > Payments** and find the payment
2. Check payment status (Draft, Posted, Allocated)
3. Verify dealer matches invoice dealer
4. Check **Finance > Payment Allocation** for allocation status

---

## Procure to Pay (P2P) Issues

### Purchase Order Stuck in Approval

**Symptoms**: PO shows "Pending Approval" for extended time

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Approver on leave | Check approver availability, escalate |
| Approval limit exceeded | Route to higher authority |
| No approver assigned | Configure approval workflow |
| Email notification failed | Manually notify approver |

**Steps to Diagnose**:
1. Go to **P2P > Purchase Orders** and view PO
2. Click **View Approval History**
3. Check current pending approver
4. Contact approver or escalate

---

### Three-Way Matching Failed

**Symptoms**: Invoice blocked due to matching exception

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Quantity mismatch | Verify GRN quantities vs PO |
| Price variance | Check if price changed after PO |
| Missing GRN | Create GRN for received goods |
| Wrong PO referenced | Correct PO reference on invoice |

**Steps to Diagnose**:
1. Go to **P2P > Supplier Invoices** and view invoice
2. Click **View Matching Details**
3. Compare PO, GRN, and Invoice values
4. Request approval for variance or correct data

---

## Inventory Issues

### Stock Count Doesn't Match

**Symptoms**: Physical count differs from system count

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Pending receipts | Post all pending GRNs |
| Pending issues | Post all pending deliveries |
| Unposted adjustments | Review and post adjustments |
| In-transit not counted | Include or exclude consistently |
| Data entry error | Investigate and adjust |

**Steps to Diagnose**:
1. Go to **Inventory > Stock** and export current values
2. Check **Inventory > Pending Receipts**
3. Check **Inventory > Pending Issues**
4. Run stock ledger report for the period
5. Create adjustment for variance

---

### Inter-Warehouse Transfer Stuck

**Symptoms**: IWT shows "In Transit" but goods received

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Receipt not posted | Complete receive process |
| Quantity mismatch | Accept partial or investigate |
| System error | Contact support |

**Steps to Diagnose**:
1. Go to **Inventory > Inter-Warehouse Transfers**
2. Find the IWT and check status
3. If shipped but not received, complete receive
4. If quantity mismatch, document and adjust

---

## Finance Issues

### Journal Entry Won't Post

**Symptoms**: Error when trying to post journal entry

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Entry not balanced | Ensure debits = credits |
| Invalid account | Use posting accounts only |
| Period closed | Open period or change date |
| Account inactive | Use active account |
| Missing approval | Get required approval |

**Steps to Diagnose**:
1. Go to **Finance > Journal Entries** and view entry
2. Verify total debits = total credits
3. Check all accounts are valid posting accounts
4. Verify entry date is in open period

---

### VAN Payment Not Reconciling

**Symptoms**: Bank shows payment but not in DAEE

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Wrong VAN used | Verify VAN number with bank |
| Webhook failed | Check API logs, retry |
| Validation failed | Check VAN payment status |
| Dealer mismatch | Verify dealer-VAN mapping |

**Steps to Diagnose**:
1. Go to **Finance > VAN Payments** and search by UTR
2. Check payment status (Validated, Posted, Failed)
3. If not found, check **Admin > API Security Logs**
4. Contact bank or support if webhook issues

---

## Authentication & Access Issues

### Cannot Log In

**Symptoms**: Login fails with error message

**Common Causes & Solutions**:

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid credentials" | Wrong password | Use "Forgot Password" |
| "Account locked" | Too many failed attempts | Wait 30 min or contact admin |
| "Account inactive" | User deactivated | Contact admin to reactivate |
| "Session expired" | Token timeout | Log in again |

---

### Missing Menu Items

**Symptoms**: Cannot see certain modules or features

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Missing role | Request role assignment from admin |
| Missing permission | Request specific permission |
| Feature not enabled | Contact admin to enable |
| Browser cache | Clear browser cache |

**Steps to Diagnose**:
1. Go to **Profile > My Roles** and check assigned roles
2. Compare with colleague who has access
3. Request missing role/permission from admin

---

### Permission Denied Error

**Symptoms**: "You don't have permission" error message

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Missing create permission | Request create permission |
| Missing update permission | Request update permission |
| Missing approve permission | Request approve permission |
| Record from different tenant | Verify correct tenant login |

**Steps to Diagnose**:
1. Note the exact error message
2. Check which action triggered error
3. Request specific permission from admin

---

## Performance Issues

### Slow Page Load

**Symptoms**: Pages take long time to load

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Large data set | Use filters to reduce data |
| Network issues | Check internet connection |
| Browser issues | Clear cache, use Chrome |
| Server load | Try again later |

**Steps to Improve**:
1. Use date filters to reduce data range
2. Clear browser cache
3. Close unused browser tabs
4. Use Chrome or Edge browser

---

### Report Taking Too Long

**Symptoms**: Reports timeout or take minutes to generate

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Large date range | Reduce date range |
| Too many records | Add filters |
| Complex report | Export to Excel for analysis |
| Server busy | Run during off-peak hours |

**Steps to Improve**:
1. Reduce date range (monthly instead of yearly)
2. Add filters (specific dealer, product, etc.)
3. Export data and analyze in Excel
4. Schedule reports for off-peak hours

---

## Getting Help

### Before Contacting Support

1. **Note the exact error message** - Screenshot if possible
2. **Document steps to reproduce** - What did you do before error?
3. **Check this guide first** - Many issues have simple solutions
4. **Try basic troubleshooting**:
   - Refresh the page
   - Clear browser cache
   - Try different browser
   - Log out and log back in

### Contact Support

- **Email**: support@daee.in
- **Include**:
  - Your username and tenant
  - Exact error message
  - Steps to reproduce
  - Screenshots if available
  - Time when issue occurred

### Emergency Issues

For critical production issues:
- **Phone**: +91-XXXX-XXXXXX (Business hours)
- **Priority Email**: urgent@daee.in
