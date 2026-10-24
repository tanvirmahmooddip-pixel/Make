import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  AlertOctagon,
  FileBarChart,
  Lightbulb,
} from 'lucide-react';
import { CurrencyCode } from '../types';
import { formatMoney } from '../utils/formatters';

interface GeminiAIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData: any;
  activeCurrency: CurrencyCode;
}

export const GeminiAIAdvisorModal: React.FC<GeminiAIAdvisorModalProps> = ({
  isOpen,
  onClose,
  summaryData,
  activeCurrency,
}) => {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState('');
  const [reportType, setReportType] = useState('Full Executive Audit');
  const [loading, setLoading] = useState(false);
  const [reportOutput, setReportOutput] = useState<string>('');
  const [modelUsed, setModelUsed] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const runAnalysis = async (type: string, customQuery?: string) => {
    setLoading(true);
    setReportType(type);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryData,
          reportType: type,
          userQuery: customQuery || prompt,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReportOutput(data.report);
        setModelUsed(data.modelUsed || 'gemini-3.8-flash');
      } else {
        setReportOutput(`❌ Error analyzing data: ${data.error}`);
      }
    } catch (err: any) {
      setReportOutput(`⚠️ Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Al-Rabil AI Financial & Operations Advisor</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                  {modelUsed || 'gemini-3.8-flash'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI financial auditing, profit margin diagnostics, cash reconciliation & Oman VAT analytics.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Preset Buttons */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Recommended Analysis Presets:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <button
                disabled={loading}
                onClick={() => runAnalysis('Executive Health Audit', 'Assess overall store liquidity, profit margins and cash balance.')}
                className="p-3 text-left rounded-xl bg-slate-800/80 hover:bg-purple-900/30 border border-slate-700 hover:border-purple-500/40 transition group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>Executive Health Audit</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Revenue, margins, and 1-100 overall business health score.
                </div>
              </button>

              <button
                disabled={loading}
                onClick={() => runAnalysis('Cash & Bank Reconciliation', 'Audit drawer cash in hand vs bank deposits and flag any cash leaks.')}
                className="p-3 text-left rounded-xl bg-slate-800/80 hover:bg-blue-900/30 border border-slate-700 hover:border-blue-500/40 transition group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300 mb-1">
                  <FileBarChart className="w-3.5 h-3.5 text-blue-400" />
                  <span>Cash & Bank Audit</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Drawer float variance, Bank Muscat drops & liquid assets.
                </div>
              </button>

              <button
                disabled={loading}
                onClick={() => runAnalysis('Inventory & Margin Radar', 'Identify low-stock items, dead stock, and high-margin accessories opportunities.')}
                className="p-3 text-left rounded-xl bg-slate-800/80 hover:bg-amber-900/30 border border-slate-700 hover:border-amber-500/40 transition group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Inventory & Margins</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Reorder warnings, phone vs accessory profit spread.
                </div>
              </button>

              <button
                disabled={loading}
                onClick={() => runAnalysis('Oman VAT & Tax Forecast', 'Audit Oman VAT 5% quarterly estimate and compliance status.')}
                className="p-3 text-left rounded-xl bg-slate-800/80 hover:bg-emerald-900/30 border border-slate-700 hover:border-emerald-500/40 transition group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Oman VAT 5% Review</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  OTA tax liability forecast and input/output VAT balance.
                </div>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Cash in Hand</span>
              <div className="font-mono font-bold text-emerald-400">
                {formatMoney(summaryData?.cashInHand || 0, activeCurrency)}
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total Bank Balances</span>
              <div className="font-mono font-bold text-blue-400">
                {formatMoney(summaryData?.totalBankBalance || 0, activeCurrency)}
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Today Sales</span>
              <div className="font-mono font-bold text-amber-400">
                {formatMoney(summaryData?.todaySales || 0, activeCurrency)}
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Net Profit</span>
              <div className="font-mono font-bold text-purple-400">
                {formatMoney(summaryData?.netProfit || 0, activeCurrency)}
              </div>
            </div>
          </div>

          {/* Report Display Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 min-h-[260px] relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Analysis Output:
                </span>
                <span className="text-xs text-slate-400 font-medium">{reportType}</span>
              </div>
              {reportOutput && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Report'}</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-200">
                  Gemini AI is analyzing financial ledgers, inventory levels & cash flow...
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Applying Oman retail benchmarks & VAT rules</p>
              </div>
            ) : reportOutput ? (
              <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed space-y-2 whitespace-pre-wrap font-sans text-xs">
                {reportOutput}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 text-xs">
                <Sparkles className="w-8 h-8 text-purple-500/40 mb-2" />
                <p>Click one of the audit presets above or type a specific business inquiry below.</p>
              </div>
            )}
          </div>
        </div>

        {/* Custom Inquiry Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Gemini AI (e.g. 'How can I improve net profit from CCTV installations and Ooredoo recharges?')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && prompt.trim()) {
                runAnalysis('Custom Financial Inquiry', prompt);
              }
            }}
            className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <button
            disabled={loading || !prompt.trim()}
            onClick={() => runAnalysis('Custom Financial Inquiry', prompt)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-purple-600/30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
