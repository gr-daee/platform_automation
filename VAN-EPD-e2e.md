E2E Automated Test Suite: VAN Payment to EPD Recapture
Project: DAE-261 | Financial Integrity Suite
Author: Sr. Automation Engineer
Environment: Staging / UAT
1. Test Prerequisites
Dealer ID: DL-4001 (Ensure balance is 0 before start).
VAN Mapping: VPA-DL4001 mapped to Dealer DL-4001.
Tenant Config: epd_recapture_threshold = 1.00, epd_recapture_auto_apply = TRUE.
2. Phase 1: Invoicing & VAN Payment (The Trigger)
Step 1.1: Create Sales Invoice (Inv-01)
Action: POST /api/v1/sales/invoices (Amount: ₹10,000, GST: 18%).
Verification URL: {{BASE_URL}}/sales/invoices/INV-01
Expected Result: Invoice status is POSTED. balance_due = ₹10,000.
Step 1.2: Simulate VAN Inward (Webhook)
Action: Trigger Webhook /api/v1/webhooks/van-payment (Amount: ₹10,000, Reference: INV-01).
Verification URL: {{BASE_URL}}/finance/cash-receipts
Expected Result: A Cash Receipt CR-001 is created. INV-01 status changes to PAID.
3. Phase 2: EPD CCN Generation & Utilization
Step 2.1: Automated Discount Generation
Action: Trigger Batch Job /api/v1/jobs/epd-processor.
Verification URL: {{BASE_URL}}/finance/credit-memos (Filter by Type: Commercial)
Expected Result: CCN-01 generated for ₹1,000 (10% of 10k). Status = OPEN.
Step 2.2: Credit Utilization (The "Spending" Phase)
Action: Create Inv-02 (₹15,000). Apply CCN-01 to Inv-02.
Verification URL: {{BASE_URL}}/sales/invoices/INV-02
Expected Result: Invoice balance reduces to ₹14,000. CCN-01 status becomes CLOSED.
4. Phase 3: Sales Return & Recapture (The "Clawback")
Step 3.1: Post Sales Return
Action: POST /api/v1/sales/returns (Qty: 100% of Inv-01).
Verification URL: {{BASE_URL}}/sales/returns/RO-001
Expected Result: Two documents are generated:
TCN-001 (Tax Credit Note) for ₹10,000.
CDN-001 (Comm. Debit Note) for ₹1,000.
5. Phase 4: Report Verification (Validation Logic)
This is the core of the automation script. You must navigate to each URL and verify the DOM elements or API response.
4.1 Dealer Ledger (The Transaction Log)
URL: {{BASE_URL}}/reports/finance/dealer-ledger?dealer_id=DL-4001
Verify Rows:
Inv-01: Dr ₹10,000
CR-001: Cr ₹10,000
CCN-01: Cr ₹1,000
TCN-001: Cr ₹10,000
CDN-001: Dr ₹1,000
Verification Logic: Assert Final_Balance == Total_Debits - Total_Credits
4.2 Dealer Outstanding Summary
URL: {{BASE_URL}}/reports/finance/dealer-outstanding
Verify Column: Net Receivable
Expected Result: Should show ₹14,000 (The remaining balance of Inv-02).
4.3 AR Aging Report
URL: {{BASE_URL}}/reports/finance/ar-aging
Verify Buckets:
The ₹1,000 CDN-001 (Debit) and ₹10,000 TCN-001 (Credit) should appear in the 0-30 Days bucket.
They should not be "lost" in unallocated buckets.
4.4 General Ledger (GL Audit)
URL: {{BASE_URL}}/reports/finance/general-ledger
Verification Logic: Search for Account 6503 (EPD Recapture Income).
Expected Result: One entry of Credit ₹1,000 mapped to CDN-001.
4.5 GST Compliance (GSTR-1 Ready)
URL: {{BASE_URL}}/reports/tax/gstr1?period=Current_Month
Verification Logic: Filter Section 9B (Credit/Debit Notes).
Expected Result:
TCN-001 (₹10,000) MUST be present.
CCN-01 and CDN-001 MUST NOT be present (as they are non-tax commercial docs).
6. Automation "Gotchas" to script for:
Document Linkage:
Nav to {{BASE_URL}}/finance/debit-memos/CDN-001.
Verify the UI has a hyperlink to RO-001 and Inv-01.
State Mismatch:
If TCN is generated but CDN is not (due to threshold), verify the Ledger shows only the TCN.
VAN Re-association:
Ensure that if a VAN payment is reversed (Bounce), the system does not generate an EPD.
7. Reporting & Logs
Log Capture: Capture the trace_id for the Webhook and the Batch Job.
Screen Capture: Take screenshots of the Dealer Ledger and GSTR-1 Report pages at the end of the script for the QA Audit folder.