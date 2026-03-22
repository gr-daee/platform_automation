/**
 * Finance UI helpers — stable matching for invoice rows in Radix Selects.
 *
 * Credit memo apply / original invoice SelectItem text is:
 *   "{invoice_number} - {date} - ₹… balance" (see credit-memos/[id]/page.tsx, new/page.tsx).
 * A naive RegExp(invoiceNumber) matches the first option whose accessible name *contains*
 * that substring (e.g. "SI-1" matches "SI-10"). Anchor to the start of the option label.
 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Accessible name of SelectItem starts with invoice number then " - ".
 */
export function selectOptionNameRegexForInvoiceNumber(invoiceNumber: string): RegExp {
  return new RegExp(`^${escapeRegExp(invoiceNumber)}\\s+-\\s+`, 'i');
}
