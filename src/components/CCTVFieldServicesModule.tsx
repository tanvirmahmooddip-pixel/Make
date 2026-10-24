import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  MapPin,
  Phone,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CCTVFieldJob, CurrencyCode } from '../types';
import { formatMoney } from '../utils/formatters';

interface CCTVFieldServicesModuleProps {
  fieldJobs: CCTVFieldJob[];
  activeCurrency: CurrencyCode;
  onAddJob: (job: CCTVFieldJob) => void;
  onUpdateJobStatus: (jobId: string, status: CCTVFieldJob['status']) => void;
}

export const CCTVFieldServicesModule: React.FC<CCTVFieldServicesModuleProps> = ({
  fieldJobs,
  activeCurrency,
  onAddJob,
  onUpdateJobStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'troubleshoot' | 'new_job'>('assignments');
  const [expandedIssue, setExpandedIssue] = useState<string | null>('issue-1');

  // New job state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+968 9');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Muscat');
  const [packageType, setPackageType] = useState('Dahua 4-Channel 4K PoE Kit');
  const [scheduledDate, setScheduledDate] = useState('2026-10-07 10:00');
  const [assignedTechnician, setAssignedTechnician] = useState('Hamood Al-Farsi');
  const [price, setPrice] = useState('185.000');
  const [notes, setNotes] = useState('Requires drilling exterior concrete wall for cables.');

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: CCTVFieldJob = {
      id: `job-${Date.now()}`,
      jobCode: `CCTV-JOB-${Math.floor(100 + Math.random() * 900)}`,
      customerName,
      customerPhone,
      address,
      city,
      packageType,
      scheduledDate,
      assignedTechnician,
      status: 'scheduled',
      equipmentList: ['Cameras', 'NVR', 'Hard Drive', 'Cat6 Cables', 'Connectors'],
      notes,
      price: parseFloat(price) || 0,
      amountCollected: 0,
    };

    onAddJob(newJob);
    setActiveTab('assignments');
  };

  const troubleshootingGuides = [
    {
      id: 'issue-1',
      title: 'Camera Video Signal Loss / Black Screen',
      severity: 'High',
      symptoms: 'NVR displays "No Video" or black screen on specific channel.',
      solutions: [
        'Check PoE switch port LED status: Ensure link light is solid amber/green.',
        'Verify cable length: Standard Cat6 without PoE repeater is limited to 90 meters.',
        'Use RJ45 cable tester to verify pins 1, 2, 3, 6 (data) and 4, 5, 7, 8 (power).',
        'Verify 12V DC power drop if using passive PoE splitter.',
      ],
    },
    {
      id: 'issue-2',
      title: 'IP Address Conflict in NVR',
      severity: 'Medium',
      symptoms: 'Cameras randomly disconnect or swap video streams.',
      solutions: [
        'Open Dahua / Hikvision SADP tool or ConfigTool on technician laptop.',
        'Verify whether DHCP is enabled on router and assigning overlapping IP pool.',
        'Set static IP addressing scheme for surveillance VLAN (e.g. 192.168.2.100 - 192.168.2.132).',
        'Check gateway and subnet mask match NVR internal NIC.',
      ],
    },
    {
      id: 'issue-3',
      title: 'Surveillance HDD Not Formatting or NVR Beeping',
      severity: 'Critical',
      symptoms: 'NVR emits repeated buzzer beeps; status shows "HDD Error / Unformatted".',
      solutions: [
        'Ensure SATA power cable and data cable are firmly seated into NVR motherboard.',
        'Confirm power supply is at least 12V 2.5A (underpowered NVR cannot spin up 3.5" HDDs).',
        'In NVR Storage menu, execute "Init / Format HDD".',
        'If SMART bad sectors detected, replace with WD Purple or Seagate SkyHawk drive.',
      ],
    },
    {
      id: 'issue-4',
      title: 'Mobile P2P App "Device Offline" Error',
      severity: 'Medium',
      symptoms: 'DMSS or Hik-Connect shows offline on customer iPhone / Android.',
      solutions: [
        'Check NVR Network Settings: DNS 1 must be set to 8.8.8.8 and DNS 2 to 8.8.4.4.',
        'Verify NVR P2P status is "Online" in cloud access settings.',
        'Ensure Oman ISP router (Omantel / Ooredoo fiber ONT) allows outbound port 443 / 8800.',
        'Re-scan NVR serial number QR code from customer app.',
      ],
    },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-400" />
            <span>CCTV Sales & Field Technician Dispatch</span>
          </h1>
          <p className="text-xs text-slate-400">
            Field installation management across Oman, technician dispatch & live CCTV hardware troubleshooting.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start md:self-auto">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'assignments' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Active Field Jobs ({fieldJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('new_job')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'new_job' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            + Schedule Field Job
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'troubleshoot' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Troubleshooting Guide
          </button>
        </div>
      </div>

      {/* Tab 1: Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldJobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-md text-xs hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="font-mono font-bold text-amber-400">{job.jobCode}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        job.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : job.status === 'in_progress'
                          ? 'bg-purple-500/20 text-purple-300 animate-pulse'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="font-bold text-sm text-white">{job.packageType}</div>
                    <div className="text-slate-300">
                      <strong>Client:</strong> {job.customerName} ({job.customerPhone})
                    </div>
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{job.address}, {job.city}</span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>Scheduled: {job.scheduledDate}</span>
                    </div>
                    <div className="text-purple-300 font-semibold">
                      Tech Assigned: {job.assignedTechnician}
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Notes:</span>
                      {job.notes}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-400">Total Price:</span>
                    <span className="text-sm font-bold text-amber-400">
                      {formatMoney(job.price, activeCurrency)}
                    </span>
                  </div>

                  {/* Status buttons */}
                  <div className="flex gap-1.5 pt-1">
                    {(['scheduled', 'en_route', 'in_progress', 'completed'] as CCTVFieldJob['status'][]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => onUpdateJobStatus(job.id, st)}
                          className={`flex-1 py-1 rounded text-[10px] font-semibold uppercase transition cursor-pointer ${
                            job.status === st
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: New Field Job */}
      {activeTab === 'new_job' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto shadow-xl text-xs">
          <h2 className="text-sm font-bold text-white mb-4">Book New CCTV Installation Job</h2>

          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer / Company Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sheikh Ahmed Al-Busaidi"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone (+968)</label>
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
                <label className="block text-slate-300 font-semibold mb-1">Governorate / City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  <option value="Muscat">Muscat (Ruwi / Muttrah / Bowsher)</option>
                  <option value="Seeb">Seeb / Al Mawaleh / Al Khoudh</option>
                  <option value="Salalah">Salalah (Dhofar)</option>
                  <option value="Sohar">Sohar (Al Batinah)</option>
                  <option value="Barka">Barka</option>
                  <option value="Nizwa">Nizwa (Al Dakhiliyah)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Site Address / Villa No.</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Way 4210, Villa 18, Near LuLu"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">CCTV Package</label>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  <option value="Dahua 4-Channel 4K PoE Kit">Dahua 4-Channel 4K PoE Kit</option>
                  <option value="Hikvision 8-Channel 5MP ColorVu Kit">Hikvision 8-Channel 5MP ColorVu Kit</option>
                  <option value="Commercial 16-Cam IP NVR System">Commercial 16-Cam IP NVR System</option>
                  <option value="Tuya Smart Biometric Door Lock Kit">Tuya Smart Biometric Door Lock Kit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Field Tech</label>
                <input
                  type="text"
                  required
                  value={assignedTechnician}
                  onChange={(e) => setAssignedTechnician(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Scheduled Date & Time</label>
                <input
                  type="text"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Quoted Price (OMR)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-amber-400 font-bold"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Installation Notes & Requirements</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('assignments')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Schedule Job
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Troubleshooting Guide */}
      {activeTab === 'troubleshoot' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-1">
              Field Technician CCTV Troubleshooting Diagnostic Handbook
            </h2>
            <p className="text-xs text-slate-400">
              Instant diagnostic steps for NVRs, PoE switches, IP addressing, and mobile P2P connectivity in Oman.
            </p>
          </div>

          <div className="space-y-3">
            {troubleshootingGuides.map((guide) => {
              const isOpen = expandedIssue === guide.id;
              return (
                <div
                  key={guide.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm text-xs"
                >
                  <button
                    onClick={() => setExpandedIssue(isOpen ? null : guide.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{guide.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{guide.symptoms}</div>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 border-t border-slate-800/80 bg-slate-950/40 text-slate-300 space-y-2">
                      <div className="font-semibold text-amber-400 text-[11px] uppercase tracking-wider mb-2">
                        Step-by-Step Diagnostic Resolution:
                      </div>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                        {guide.solutions.map((sol, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {sol}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
