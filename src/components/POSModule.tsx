import React, { useState } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Printer,
  Smartphone,
  CreditCard,
  Wallet,
  Landmark,
  UserCheck,
  AlertCircle,
  Tag,
  Percent,
  Camera,
  Wifi,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Layers,
  Cpu,
  Scan,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  CartItem,
  CompanyConfig,
  CurrencyCode,
  PaymentMethod,
  Product,
  ProductCategory,
  SaleTransaction,
  User,
} from '../types';
import { formatMoney } from '../utils/formatters';
import { UniversalCameraBarcodeScanner } from './UniversalCameraBarcodeScanner';
import { soundEffects } from '../utils/soundEffects';

interface POSModuleProps {
  products: Product[];
  categories: ProductCategory[];
  currentUser: User;
  activeBranchId: string;
  activeCurrency: CurrencyCode;
  onCompleteSale: (sale: SaleTransaction) => void;
  onOpenInvoiceModal: (sale: SaleTransaction) => void;
  companyConfig?: CompanyConfig;
}

export const POSModule: React.FC<POSModuleProps> = ({
  products,
  categories,
  currentUser,
  activeBranchId,
  activeCurrency,
  onCompleteSale,
  onOpenInvoiceModal,
  companyConfig,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isExpandedMode, setIsExpandedMode] = useState<boolean>(false);
  const [isStockAllExpanded, setIsStockAllExpanded] = useState<boolean>(false);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [soundMuted, setSoundMuted] = useState<boolean>(!companyConfig?.soundEnabled);

  // Customer info
  const [customerName, setCustomerName] = useState('Cash Walk-in');
  const [customerPhone, setCustomerPhone] = useState('+968 9');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [notes, setNotes] = useState('');

  // IMEI modal state
  const [imeiModalItem, setImeiModalItem] = useState<{ index: number; imeis: string[] } | null>(null);

  // Live Camera Barcode & IMEI Scanner state
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    soundEffects.setMuted(next);
    if (!next) soundEffects.playClick();
  };

  const handleCameraScanResult = (code: string, matched?: Product) => {
    soundEffects.playBarcodeBeep();
    if (imeiModalItem !== null) {
      setCart((prev) =>
        prev.map((c, idx) =>
          idx === imeiModalItem.index ? { ...c, imeiNumbers: [code] } : c
        )
      );
      setScanFeedback(`Assigned IMEI ${code} to item`);
      setImeiModalItem(null);
      setIsCameraScannerOpen(false);
      return;
    }

    if (matched) {
      addToCart(matched);
      setScanFeedback(`Scanned & added: ${matched.name}`);
    } else {
      const found = products.find(
        (p) =>
          p.barcode.toLowerCase() === code.toLowerCase() ||
          p.sku.toLowerCase() === code.toLowerCase()
      );
      if (found) {
        addToCart(found);
        setScanFeedback(`Scanned & added: ${found.name}`);
      } else {
        setScanFeedback(`Scanned code: ${code} (Applied to search)`);
        setSearchQuery(code);
      }
    }

    setTimeout(() => {
      setScanFeedback(null);
    }, 4000);
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    const code = manualCodeInput.trim();
    const found = products.find(
      (p) =>
        p.barcode.toLowerCase() === code.toLowerCase() ||
        p.sku.toLowerCase() === code.toLowerCase() ||
        p.id.toLowerCase() === code.toLowerCase()
    );
    if (found) {
      soundEffects.playBarcodeBeep();
      addToCart(found);
      setScanFeedback(`Matched code: ${found.name}`);
      setManualCodeInput('');
    } else {
      soundEffects.playAlertBuzzer();
      setScanFeedback(`Code "${code}" not found, searching catalog.`);
      setSearchQuery(code);
    }
    setTimeout(() => setScanFeedback(null), 3500);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      soundEffects.playAlertBuzzer();
      return;
    }
    soundEffects.playBarcodeBeep();
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          soundEffects.playAlertBuzzer();
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, discount: 0, imeiNumbers: [] }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    soundEffects.playClick();
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) {
              soundEffects.playAlertBuzzer();
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    soundEffects.playClick();
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Financial calculations
  const taxRate = companyConfig?.taxRatePercent !== undefined ? companyConfig.taxRatePercent / 100 : 0.05;
  const rawSubtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  const netSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const omanVatAmount = netSubtotal * taxRate;
  const grandTotal = netSubtotal + omanVatAmount;

  const parsedCashGiven = parseFloat(cashGiven) || 0;
  const changeDue = paymentMethod === 'cash' && parsedCashGiven > grandTotal ? parsedCashGiven - grandTotal : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    soundEffects.playCashChime();

    const saleItems = cart.map((c) => ({
      productId: c.product.id,
      productName: c.product.name,
      quantity: c.quantity,
      unitPrice: c.product.sellingPrice,
      costPrice: c.product.costPrice,
      imeiNumbers: c.imeiNumbers,
      subtotal: c.product.sellingPrice * c.quantity,
    }));

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newSale: SaleTransaction = {
      id: `sale-${Date.now()}`,
      invoiceNumber,
      date: new Date().toISOString(),
      branchId: activeBranchId,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || 'N/A',
      items: saleItems,
      subtotal: rawSubtotal,
      discountAmount,
      taxAmount: omanVatAmount,
      grandTotal,
      paymentMethod,
      paidAmount: paymentMethod === 'customer_credit' ? 0 : grandTotal,
      balanceDue: paymentMethod === 'customer_credit' ? grandTotal : 0,
      status: paymentMethod === 'customer_credit' ? 'pending' : 'paid',
      warrantyUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes,
    };

    onCompleteSale(newSale);
    onOpenInvoiceModal(newSale);

    // Reset Cart
    setCart([]);
    setDiscountAmount(0);
    setCashGiven('');
    setNotes('');
  };

  return (
    <div className={`flex flex-col gap-3 ${isExpandedMode ? 'fixed inset-2 z-50 bg-slate-950 p-3 rounded-2xl border border-amber-500/40 shadow-2xl overflow-y-auto' : 'h-[calc(100vh-80px)]'}`}>
      {/* Top Technical Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-amber-500/20">
            {companyConfig?.shortName || 'FAP'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                {companyConfig?.companyName || 'FAKAR AL AYAM PROJECTS LLC'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-semibold border border-emerald-500/30">
                POS LIVE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-arabic">
              {companyConfig?.companyNameAr || 'شركة فكار الأيام للمشاريع ذ.م.م'}
            </div>
          </div>
        </div>

        {/* Center: Fast Manual IMEI / Barcode / Serial Scanner Form */}
        <form onSubmit={handleManualCodeSubmit} className="flex items-center gap-1.5 flex-1 max-w-md min-w-[220px]">
          <div className="relative flex-1">
            <Scan className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={manualCodeInput}
              onChange={(e) => setManualCodeInput(e.target.value)}
              placeholder="Fast Scan IMEI / Barcode / Serial SL..."
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer shrink-0"
          >
            Scan Code
          </button>
        </form>

        {/* Right: Technical Options: Expand All Stock, Camera Scanner, Fullscreen, Sound */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              soundEffects.playExpand();
              setIsStockAllExpanded(!isStockAllExpanded);
            }}
            title="Expand All Stock Options (IMEI, specs, margins, barcode & details)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
              isStockAllExpanded
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-amber-500/30'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isStockAllExpanded ? 'Collapse Stock' : 'Expand Option All'}</span>
          </button>

          <button
            onClick={() => setIsCameraScannerOpen(true)}
            title="Open Device Camera Barcode & IMEI Scanner (Phone, Tablet, Desktop)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 transition cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Cam Scanner</span>
          </button>

          <button
            onClick={toggleSound}
            title={soundMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          <button
            onClick={() => setIsExpandedMode(!isExpandedMode)}
            title={isExpandedMode ? 'Exit Expanded View' : 'Expand POS Fullscreen'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            {isExpandedMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left 7 cols: Products Catalog */}
        <div className="lg:col-span-7 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
          {/* Top Controls: Search & Category tabs */}
          <div className="space-y-3 mb-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search item name, brand, barcode, SKU or IMEI serial..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                onClick={() => {
                  const rand = products[Math.floor(Math.random() * products.length)];
                  if (rand) handleCameraScanResult(rand.barcode, rand);
                }}
                title="Simulate Instant Hardware Barcode Scan"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
              >
                <Barcode className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Sim Scan</span>
              </button>
            </div>

            {/* Scan Feedback Banner */}
            {scanFeedback && (
              <div className="flex items-center justify-between px-3 py-2 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 animate-in fade-in duration-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{scanFeedback}</span>
                </div>
                <button
                  onClick={() => setScanFeedback(null)}
                  className="text-emerald-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Categories Horizontal Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategoryId === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Items ({products.length})
              </button>
              {categories.map((c) => {
                const count = products.filter((p) => p.categoryId === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryId(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                      selectedCategoryId === c.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {c.name.split('&')[0]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid / Expanded View */}
          <div className="flex-1 overflow-y-auto pr-1">
            {isStockAllExpanded ? (
              /* Expanded Detailed Stock Options View */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 font-medium">
                  <span>Showing full technical stock, IMEI serial tracking & cost margin options</span>
                  <span>{filteredProducts.length} items found</span>
                </div>
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  const inCart = cart.find((i) => i.product.id === p.id);
                  const marginPercent = Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100);

                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border transition ${
                        isOutOfStock
                          ? 'opacity-60 bg-slate-900 border-slate-800'
                          : inCart
                          ? 'bg-slate-800 border-amber-500/60 shadow-md shadow-amber-500/10'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 uppercase">
                              {p.brand}
                            </span>
                            <span className="text-xs font-bold text-white">{p.name}</span>
                            {p.nameAr && (
                              <span className="text-[10px] text-slate-400 font-arabic">
                                ({p.nameAr})
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] text-slate-400 font-mono">
                            <span>SKU: {p.sku}</span>
                            <span>Barcode: {p.barcode}</span>
                            {p.trackIMEI && (
                              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                                IMEI Serial Required
                              </span>
                            )}
                            <span>Warranty: {p.warrantyMonths}m</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-black font-mono text-amber-400">
                              {formatMoney(p.sellingPrice, activeCurrency)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Stock: <span className={p.stock <= p.minStockAlert ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{p.stock} units</span>
                            </div>
                            {currentUser.permissions.editProductCosts && (
                              <div className="text-[9px] text-emerald-400 font-mono">
                                Margin: +{marginPercent}%
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={isOutOfStock}
                              onClick={() => addToCart(p)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{inCart ? `Add (${inCart.quantity})` : 'Add to Cart'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  const inCart = cart.find((i) => i.product.id === p.id);
                  const marginPercent = Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100);

                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && addToCart(p)}
                      className={`relative flex flex-col justify-between p-3 rounded-xl border transition group cursor-pointer ${
                        isOutOfStock
                          ? 'opacity-50 bg-slate-900 border-slate-800 cursor-not-allowed'
                          : inCart
                          ? 'bg-slate-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/70 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                            {p.brand}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              p.stock <= p.minStockAlert
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {p.stock} in stock
                          </span>
                        </div>

                        <h3 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-tight group-hover:text-amber-300 transition">
                          {p.name}
                        </h3>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {p.sku}</div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold font-mono text-amber-400">
                            {formatMoney(p.sellingPrice, activeCurrency)}
                          </div>
                          {currentUser.permissions.editProductCosts && (
                            <div className="text-[9px] text-emerald-400/80 font-mono">
                              +{marginPercent}% margin
                            </div>
                          )}
                        </div>

                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                            inCart
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-700 group-hover:bg-amber-500/20 text-slate-300 group-hover:text-amber-400'
                          }`}
                        >
                          {inCart ? inCart.quantity : <Plus className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      {/* Right 5 cols: Cart, Customer & Checkout */}
      <div className="lg:col-span-5 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Current Cart</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono">
              {cart.reduce((a, b) => a + b.quantity, 0)} Items
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800 py-2 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
              <Wallet className="w-8 h-8 text-slate-600 mb-2" />
              <p>Cart is empty.</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Click products on the left or scan barcodes.</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">{item.product.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {formatMoney(item.product.sellingPrice, activeCurrency)} each
                  </div>
                  {item.product.trackIMEI && (
                    <button
                      onClick={() =>
                        setImeiModalItem({
                          index: idx,
                          imeis: item.imeiNumbers || [],
                        })
                      }
                      className="text-[10px] text-amber-400 underline font-mono mt-0.5 block"
                    >
                      {item.imeiNumbers && item.imeiNumbers.length > 0
                        ? `IMEI: ${item.imeiNumbers.join(', ')}`
                        : '+ Add Device IMEI Serial'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold font-mono text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <div className="text-xs font-bold font-mono text-slate-100">
                    {formatMoney(item.product.sellingPrice * item.quantity, activeCurrency)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer & Payment Inputs */}
        <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-medium">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-slate-100 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-medium">Phone (+968)</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-slate-100 text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[10px] text-slate-400 font-medium">Payment Mode</label>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center gap-0.5 cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="text-[10px]">Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center gap-0.5 cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="text-[10px]">OmanNet</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center gap-0.5 cursor-pointer ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span className="text-[10px]">Bank Transfer</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('customer_credit')}
                className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center gap-0.5 cursor-pointer ${
                  paymentMethod === 'customer_credit'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="text-[10px]">Credit / Khata</span>
              </button>
            </div>
          </div>

          {/* Cash input & change calculation */}
          {paymentMethod === 'cash' && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                placeholder="Cash given by customer..."
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-100 font-mono"
              />
              {changeDue > 0 && (
                <div className="text-[11px] font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                  Change: {formatMoney(changeDue, activeCurrency)}
                </div>
              )}
            </div>
          )}

          {/* Calculations Summary */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span>{formatMoney(rawSubtotal, activeCurrency)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>Discount:</span>
                <span>-{formatMoney(discountAmount, activeCurrency)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>{companyConfig?.taxLabel || 'Oman VAT (5%)'}:</span>
              <span>{formatMoney(omanVatAmount, activeCurrency)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-slate-700">
              <span>Total Payable:</span>
              <span className="text-amber-400">{formatMoney(grandTotal, activeCurrency)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full mt-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Complete Sale & Issue Oman VAT Invoice</span>
          </button>
        </div>
      </div>
      </div>

      {/* Optional IMEI Serial Assignment Modal */}
      {imeiModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl p-5 text-xs text-slate-100">
            <h3 className="font-bold text-sm text-white mb-2">Assign Device IMEI / Serial</h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Record 15-digit IMEI for manufacturer warranty and police registration.
            </p>
            <input
              type="text"
              placeholder="e.g. 359182049182741"
              defaultValue={imeiModalItem.imeis[0] || ''}
              id="imei-input-field"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100 mb-4 focus:ring-1 focus:ring-amber-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setImeiModalItem(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = (document.getElementById('imei-input-field') as HTMLInputElement)?.value;
                  if (val) {
                    setCart((prev) =>
                      prev.map((c, idx) =>
                        idx === imeiModalItem.index ? { ...c, imeiNumbers: [val] } : c
                      )
                    );
                  }
                  setImeiModalItem(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold"
              >
                Save IMEI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Camera Barcode & IMEI Scanner */}
      <UniversalCameraBarcodeScanner
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanResult={handleCameraScanResult}
        products={products}
        title="POS Barcode & IMEI Scanner"
        subtitle="Aim camera at box barcode, warranty card, or phone back"
      />
    </div>
  );
};
