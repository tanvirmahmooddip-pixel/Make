import React, { useState } from 'react';
import {
  Landmark,
  Wallet,
  ArrowRightLeft,
  CreditCard,
  Scale,
  Plus,
  ArrowDownToLine,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { BankAccount, CurrencyCode } from '../types';
import { formatMoney } from '../utils/formatters';

interface BankLedgerModuleProps {
  bankAccounts: BankAccount[];
  cashInHand: number;
  totalReceivables: number;
  totalPayables: number;
  activeCurrency: CurrencyCode;
  onOpenDepositModal: () => void;
  onTransferBetweenBanks: (fromBankId: string, toBankId: string, amount: number) => void;
}

export const BankLedgerModule: React.FC<BankLedgerModuleProps> = ({
  bankAccounts,
  cashInHand,
  totalReceivables,
  totalPayables,
  activeCurrency,
  onOpenDepositModal,
  onTransferBetweenBanks,
}) => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [fromBankId, setFromBankId] = useState(bankAccounts[0]?.id || '');
  const [toBankId, setToBankId] = useState(bankAccounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('500.000');

  const totalBankBalance = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);
  const totalLiquidCash = cashInHand + totalBankBalance;
  const netWorkingCapital = totalLiquidCash + totalReceivables - totalPayables;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount) || 0;
    if (amount <= 0 || fromBankId === toBankId) return;

    onTransferBetweenBanks(fromBankId, toBankId, amount);
    setIsTransferModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-400" />
            <span>Bank Accounts & Central Treasury Ledger</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time financial balancing across Bank Muscat, Bank Dhofar, NBO, drawer cash & customer credit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
            <span>Inter-Bank Transfer</span>
          </button>

          <button
            onClick={onOpenDepositModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Deposit Cash In Hand</span>
          </button>
        </div>
      </div>

      {/* Central Balance Sheet / Balancing Equation */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-blue-500/30 shadow-xl text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Real-Time Liquid Store Position & Working Capital
            </h2>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">100% BALANCED</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[10px] uppercase font-sans text-emerald-400 font-semibold">
              Cash in Hand (Drawer)
            </div>
            <div className="text-base font-bold text-emerald-300 mt-1">
              {formatMoney(cashInHand, activeCurrency)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[10px] uppercase font-sans text-blue-400 font-semibold">
              Combined Bank Funds
            </div>
            <div className="text-base font-bold text-blue-300 mt-1">
              {formatMoney(totalBankBalance, activeCurrency)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-[10px] uppercase font-sans text-amber-400 font-semibold">
              Customer Receivables (A/R)
            </div>
            <div className="text-base font-bold text-amber-300 mt-1">
              {formatMoney(totalReceivables, activeCurrency)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-purple-500/40">
            <div className="text-[10px] uppercase font-sans text-purple-300 font-semibold">
              Net Store Working Capital
            </div>
            <div className="text-base font-bold text-purple-300 mt-1">
              {formatMoney(netWorkingCapital, activeCurrency)}
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bankAccounts.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg text-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-blue-400" />
                  <span>{b.bankName}</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">{b.accountName}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-mono text-[10px] border border-blue-500/20">
                {b.currency}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Account No:</span>
                <span className="text-slate-200">{b.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">IBAN (Oman):</span>
                <span className="text-slate-300">{b.iban}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Branch:</span>
                <span className="text-slate-300">{b.branch}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-slate-400 font-sans">Verified Ledger Balance:</span>
              <span className="font-mono font-bold text-base text-blue-300">
                {formatMoney(b.currentBalance, activeCurrency)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Inter-Bank Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 text-xs text-slate-100 shadow-2xl">
            <h3 className="font-bold text-sm text-white mb-3">Inter-Bank Account Transfer</h3>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">From Bank Account</label>
                <select
                  value={fromBankId}
                  onChange={(e) => setFromBankId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} (Bal: OMR {b.currentBalance.toFixed(3)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">To Bank Account</label>
                <select
                  value={toBankId}
                  onChange={(e) => setToBankId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} (Bal: OMR {b.currentBalance.toFixed(3)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Transfer Amount (OMR)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-amber-400 font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
