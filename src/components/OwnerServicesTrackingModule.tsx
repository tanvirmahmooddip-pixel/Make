import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Wrench,
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Phone,
  MessageCircle,
  HelpCircle,
  Building2,
  Filter,
  ShieldAlert,
  UserCheck,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  DelayReasonCode,
  PendingServiceWork,
  StoreLocation,
  User,
} from '../types';

interface OwnerServicesTrackingModuleProps {
  pendingServices: PendingServiceWork[];
  branches: StoreLocation[];
  currentUser: User;
  onAddPendingService: (work: PendingServiceWork) => void;
  onUpdatePendingService: (work: PendingServiceWork) => void;
  onResolveService: (id: string) => void;
}

export const OwnerServicesTrackingModule: React.FC<OwnerServicesTrackingModuleProps> = ({
  pendingServices,
  branches,
  currentUser,
  onAddPendingService,
  onUpdatePendingService,
  onResolveService,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | 'all'>('pending');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PendingServiceWork | null>(null);

  // Form Fields
  const [serviceType, setServiceType] = useState<'mobile_repair' | 'cctv_field_job'>('mobile_repair');
  const [referenceCode, setReferenceCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+968 ');
  const [deviceOrSite, setDeviceOrSite] = useState('');
  const [assignedPerson, setAssignedPerson] = useState('');
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [daysPending, setDaysPending] = useState('1');
  const [reasonCategory, setReasonCategory] = useState<DelayReasonCode>('waiting_parts_dubai');
  const [pendingDetailsReason, setPendingDetailsReason] = useState('');
  const [supervisorActionNotes, setSupervisorActionNotes] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'normal'>('high');

  const reasonLabels: Record<DelayReasonCode, { label: string; color: string }> = {
    waiting_parts_dubai: {
      label: 'Waiting for Parts from Dubai / Supplier',
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    waiting_customer_approval: {
      label: 'Waiting for Customer Quote Approval',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    motherboard_microsoldering: {
      label: 'Motherboard IC / Micro-Soldering in Progress',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    customer_unreachable: {
      label: 'Customer Phone Switched Off / Unreachable',
      color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    },
    weather_site_access: {
      label: 'Site Access / Municipality Permit Delay',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    technician_overload: {
      label: 'Technician Workload Backlog',
      color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    },
    other: {
      label: 'Other Bottleneck / Custom Reason',
      color: 'bg-slate-700 text-slate-300 border-slate-600',
    },
  };

  const filteredItems = pendingServices.filter((item) => {
    const matchesSearch =
      item.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deviceOrSite.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignedPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pendingDetailsReason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = selectedBranchId === 'all' || item.branchId === selectedBranchId;
    const matchesReason =
      selectedReasonFilter === 'all' || item.reasonCategory === selectedReasonFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && item.status !== 'resolved') ||
      (statusFilter === 'resolved' && item.status === 'resolved');

    return matchesSearch && matchesBranch && matchesReason && matchesStatus;
  });

  const openNewModal = () => {
    setEditingItem(null);
    setServiceType('mobile_repair');
    setReferenceCode(`REP-2026-${Math.floor(100 + Math.random() * 900)}`);
    setCustomerName('');
    setCustomerPhone('+968 9');
    setDeviceOrSite('');
    setAssignedPerson('Salim Al-Maamari (Lead Tech)');
    setBranchId(branches[0]?.id || '');
    setDaysPending('2');
    setReasonCategory('waiting_parts_dubai');
    setPendingDetailsReason('');
    setSupervisorActionNotes('');
    setPriority('high');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PendingServiceWork) => {
    setEditingItem(item);
    setServiceType(item.serviceType);
    setReferenceCode(item.referenceCode);
    setCustomerName(item.customerName);
    setCustomerPhone(item.customerPhone);
    setDeviceOrSite(item.deviceOrSite);
    setAssignedPerson(item.assignedPerson);
    setBranchId(item.branchId);
    setDaysPending(String(item.daysPending));
    setReasonCategory(item.reasonCategory);
    setPendingDetailsReason(item.pendingDetailsReason);
    setSupervisorActionNotes(item.supervisorActionNotes || '');
    setPriority(item.priority);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !deviceOrSite || !pendingDetailsReason) {
      alert('Please fill out customer name, device/site, and the detailed reason why work is pending.');
      return;
    }

    if (editingItem) {
      const updated: PendingServiceWork = {
        ...editingItem,
        serviceType,
        referenceCode,
        customerName,
        customerPhone,
        deviceOrSite,
        assignedPerson,
        branchId,
        daysPending: parseInt(daysPending, 10) || 1,
        reasonCategory,
        pendingDetailsReason,
        supervisorActionNotes,
        priority,
      };
      onUpdatePendingService(updated);
    } else {
      const newItem: PendingServiceWork = {
        id: `ps-${Date.now()}`,
        serviceType,
        referenceCode,
        customerName,
        customerPhone,
        deviceOrSite,
        assignedPerson,
        branchId,
        daysPending: parseInt(daysPending, 10) || 1,
        reasonCategory,
        pendingDetailsReason,
        supervisorActionNotes,
        priority,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddPendingService(newItem);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Owner Services Tracking & Delay Bottleneck Log
            </h2>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono font-bold">
              OWNER RESTRICTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time supervisor tracking: monitor where technician repairs and CCTV jobs are delayed, why they are pending, and required owner interventions
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition shadow-lg shadow-amber-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Pending Work Delay</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Pending Bottlenecks</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {pendingServices.filter((s) => s.status !== 'resolved').length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Mobile Repairs Stalled</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">
              {
                pendingServices.filter(
                  (s) => s.status !== 'resolved' && s.serviceType === 'mobile_repair'
                ).length
              }
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">CCTV Installations Delayed</p>
            <h3 className="text-2xl font-bold text-purple-400 mt-1">
              {
                pendingServices.filter(
                  (s) => s.status !== 'resolved' && s.serviceType === 'cctv_field_job'
                ).length
              }
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference #, customer, device, technician or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              value={selectedReasonFilter}
              onChange={(e) => setSelectedReasonFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
            >
              <option value="all">All Delay Reasons</option>
              <option value="waiting_parts_dubai">Waiting Parts (Dubai)</option>
              <option value="waiting_customer_approval">Waiting Approval</option>
              <option value="motherboard_microsoldering">Micro-Soldering</option>
              <option value="customer_unreachable">Unreachable</option>
              <option value="weather_site_access">Site Access</option>
              <option value="technician_overload">Tech Overload</option>
              <option value="other">Other</option>
            </select>

            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
                }`}
              >
                Active Pending
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  statusFilter === 'resolved' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-400" />
            <p className="text-sm font-semibold text-slate-300">No service delays found</p>
            <p className="text-xs text-slate-500 mt-1">
              All workshop repairs and field CCTV projects are progressing smoothly on schedule!
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const reasonMeta = reasonLabels[item.reasonCategory] || reasonLabels.other;
            const branch = branches.find((b) => b.id === item.branchId);
            const isResolved = item.status === 'resolved';

            return (
              <div
                key={item.id}
                className={`bg-slate-900 border rounded-2xl p-5 transition space-y-4 ${
                  isResolved
                    ? 'border-slate-800 opacity-70'
                    : item.priority === 'urgent'
                    ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        item.serviceType === 'mobile_repair'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}
                    >
                      {item.serviceType === 'mobile_repair' ? (
                        <Wrench className="w-5 h-5" />
                      ) : (
                        <Truck className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">
                          {item.referenceCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">
                          {item.customerName}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            item.priority === 'urgent'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Target: <span className="text-slate-200">{item.deviceOrSite}</span> • Assigned:{' '}
                        <span className="text-amber-400">{item.assignedPerson}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-mono font-bold border ${
                        item.daysPending > 3
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Pending {item.daysPending} Days
                    </span>

                    {!isResolved && (
                      <button
                        onClick={() => onResolveService(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition cursor-pointer"
                    >
                      Update Reason
                    </button>
                  </div>
                </div>

                {/* Delay Category Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Delay Reason:</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${reasonMeta.color}`}
                  >
                    {reasonMeta.label}
                  </span>
                  <span className="text-xs text-slate-500">
                    • Branch: {branch?.name || 'Muscat HQ'}
                  </span>
                </div>

                {/* Deep Reason Details Box */}
                <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                        Detailed Bottleneck Description (Why Work is Pending):
                      </span>
                      <p className="text-slate-200 mt-0.5 leading-relaxed">
                        {item.pendingDetailsReason}
                      </p>
                    </div>
                  </div>

                  {item.supervisorActionNotes && (
                    <div className="border-t border-slate-800/80 pt-2 flex items-start gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">
                          Supervisor / Owner Action Taken:
                        </span>
                        <p className="text-slate-300 mt-0.5 leading-relaxed">
                          {item.supervisorActionNotes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick WhatsApp Reminder */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Customer Contact: {item.customerPhone}</span>
                  <a
                    href={`https://wa.me/${item.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hello ${item.customerName}, this is Al-Rabil Mobile & Smart Services updating you regarding job ${item.referenceCode}. Status update: ${item.pendingDetailsReason}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 font-medium transition cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Send Customer WhatsApp Update</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal to Log / Edit Delay Reason */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                {editingItem ? 'Update Service Delay Details' : 'Log New Work Delay & Bottleneck'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Service Type:</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  >
                    <option value="mobile_repair">Mobile Phone / Device Repair</option>
                    <option value="cctv_field_job">CCTV Installation & Field Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Job Card / Ticket Reference:
                  </label>
                  <input
                    type="text"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    placeholder="e.g. REP-2026-085"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer Name:</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Salim Al-Harthy"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Customer Phone (+968):
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Device / Installation Site:
                  </label>
                  <input
                    type="text"
                    value={deviceOrSite}
                    onChange={(e) => setDeviceOrSite(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro Max / Villa Seeb"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Assigned Technician:
                  </label>
                  <input
                    type="text"
                    value={assignedPerson}
                    onChange={(e) => setAssignedPerson(e.target.value)}
                    placeholder="e.g. Salim Al-Maamari (Lead Tech)"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Branch:</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Days Stalled:</label>
                  <input
                    type="number"
                    min="1"
                    value={daysPending}
                    onChange={(e) => setDaysPending(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Delay Reason Category:
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value as DelayReasonCode)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-medium"
                >
                  <option value="waiting_parts_dubai">
                    Waiting for Parts from Dubai / Regional Supplier
                  </option>
                  <option value="waiting_customer_approval">
                    Waiting for Customer Quote Approval / Cost Agreement
                  </option>
                  <option value="motherboard_microsoldering">
                    Motherboard IC / Micro-Soldering in Progress
                  </option>
                  <option value="customer_unreachable">
                    Customer Phone Switched Off / WhatsApp Unanswered
                  </option>
                  <option value="weather_site_access">
                    Site Access / Municipality Exterior Permit Delay
                  </option>
                  <option value="technician_overload">
                    Technician Workload Backlog / Queue Overload
                  </option>
                  <option value="other">Other / Custom Bottleneck</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Detailed Explanation (Why Work is Pending):
                </label>
                <textarea
                  rows={3}
                  value={pendingDetailsReason}
                  onChange={(e) => setPendingDetailsReason(e.target.value)}
                  placeholder="e.g. OLED screen flex cable torn; ordered replacement part from Dubai supplier with tracking DHL #94821034."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Owner / Supervisor Action Notes:
                </label>
                <textarea
                  rows={2}
                  value={supervisorActionNotes}
                  onChange={(e) => setSupervisorActionNotes(e.target.value)}
                  placeholder="e.g. Owner authorized express shipping charge; customer notified."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Bottleneck Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
