import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Wrench,
  Truck,
  CheckCircle2,
  Phone,
  Search,
  Filter,
  Plus,
  Crown,
  ShieldAlert,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { CurrencyCode, DelayReasonCode, PendingServiceWork, User } from '../types';

interface PendingServicesTrackerModuleProps {
  pendingServices: PendingServiceWork[];
  currentUser: User;
  onAddPendingService: (item: PendingServiceWork) => void;
  onUpdatePendingService: (item: PendingServiceWork) => void;
  onResolveService: (id: string) => void;
}

export const PendingServicesTrackerModule: React.FC<PendingServicesTrackerModuleProps> = ({
  pendingServices,
  currentUser,
  onAddPendingService,
  onUpdatePendingService,
  onResolveService,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'mobile_repair' | 'cctv_field_job'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New bottleneck entry state
  const [serviceType, setServiceType] = useState<'mobile_repair' | 'cctv_field_job'>('mobile_repair');
  const [referenceCode, setReferenceCode] = useState('REP-2026-085');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+968 9');
  const [deviceOrSite, setDeviceOrSite] = useState('');
  const [assignedPerson, setAssignedPerson] = useState('Salim Al-Maamari (Tech)');
  const [daysPending, setDaysPending] = useState(2);
  const [reasonCategory, setReasonCategory] = useState<DelayReasonCode>('waiting_parts_dubai');
  const [pendingDetailsReason, setPendingDetailsReason] = useState('');
  const [supervisorActionNotes, setSupervisorActionNotes] = useState('');
  const [priority, setPriority] = useState<PendingServiceWork['priority']>('high');

  const reasonLabels: Record<DelayReasonCode, string> = {
    waiting_parts_dubai: 'Waiting for Parts from Dubai / China',
    waiting_customer_approval: 'Waiting for Customer Quote Approval',
    motherboard_microsoldering: 'Complex Board Micro-Soldering in Progress',
    customer_unreachable: 'Customer Phone Unreachable / No Response',
    weather_site_access: 'Site Scaffold / Municipal Permit Pending',
    technician_overload: 'Technician Workload Backlog',
    other: 'Other Custom Delay Reason',
  };

  const handleCreatePendingEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: PendingServiceWork = {
      id: `ps-${Date.now()}`,
      serviceType,
      referenceCode,
      customerName,
      customerPhone,
      deviceOrSite,
      assignedPerson,
      branchId: 'branch-ruwi',
      daysPending: Number(daysPending) || 1,
      reasonCategory,
      pendingDetailsReason,
      supervisorActionNotes: supervisorActionNotes || undefined,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddPendingService(newEntry);
    setIsAddModalOpen(false);
    setCustomerName('');
    setDeviceOrSite('');
    setPendingDetailsReason('');
  };

  const filteredItems = pendingServices.filter((item) => {
    const matchesSearch =
      item.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerPhone.includes(searchQuery) ||
      item.deviceOrSite.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.serviceType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>Owner Pending Services & Bottleneck Resolution Radar</span>
          </h1>
          <p className="text-xs text-slate-400">
            Mandatory delay tracking: view why repair devices or CCTV field projects are pending, SLA overdue warnings, and supervisor action notes.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Pending Service Bottleneck</span>
        </button>
      </div>

      {/* SLA Metric Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Pending Works</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {pendingServices.filter((s) => s.status !== 'resolved').length} Works
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Mobile repairs & CCTV site jobs</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30">
          <div className="text-[10px] uppercase font-bold text-amber-400">Delayed 2 - 3 Days</div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">
            {pendingServices.filter((s) => s.daysPending >= 2 && s.daysPending <= 3 && s.status !== 'resolved').length} Works
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Require customer update call</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/40">
          <div className="text-[10px] uppercase font-bold text-rose-400">Critical Overdue (&gt; 3 Days)</div>
          <div className="text-xl font-bold font-mono text-rose-300 mt-1">
            {pendingServices.filter((s) => s.daysPending > 3 && s.status !== 'resolved').length} Critical
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">Owner direct intervention required</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ticket #, customer, phone, device..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterType === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            All Pending
          </button>
          <button
            onClick={() => setFilterType('mobile_repair')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterType === 'mobile_repair' ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Mobile Repairs Only
          </button>
          <button
            onClick={() => setFilterType('cctv_field_job')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterType === 'cctv_field_job' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            CCTV Field Jobs Only
          </button>
        </div>
      </div>

      {/* Pending Items Cards List */}
      <div className="space-y-3.5">
        {filteredItems.map((item) => {
          const isOverdue = item.daysPending >= 3;
          const isWarning = item.daysPending === 2;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl bg-slate-900 border text-xs shadow-lg transition ${
                isOverdue
                  ? 'border-rose-500/50 bg-rose-950/10'
                  : isWarning
                  ? 'border-amber-500/40'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {item.referenceCode}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        item.serviceType === 'mobile_repair'
                          ? 'bg-orange-500/20 text-orange-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {item.serviceType.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOverdue
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.daysPending} DAYS PENDING
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm">{item.deviceOrSite}</h3>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Customer: {item.customerName} ({item.customerPhone}) • Tech Assigned: {item.assignedPerson}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <a
                    href={`https://wa.me/${item.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `السلام عليكم، معكم شركة الرابيل بخصوص جهازكم ${item.deviceOrSite} (${item.referenceCode}).`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => onResolveService(item.id)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Delay Details Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Reason Why Pending ({reasonLabels[item.reasonCategory]}):</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans text-xs">
                    {item.pendingDetailsReason}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Owner / Supervisor Action Plan:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans text-xs italic">
                    {item.supervisorActionNotes || 'No specific supervisor note yet. Click to update.'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Bottleneck Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 text-xs space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Log Pending Service Delay / Bottleneck Reason</span>
            </h2>

            <form onSubmit={handleCreatePendingEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="mobile_repair">Mobile Device Repair</option>
                    <option value="cctv_field_job">CCTV Field Installation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job / Ticket Reference</label>
                  <input
                    type="text"
                    required
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    placeholder="e.g. REP-2026-085"
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
                    placeholder="Customer Name"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer Mobile (+968)</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+968 9..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Device Model or Installation Site</label>
                  <input
                    type="text"
                    required
                    value={deviceOrSite}
                    onChange={(e) => setDeviceOrSite(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro Max / Villa 142 Seeb"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Delay Reason</label>
                  <select
                    value={reasonCategory}
                    onChange={(e) => setReasonCategory(e.target.value as DelayReasonCode)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    {Object.entries(reasonLabels).map(([code, label]) => (
                      <option key={code} value={code}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Days Currently Pending</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={daysPending}
                    onChange={(e) => setDaysPending(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Detailed Explanation (Mandatory)</label>
                  <textarea
                    rows={2}
                    required
                    value={pendingDetailsReason}
                    onChange={(e) => setPendingDetailsReason(e.target.value)}
                    placeholder="Provide specific technical or logistical reason why this cannot be completed today..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Supervisor / Owner Resolution Action</label>
                  <input
                    type="text"
                    value={supervisorActionNotes}
                    onChange={(e) => setSupervisorActionNotes(e.target.value)}
                    placeholder="e.g. Called supplier in Dubai; parts arriving tomorrow at 11 AM via DHL."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Record Bottleneck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
