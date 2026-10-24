import React, { useState } from 'react';
import {
  Building2,
  X,
  Sparkles,
  Check,
  RotateCcw,
  Store,
  Smartphone,
  Cpu,
  UtensilsCrossed,
  ShoppingCart,
  Wrench,
  Percent,
  FileText,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { CompanyConfig, BusinessPreset } from '../types';
import { BUSINESS_PRESETS } from '../utils/storage';

interface BusinessCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: CompanyConfig;
  onSaveConfig: (newConfig: CompanyConfig) => void;
}

export const BusinessCustomizerModal: React.FC<BusinessCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<CompanyConfig>({ ...currentConfig });
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-amber-400" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'Building2':
        return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-4 h-4 text-orange-400" />;
      case 'ShoppingCart':
        return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4 text-indigo-400" />;
      default:
        return <Store className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleApplyPreset = (preset: BusinessPreset) => {
    setSelectedPresetId(preset.id);
    setFormData((prev) => ({
      ...prev,
      ...preset.config,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-slate-100 max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Business & Company Profile Customizer
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  Universal ERP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize your company name, brand initials, industry solution, tax rate & official credentials.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/70 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Quick Business Solution Presets */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Ready Business Solutions:</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Click any preset to instant rebrand
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {BUSINESS_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id || formData.companyName === preset.config.companyName;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/70 ring-1 ring-amber-500/40 shadow-md'
                        : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700">
                            {getPresetIcon(preset.iconName)}
                          </div>
                          <span className="font-bold text-xs text-white group-hover:text-amber-300 transition line-clamp-1">
                            {preset.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-semibold">
                        Badge: {preset.config.shortName}
                      </span>
                      <span className="text-emerald-400 font-medium">
                        {preset.config.taxLabel || 'VAT 5%'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 shadow-inner">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Live Application & Invoice Header Preview:</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Branding
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shrink-0">
                  {formData.shortName || 'RB'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white tracking-tight">
                      {formData.companyName || 'My Business Solutions'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                      {formData.taxLabel || 'TAX 5%'}
                    </span>
                  </div>
                  <div className="text-xs text-amber-400/90 font-medium mt-0.5" dir="rtl">
                    {formData.companyNameAr || ''}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {formData.tagline || 'All-in-one Business Management Platform'}
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400 space-y-0.5 sm:border-l sm:border-slate-800 sm:pl-4 w-full sm:w-auto">
                <div><span className="text-slate-500">CR No:</span> <span className="font-mono text-slate-300 font-semibold">{formData.crNumber}</span></div>
                <div><span className="text-slate-500">VAT:</span> <span className="font-mono text-amber-300 font-semibold">{formData.vatNumber}</span></div>
                <div><span className="text-slate-500">Phone:</span> <span className="text-slate-300">{formData.phone}</span></div>
              </div>
            </div>
          </div>

          {/* Form to Edit Any Company Detail */}
          <form id="business-config-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Customize Company Attributes & Legal Identifiers
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Company Name English */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Company / Store Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Rabiul & Big Brother Solutions"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Company Name Arabic */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Company / Store Name (Arabic / Local)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.companyNameAr}
                  onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
                  placeholder="مثال: شركة ربيع والأخ الأكبر ش.م.م"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Short Brand Abbreviation */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Logo Badge Initials / Short Code
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })}
                  placeholder="e.g. RB, RST, BRO, APX"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-amber-400 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Industry Category */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Business Industry Category
                </label>
                <select
                  value={formData.industryType}
                  onChange={(e) => setFormData({ ...formData, industryType: e.target.value as any })}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="electronics_cctv">Electronics, Mobiles & CCTV Systems</option>
                  <option value="general_retail">General Retail & Wholesale Trading</option>
                  <option value="restaurant_cafe">Restaurant, Cafe & Food Court</option>
                  <option value="supermarket_grocery">Supermarket, Hypermarket & Grocery</option>
                  <option value="auto_workshop">Automotive Workshop & Spare Parts</option>
                  <option value="consulting_services">Professional & Technical Services</option>
                  <option value="custom">Custom Enterprise Business Solution</option>
                </select>
              </div>

              {/* English Tagline */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Business Tagline (English)
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Mobiles • CCTV • Smart Security • Oman Bills"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Arabic Tagline */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Business Tagline (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.taglineAr}
                  onChange={(e) => setFormData({ ...formData, taglineAr: e.target.value })}
                  placeholder="هواتف • مراقبة • أمان ذكي"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Commercial Registration (CR) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Commercial Registration Number (CR No) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.crNumber}
                  onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                  placeholder="CR 1394821"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Tax / VAT Number */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  VAT / Tax Identification Number (Tax ID) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.vatNumber}
                  onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                  placeholder="OM1100239102"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Tax Rate & Label */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.taxRatePercent}
                    onChange={(e) => setFormData({ ...formData, taxRatePercent: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tax Label
                  </label>
                  <input
                    type="text"
                    value={formData.taxLabel}
                    onChange={(e) => setFormData({ ...formData, taxLabel: e.target.value })}
                    placeholder="e.g. Oman VAT (5%)"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Official Phone */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Store Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+968 2478 9120"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Official Email */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@mybusiness.com"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Physical Address */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Head Office / Store Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ruwi Commercial High Street, Ruwi, Muscat, Sultanate of Oman"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Invoice Return Policy Note (English) */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Invoice Footer Return & Warranty Policy (English)
                </label>
                <textarea
                  rows={2}
                  value={formData.invoiceFooterNote}
                  onChange={(e) => setFormData({ ...formData, invoiceFooterNote: e.target.value })}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Invoice Return Policy Note (Arabic) */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Invoice Footer Return & Warranty Policy (Arabic)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={formData.invoiceFooterNoteAr}
                  onChange={(e) => setFormData({ ...formData, invoiceFooterNoteAr: e.target.value })}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-800/95 border-t border-slate-700 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            {savedSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-bounce">
                <Check className="w-4 h-4" />
                <span>Saved & applied across all ERP modules!</span>
              </span>
            ) : (
              <span>Changes reflect instantly across POS, invoices, navbar, reports & ledger.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="business-config-form"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Apply & Save Branding</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
