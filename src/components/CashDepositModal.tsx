import React, { useState } from 'react';
import { Landmark, Wallet, ArrowRight, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { BankAccount, CurrencyCode } from '../types';
import { formatMoney } from '../utils/formatters';

interface CashDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashInHand: number;
  bankAccounts: BankAccount[];
  activeCurrency: CurrencyCode;
  onConfirmDeposit: (bankId: string, amount: number, slipRef: string, notes: string) => void;
}

export const CashDepositModal: React.FC<CashDepositModalProps> = ({
  isOpen,
  onClose,
  cashInHand,
  bankAccounts,
  activeCurrency,
  onConfirmDeposit,
}) => {
  if (!isOpen) return null;

  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts[0]?.id || '');
  const [depositAmount, setDepositAmount] = useState<string>(
    cashInHand > 100 ? (cashInHand - 100).toFixed(3) : cashInHand.toFixed(3)
  );
  const [slipRef, setSlipRef] = useState<string>('DEP-SLIP-' + Math.floor(100000 + Math.random() * 900000));
  const [notes, setNotes] = useState<string>('Daily evening sales cash drop into company account');
  const [error, setError] = useState<string>('');

  const parsedAmount = parseFloat(depositAmount) || 0;
  const remainingDrawerCash = cashInHand - parsedAmount;

  const handleDeposit = () => {
    if (parsedAmount <= 0) {
      setError('Please enter a valid deposit amount greater than 0.');
      return;
    }
    if (parsedAmount > cashInHand) {
      setError(`Deposit amount exceeds drawer cash in hand (${formatMoney(cashInHand, activeCurrency)}).`);
      return;
    }
    if (!selectedBankId) {
      setError('Please select a destination bank account.');
      return;
    }

    onConfirmDeposit(selectedBankId, parsedAmount, slipRef, notes);
    onClose();
  };

  const handleQuickFloat = (floatToKeep: number) => {
    const toDeposit = Math.max(0, cashInHand - floatToKeep);
    setDepositAmount(toDeposit.toFixed(3));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Daily Sales Cash Deposit</h2>
            <p className="text-xs text-slate-400">
              Transfer physical drawer cash into the designated company bank account.
            </p>
          </div>
        </div>

        {/* Current Balances comparison */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 mb-5">
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-400">Cash in Hand (Drawer)</div>
            <div className="text-base font-bold font-mono text-emerald-300">
              {formatMoney(cashInHand, activeCurrency)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Projected Drawer Float</div>
            <div className={`text-base font-bold font-mono ${remainingDrawerCash < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {formatMoney(remainingDrawerCash, activeCurrency)}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Target Bank Dropdown */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Select Company Bank Account
            </label>
            <select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              {bankAccounts.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bankName} - {b.accountName} (Acc: {b.accountNumber}) [Bal: OMR {b.currentBalance.toFixed(3)}]
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Deposit Amount (OMR)</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFloat(100)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold border border-slate-700"
                >
                  Keep OMR 100 Float
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFloat(50)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold border border-slate-700"
                >
                  Keep OMR 50 Float
                </button>
                <button
                  type="button"
                  onClick={() => setDepositAmount(cashInHand.toFixed(3))}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold border border-slate-700"
                >
                  Deposit All
                </button>
              </div>
            </div>
            <input
              type="number"
              step="0.001"
              value={depositAmount}
              onChange={(e) => {
                setDepositAmount(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-base font-mono font-bold text-amber-400 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Slip / Ref Number */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              ATM / Bank Deposit Slip Number / Ref
            </label>
            <input
              type="text"
              value={slipRef}
              onChange={(e) => setSlipRef(e.target.value)}
              placeholder="e.g. ATM-SLIP-49120"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Notes / Description</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional reconciliation notes"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDeposit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Bank Deposit ({formatMoney(parsedAmount, activeCurrency)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
