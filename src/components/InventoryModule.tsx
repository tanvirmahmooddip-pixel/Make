import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit2,
  Trash2,
  Barcode,
  TrendingUp,
  Tag,
  Check,
  X,
  Smartphone,
  Shield,
  Home,
  Wrench,
  ChevronDown,
  ChevronUp,
  Layers,
  Printer,
  Copy,
  CheckCircle2,
  Cpu,
  Building2,
} from 'lucide-react';
import { CurrencyCode, Product, ProductCategory, User } from '../types';
import { formatMoney } from '../utils/formatters';
import { soundEffects } from '../utils/soundEffects';

interface InventoryModuleProps {
  products: Product[];
  categories: ProductCategory[];
  currentUser: User;
  activeCurrency: CurrencyCode;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  products,
  categories,
  currentUser,
  activeCurrency,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [filterHouseholdOnly, setFilterHouseholdOnly] = useState(false);
  const [isAllExpanded, setIsAllExpanded] = useState<boolean>(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const toggleExpandItem = (id: string) => {
    soundEffects.playExpand();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpandAll = () => {
    soundEffects.playExpand();
    if (isAllExpanded) {
      setExpandedIds(new Set());
      setIsAllExpanded(false);
    } else {
      const allIds = new Set(products.map((p) => p.id));
      setExpandedIds(allIds);
      setIsAllExpanded(true);
    }
  };

  const handleCopyCode = (code: string) => {
    soundEffects.playBarcodeBeep();
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-phones');
  const [costPrice, setCostPrice] = useState('0.000');
  const [sellingPrice, setSellingPrice] = useState('0.000');
  const [stock, setStock] = useState('10');
  const [minStockAlert, setMinStockAlert] = useState('3');
  const [brand, setBrand] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [isHousehold, setIsHousehold] = useState(false);
  const [isCCTV, setIsCCTV] = useState(false);
  const [trackIMEI, setTrackIMEI] = useState(false);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setNameAr('');
    setSku('SKU-' + Math.floor(10000 + Math.random() * 90000));
    setBarcode(String(Math.floor(100000000000 + Math.random() * 900000000000)));
    setCategoryId(categories[0]?.id || 'cat-phones');
    setCostPrice('10.000');
    setSellingPrice('15.000');
    setStock('10');
    setMinStockAlert('3');
    setBrand('Apple');
    setWarrantyMonths('12');
    setIsHousehold(false);
    setIsCCTV(false);
    setTrackIMEI(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setNameAr(p.nameAr || '');
    setSku(p.sku);
    setBarcode(p.barcode);
    setCategoryId(p.categoryId);
    setCostPrice(p.costPrice.toFixed(3));
    setSellingPrice(p.sellingPrice.toFixed(3));
    setStock(String(p.stock));
    setMinStockAlert(String(p.minStockAlert));
    setBrand(p.brand);
    setWarrantyMonths(String(p.warrantyMonths));
    setIsHousehold(p.isHousehold);
    setIsCCTV(p.isCCTV);
    setTrackIMEI(!!p.trackIMEI);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name,
      nameAr,
      sku,
      barcode,
      categoryId,
      costPrice: parseFloat(costPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      stock: parseInt(stock, 10) || 0,
      minStockAlert: parseInt(minStockAlert, 10) || 1,
      brand,
      warrantyMonths: parseInt(warrantyMonths, 10) || 0,
      isHousehold,
      isCCTV,
      trackIMEI,
    };

    if (editingProduct) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStock = !filterLowStockOnly || p.stock <= p.minStockAlert;
    const matchesHousehold = !filterHouseholdOnly || p.isHousehold;
    return matchesCat && matchesSearch && matchesLowStock && matchesHousehold;
  });

  const totalInventoryCost = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);
  const totalInventoryRetail = products.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0);
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);

  return (
    <div className="space-y-5">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            <span>Inventory & Stock Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time stock tracking, automated alerts, profit margins, and IMEI management.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Catalog Items</div>
          <div className="text-base font-bold font-mono text-white mt-0.5">{products.length} SKUs</div>
          <div className="text-[10px] text-slate-500 mt-1">{totalStockUnits} units in warehouse</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Asset Valuation (Cost)</div>
          <div className="text-base font-bold font-mono text-blue-300 mt-0.5">
            {formatMoney(totalInventoryCost, activeCurrency)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Capital invested in stock</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Retail Sales Potential</div>
          <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
            {formatMoney(totalInventoryRetail, activeCurrency)}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">
            Margin: {formatMoney(totalInventoryRetail - totalInventoryCost, activeCurrency)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/30">
          <div className="text-[10px] uppercase font-bold text-rose-400">Low Stock Warnings</div>
          <div className="text-base font-bold font-mono text-rose-300 mt-0.5">
            {products.filter((p) => p.stock <= p.minStockAlert).length} Items
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1">Require vendor purchase order</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, SKU, barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Toggle Low Stock */}
          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              filterLowStockOnly
                ? 'bg-rose-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Only</span>
          </button>

          {/* Toggle Household Items */}
          <button
            onClick={() => setFilterHouseholdOnly(!filterHouseholdOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              filterHouseholdOnly
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Household Items</span>
          </button>

          {/* INVENTORY Click Expand Option All */}
          <button
            onClick={toggleExpandAll}
            title="Expand All Products Details (IMEI, Barcodes, Margins & Branch Stock)"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              isAllExpanded
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-amber-400 hover:bg-slate-700 border-amber-500/30'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAllExpanded ? 'Collapse All' : 'Expand Option All'}</span>
          </button>
        </div>
      </div>

      {/* Copied Barcode Toast */}
      {copiedCode && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Barcode / SKU code copied to clipboard: <strong className="font-mono">{copiedCode}</strong></span>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-700">
              <tr>
                <th className="py-3 px-3 w-8"></th>
                <th className="py-3 px-4 font-bold">Product / Brand</th>
                <th className="py-3 px-3 font-bold">SKU / Barcode</th>
                <th className="py-3 px-3 font-bold">Category</th>
                <th className="py-3 px-3 font-bold text-center">Stock</th>
                <th className="py-3 px-3 font-bold text-right">Cost Price</th>
                <th className="py-3 px-3 font-bold text-right">Selling Price</th>
                <th className="py-3 px-3 font-bold text-right">Margin %</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredProducts.map((p) => {
                const categoryObj = categories.find((c) => c.id === p.categoryId);
                const marginPercent = Math.round(
                  ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100
                );
                const isLowStock = p.stock <= p.minStockAlert;
                const isExpanded = isAllExpanded || expandedIds.has(p.id);
                const profitPerUnit = p.sellingPrice - p.costPrice;
                const totalBatchProfit = profitPerUnit * p.stock;

                return (
                  <React.Fragment key={p.id}>
                    <tr
                      className={`hover:bg-slate-800/40 transition cursor-pointer ${
                        isExpanded ? 'bg-slate-800/30' : ''
                      }`}
                      onClick={() => toggleExpandItem(p.id)}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          className="p-1 rounded text-slate-400 hover:text-amber-400 transition"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-amber-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-amber-400 font-semibold">{p.brand}</span>
                          {p.nameAr && (
                            <span className="text-slate-400 font-arabic">({p.nameAr})</span>
                          )}
                          {p.trackIMEI && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              IMEI Tracked
                            </span>
                          )}
                          {p.isHousehold && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Smart Home
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div>{p.sku}</div>
                        <div className="text-slate-500 text-[10px]">{p.barcode}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                          {categoryObj?.name.split('&')[0] || p.categoryId}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-mono font-bold text-[11px] ${
                            isLowStock
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        {currentUser.permissions.editProductCosts
                          ? formatMoney(p.costPrice, activeCurrency)
                          : '***'}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">
                        {formatMoney(p.sellingPrice, activeCurrency)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        <span
                          className={`font-semibold ${
                            marginPercent > 35 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          +{marginPercent}%
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {currentUser.permissions.deleteRecords && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete ${p.name}?`)) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED TECHNICAL DRAWER FOR THIS INVENTORY ITEM */}
                    {isExpanded && (
                      <tr className="bg-slate-950/60 border-b border-slate-800">
                        <td colSpan={9} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            {/* Card 1: Barcode & Identification */}
                            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                  <Barcode className="w-4 h-4 text-amber-400" />
                                  <span>Barcode & Label Tag</span>
                                </span>
                                <button
                                  onClick={() => handleCopyCode(p.barcode)}
                                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </button>
                              </div>

                              {/* Stylized Barcode Graphic */}
                              <div className="p-3 bg-white rounded-lg flex flex-col items-center justify-center text-slate-950">
                                <div className="h-9 w-full flex items-center justify-center gap-[2px]">
                                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3].map((w, i) => (
                                    <div
                                      key={i}
                                      className="bg-black h-full"
                                      style={{ width: `${w * 1.5}px` }}
                                    />
                                  ))}
                                </div>
                                <div className="text-[11px] font-mono font-bold tracking-widest mt-1">
                                  {p.barcode}
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>SKU: <strong className="text-slate-200 font-mono">{p.sku}</strong></span>
                                <span>Warranty: <strong className="text-emerald-400 font-mono">{p.warrantyMonths} Months</strong></span>
                              </div>
                            </div>

                            {/* Card 2: IMEI Serial Number Tracking */}
                            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                  <Smartphone className="w-4 h-4 text-cyan-400" />
                                  <span>IMEI & Serial Registry</span>
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-semibold">
                                  {p.trackIMEI ? 'Active Tracking' : 'Standard SKU'}
                                </span>
                              </div>

                              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                                {p.trackIMEI ? (
                                  <>
                                    <div className="flex items-center justify-between p-1.5 bg-slate-800 rounded text-[11px] font-mono">
                                      <span className="text-slate-300">35{p.barcode.slice(0, 13)}</span>
                                      <span className="text-emerald-400 text-[10px] font-bold">IN STOCK</span>
                                    </div>
                                    <div className="flex items-center justify-between p-1.5 bg-slate-800 rounded text-[11px] font-mono">
                                      <span className="text-slate-300">86{p.barcode.slice(2, 12)}09</span>
                                      <span className="text-emerald-400 text-[10px] font-bold">IN STOCK</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="p-3 text-center text-slate-500 text-[11px]">
                                    Bulk non-serialized item. Tracked by quantity count.
                                  </div>
                                )}
                              </div>

                              <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-800">
                                <Shield className="w-3 h-3 text-amber-400" />
                                <span>Compliant with Oman Consumer Protection & TRA specs</span>
                              </div>
                            </div>

                            {/* Card 3: Multi-Branch Stock & Margins */}
                            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-emerald-400" />
                                <span>Multi-Branch Stock & Margins</span>
                              </span>

                              <div className="space-y-1 font-mono text-[11px]">
                                <div className="flex justify-between text-slate-400">
                                  <span>Ruwi Commercial HQ:</span>
                                  <span className="text-slate-100 font-bold">{Math.ceil(p.stock * 0.6)} units</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                  <span>Al Khoudh Branch:</span>
                                  <span className="text-slate-100 font-bold">{Math.floor(p.stock * 0.4)} units</span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-[11px]">
                                <div className="flex justify-between text-slate-400">
                                  <span>Unit Profit:</span>
                                  <span className="text-emerald-400 font-bold">
                                    +{formatMoney(profitPerUnit, activeCurrency)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                  <span>Total Batch Profit:</span>
                                  <span className="text-emerald-300 font-bold">
                                    +{formatMoney(totalBatchProfit, activeCurrency)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-white mb-4">
              {editingProduct ? 'Edit Product Details' : 'Add New Inventory Item'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Product Title (English)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Samsung Galaxy S25 Ultra 512GB"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Product Title (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="سامسونج جالكسي إس 25 ألترا"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Apple, Samsung, Dahua..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Barcode</label>
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cost Price (OMR)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Selling Price (OMR)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Stock Count</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Stock Alert Threshold</label>
                  <input
                    type="number"
                    required
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trackIMEI}
                    onChange={(e) => setTrackIMEI(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-amber-500"
                  />
                  <span>Track Device IMEI / Serial Number</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHousehold}
                    onChange={(e) => setIsHousehold(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-amber-500"
                  />
                  <span>Smart Household Appliance</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCCTV}
                    onChange={(e) => setIsCCTV(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-amber-500"
                  />
                  <span>CCTV & Surveillance System</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
