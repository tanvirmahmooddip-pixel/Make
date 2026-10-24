import React, { useState } from 'react';
import {
  PackageCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Truck,
  DollarSign,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { CurrencyCode, Product, PurchaseOrder } from '../types';
import { formatMoney } from '../utils/formatters';

interface PurchaseOrdersModuleProps {
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  activeCurrency: CurrencyCode;
  onAddPO: (po: PurchaseOrder) => void;
  onUpdatePOStatus: (poId: string, status: PurchaseOrder['status']) => void;
}

export const PurchaseOrdersModule: React.FC<PurchaseOrdersModuleProps> = ({
  purchaseOrders,
  products,
  activeCurrency,
  onAddPO,
  onUpdatePOStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'new_po'>('list');

  // Form State
  const [vendorName, setVendorName] = useState('Redington Gulf (Apple / Anker Distributor)');
  const [vendorContact, setVendorContact] = useState('orders.oman@redingtongroup.com');
  const [expectedDelivery, setExpectedDelivery] = useState('2026-10-10');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [orderQuantity, setOrderQuantity] = useState('10');
  const [unitCost, setUnitCost] = useState('11.000');

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === selectedProductId) || products[0];
    const qty = parseInt(orderQuantity, 10) || 1;
    const cost = parseFloat(unitCost) || product.costPrice;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-OM-2026-${Math.floor(10 + Math.random() * 90)}`,
      vendorName,
      vendorContact,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery,
      items: [
        {
          productId: product.id,
          productName: product.name,
          quantity: qty,
          unitCost: cost,
          total: qty * cost,
        },
      ],
      totalAmount: qty * cost,
      status: 'ordered',
      paymentStatus: 'unpaid',
      invoiceRef: `VEND-INV-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    onAddPO(newPO);
    setActiveTab('list');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-400" />
            <span>Purchase Order Tracking & Supply Chain Invoicing</span>
          </h1>
          <p className="text-xs text-slate-400">
            Procure wholesale iPhones, Dahua CCTV kits & accessories with automatic inventory receiving and vendor accounts payable.
          </p>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start md:self-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'list' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            All Purchase Orders ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('new_po')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'new_po' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            + Create New PO
          </button>
        </div>
      </div>

      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="font-mono font-bold text-amber-400">{po.poNumber}</span>
                    <span className="text-slate-400 text-[10px] ml-2">Inv: {po.invoiceRef}</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      po.status === 'received'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {po.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="font-bold text-white text-sm">{po.vendorName}</div>
                  <div className="text-slate-400 text-[11px]">{po.vendorContact}</div>
                  <div className="text-slate-400 text-[11px]">
                    Ordered: {po.orderDate} • Delivery: {po.expectedDelivery}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 mt-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Ordered Line Items:
                    </span>
                    {po.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between font-mono text-[11px]">
                        <span className="text-slate-200">
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="text-slate-300">{formatMoney(item.total, activeCurrency)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Total Payable:</span>
                    <div className="font-mono font-bold text-sm text-emerald-400">
                      {formatMoney(po.totalAmount, activeCurrency)}
                    </div>
                  </div>

                  {/* Receive Stock Action */}
                  {po.status !== 'received' ? (
                    <button
                      onClick={() => onUpdatePOStatus(po.id, 'received')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Received & Increment Stock</span>
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Stock Received in Inventory</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'new_po' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl mx-auto shadow-xl text-xs">
          <h2 className="text-sm font-bold text-white mb-4">Draft Purchase Order to Distributor</h2>

          <form onSubmit={handleCreatePO} className="space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vendor / Distributor</label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vendor Email / Phone</label>
                <input
                  type="text"
                  required
                  value={vendorContact}
                  onChange={(e) => setVendorContact(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  required
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Item to Reorder</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find((x) => x.id === e.target.value);
                  if (p) setUnitCost(p.costPrice.toFixed(3));
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Quantity to Order</label>
                <input
                  type="number"
                  required
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Agreed Wholesale Cost (OMR)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-emerald-400 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Issue Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
