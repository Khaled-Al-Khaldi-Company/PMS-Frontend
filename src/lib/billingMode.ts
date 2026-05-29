export type BillingMode = 'QUANTITY' | 'LUMP_SUM_PROGRESS';

const LUMP_SUM_UNIT_HINTS = [
  'مقطوعية',
  'مقطوع',
  'ls',
  'l.s',
  'lump',
  'job',
  'sum',
  'م.م',
];

export function isLumpSumUnit(unit?: string | null): boolean {
  const normalized = (unit || '').trim().toLowerCase();
  if (!normalized) return false;
  return LUMP_SUM_UNIT_HINTS.some((hint) => normalized.includes(hint));
}

export function resolveBillingMode(item: {
  billingMode?: string | null;
  unit?: string | null;
}): BillingMode {
  if (item.billingMode === 'LUMP_SUM_PROGRESS') return 'LUMP_SUM_PROGRESS';
  if (item.billingMode === 'QUANTITY') return 'QUANTITY';
  return isLumpSumUnit(item.unit) ? 'LUMP_SUM_PROGRESS' : 'QUANTITY';
}

export function inferBillingModeFromUnit(unit?: string): BillingMode {
  return isLumpSumUnit(unit) ? 'LUMP_SUM_PROGRESS' : 'QUANTITY';
}

export function lineContractTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

/** For lump-sum lines: progress fraction (0..quantity) from stored currentQty */
export function qtyToProgressPercent(
  currentQty: number,
  contractQty: number,
): number {
  if (contractQty <= 0) return 0;
  return (currentQty / contractQty) * 100;
}

export function progressPercentToQty(
  percent: number,
  contractQty: number,
): number {
  return (percent / 100) * contractQty;
}

/** Consistent number formatting (avoids SSR/client locale hydration mismatch) */
export function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatProgressLabel(
  qty: number,
  contractQty: number,
  billingMode: BillingMode,
): string {
  if (billingMode === 'LUMP_SUM_PROGRESS') {
    return `${qtyToProgressPercent(qty, contractQty).toFixed(1)}%`;
  }
  return String(qty);
}
