import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MessageCircle,
  Printer,
  ChevronRight,
  TrendingUp,
  Tag,
  Edit2,
  Trash2,
  X,
  Building2,
  ArrowDownToLine,
  Receipt,
  Wrench,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Download,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { CurrencyCode, Customer, PaymentMethod, RepairTicket, SaleTransaction } from '../types';
import { formatMoney } from '../utils/formatters';

interface CustomerManagementModuleProps {
  customers: Customer[];
  sales: SaleTransaction[];
  repairTickets: RepairTicket[];
  activeCurrency: CurrencyCode;
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onSettleCredit: (customerId: string, amount: number, method: PaymentMethod, note?: string) => void;
  onOpenInvoiceModal: (sale: SaleTransaction) => void;
}

export const CustomerManagementModule: React.FC<CustomerManagementModuleProps> = ({
  customers,
  sales,
  repairTickets,
  activeCurrency,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onSettleCredit,
  onOpenInvoiceModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [onlyWithCredit, setOnlyWithCredit] = useState(false);

  // Selected customer for detail view drawer/modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Add/Edit modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formPhone, setFormPhone] = useState('+968 ');
  const [formEmail, setFormEmail] = useState('');
  const [formCivilId, setFormCivilId] = useState('');
  const [formCity, setFormCity] = useState('Muscat');
  const [formAddress, setFormAddress] = useState('');
  const [formCreditLimit, setFormCreditLimit] = useState('200.000');
  const [formCreditBalance, setFormCreditBalance] = useState('0.000');
  const [formTags, setFormTags] = useState<Customer['tags']>(['regular']);
  const [formNotes, setFormNotes] = useState('');

  // Settle credit modal state
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>('cash');
  const [settleNote, setSettleNote] = useState('');

  // CSV Export state & feedback toast
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportToastMessage, setExportToastMessage] = useState<string | null>(null);

  // Export Customer Database to CSV (RFC 4180 standard + UTF-8 BOM for Arabic support)
  const exportCustomersToCSV = (targetCustomers: Customer[], exportTypeLabel: string) => {
    if (!targetCustomers || targetCustomers.length === 0) {
      alert('No customer records to export.');
      return;
    }

    const headers = [
      'Customer ID',
      'Customer Name',
      'Customer Name (Arabic)',
      'Phone Number',
      'Email Address',
      'Civil ID / CR',
      'City',
      'Address',
      'Customer Tags',
      'Credit Balance (OMR)',
      'Credit Limit (OMR)',
      'Available Credit Headroom (OMR)',
      'Total Purchases Count',
      'Total Lifetime Spent (OMR)',
      'Last Purchase Date',
      'Account Registered Date',
      'Notes / Remarks',
    ];

    const escapeCell = (val: string | number | undefined | null): string => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = targetCustomers.map((c) => {
      const availableCredit = Math.max(0, c.creditLimit - c.creditBalance);
      const tagsStr = (c.tags || []).join('; ');
      return [
        escapeCell(c.id),
        escapeCell(c.name),
        escapeCell(c.nameAr || ''),
        escapeCell(c.phone),
        escapeCell(c.email || ''),
        escapeCell(c.civilIdOrCr || ''),
        escapeCell(c.city),
        escapeCell(c.address || ''),
        escapeCell(tagsStr),
        escapeCell(c.creditBalance.toFixed(3)),
        escapeCell(c.creditLimit.toFixed(3)),
        escapeCell(availableCredit.toFixed(3)),
        escapeCell(c.totalPurchasesCount),
        escapeCell(c.totalSpent.toFixed(3)),
        escapeCell(c.lastPurchaseDate || 'N/A'),
        escapeCell(c.createdAt || 'N/A'),
        escapeCell(c.notes || ''),
      ].join(',');
    });

    // Prepend UTF-8 BOM (\uFEFF) to guarantee Arabic text renders correctly in Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const safeLabel = exportTypeLabel.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `Zukait-Customers-${safeLabel}-${dateStr}.csv`;

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportToastMessage(`Exported ${targetCustomers.length} customer records to "${filename}"`);
    setIsExportModalOpen(false);
    setTimeout(() => setExportToastMessage(null), 4500);
  };

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.nameAr && c.nameAr.toLowerCase().includes(q)) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.civilIdOrCr && c.civilIdOrCr.toLowerCase().includes(q)) ||
      c.city.toLowerCase().includes(q);

    const matchesTag = selectedTagFilter === 'all' || c.tags.includes(selectedTagFilter as any);
    const matchesCity = selectedCityFilter === 'all' || c.city.toLowerCase() === selectedCityFilter.toLowerCase();
    const matchesCredit = !onlyWithCredit || c.creditBalance > 0;

    return matchesSearch && matchesTag && matchesCity && matchesCredit;
  });

  // Aggregated Stats
  const totalClients = customers.length;
  const totalOutstandingCredit = customers.reduce((acc, c) => acc + c.creditBalance, 0);
  const clientsWithCreditCount = customers.filter((c) => c.creditBalance > 0).length;
  const totalSpentAcrossAll = customers.reduce((acc, c) => acc + c.totalSpent, 0);

  // Open Add modal
  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormNameAr('');
    setFormPhone('+968 9');
    setFormEmail('');
    setFormCivilId('');
    setFormCity('Muscat');
    setFormAddress('');
    setFormCreditLimit('250.000');
    setFormCreditBalance('0.000');
    setFormTags(['regular']);
    setFormNotes('');
    setIsFormModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormNameAr(c.nameAr || '');
    setFormPhone(c.phone);
    setFormEmail(c.email || '');
    setFormCivilId(c.civilIdOrCr || '');
    setFormCity(c.city);
    setFormAddress(c.address || '');
    setFormCreditLimit(c.creditLimit.toFixed(3));
    setFormCreditBalance(c.creditBalance.toFixed(3));
    setFormTags(c.tags);
    setFormNotes(c.notes || '');
    setIsFormModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert('Customer name and phone number are required.');
      return;
    }

    if (editingCustomer) {
      const updated: Customer = {
        ...editingCustomer,
        name: formName.trim(),
        nameAr: formNameAr.trim() || undefined,
        phone: formPhone.trim(),
        email: formEmail.trim() || undefined,
        civilIdOrCr: formCivilId.trim() || undefined,
        city: formCity,
        address: formAddress.trim() || undefined,
        creditLimit: parseFloat(formCreditLimit) || 0,
        creditBalance: parseFloat(formCreditBalance) || 0,
        tags: formTags,
        notes: formNotes.trim() || undefined,
      };
      onUpdateCustomer(updated);
      if (selectedCustomer?.id === updated.id) {
        setSelectedCustomer(updated);
      }
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: formName.trim(),
        nameAr: formNameAr.trim() || undefined,
        phone: formPhone.trim(),
        email: formEmail.trim() || undefined,
        civilIdOrCr: formCivilId.trim() || undefined,
        city: formCity,
        address: formAddress.trim() || undefined,
        creditBalance: parseFloat(formCreditBalance) || 0,
        creditLimit: parseFloat(formCreditLimit) || 200,
        tags: formTags,
        totalPurchasesCount: 0,
        totalSpent: 0,
        notes: formNotes.trim() || undefined,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddCustomer(newCust);
    }

    setIsFormModalOpen(false);
  };

  // Open Settle Credit modal
  const handleOpenSettleModal = (c: Customer) => {
    setSelectedCustomer(c);
    setSettleAmount(c.creditBalance > 0 ? c.creditBalance.toFixed(3) : '10.000');
    setSettleMethod('cash');
    setSettleNote(`Settlement of outstanding customer account credit`);
    setIsSettleModalOpen(true);
  };

  // Confirm Settle Credit
  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const amount = parseFloat(settleAmount) || 0;
    if (amount <= 0) return;

    onSettleCredit(selectedCustomer.id, amount, settleMethod, settleNote);
    setIsSettleModalOpen(false);

    // Update local selectedCustomer state
    const newBal = Math.max(0, selectedCustomer.creditBalance - amount);
    const updated = { ...selectedCustomer, creditBalance: newBal };
    setSelectedCustomer(updated);
  };

  // Get purchase history for current selected customer
  const getCustomerSales = (cust: Customer) => {
    const cleanPhone = cust.phone.replace(/\D/g, '');
    return sales.filter((s) => {
      const salePhone = s.customerPhone.replace(/\D/g, '');
      const matchesPhone = cleanPhone && salePhone && (cleanPhone.includes(salePhone) || salePhone.includes(cleanPhone));
      const matchesName = s.customerName.toLowerCase() === cust.name.toLowerCase();
      return matchesPhone || matchesName;
    });
  };

  // Get repair jobs for current selected customer
  const getCustomerRepairs = (cust: Customer) => {
    const cleanPhone = cust.phone.replace(/\D/g, '');
    return repairTickets.filter((r) => {
      const repPhone = r.customerPhone.replace(/\D/g, '');
      const matchesPhone = cleanPhone && repPhone && (cleanPhone.includes(repPhone) || repPhone.includes(cleanPhone));
      const matchesName = r.customerName.toLowerCase() === cust.name.toLowerCase();
      return matchesPhone || matchesName;
    });
  };

  // Generate WhatsApp Account Statement Link
  const getWhatsAppStatementUrl = (cust: Customer) => {
    const cleanPhone = cust.phone.replace(/\D/g, '');
    const message = `*Al-Rabiul & Big Brother Mobiles & Smart Security LLC*
*كشف حساب العميل / Client Account Statement*
--------------------------------
*Client Name:* ${cust.name}
*Phone:* ${cust.phone}
*City:* ${cust.city}
--------------------------------
*Current Outstanding Credit Balance:* OMR ${cust.creditBalance.toFixed(3)}
*Approved Credit Limit:* OMR ${cust.creditLimit.toFixed(3)}
*Total Lifetime Purchases:* ${cust.totalPurchasesCount} orders (OMR ${cust.totalSpent.toFixed(3)})
--------------------------------
${
  cust.creditBalance > 0
    ? `Kindly settle your outstanding balance of OMR ${cust.creditBalance.toFixed(3)} via Bank Muscat (Account: 0421-9876-0012-001) or visit our showroom counter. Thank you!`
    : `Your account balance is clear with zero dues. Thank you for being a valued client!`
}
--------------------------------
Al-Rabiul & Big Brother LLC • Ruwi High Street, Muscat • Tel: +968 2478 9120`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const tagColor = (tag: string) => {
    switch (tag) {
      case 'vip':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'wholesale':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'corporate':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'credit':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Customer Directory & Client Credit Ledger
            </h2>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
              CRM & CREDIT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track customer contact info, purchase history, outstanding credit balances, and WhatsApp statements across Oman
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
            title="Export Customer Database to CSV (Backup or External Reporting)"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
            title="Print Customer List"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print List</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* CSV Export Success Toast Banner */}
      {exportToastMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{exportToastMessage}</span>
          </div>
          <button
            onClick={() => setExportToastMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 p-1 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Registered Clients</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalClients}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Across all branches in Oman</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Outstanding Credit (Receivables) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Credit Balance Owed</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1 font-mono">
              {formatMoney(totalOutstandingCredit, activeCurrency)}
            </h3>
            <p className="text-[11px] text-rose-400/80 mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {clientsWithCreditCount} clients with active credit balance
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* VIP & Wholesale Count */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">VIP & Corporate Clients</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">
              {customers.filter((c) => c.tags.includes('vip') || c.tags.includes('corporate')).length}
            </h3>
            <p className="text-[11px] text-amber-400/80 mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              High lifetime value partners
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Total Lifetime Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Lifetime Spend</p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1 font-mono">
              {formatMoney(totalSpentAcrossAll, activeCurrency)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Recorded store purchases</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone (+968), email, Civil ID/CR, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Tag Filter */}
            <select
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
            >
              <option value="all">All Client Types</option>
              <option value="vip">VIP</option>
              <option value="wholesale">Wholesale</option>
              <option value="corporate">Corporate</option>
              <option value="regular">Regular</option>
              <option value="credit">Credit Account</option>
            </select>

            {/* City Filter */}
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
            >
              <option value="all">All Cities</option>
              <option value="Muscat">Muscat</option>
              <option value="Seeb">Seeb</option>
              <option value="Barka">Barka</option>
              <option value="Sohar">Sohar</option>
              <option value="Salalah">Salalah</option>
            </select>

            {/* With Credit Toggle */}
            <button
              onClick={() => setOnlyWithCredit(!onlyWithCredit)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                onlyWithCredit
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              Owing Credit Only ({clientsWithCreditCount})
            </button>

            {/* Quick 1-Click CSV Export of Current List */}
            {filteredCustomers.length > 0 && (
              <button
                onClick={() =>
                  exportCustomersToCSV(
                    filteredCustomers,
                    searchQuery || selectedTagFilter !== 'all' || selectedCityFilter !== 'all' || onlyWithCredit
                      ? 'Filtered'
                      : 'Database'
                  )
                }
                title={`Export ${filteredCustomers.length} customer records to CSV`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export ({filteredCustomers.length}) CSV</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-400" />
            <p className="text-sm font-semibold text-slate-300">No customers found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new customer.</p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const hasCredit = cust.creditBalance > 0;
            const creditPct = cust.creditLimit > 0 ? Math.min(100, (cust.creditBalance / cust.creditLimit) * 100) : 0;
            const custSales = getCustomerSales(cust);
            const custRepairs = getCustomerRepairs(cust);

            return (
              <div
                key={cust.id}
                className={`bg-slate-900 border rounded-2xl p-5 hover:border-slate-700 transition space-y-4 flex flex-col justify-between shadow-lg ${
                  hasCredit ? 'border-rose-500/30' : 'border-slate-800'
                }`}
              >
                {/* Header: Name, Tags, Actions */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30 shrink-0">
                        {cust.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm hover:text-emerald-400 transition cursor-pointer" onClick={() => setSelectedCustomer(cust)}>
                            {cust.name}
                          </h3>
                        </div>
                        {cust.nameAr && (
                          <p className="text-[11px] text-slate-400 font-sans">{cust.nameAr}</p>
                        )}
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{cust.city}</span>
                          {cust.civilIdOrCr && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              • ID: {cust.civilIdOrCr}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(cust)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete customer ${cust.name}?`)) {
                            onDeleteCustomer(cust.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {cust.tags.map((t) => (
                      <span
                        key={t}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${tagColor(
                          t
                        )}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact quick links */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80">
                  <a
                    href={`tel:${cust.phone}`}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition truncate"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{cust.phone}</span>
                  </a>
                  <a
                    href={getWhatsAppStatementUrl(cust)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition justify-end font-semibold text-[11px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>WhatsApp Bill</span>
                  </a>
                </div>

                {/* Credit Balance Bar */}
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      Credit Balance:
                    </span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        hasCredit ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatMoney(cust.creditBalance, activeCurrency)}
                    </span>
                  </div>

                  {/* Limit visual meter */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          creditPct > 80 ? 'bg-rose-500' : creditPct > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${creditPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Limit: {formatMoney(cust.creditLimit, activeCurrency)}</span>
                      <span>
                        Available: {formatMoney(Math.max(0, cust.creditLimit - cust.creditBalance), activeCurrency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Purchase stats & Actions */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Orders: <strong className="text-slate-200">{cust.totalPurchasesCount || custSales.length}</strong>
                    </span>
                    <span>
                      Total Spent:{' '}
                      <strong className="text-slate-200 font-mono">
                        {formatMoney(cust.totalSpent, activeCurrency)}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Ledger & History</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {hasCredit && (
                      <button
                        onClick={() => handleOpenSettleModal(cust)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        <span>Settle</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100 animate-in fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-500/30">
                  {selectedCustomer.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedCustomer.name}</h3>
                    {selectedCustomer.tags.map((t) => (
                      <span
                        key={t}
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${tagColor(
                          t
                        )}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedCustomer.city} • Joined {selectedCustomer.createdAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppStatementUrl(selectedCustomer)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp Statement</span>
                </a>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Credit Status Banner */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Outstanding Account Credit Balance
                  </span>
                  <div className="text-2xl font-bold font-mono text-rose-400 mt-0.5">
                    {formatMoney(selectedCustomer.creditBalance, activeCurrency)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Store Credit Limit: {formatMoney(selectedCustomer.creditLimit, activeCurrency)} • Available Credit:{' '}
                    {formatMoney(
                      Math.max(0, selectedCustomer.creditLimit - selectedCustomer.creditBalance),
                      activeCurrency
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCustomer.creditBalance > 0 && (
                    <button
                      onClick={() => handleOpenSettleModal(selectedCustomer)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>Collect / Settle Credit</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEditModal(selectedCustomer)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
                  >
                    Adjust Limit
                  </button>
                </div>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-850/50 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phone</span>
                  <span className="font-mono text-slate-200 text-xs">{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Email</span>
                  <span className="text-slate-200 text-xs truncate block">{selectedCustomer.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Civil ID / CR No.</span>
                  <span className="font-mono text-slate-200 text-xs">{selectedCustomer.civilIdOrCr || 'N/A'}</span>
                </div>
                <div className="sm:col-span-3 border-t border-slate-800 pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Address</span>
                  <span className="text-slate-200 text-xs">{selectedCustomer.address || selectedCustomer.city}</span>
                </div>
                {selectedCustomer.notes && (
                  <div className="sm:col-span-3 border-t border-slate-800 pt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Customer Notes</span>
                    <span className="text-slate-300 text-xs italic">{selectedCustomer.notes}</span>
                  </div>
                )}
              </div>

              {/* Purchase History Log */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span>Purchase History ({getCustomerSales(selectedCustomer).length} Invoices)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Lifetime: {formatMoney(selectedCustomer.totalSpent, activeCurrency)}
                  </span>
                </div>

                {getCustomerSales(selectedCustomer).length === 0 ? (
                  <p className="text-slate-500 py-3 text-center">No purchases recorded under this customer yet.</p>
                ) : (
                  <div className="space-y-2">
                    {getCustomerSales(selectedCustomer).map((sale) => (
                      <div
                        key={sale.id}
                        className="p-3 bg-slate-850 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 hover:border-slate-700 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">{sale.invoiceNumber}</span>
                            <span className="text-[10px] text-slate-400">{sale.date.split('T')[0]}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 uppercase font-mono">
                              {sale.paymentMethod}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-white text-xs">
                            {formatMoney(sale.grandTotal, activeCurrency)}
                          </span>
                          <button
                            onClick={() => onOpenInvoiceModal(sale)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-semibold transition cursor-pointer"
                          >
                            View Invoice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Repair History Log */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-orange-400" />
                    <span>Repair & Service History ({getCustomerRepairs(selectedCustomer).length} Job Cards)</span>
                  </h4>
                </div>

                {getCustomerRepairs(selectedCustomer).length === 0 ? (
                  <p className="text-slate-500 py-3 text-center">No device repairs logged for this client.</p>
                ) : (
                  <div className="space-y-2">
                    {getCustomerRepairs(selectedCustomer).map((rep) => (
                      <div
                        key={rep.id}
                        className="p-3 bg-slate-850 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">{rep.ticketNumber}</span>
                            <span className="font-medium text-slate-200">{rep.deviceBrand} {rep.deviceModel}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-semibold">
                              {rep.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{rep.problemDescription}</p>
                        </div>

                        <div className="text-right font-mono">
                          <span className="font-bold text-white text-xs block">
                            {formatMoney(rep.finalCost || rep.estimatedCost, activeCurrency)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {rep.warrantyDays} Days Warranty
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-800/80 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settle Credit Payment Modal */}
      {isSettleModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
                Receive Credit Payment
              </h3>
              <button onClick={() => setIsSettleModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSettle} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400">Client: <strong className="text-white">{selectedCustomer.name}</strong></div>
                <div className="text-slate-400 font-mono">
                  Current Credit Owed: <strong className="text-rose-400">{formatMoney(selectedCustomer.creditBalance, activeCurrency)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Amount Received (OMR):</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  max={selectedCustomer.creditBalance}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono text-sm"
                  required
                />
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setSettleAmount(selectedCustomer.creditBalance.toFixed(3))}
                    className="text-[10px] text-emerald-400 underline cursor-pointer"
                  >
                    Full Balance ({formatMoney(selectedCustomer.creditBalance, activeCurrency)})
                  </button>
                  {selectedCustomer.creditBalance > 20 && (
                    <button
                      type="button"
                      onClick={() => setSettleAmount((selectedCustomer.creditBalance / 2).toFixed(3))}
                      className="text-[10px] text-slate-400 underline cursor-pointer"
                    >
                      50% Partial
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deposited Via:</label>
                <select
                  value={settleMethod}
                  onChange={(e) => setSettleMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                >
                  <option value="cash">Drawer Cash In Hand</option>
                  <option value="card">OmanNet Card POS Terminal</option>
                  <option value="bank_transfer">Bank Muscat / Dhofar Direct Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Receipt Note / Voucher Ref:</label>
                <input
                  type="text"
                  value={settleNote}
                  onChange={(e) => setSettleNote(e.target.value)}
                  placeholder="e.g. Received by cashier Ahmed at Ruwi counter"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSettleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                {editingCustomer ? 'Edit Customer Profile' : 'Register New Customer'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name (English):</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Salim Al-Balushi"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Arabic Name (Optional):</label>
                  <input
                    type="text"
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="e.g. سالم البلوشي"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number (+968):</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+968 9..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address:</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Civil ID / CR / VAT No:</label>
                  <input
                    type="text"
                    value={formCivilId}
                    onChange={(e) => setFormCivilId(e.target.value)}
                    placeholder="e.g. 10928374 or CR 139..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City / Region in Oman:</label>
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  >
                    <option value="Muscat">Muscat</option>
                    <option value="Seeb">Seeb</option>
                    <option value="Barka">Barka</option>
                    <option value="Sohar">Sohar</option>
                    <option value="Salalah">Salalah</option>
                    <option value="Nizwa">Nizwa</option>
                    <option value="Sur">Sur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Street / Building Address:</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="e.g. Ruwi Commercial High Street, Way 3312"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              {/* Credit Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-850 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Store Credit Limit (OMR):</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formCreditLimit}
                    onChange={(e) => setFormCreditLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Credit Balance (OMR):</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formCreditBalance}
                    onChange={(e) => setFormCreditBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Tags Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Client Category Tags:</label>
                <div className="flex flex-wrap gap-2">
                  {(['regular', 'vip', 'wholesale', 'corporate', 'credit'] as Customer['tags'][number][]).map((tag) => {
                    const isSelected = formTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => {
                          if (isSelected) {
                            setFormTags(formTags.filter((t) => t !== tag));
                          } else {
                            setFormTags([...formTags, tag]);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize border transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes / Preferences:</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. VIP client, prefers iPhone Pro Max releases, Net 30 billing."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Database Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Export Customer Database
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                      CSV / EXCEL
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generate an RFC 4180 compliant CSV backup for external accounting, audits, and Excel reporting.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Export Scope Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Full Database Backup */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Full Customer Database</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                      {customers.length} Records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Complete backup of all registered customers across all branches in Oman.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-700/50 space-y-1 text-[11px] text-slate-300 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Credit Owed:</span>
                      <span className="text-rose-400 font-bold">{formatMoney(totalOutstandingCredit, activeCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Lifetime Spend:</span>
                      <span className="text-blue-400 font-bold">{formatMoney(totalSpentAcrossAll, activeCurrency)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => exportCustomersToCSV(customers, 'Full-Database-Backup')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Backup ({customers.length})</span>
                </button>
              </div>

              {/* Option 2: Filtered Results */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Filtered Search View</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                      {filteredCustomers.length} Records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Export customers currently matched by your active search filters (city, tag, credit balance).
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-700/50 space-y-1 text-[11px] text-slate-300 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Filtered Credit Owed:</span>
                      <span className="text-rose-400 font-bold">
                        {formatMoney(
                          filteredCustomers.reduce((acc, c) => acc + c.creditBalance, 0),
                          activeCurrency
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Filtered Spend:</span>
                      <span className="text-blue-400 font-bold">
                        {formatMoney(
                          filteredCustomers.reduce((acc, c) => acc + c.totalSpent, 0),
                          activeCurrency
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    exportCustomersToCSV(
                      filteredCustomers,
                      searchQuery || selectedTagFilter !== 'all' || selectedCityFilter !== 'all' || onlyWithCredit
                        ? 'Filtered-Report'
                        : 'Current-View'
                    )
                  }
                  disabled={filteredCustomers.length === 0}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filteredCustomers.length > 0
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Download Filtered View ({filteredCustomers.length})</span>
                </button>
              </div>
            </div>

            {/* Export Fields & Format Specifications */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Export Format Specifications & Included Columns</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pre-formatted with UTF-8 Byte Order Mark (BOM) for zero-configuration opening in Arabic versions of Microsoft Excel and Apple Numbers. Columns included:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Customer ID',
                  'Full Name',
                  'Name (Arabic)',
                  'Phone Number',
                  'Email Address',
                  'Civil ID / CR',
                  'City & Address',
                  'Client Tags',
                  'Credit Balance (OMR)',
                  'Credit Limit (OMR)',
                  'Available Credit (OMR)',
                  'Total Purchases',
                  'Total Lifetime Spent (OMR)',
                  'Last Purchase Date',
                  'Registered Date',
                  'Account Notes',
                ].map((col) => (
                  <span
                    key={col}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                UTF-8 CSV • Oman VAT & Accounting Ready
              </span>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
