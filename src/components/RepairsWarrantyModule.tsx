import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  User,
  Calendar,
  FileText,
  Printer,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { CurrencyCode, RepairTicket, User as UserType } from '../types';
import { formatMoney, formatDateTime } from '../utils/formatters';

interface RepairsWarrantyModuleProps {
  repairs: RepairTicket[];
  technicians: UserType[];
  currentUser: UserType;
  activeBranchId: string;
  activeCurrency: CurrencyCode;
  onAddRepair: (ticket: RepairTicket) => void;
  onUpdateRepair: (ticket: RepairTicket) => void;
}

export const RepairsWarrantyModule: React.FC<RepairsWarrantyModuleProps> = ({
  repairs,
  technicians,
  currentUser,
  activeBranchId,
  activeCurrency,
  onAddRepair,
  onUpdateRepair,
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'new_ticket' | 'history_lookup' | 'warranty_tracker'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [historySearchTerm, setHistorySearchTerm] = useState('+968 9123 4567');
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState<RepairTicket | null>(null);

  // New ticket state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+968 9');
  const [deviceBrand, setDeviceBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('');
  const [imeiOrSerial, setImeiOrSerial] = useState('');
  const [pinOrPattern, setPinOrPattern] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [physicalConditionNotes, setPhysicalConditionNotes] = useState('Minor scuffs, screen intact.');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState(technicians[0]?.id || '');
  const [priority, setPriority] = useState<RepairTicket['priority']>('normal');
  const [estimatedCost, setEstimatedCost] = useState('25.000');
  const [depositPaid, setDepositPaid] = useState('10.000');
  const [warrantyDays, setWarrantyDays] = useState(90);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedTech = technicians.find((t) => t.id === assignedTechnicianId) || technicians[0];
    const ticketNumber = `REP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newTicket: RepairTicket = {
      id: `rep-${Date.now()}`,
      ticketNumber,
      createdAt: new Date().toISOString(),
      customerName,
      customerPhone,
      deviceBrand,
      deviceModel,
      imeiOrSerial,
      pinOrPattern,
      problemDescription,
      physicalConditionNotes,
      assignedTechnicianId: assignedTech.id,
      assignedTechnicianName: assignedTech.name,
      priority,
      status: 'received',
      estimatedCost: parseFloat(estimatedCost) || 0,
      depositPaid: parseFloat(depositPaid) || 0,
      finalCost: parseFloat(estimatedCost) || 0,
      partsUsed: [],
      warrantyDays,
      branchId: activeBranchId,
      technicianNotes: 'Device checked in at front desk.',
    };

    onAddRepair(newTicket);
    setActiveTab('board');
  };

  const handleStatusChange = (ticket: RepairTicket, newStatus: RepairTicket['status']) => {
    onUpdateRepair({
      ...ticket,
      status: newStatus,
      technicianNotes: `${ticket.technicianNotes || ''}\n[${new Date().toLocaleTimeString()}]: Status updated to ${newStatus}`,
    });
  };

  // Filtered tickets
  const filteredTickets = repairs.filter((r) => {
    return (
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerPhone.includes(searchQuery) ||
      r.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.imeiOrSerial.includes(searchQuery) ||
      r.deviceModel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // History search results
  const historyResults = repairs.filter(
    (r) =>
      r.customerPhone.includes(historySearchTerm.trim()) ||
      r.customerName.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
      (historySearchTerm.trim() && r.imeiOrSerial.includes(historySearchTerm.trim()))
  );

  const statuses: RepairTicket['status'][] = [
    'received',
    'in_diagnosis',
    'waiting_for_parts',
    'in_repair',
    'testing_qa',
    'ready_for_pickup',
    'delivered',
  ];

  return (
    <div className="space-y-5">
      {/* Header and Sub-tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-400" />
            <span>Mobile Repairs & Warranty Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Intake job cards, micro-soldering workflow, customer repair history & 90-day warranty tracking.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start md:self-auto">
          <button
            onClick={() => setActiveTab('board')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'board' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Repair Board ({repairs.length})
          </button>
          <button
            onClick={() => setActiveTab('new_ticket')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'new_ticket' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            + New Job Card
          </button>
          <button
            onClick={() => setActiveTab('history_lookup')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'history_lookup' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Customer History
          </button>
          <button
            onClick={() => setActiveTab('warranty_tracker')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'warranty_tracker' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Warranty Certificates
          </button>
        </div>
      </div>

      {/* Tab 1: Repair Workflow Board */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket #, customer name, phone, IMEI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredTickets.length} Job Cards
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((ticket) => {
              return (
                <div
                  key={ticket.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-slate-700 transition"
                >
                  <div>
                    {/* Top ticket badge */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {ticket.ticketNumber}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          ticket.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>

                    {/* Device & Customer */}
                    <div className="space-y-1 mb-3 text-xs">
                      <div className="font-bold text-white text-sm">
                        {ticket.deviceBrand} {ticket.deviceModel}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        IMEI: {ticket.imeiOrSerial || 'N/A'} {ticket.pinOrPattern ? `• PIN: ${ticket.pinOrPattern}` : ''}
                      </div>
                      <div className="text-slate-300 font-medium">
                        Customer: {ticket.customerName} ({ticket.customerPhone})
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/70 text-[11px] text-slate-300 mt-2 border border-slate-800/80">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Reported Problem:</span>
                        {ticket.problemDescription}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Cost & Pipeline controls */}
                  <div className="pt-3 border-t border-slate-800 space-y-2.5 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Est. Cost:</span>
                      <span className="font-bold text-slate-200">
                        {formatMoney(ticket.estimatedCost, activeCurrency)}
                      </span>
                    </div>

                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Deposit Paid:</span>
                      <span className="font-bold text-emerald-400">
                        {formatMoney(ticket.depositPaid, activeCurrency)}
                      </span>
                    </div>

                    {/* Status Changer */}
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Current Status Pipeline:
                      </label>
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket, e.target.value as RepairTicket['status'])}
                        className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-1.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500"
                      >
                        {statuses.map((st) => (
                          <option key={st} value={st}>
                            {st.replace(/_/g, ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span>Tech: {ticket.assignedTechnicianName.split(' ')[0]}</span>
                      <button
                        onClick={() => setSelectedTicketForPrint(ticket)}
                        className="text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Job Ticket</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: New Job Card Intake Form */}
      {activeTab === 'new_ticket' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto shadow-xl text-xs">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Create New Repair Job Card</span>
          </h2>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Salim Al-Rawahi"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Oman Mobile (+968)</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+968 9123 4567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Device Brand</label>
                <select
                  value={deviceBrand}
                  onChange={(e) => setDeviceBrand(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  <option value="Apple">Apple iPhone</option>
                  <option value="Samsung">Samsung Galaxy</option>
                  <option value="Xiaomi">Xiaomi / Redmi</option>
                  <option value="OnePlus">OnePlus</option>
                  <option value="Honor">Honor</option>
                  <option value="Huawei">Huawei</option>
                  <option value="Other">Other Brand</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro Max"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">15-Digit IMEI or Serial</label>
                <input
                  type="text"
                  value={imeiOrSerial}
                  onChange={(e) => setImeiOrSerial(e.target.value)}
                  placeholder="359182049182741"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lock PIN / Screen Pattern</label>
                <input
                  type="text"
                  value={pinOrPattern}
                  onChange={(e) => setPinOrPattern(e.target.value)}
                  placeholder="e.g. PIN 2580"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Customer Reported Problem</label>
                <textarea
                  required
                  rows={2}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe failure: broken OLED, no touch, water damage, battery drain, mic issue..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Physical Inspection Notes</label>
                <input
                  type="text"
                  value={physicalConditionNotes}
                  onChange={(e) => setPhysicalConditionNotes(e.target.value)}
                  placeholder="Scratches on housing, back glass intact, camera tested..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign Technician</label>
                <select
                  value={assignedTechnicianId}
                  onChange={(e) => setAssignedTechnicianId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.roleTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as RepairTicket['priority'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  <option value="normal">Normal (24-48 hrs)</option>
                  <option value="urgent">Urgent / Express (Same Day)</option>
                  <option value="high">High Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estimated Cost (OMR)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deposit Advance (OMR)</label>
                <input
                  type="number"
                  step="0.001"
                  value={depositPaid}
                  onChange={(e) => setDepositPaid(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-emerald-400 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('board')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Save & Issue Job Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Customer History Lookup */}
      {activeTab === 'history_lookup' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-2">Customer Repair Lifetime History</h2>
            <p className="text-xs text-slate-400 mb-4">
              Enter customer phone number, name, or device IMEI to review previous repairs and parts replaced.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search phone (+968 9123 4567) or IMEI..."
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-3">
            {historyResults.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No repair records found for this query.
              </div>
            ) : (
              historyResults.map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">
                        {r.deviceBrand} {r.deviceModel}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono text-[10px]">
                        Ticket: {r.ticketNumber}
                      </span>
                      <span className="capitalize text-[10px] text-emerald-400 font-semibold">
                        [{r.status.replace('_', ' ')}]
                      </span>
                    </div>

                    <div className="text-slate-400 text-[11px]">
                      Customer: {r.customerName} ({r.customerPhone}) • Created: {formatDateTime(r.createdAt)}
                    </div>
                    <div className="text-slate-300 mt-1">Issue: {r.problemDescription}</div>
                    {r.technicianNotes && (
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Tech Notes: {r.technicianNotes}
                      </div>
                    )}
                  </div>

                  <div className="text-right font-mono self-end md:self-auto">
                    <div className="font-bold text-sm text-amber-400">
                      {formatMoney(r.finalCost || r.estimatedCost, activeCurrency)}
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      Warranty: {r.warrantyDays} Days
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Warranty Certificates */}
      {activeTab === 'warranty_tracker' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-1">Official Repair Warranty Certificates</h2>
            <p className="text-xs text-slate-400">
              Al-Rabil guarantees genuine replacement screens and batteries for 90 days across Oman.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repairs.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 text-xs shadow-md"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">WARRANTY CERTIFICATE</span>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">{r.ticketNumber}</span>
                </div>

                <div className="space-y-1.5 text-slate-300 mb-4">
                  <div>
                    <span className="text-slate-400">Customer:</span> {r.customerName}
                  </div>
                  <div>
                    <span className="text-slate-400">Device:</span> {r.deviceBrand} {r.deviceModel}
                  </div>
                  <div className="font-mono">
                    <span className="text-slate-400">IMEI:</span> {r.imeiOrSerial}
                  </div>
                  <div>
                    <span className="text-slate-400">Coverage:</span> {r.warrantyDays} Days (Parts & Labor)
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-700 text-[11px]">
                  <span className="text-emerald-400 font-semibold">Active & Valid in Oman</span>
                  <button
                    onClick={() => setSelectedTicketForPrint(r)}
                    className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                  >
                    Print Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Print Modal */}
      {selectedTicketForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
          <div className="w-full max-w-md bg-white text-slate-900 p-6 rounded-2xl shadow-2xl text-xs font-sans">
            <div className="text-center pb-3 border-b border-slate-300">
              <h3 className="font-extrabold text-sm uppercase">AL-RABIL REPAIR JOB CARD</h3>
              <div className="text-[10px] text-slate-600">Al-Rabil Mobiles & Smart Security LLC (Oman)</div>
              <div className="text-xs font-mono font-bold mt-1 text-amber-700">
                Ticket: {selectedTicketForPrint.ticketNumber}
              </div>
            </div>

            <div className="py-3 space-y-1.5 border-b border-slate-200">
              <div><strong>Customer:</strong> {selectedTicketForPrint.customerName}</div>
              <div><strong>Phone:</strong> {selectedTicketForPrint.customerPhone}</div>
              <div><strong>Device:</strong> {selectedTicketForPrint.deviceBrand} {selectedTicketForPrint.deviceModel}</div>
              <div className="font-mono"><strong>IMEI:</strong> {selectedTicketForPrint.imeiOrSerial}</div>
              <div><strong>Reported Problem:</strong> {selectedTicketForPrint.problemDescription}</div>
              <div><strong>Est. Cost:</strong> OMR {selectedTicketForPrint.estimatedCost.toFixed(3)}</div>
              <div><strong>Deposit Paid:</strong> OMR {selectedTicketForPrint.depositPaid.toFixed(3)}</div>
            </div>

            <div className="pt-3 text-[10px] text-slate-500 text-center">
              Please present this slip when collecting your device. Devices not collected within 60 days are subject to disposal.
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedTicketForPrint(null)}
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
