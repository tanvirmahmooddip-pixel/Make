import React, { useState } from 'react';
import {
  FileText,
  Clock,
  AlertTriangle,
  Send,
  MessageCircle,
  CheckCircle2,
  Phone,
  Copy,
  Check,
} from 'lucide-react';
import { CurrencyCode, SaleTransaction } from '../types';
import { formatMoney, formatDateTime } from '../utils/formatters';

interface InvoicesReceivablesModuleProps {
  sales: SaleTransaction[];
  activeCurrency: CurrencyCode;
  onMarkInvoicePaid: (invoiceId: string) => void;
  onOpenInvoiceModal: (sale: SaleTransaction) => void;
}

export const InvoicesReceivablesModule: React.FC<InvoicesReceivablesModuleProps> = ({
  sales,
  activeCurrency,
  onMarkInvoicePaid,
  onOpenInvoiceModal,
}) => {
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // Unpaid or pending credit invoices
  const pendingSales = sales.filter((s) => s.status === 'pending' || s.paymentMethod === 'customer_credit');

  const totalOutstanding = pendingSales.reduce((acc, s) => acc + s.grandTotal, 0);

  const generateReminderMessage = (sale: SaleTransaction) => {
    return `السلام عليكم ورحمة الله، عزيزي/عزيزتي ${sale.customerName}،
نود تذكيركم بلطف بوجود فاتورة مستحقة لدى شركة الرابيل للهواتف والأمان الذكي (فاتورة رقم: ${sale.invoiceNumber}) بمبلغ: ${formatMoney(sale.grandTotal, activeCurrency)}.
يرجى التكرم بالتحويل عبر بنك مسقط أو سدادها في المعرض.
شكراً لتعاملكم الراقي معنا!
Al-Rabil Mobiles & CCTV - Tel: +968 2478 9120`;
  };

  const handleCopyReminder = (sale: SaleTransaction) => {
    const text = generateReminderMessage(sale);
    navigator.clipboard.writeText(text);
    setCopiedInvoiceId(sale.id);
    setTimeout(() => setCopiedInvoiceId(null), 2000);
  };

  const handleOpenWhatsApp = (sale: SaleTransaction) => {
    const cleanPhone = sale.customerPhone.replace(/\D/g, '');
    const text = encodeURIComponent(generateReminderMessage(sale));
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Invoices & Automated Overdue Reminders</span>
          </h1>
          <p className="text-xs text-slate-400">
            Track customer credit balances (Khata book), aging receivables, and dispatch 1-click WhatsApp payment reminders.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Total Outstanding A/R:</span>{' '}
          <span className="font-bold text-amber-400 text-sm">
            {formatMoney(totalOutstanding, activeCurrency)}
          </span>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {pendingSales.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
            <p>All client invoices are fully paid! No overdue credit receivables.</p>
          </div>
        ) : (
          pendingSales.map((sale) => (
            <div
              key={sale.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {sale.invoiceNumber}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold uppercase">
                    Pending Payment
                  </span>
                  <span className="text-slate-400 text-[10px]">{formatDateTime(sale.date)}</span>
                </div>

                <div className="text-slate-200 font-semibold text-sm">
                  {sale.customerName} ({sale.customerPhone})
                </div>

                <div className="text-slate-400 text-[11px] mt-1">
                  Items: {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                </div>
              </div>

              {/* Actions & Balance */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 self-end md:self-auto font-mono">
                <div className="text-right">
                  <div className="text-base font-bold text-rose-400">
                    {formatMoney(sale.grandTotal, activeCurrency)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">Payment Overdue</div>
                </div>

                <div className="flex items-center gap-2 font-sans">
                  <button
                    onClick={() => handleCopyReminder(sale)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    title="Copy WhatsApp Arabic Reminder Template"
                  >
                    {copiedInvoiceId === sale.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenWhatsApp(sale)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Reminder</span>
                  </button>

                  <button
                    onClick={() => onMarkInvoicePaid(sale.id)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Collect Payment</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
