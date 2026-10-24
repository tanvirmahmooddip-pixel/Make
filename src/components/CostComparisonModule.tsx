import React, { useState } from 'react';
import {
  Scale,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  PhoneCall,
  CreditCard,
  Truck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { CurrencyCode } from '../types';
import { formatMoney } from '../utils/formatters';

interface CostComparisonModuleProps {
  activeCurrency: CurrencyCode;
}

export const CostComparisonModule: React.FC<CostComparisonModuleProps> = ({ activeCurrency }) => {
  const [activeCategory, setActiveCategory] = useState<'telecom' | 'pos' | 'courier'>('telecom');
  const [currentMonthlyBill, setCurrentMonthlyBill] = useState('75.000');

  const telecomPlans = [
    {
      operator: 'Omantel 5G Baqati',
      planName: 'Baqati Large 5G',
      monthlyPrice: 25.000,
      dataAllowance: '50 GB High Speed + Unlimited Social',
      callMinutes: '1,500 Local + 150 Int. Mins',
      pricePerGB: 'OMR 0.500 / GB',
      rating: 'Best 4G/5G Coverage across Oman interior',
    },
    {
      operator: 'Ooredoo Oman Shahry',
      planName: 'Shahry 5G Endless 25',
      monthlyPrice: 25.000,
      dataAllowance: '60 GB High Speed 5G',
      callMinutes: '1,800 Local + 100 Int. Mins',
      pricePerGB: 'OMR 0.416 / GB',
      rating: 'Highest data allowance in Oman market',
      isBestValue: true,
    },
    {
      operator: 'Vodafone Oman BLACK',
      planName: 'Vodafone Red Business',
      monthlyPrice: 22.000,
      dataAllowance: '45 GB 5G + Roaming in GCC',
      callMinutes: 'Unlimited On-Net + 1,200 Local',
      pricePerGB: 'OMR 0.488 / GB',
      rating: 'Cheapest entry price for small business',
    },
  ];

  const posTerminals = [
    {
      provider: 'Bank Muscat OmanNet POS',
      setupCost: 'Free / Zero',
      monthlyRental: 5.000,
      debitMDR: '0.90% + 50 Baiza',
      creditMDR: '1.95%',
      settlementTime: 'T+1 Morning to Bank Muscat',
      recommendation: 'Dominant bank cardholder volume in Oman',
      isBestValue: true,
    },
    {
      provider: 'National Bank of Oman (NBO) Smart POS',
      setupCost: 'Free',
      monthlyRental: 6.000,
      debitMDR: '0.85% + 40 Baiza',
      creditMDR: '1.80%',
      settlementTime: 'T+1 to any Oman IBAN',
      recommendation: 'Lower MDR on credit card processing',
    },
    {
      provider: 'Thawani Technologies (SoftPOS & Terminal)',
      setupCost: 'OMR 15.000',
      monthlyRental: 0.000,
      debitMDR: '1.10%',
      creditMDR: '2.10%',
      settlementTime: 'Same Day to Thawani Wallet',
      recommendation: 'Zero monthly rental; best for low-volume popups',
    },
  ];

  const courierPartners = [
    {
      company: 'Asyad Express (Oman Post)',
      muscatLocalRate: 1.500,
      governorateRate: 2.200,
      deliveryTime: 'Same-day in Muscat / Next-day nationwide',
      codHandlingFee: '0.300 OMR',
      status: 'Official Oman national postal logistics',
      isBestValue: true,
    },
    {
      company: 'Dalilee Logistics Oman',
      muscatLocalRate: 1.800,
      governorateRate: 2.500,
      deliveryTime: 'Next day delivery',
      codHandlingFee: '0.400 OMR',
      status: 'Dedicated e-commerce app & SMS tracking',
    },
    {
      company: 'DHL Express Oman',
      muscatLocalRate: 4.500,
      governorateRate: 6.000,
      deliveryTime: 'Express 4-Hour / Priority',
      codHandlingFee: '1.000 OMR',
      status: 'Premium speed, best for high-value iPhones',
    },
  ];

  const parsedCurrent = parseFloat(currentMonthlyBill) || 0;
  const estimatedSavingsMonthly = parsedCurrent * 0.22; // ~22% savings potential
  const estimatedSavingsAnnual = estimatedSavingsMonthly * 12;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-400" />
          <span>Oman Service Provider Cost Comparison & Bill Reducer</span>
        </h1>
        <p className="text-xs text-slate-400">
          Compare telecom subscriptions, bank POS terminal merchant rates, and delivery logistics to cut store overheads.
        </p>
      </div>

      {/* Category selector */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start">
        <button
          onClick={() => setActiveCategory('telecom')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition ${
            activeCategory === 'telecom'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Telecom & 5G Data Plans</span>
        </button>

        <button
          onClick={() => setActiveCategory('pos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition ${
            activeCategory === 'pos'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>POS Terminals & MDR Fees</span>
        </button>

        <button
          onClick={() => setActiveCategory('courier')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition ${
            activeCategory === 'courier'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Oman Delivery Courier Rates</span>
        </button>
      </div>

      {/* Savings Calculator Widget */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm mb-1">
              <TrendingDown className="w-4 h-4" />
              <span>Smart Expense Reduction Calculator</span>
            </div>
            <p className="text-slate-400">
              Enter what you currently spend each month on telecom, POS machine rentals, or couriers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                Current Monthly Outflow:
              </label>
              <input
                type="number"
                step="0.001"
                value={currentMonthlyBill}
                onChange={(e) => setCurrentMonthlyBill(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-sm text-white font-bold w-32 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-right">
              <div className="text-[10px] text-emerald-400 uppercase font-semibold">
                Estimated Annual Savings:
              </div>
              <div className="text-base font-bold text-emerald-300">
                {formatMoney(estimatedSavingsAnnual, activeCurrency)} / year
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Tables */}
      {activeCategory === 'telecom' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {telecomPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-slate-900 border text-xs flex flex-col justify-between shadow-lg relative ${
                plan.isBestValue ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-slate-800'
              }`}
            >
              {plan.isBestValue && (
                <span className="absolute top-3 right-3 text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                  BEST VALUE
                </span>
              )}

              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">{plan.operator}</h3>
                <div className="text-slate-400 text-[11px] mb-3">{plan.planName}</div>

                <div className="text-lg font-bold font-mono text-amber-400 mb-3">
                  {formatMoney(plan.monthlyPrice, activeCurrency)} <span className="text-xs text-slate-400 font-normal">/ month</span>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-800 text-[11px] text-slate-300">
                  <div><strong>Data:</strong> {plan.dataAllowance}</div>
                  <div><strong>Voice:</strong> {plan.callMinutes}</div>
                  <div className="font-mono text-emerald-400"><strong>Cost/GB:</strong> {plan.pricePerGB}</div>
                </div>
              </div>

              <div className="pt-3 text-[10px] text-slate-400 italic">
                {plan.rating}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeCategory === 'pos' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {posTerminals.map((pos, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-slate-900 border text-xs flex flex-col justify-between shadow-lg relative ${
                pos.isBestValue ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-slate-800'
              }`}
            >
              {pos.isBestValue && (
                <span className="absolute top-3 right-3 text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                  RECOMMENDED
                </span>
              )}

              <div>
                <h3 className="font-bold text-white text-sm mb-3">{pos.provider}</h3>

                <div className="space-y-2 py-3 border-y border-slate-800 text-[11px] text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Monthly SIM Rental:</span>
                    <span>{formatMoney(pos.monthlyRental, activeCurrency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Debit Card MDR:</span>
                    <span className="text-emerald-400">{pos.debitMDR}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Credit Card MDR:</span>
                    <span className="text-amber-400">{pos.creditMDR}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Settlement Speed:</span>
                    <span>{pos.settlementTime}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 text-[10px] text-slate-400 italic">
                {pos.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeCategory === 'courier' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courierPartners.map((c, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-slate-900 border text-xs flex flex-col justify-between shadow-lg relative ${
                c.isBestValue ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-slate-800'
              }`}
            >
              {c.isBestValue && (
                <span className="absolute top-3 right-3 text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                  LOCAL LEADER
                </span>
              )}

              <div>
                <h3 className="font-bold text-white text-sm mb-3">{c.company}</h3>

                <div className="space-y-2 py-3 border-y border-slate-800 text-[11px] text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Muscat Local Delivery:</span>
                    <span className="text-emerald-400">{formatMoney(c.muscatLocalRate, activeCurrency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">All Oman Governorates:</span>
                    <span>{formatMoney(c.governorateRate, activeCurrency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">COD Collection Fee:</span>
                    <span>{c.codHandlingFee}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 text-[10px] text-slate-400 italic">
                {c.deliveryTime} • {c.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
