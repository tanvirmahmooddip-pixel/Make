import React, { useState } from 'react';
import {
  PhoneCall,
  Wifi,
  Repeat,
  CheckCircle2,
  Search,
  Smartphone,
  CreditCard,
  Wallet,
  Clock,
  Printer,
  Calendar,
} from 'lucide-react';
import { CurrencyCode, PaymentMethod, TelecomBillPayment } from '../types';
import { formatMoney, formatDateTime } from '../utils/formatters';

interface TelecomBillsModuleProps {
  telecomBills: TelecomBillPayment[];
  activeCurrency: CurrencyCode;
  onProcessTelecomPayment: (payment: TelecomBillPayment) => void;
}

export const TelecomBillsModule: React.FC<TelecomBillsModuleProps> = ({
  telecomBills,
  activeCurrency,
  onProcessTelecomPayment,
}) => {
  const [operator, setOperator] = useState<TelecomBillPayment['operator']>('omantel');
  const [serviceCategory, setServiceCategory] = useState<TelecomBillPayment['serviceCategory']>('postpaid_bill');
  const [mobileOrAccount, setMobileOrAccount] = useState('91234567');
  const [customerName, setCustomerName] = useState('Hamad Al-Amri');
  const [amount, setAmount] = useState('20.000');
  const [isAutoPayConfigured, setIsAutoPayConfigured] = useState(false);
  const [autoPayDayOfMonth, setAutoPayDayOfMonth] = useState(25);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const operators = [
    { id: 'omantel', name: 'Omantel', color: 'from-orange-500 to-amber-600', badge: 'National Telco' },
    { id: 'ooredoo', name: 'Ooredoo Oman', color: 'from-rose-600 to-red-700', badge: '5G Speeds' },
    { id: 'vodafone', name: 'Vodafone Oman', color: 'from-red-600 to-rose-700', badge: 'Digital 5G' },
    { id: 'renna', name: 'Renna Mobile', color: 'from-blue-600 to-indigo-700', badge: 'Prepaid MVNO' },
    { id: 'friendi', name: 'FRiENDi Mobile', color: 'from-purple-600 to-pink-700', badge: 'International MVNO' },
  ];

  const quickAmounts = ['5.000', '10.000', '15.000', '20.000', '35.000', '50.000'];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    const commission = parsedAmount * 0.025; // 2.5% distributor commission

    const operatorObj = operators.find((o) => o.id === operator);

    const newPayment: TelecomBillPayment = {
      id: `tel-${Date.now()}`,
      transactionId: `TEL-OM-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      operator,
      operatorName: operatorObj?.name || 'Omantel',
      serviceCategory,
      mobileOrAccount,
      customerName,
      amount: parsedAmount,
      commission,
      paymentMethod,
      isAutoPayConfigured,
      autoPayDayOfMonth: isAutoPayConfigured ? autoPayDayOfMonth : undefined,
      status: 'completed',
    };

    onProcessTelecomPayment(newPayment);
    alert(`Payment of OMR ${parsedAmount.toFixed(3)} processed successfully for ${mobileOrAccount}!`);
  };

  const autoPayList = telecomBills.filter((b) => b.isAutoPayConfigured);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-teal-400" />
          <span>Oman Telecommunications & 5G Data Billing Hub</span>
        </h1>
        <p className="text-xs text-slate-400">
          Instant recharge, postpaid bill settlement, and monthly recurring auto-pay management for Omantel, Ooredoo & Vodafone.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: Recharge & Bill Pay Form */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-xs space-y-5">
          <h2 className="text-sm font-bold text-white">Select Operator & Plan</h2>

          {/* Operator Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {operators.map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setOperator(op.id as any)}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  operator === op.id
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                <div className="font-bold text-xs">{op.name}</div>
                <div className="text-[10px] text-slate-400">{op.badge}</div>
              </button>
            ))}
          </div>

          {/* Service Category */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Service Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setServiceCategory('postpaid_bill')}
                className={`p-2 rounded-lg border text-center transition font-semibold ${
                  serviceCategory === 'postpaid_bill'
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Postpaid Bill
              </button>
              <button
                type="button"
                onClick={() => setServiceCategory('prepaid_recharge')}
                className={`p-2 rounded-lg border text-center transition font-semibold ${
                  serviceCategory === 'prepaid_recharge'
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Prepaid Recharge
              </button>
              <button
                type="button"
                onClick={() => setServiceCategory('5g_home_fiber')}
                className={`p-2 rounded-lg border text-center transition font-semibold ${
                  serviceCategory === '5g_home_fiber'
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                5G Home / Fiber
              </button>
            </div>
          </div>

          {/* Input details */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile / Account Number</label>
                <input
                  type="text"
                  required
                  value={mobileOrAccount}
                  onChange={(e) => setMobileOrAccount(e.target.value)}
                  placeholder="e.g. 91234567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>
            </div>

            {/* Quick Amount presets */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select or Enter Amount (OMR)</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    className={`px-3 py-1 rounded-lg border font-mono font-bold transition ${
                      amount === q
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    OMR {q}
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="0.001"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-amber-400 font-bold"
              />
            </div>

            {/* Auto Pay Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoPayConfigured}
                  onChange={(e) => setIsAutoPayConfigured(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-teal-500"
                />
                <span className="font-semibold text-teal-300 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Configure Recurring Monthly Auto-Pay</span>
                </span>
              </label>

              {isAutoPayConfigured && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Deduct and recharge on:</span>
                  <select
                    value={autoPayDayOfMonth}
                    onChange={(e) => setAutoPayDayOfMonth(parseInt(e.target.value, 10))}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  >
                    <option value={1}>1st of each month (Salary Day)</option>
                    <option value={20}>20th of each month</option>
                    <option value={25}>25th of each month (Oman Govt Pay Day)</option>
                    <option value={28}>28th of each month</option>
                  </select>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handlePay}
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold uppercase tracking-wider shadow-lg shadow-teal-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Process Instant Recharge / Bill Settlement</span>
            </button>
          </div>
        </div>

        {/* Right 6 cols: Recurring Auto-Pay & History */}
        <div className="lg:col-span-6 space-y-5">
          {/* Active Auto-Pay Contracts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-white">Active Recurring Auto-Pay Customers</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-mono">
                {autoPayList.length} Scheduled
              </span>
            </div>

            <div className="space-y-2">
              {autoPayList.map((ap) => (
                <div
                  key={ap.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-200">
                      {ap.customerName} • {ap.mobileOrAccount}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {ap.operatorName} • Scheduled on day {ap.autoPayDayOfMonth || 25} of every month
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-teal-300">
                    {formatMoney(ap.amount, activeCurrency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-bold text-white">Recent Telecom Transactions</h3>
              <span className="text-[10px] text-slate-400">{telecomBills.length} Total</span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {telecomBills.map((tb) => (
                <div
                  key={tb.id}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-200">
                      {tb.operatorName} • {tb.mobileOrAccount}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Customer: {tb.customerName} • {formatDateTime(tb.timestamp)}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-teal-300">
                      {formatMoney(tb.amount, activeCurrency)}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      Comm: +{formatMoney(tb.commission, activeCurrency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
