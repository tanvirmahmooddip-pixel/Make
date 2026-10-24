import { CurrencyCode } from '../types';

export const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number; decimals: number; name: string }> = {
  OMR: { symbol: 'OMR', rate: 1.0, decimals: 3, name: 'Omani Rial (ر.ع.)' },
  USD: { symbol: '$', rate: 2.60, decimals: 2, name: 'US Dollar ($)' },
  AED: { symbol: 'AED', rate: 9.55, decimals: 2, name: 'UAE Dirham (د.إ)' },
  SAR: { symbol: 'SAR', rate: 9.75, decimals: 2, name: 'Saudi Riyal (ر.س)' },
  EUR: { symbol: '€', rate: 2.38, decimals: 2, name: 'Euro (€)' },
  INR: { symbol: '₹', rate: 224.50, decimals: 2, name: 'Indian Rupee (₹)' },
};

export function formatMoney(amountInOMR: number, currency: CurrencyCode = 'OMR'): string {
  const conf = CURRENCY_RATES[currency] || CURRENCY_RATES.OMR;
  const converted = amountInOMR * conf.rate;
  return `${conf.symbol} ${converted.toLocaleString('en-US', {
    minimumFractionDigits: conf.decimals,
    maximumFractionDigits: conf.decimals,
  })}`;
}

export function formatOMR(amountInOMR: number): string {
  return `OMR ${(amountInOMR || 0).toFixed(3)}`;
}

export function calculateOmanVAT(subtotal: number, vatRatePercent: number = 5): { net: number; vat: number; gross: number } {
  // If price is VAT inclusive:
  const vat = (subtotal * vatRatePercent) / 100;
  const gross = subtotal + vat;
  return { net: subtotal, vat, gross };
}

export function formatDate(isoOrDate: string | Date): string {
  try {
    const d = new Date(isoOrDate);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(isoOrDate);
  }
}

export function formatDateTime(isoOrDate: string | Date): string {
  try {
    const d = new Date(isoOrDate);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(isoOrDate);
  }
}

// Generate an SVG or base64 data uri for QR code visualization for Oman VAT tax invoice
export function generateTaxQrData(sellerName: string, vatNumber: string, timestamp: string, totalWithVat: number, vatAmount: number): string {
  const payload = `Seller: ${sellerName} | VAT: ${vatNumber} | Time: ${timestamp} | Total: OMR ${totalWithVat.toFixed(3)} | Tax: OMR ${vatAmount.toFixed(3)}`;
  return encodeURIComponent(payload);
}
