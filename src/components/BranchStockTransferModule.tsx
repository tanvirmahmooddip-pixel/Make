import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Camera,
  CheckCircle2,
  Clock,
  Building2,
  Boxes,
  Truck,
  Printer,
  FileText,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  BranchStockTransfer,
  CurrencyCode,
  Product,
  StoreLocation,
  User,
} from '../types';
import { formatMoney } from '../utils/formatters';
import { UniversalCameraBarcodeScanner } from './UniversalCameraBarcodeScanner';

interface BranchStockTransferModuleProps {
  transfers: BranchStockTransfer[];
  branches: StoreLocation[];
  products: Product[];
  currentUser: User;
  activeCurrency: CurrencyCode;
  onInitiateTransfer: (transfer: BranchStockTransfer) => void;
  onReceiveTransfer: (transferId: string) => void;
}

export const BranchStockTransferModule: React.FC<BranchStockTransferModuleProps> = ({
  transfers,
  branches,
  products,
  currentUser,
  activeCurrency,
  onInitiateTransfer,
  onReceiveTransfer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_transit' | 'received'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Form State
  const [sourceBranchId, setSourceBranchId] = useState(branches[0]?.id || '');
  const [targetBranchId, setTargetBranchId] = useState(branches[1]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [transferQuantity, setTransferQuantity] = useState('1');
  const [transferNotes, setTransferNotes] = useState('');

  // Selected product detail
  const currentSelectedProduct = products.find((p) => p.id === selectedProductId);

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      t.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sourceBranchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.targetBranchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = () => {
    setSourceBranchId(branches[0]?.id || '');
    setTargetBranchId(branches[1]?.id || '');
    setSelectedProductId(products[0]?.id || '');
    setTransferQuantity('1');
    setTransferNotes('');
    setIsModalOpen(true);
  };

  const handleBarcodeScanResult = (barcode: string, matched?: Product) => {
    if (matched) {
      setSelectedProductId(matched.id);
    } else {
      const found = products.find(
        (p) => p.barcode === barcode || p.sku.toLowerCase() === barcode.toLowerCase()
      );
      if (found) {
        setSelectedProductId(found.id);
      }
    }
    setIsScannerOpen(false);
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedProduct) return;

    const qty = parseInt(transferQuantity, 10) || 1;
    if (qty <= 0) return;

    if (sourceBranchId === targetBranchId) {
      alert('Source branch and destination branch must be different.');
      return;
    }

    const sourceBranch = branches.find((b) => b.id === sourceBranchId);
    const targetBranch = branches.find((b) => b.id === targetBranchId);

    const newTransfer: BranchStockTransfer = {
      id: `tr-${Date.now()}`,
      transferNumber: `TR-OM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      sourceBranchId,
      sourceBranchName: sourceBranch?.name || 'Main Branch',
      targetBranchId,
      targetBranchName: targetBranch?.name || 'Target Branch',
      items: [
        {
          productId: currentSelectedProduct.id,
          productName: currentSelectedProduct.name,
          sku: currentSelectedProduct.sku,
          barcode: currentSelectedProduct.barcode,
          quantity: qty,
        },
      ],
      status: 'in_transit',
      transferredBy: currentUser.name,
      notes: transferNotes || 'Scheduled branch inventory reallocation',
    };

    onInitiateTransfer(newTransfer);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            Inter-Branch Stock Transfer Automation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Reallocate smartphones, accessories, and CCTV inventory between Ruwi, Seeb, Salalah & Sohar branches with barcode scan tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-400 transition cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Transfer Item</span>
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Transfer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transfer #, branch or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Status:</span>
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
              }`}
            >
              All ({transfers.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_transit')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'in_transit'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300'
              }`}
            >
              In Transit
            </button>
            <button
              onClick={() => setStatusFilter('received')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'received' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
              }`}
            >
              Received
            </button>
          </div>
        </div>
      </div>

      {/* Transfers List */}
      <div className="space-y-3">
        {filteredTransfers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Boxes className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-400" />
            <p className="text-sm font-semibold text-slate-300">No stock transfers found</p>
            <p className="text-xs text-slate-500 mt-1">Initiate a transfer between branches to rebalance store stock.</p>
          </div>
        ) : (
          filteredTransfers.map((transfer) => {
            const isReceived = transfer.status === 'received';
            return (
              <div
                key={transfer.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">
                          {transfer.transferNumber}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isReceived
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                          }`}
                        >
                          {transfer.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Date: {transfer.date} • Dispatched by {transfer.transferredBy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isReceived && (
                      <button
                        onClick={() => onReceiveTransfer(transfer.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Received at Branch</span>
                      </button>
                    )}
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                      title="Print Branch Transfer Delivery Note"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Route visualization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                        Source Branch (Stock Out):
                      </span>
                      <span className="font-semibold text-slate-200">{transfer.sourceBranchName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                        Destination Branch (Stock In):
                      </span>
                      <span className="font-semibold text-slate-200">{transfer.targetBranchName}</span>
                    </div>
                  </div>
                </div>

                {/* Items in transfer */}
                <div className="border-t border-slate-800/80 pt-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Transferred Inventory Units:
                  </span>
                  <div className="space-y-1.5">
                    {transfer.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-850 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Boxes className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-medium text-slate-200">{item.productName}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            (SKU: {item.sku} | Barcode: {item.barcode})
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold text-xs border border-amber-500/20">
                          {item.quantity} Units
                        </span>
                      </div>
                    ))}
                  </div>

                  {transfer.notes && (
                    <p className="text-[11px] text-slate-400 italic mt-2.5">
                      Note: {transfer.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                Initiate Inter-Branch Stock Transfer
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
              {/* Source & Destination Branches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    From Source Branch (Stock Out):
                  </label>
                  <select
                    value={sourceBranchId}
                    onChange={(e) => setSourceBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    To Destination Branch (Stock In):
                  </label>
                  <select
                    value={targetBranchId}
                    onChange={(e) => setTargetBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Select with Scanner Shortcut */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Select Product to Transfer:</label>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Scan Barcode
                  </button>
                </div>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Available: {p.stock} units) - {p.barcode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Quantity to Move:
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentSelectedProduct ? currentSelectedProduct.stock : 99}
                  value={transferQuantity}
                  onChange={(e) => setTransferQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                />
                {currentSelectedProduct && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Source current stock: {currentSelectedProduct.stock} units. New source stock will be{' '}
                    {Math.max(0, currentSelectedProduct.stock - (parseInt(transferQuantity, 10) || 0))}.
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Transfer Dispatch Notes / Vehicle Reg:
                </label>
                <textarea
                  rows={2}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="e.g. Dispatched with Driver Salim via Toyota Hilux 4921-A"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Confirm & Dispatch Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Camera Scanner Modal */}
      <UniversalCameraBarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={handleBarcodeScanResult}
        products={products}
        title="Scan Item to Transfer"
        subtitle="Aim camera at barcode on phone box or accessory"
      />
    </div>
  );
};
