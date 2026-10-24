import React, { useState } from 'react';
import {
  Zap,
  Droplets,
  Flame,
  Search,
  CheckCircle2,
  Printer,
  Smartphone,
  Send,
  Receipt,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { CurrencyCode, PaymentMethod, UtilityBillPayment } from '../types';
import { formatMoney, formatDateTime } from '../utils/formatters';

interface UtilityBillsModuleProps {
  utilityBills: UtilityBillPayment[];
  activeCurrency: CurrencyCode;
  onProcessPayment: (payment: UtilityBillPayment) => void;
}

export const UtilityBillsModule: React.FC<UtilityBillsModuleProps> = ({
  utilityBills,
  activeCurrency,
  onProcessPayment,
}) => {
  const [serviceType, setServiceType] = useState<UtilityBillPayment['serviceType']>('electricity');
  const [provider, setProvider] = useState<UtilityBillPayment['provider']>('nama_supply');
  const [accountNumber, setAccountNumber] = useState('1048291039');
  const [customerName, setCustomerName] = useState('Salim Al-Harthy');
  const [customerPhone, setCustomerPhone] = useState('+968 9123 4567');
  const [billAmount, setBillAmount] = useState('32.500');
  const [commissionFee, setCommissionFee] = useState('0.500');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  // Inquiry simulation
  const [inquired, setInquired] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<UtilityBillPayment | null>(null);

  const handleInquire = () => {
    setInquiryLoading(true);
    setTimeout(() => {
      setInquiryLoading(false);
      setInquired(true);
    }, 600);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBill = parseFloat(billAmount) || 0;
    const parsedFee = parseFloat(commissionFee) || 0;

    let provName = 'Nama Electricity Supply';
    if (serviceType === 'water') provName = 'Nama Water Services (Diam / PAEW)';
    if (serviceType === 'gas') provName = 'Muscat Gases Co SAOG';

    const newPayment: UtilityBillPayment = {
      id: `util-${Date.now()}`,
      referenceNumber: `OM-UTIL-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      serviceType,
      provider,
      providerName: provName,
      accountNumber,
      customerName,
      customerPhone,
      billAmount: parsedBill,
      commissionFee: parsedFee,
      totalCollected: parsedBill + parsedFee,
      paymentMethod,
      status: 'completed',
      smsNotificationSent: true,
    };

    onProcessPayment(newPayment);
    setSelectedReceipt(newPayment);
    setInquired(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span>Oman All Utility Bill Payments Hub</span>
        </h1>
        <p className="text-xs text-slate-400">
          Official bill settlement for Nama Electricity, Diam Water, and Muscat Gases with instant receipt SMS notification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: Bill Inquiry & Payment Form */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-xs space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Bill Inquiry & Instant Collection</span>
          </h2>

          {/* Service Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setServiceType('electricity');
                setProvider('nama_supply');
                setInquired(false);
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                serviceType === 'electricity'
                  ? 'bg-yellow-500/15 border-yellow-500 text-yellow-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Electricity (كهرباء)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setServiceType('water');
                setProvider('diam_water');
                setInquired(false);
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                serviceType === 'water'
                  ? 'bg-blue-500/15 border-blue-500 text-blue-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Droplets className="w-5 h-5 text-blue-400" />
              <span>Diam Water (مياه)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setServiceType('gas');
                setProvider('muscat_gases');
                setInquired(false);
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                serviceType === 'gas'
                  ? 'bg-orange-500/15 border-orange-500 text-orange-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Flame className="w-5 h-5 text-orange-400" />
              <span>LPG Gas (غاز)</span>
            </button>
          </div>

          {/* Account Number & Inquiry */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Consumer Account Number / Meter Ref
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1048291039"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleInquire}
                  disabled={inquiryLoading || !accountNumber}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{inquiryLoading ? 'Checking...' : 'Fetch Bill'}</span>
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile (+968) for SMS</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                />
              </div>
            </div>

            {/* Bill Amount & Fee */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bill Amount (OMR)</label>
                <input
                  type="number"
                  step="0.001"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Service Fee / Commission</label>
                <input
                  type="number"
                  step="0.001"
                  value={commissionFee}
                  onChange={(e) => setCommissionFee(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-emerald-400 font-bold"
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Received Via</label>
              <div className="flex gap-2">
                {(['cash', 'card', 'bank_transfer'] as PaymentMethod[]).map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`flex-1 py-1.5 rounded-lg border text-center uppercase font-semibold transition ${
                      paymentMethod === pm
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {pm.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Total calculation */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between font-mono">
              <span className="text-slate-400">Total To Collect:</span>
              <span className="text-base font-bold text-amber-400">
                {formatMoney((parseFloat(billAmount) || 0) + (parseFloat(commissionFee) || 0), activeCurrency)}
              </span>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Collect Payment & Trigger SMS Notification</span>
            </button>
          </div>
        </div>

        {/* Right 6 cols: Recent Utility History */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Utility Transactions Log</span>
            </h2>
            <span className="text-[10px] text-slate-400">{utilityBills.length} Transactions</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {utilityBills.map((bill) => (
              <div
                key={bill.id}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white">{bill.providerName.split('(')[0]}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Ref: {bill.referenceNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Acc: {bill.accountNumber} • Customer: {bill.customerName} ({bill.customerPhone})
                  </div>
                  <div className="text-[10px] text-slate-500">{formatDateTime(bill.timestamp)}</div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-sm text-amber-300">
                    {formatMoney(bill.totalCollected, activeCurrency)}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    Profit Fee: +{formatMoney(bill.commissionFee, activeCurrency)}
                  </div>
                  <button
                    onClick={() => setSelectedReceipt(bill)}
                    className="text-[10px] text-amber-400 hover:underline mt-1 block ml-auto"
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Receipt Slip Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
          <div className="w-full max-w-sm bg-white text-slate-950 p-6 rounded-2xl shadow-2xl text-xs font-mono">
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              <h3 className="font-black text-sm uppercase">AL-RABIL UTILITY PAYMENT RECEIPT</h3>
              <div className="text-[10px] text-slate-600">Authorized Agent for Oman Utilities</div>
              <div className="text-[10px] font-bold text-emerald-700 mt-1">TRANSACTION CONFIRMED</div>
            </div>

            <div className="py-3 space-y-1 text-[11px] border-b border-dashed border-slate-400">
              <div className="flex justify-between">
                <span>Receipt Ref:</span>
                <span className="font-bold">{selectedReceipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Service:</span>
                <span>{selectedReceipt.providerName.split('(')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span>Account No:</span>
                <span>{selectedReceipt.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{selectedReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Mobile:</span>
                <span>{selectedReceipt.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>Bill Amount:</span>
                <span>OMR {selectedReceipt.billAmount.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee:</span>
                <span>OMR {selectedReceipt.commissionFee.toFixed(3)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                <span>TOTAL PAID:</span>
                <span>OMR {selectedReceipt.totalCollected.toFixed(3)}</span>
              </div>
            </div>

            <div className="pt-3 text-[10px] text-slate-600 text-center">
              <div>SMS notification dispatched to {selectedReceipt.customerPhone}.</div>
              <div className="mt-1 font-bold">شكراً لتعاملكم معنا</div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-300">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-1.5 rounded bg-slate-200 text-slate-800 font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded bg-amber-600 text-white font-bold"
              >
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
