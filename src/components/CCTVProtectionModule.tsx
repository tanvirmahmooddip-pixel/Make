import React, { useState } from 'react';
import {
  Cctv,
  Lock,
  Unlock,
  ShieldAlert,
  Battery,
  Eye,
  Maximize2,
  RefreshCw,
  Camera,
  Moon,
  Sun,
  Activity,
  History,
  AlertTriangle,
  Radio,
  Sliders,
} from 'lucide-react';
import { CCTVCamera, SmartDoor, User } from '../types';

interface CCTVProtectionModuleProps {
  cameras: CCTVCamera[];
  smartDoor: SmartDoor;
  currentUser: User;
  onToggleDoorLock: () => void;
  onUpdateCameraStatus: (cameraId: string, status: CCTVCamera['status']) => void;
}

export const CCTVProtectionModule: React.FC<CCTVProtectionModuleProps> = ({
  cameras,
  smartDoor,
  currentUser,
  onToggleDoorLock,
  onUpdateCameraStatus,
}) => {
  const [selectedCamera, setSelectedCamera] = useState<CCTVCamera>(cameras[0]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isNightVisionActive, setIsNightVisionActive] = useState<boolean>(false);
  const [motionTriggered, setMotionTriggered] = useState<boolean>(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);

  const handleTakeSnapshot = () => {
    setSnapshotUrl(selectedCamera.streamPlaceholder);
    setTimeout(() => setSnapshotUrl(null), 3000);
  };

  const toggleNightVision = () => {
    setIsNightVisionActive(!isNightVisionActive);
    onUpdateCameraStatus(
      selectedCamera.id,
      !isNightVisionActive ? 'night_vision' : 'online'
    );
  };

  const simulateMotionAlert = () => {
    setMotionTriggered(true);
    onUpdateCameraStatus(selectedCamera.id, 'motion_detected');
    setTimeout(() => {
      setMotionTriggered(false);
      onUpdateCameraStatus(selectedCamera.id, 'online');
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Cctv className="w-5 h-5 text-cyan-400" />
            <span>Store CCTV Protection & Smart Door Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400">
            24/7 AI-monitored 4K surveillance, live PTZ stream telemetry, and remote biometric smart door control.
          </p>
        </div>

        {/* Smart Door Quick Status */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl self-start md:self-auto">
          <div className="flex items-center gap-2 text-xs">
            {smartDoor.status === 'locked' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <Lock className="w-3.5 h-3.5" />
                <span>SECURED & LOCKED</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-bold px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <Unlock className="w-3.5 h-3.5" />
                <span>DOOR UNLOCKED</span>
              </span>
            )}

            <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>{smartDoor.batteryLevel}%</span>
            </div>
          </div>

          <button
            onClick={onToggleDoorLock}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              smartDoor.status === 'locked'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {smartDoor.status === 'locked' ? 'Unlock Remotely' : 'Lock Securely'}
          </button>
        </div>
      </div>

      {/* Main CCTV Feed + Camera Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Main Selected Camera Player */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
            {/* Live Video Image with filter effects */}
            <img
              src={selectedCamera.streamPlaceholder}
              alt={selectedCamera.name}
              className={`w-full h-full object-cover transition duration-300 ${
                isNightVisionActive ? 'grayscale contrast-150 brightness-110' : ''
              }`}
              style={{
                transform: `scale(${zoomLevel})`,
              }}
            />

            {/* Overlays */}
            {/* Top Bar Overlay */}
            <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-xs font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold text-rose-400">LIVE REC</span>
                <span className="text-slate-300">| {selectedCamera.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-300">
                <span>{selectedCamera.resolution}</span>
                <span>{selectedCamera.fps} FPS</span>
                <span>IP: {selectedCamera.ipAddress}</span>
              </div>
            </div>

            {/* Motion Detection Banner */}
            {(motionTriggered || selectedCamera.status === 'motion_detected') && (
              <div className="absolute top-12 left-4 px-3 py-1.5 rounded-lg bg-rose-600/90 text-white font-bold text-xs flex items-center gap-2 animate-bounce">
                <AlertTriangle className="w-4 h-4" />
                <span>MOTION DETECTED IN CAMERA ZONE</span>
              </div>
            )}

            {/* Snapshot Toast notification */}
            {snapshotUrl && (
              <div className="absolute top-12 right-4 px-3 py-1.5 rounded-lg bg-emerald-600/90 text-white font-bold text-xs flex items-center gap-2 animate-in fade-in">
                <Camera className="w-4 h-4" />
                <span>Snapshot Saved to Local Vault</span>
              </div>
            )}

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 text-xs text-white">
                <span className="text-[10px] text-slate-400 font-mono mr-1">ZOOM:</span>
                <button
                  onClick={() => setZoomLevel(1)}
                  className={`px-2 py-0.5 rounded font-mono ${zoomLevel === 1 ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-white/10'}`}
                >
                  1x
                </button>
                <button
                  onClick={() => setZoomLevel(1.5)}
                  className={`px-2 py-0.5 rounded font-mono ${zoomLevel === 1.5 ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-white/10'}`}
                >
                  1.5x
                </button>
                <button
                  onClick={() => setZoomLevel(2)}
                  className={`px-2 py-0.5 rounded font-mono ${zoomLevel === 2 ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-white/10'}`}
                >
                  2x
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleNightVision}
                  className={`p-2 rounded-xl backdrop-blur-md border transition ${
                    isNightVisionActive
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
                  }`}
                  title="Toggle IR Night Vision"
                >
                  <Moon className="w-4 h-4" />
                </button>

                <button
                  onClick={simulateMotionAlert}
                  className="p-2 rounded-xl bg-black/60 hover:bg-rose-600/80 text-white backdrop-blur-md border border-white/10 transition"
                  title="Simulate Motion Alarm"
                >
                  <Activity className="w-4 h-4" />
                </button>

                <button
                  onClick={handleTakeSnapshot}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition"
                  title="Capture Snapshot"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 4 Camera Switcher Thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cameras.map((cam) => {
              const isSelected = selectedCamera.id === cam.id;
              return (
                <div
                  key={cam.id}
                  onClick={() => setSelectedCamera(cam)}
                  className={`relative rounded-xl overflow-hidden border cursor-pointer group transition p-2 bg-slate-900 ${
                    isSelected
                      ? 'border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-1.5">
                    <img
                      src={cam.streamPlaceholder}
                      alt={cam.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/70 px-1 py-0.5 rounded text-[9px] font-mono text-white">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{cam.name.split('-')[0]}</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-200 truncate">
                    {cam.name.split('-')[1] || cam.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{cam.location}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 cols: Smart Door Lock Telemetry & Access History */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Smart Door Protection System
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Zigbee 3.0 / Tuya
              </span>
            </div>

            {/* Lock Control Visual Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center space-y-3 mb-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition ${
                  smartDoor.status === 'locked'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                {smartDoor.status === 'locked' ? (
                  <Lock className="w-7 h-7" />
                ) : (
                  <Unlock className="w-7 h-7" />
                )}
              </div>

              <div>
                <div className="text-sm font-bold text-white">{smartDoor.name}</div>
                <div className="text-[11px] text-slate-400">{smartDoor.location}</div>
              </div>

              <button
                onClick={onToggleDoorLock}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer ${
                  smartDoor.status === 'locked'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {smartDoor.status === 'locked'
                  ? 'Tap to Unlock Door Remotely'
                  : 'Tap to Lock Vault Door'}
              </button>
            </div>

            {/* Access Logs */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recent Door Access Logs</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Live Sync</span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
                {smartDoor.accessLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{log.user}</div>
                      <div className="text-[10px] text-slate-400">
                        {log.time} • via {log.method.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <div>
                      {log.status === 'success' ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                          GRANTED
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-semibold">
                          DENIED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
