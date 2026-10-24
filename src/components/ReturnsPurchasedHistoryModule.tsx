import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  Calendar,
  Smartphone,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { CurrencyCode, PaymentMethod, ProductReturn, SaleTransaction } from '../types';
import { formatMoney, formatDateTime } from '../utils/formatters';

interface ReturnsPurchasedHistoryModuleProps {
  sales: SaleTransaction[];
  returns: ProductReturn[];
  activeCurrency: CurrencyCode;
  onProcessReturn: (ret: ProductReturn, restockItems: boolean) => void;
  onOpenInvoiceModal: (sale: SaleTransaction) => void;
}

export const ReturnsPurchasedHistoryModule: React.FC<ReturnsPurchasedHistoryModuleProps> = ({
  sales,
  returns,
  activeCurrency,
  onProcessReturn,
  onOpenInvoiceModal,
}) => {
  const [activeTab, setActiveTab] = useState<'sales_history' | 'returns_log'>('sales_history');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected sale for return modal
  const [selectedSaleForReturn, setSelectedSaleForReturn] = useState<SaleTransaction | null>(null);
  const [returnReason, setReturnReason] = useState<ProductReturn['items'][0]['reason']>('wrong_item');
  const [restockToInventory, setRestockToInventory] = useState(true);
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('Packaging intact, inspected by technician.');

  const filteredSales = sales.filter((s) => {
    return (
      s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerPhone.includes(searchQuery) ||
      s.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleForReturn) return;

    const returnNumber = `RET-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const returnRecord: ProductReturn = {
      id: `ret-${Date.now()}`,
      returnNumber,
      originalInvoiceNumber: selectedSaleForReturn.invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      customerName: selectedSaleForReturn.customerName,
      customerPhone: selectedSaleForReturn.customerPhone,
      items: selectedSaleForReturn.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        refundAmount: i.subtotal,
        reason: returnReason,
        restocked: restockToInventory,
      })),
      totalRefund: selectedSaleForReturn.grandTotal,
      refundMethod,
      processedBy: 'Al-Rabil Front Desk',
      notes,
    };

    onProcessReturn(returnRecord, restockToInventory);
    setSelectedSaleForReturn(null);
    setActiveTab('returns_log');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <span>Purchased History Log & Returns Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            Search customer purchase receipts, review active warranty dates, and process item exchanges or cash/credit refunds.
          </p>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start md:self-auto">
          <button
            onClick={() => setActiveTab('sales_history')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'sales_history' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Sales Receipts History ({sales.length})
          </button>
          <button
            onClick={() => setActiveTab('returns_log')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'returns_log' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Processed Returns Log ({returns.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Sales Receipts History */}
      {activeTab === 'sales_history' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search receipt #, phone (+968), customer or device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-3">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {sale.invoiceNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {formatDateTime(sale.date)}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 capitalize">
                      [{sale.status}]
                    </span>
                  </div>

                  <div className="text-slate-200 font-medium">
                    Customer: {sale.customerName} ({sale.customerPhone})
                  </div>

                  {/* Purchased items list */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {sale.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300"
                      >
                        {item.quantity}x {item.productName}
                      </span>
                    ))}
                  </div>

                  {sale.warrantyUntil && (
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Warranty Valid Through: {sale.warrantyUntil}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto font-mono">
                  <div className="text-right">
                    <div className="font-bold text-base text-amber-300">
                      {formatMoney(sale.grandTotal, activeCurrency)}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      Paid via {sale.paymentMethod}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 font-sans">
                    <button
                      onClick={() => onOpenInvoiceModal(sale)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
                    >
                      View Invoice
                    </button>
                    <button
                      onClick={() => setSelectedSaleForReturn(sale)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold text-xs transition"
                    >
                      Return / Refund
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Returns Log */}
      {activeTab === 'returns_log' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {returns.map((ret) => (
              <div
                key={ret.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-rose-400">{ret.returnNumber}</span>
                    <span className="text-slate-400 text-[10px]">
                      Original: {ret.originalInvoiceNumber}
                    </span>
                    <span className="text-[10px] text-slate-500">{ret.date}</span>
                  </div>

                  <div className="text-slate-200">
                    Customer: {ret.customerName} ({ret.customerPhone})
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1">
                    {ret.items.map((i) => `${i.quantity}x ${i.productName} [Reason: ${i.reason}]`).join(', ')}
                  </div>

                  {ret.notes && (
                    <div className="text-[10px] text-slate-500 mt-1">Notes: {ret.notes}</div>
                  )}
                </div>

                <div className="text-right font-mono self-end md:self-auto">
                  <div className="font-bold text-sm text-rose-400">
                    -{formatMoney(ret.totalRefund, activeCurrency)}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    Refunded via {ret.refundMethod}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {selectedSaleForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 text-xs space-y-4">
            <h3 className="font-bold text-sm text-white">
              Process Return for Invoice {selectedSaleForReturn.invoiceNumber}
            </h3>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span>{selectedSaleForReturn.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Refund Amount (OMR):</span>
                <span className="text-rose-400 font-bold">
                  {formatMoney(selectedSaleForReturn.grandTotal, activeCurrency)}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Return Reason</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  <option value="wrong_item">Wrong Item Purchased (Unopened)</option>
                  <option value="defective">Defective / Manufacturing Issue</option>
                  <option value="customer_regret">Customer Change of Mind</option>
                  <option value="warranty_replacement">Warranty Replacement Swap</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Refund Method</label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  <option value="cash">Cash from Register Drawer</option>
                  <option value="bank_transfer">Bank Transfer (Wafaa / Mobile)</option>
                  <option value="customer_credit">Store Credit / Khata Adjustment</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={restockToInventory}
                  onChange={(e) => setRestockToInventory(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500"
                />
                <span className="text-slate-300">
                  Return items back into sellable inventory stock
                </span>
              </label>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Inspection Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedSaleForReturn(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
