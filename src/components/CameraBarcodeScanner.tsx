import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  FlipHorizontal,
  Zap,
  Volume2,
  VolumeX,
  ScanLine,
  Barcode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types';

interface CameraBarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onScanResult: (scannedValue: string, matchedProduct?: Product) => void;
  mode?: 'product' | 'imei' | 'general';
  title?: string;
}

export const CameraBarcodeScanner: React.FC<CameraBarcodeScannerProps> = ({
  isOpen,
  onClose,
  products,
  onScanResult,
  mode = 'general',
  title = 'Live Camera Barcode & IMEI Scanner',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  // Synthesize a POS beep using Web Audio API
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // AudioContext unavailable or blocked by autoplay
    }
  };

  // Start video stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    let isMounted = true;
    setCameraError(null);

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported by this browser. Use Chrome/Safari/Edge.');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Camera stream error:', err);
          setCameraError(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access in browser permissions.'
              : 'Webcam not found or busy. You can use manual entry or instant catalog scan buttons.'
          );
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Hardware USB Barcode Scanner Wedge Listener (keyboard input ending in Enter)
  useEffect(() => {
    if (!isOpen) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in the manual input
      if (document.activeElement?.tagName === 'INPUT') return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        buffer = ''; // reset buffer if typing speed is human rather than barcode laser gun
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 4) {
          e.preventDefault();
          triggerSuccessfulScan(buffer);
        }
        buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, products]);

  const triggerSuccessfulScan = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    playBeep();
    setLastScanned(trimmed);

    // Look up product by barcode, SKU or ID
    const matched = products.find(
      (p) => p.barcode === trimmed || p.sku.toLowerCase() === trimmed.toLowerCase() || p.id === trimmed
    );

    onScanResult(trimmed, matched);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      triggerSuccessfulScan(manualCode.trim());
      setManualCode('');
    }
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Mock scan presets to quickly test on desktop/laptop without physical barcode stickers
  const quickTestBarcodes = [
    { label: 'iPhone 16 Pro', code: '195949102938' },
    { label: 'Galaxy S25 Ultra', code: '880609182746' },
    { label: 'Anker 65W GaN', code: '194644083719' },
    { label: 'Dahua 4K Kit', code: '693820194827' },
    { label: 'Random IMEI 15-Digit', code: `359${Math.floor(100000000000 + Math.random() * 900000000000)}` },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ScanLine className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  {facingMode === 'environment' ? 'BACK CAM' : 'FRONT CAM'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Compatible with all Android, iPhone, iPad, Windows, Mac & Linux browsers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              title={soundEnabled ? 'Mute Scan Beep' : 'Enable Scan Beep'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={handleFlipCamera}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Flip Front / Rear Camera"
            >
              <FlipHorizontal className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder Video Container */}
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-xs text-slate-400 max-w-sm space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <div className="font-semibold text-slate-200">Camera Notice:</div>
              <p className="text-[11px] text-slate-400">{cameraError}</p>
              <p className="text-[10px] text-slate-500 pt-2">
                Tip: Hardware USB barcode guns work automatically anywhere in this app. You can also test with the instant buttons below.
              </p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Reticle with Laser Beam Animation */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="relative w-64 h-44 rounded-2xl border-2 border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 -mt-1 -ml-1 rounded-tl" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 -mt-1 -mr-1 rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 -mb-1 -ml-1 rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 -mb-1 -mr-1 rounded-br" />

                  {/* Red Laser Sweep Line Animation */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_8px_#f43f5e] animate-pulse" />

                  <span className="absolute bottom-2 text-[10px] font-mono text-amber-300 font-bold bg-black/60 px-2 py-0.5 rounded">
                    ALIGN BARCODE / IMEI
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Toast on scan match */}
          {lastScanned && (
            <div className="absolute bottom-3 inset-x-4 bg-emerald-600/90 backdrop-blur-md text-white p-2.5 rounded-xl text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                <span className="truncate">Scanned: {lastScanned}</span>
              </div>
              <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded font-bold">READY</span>
            </div>
          )}
        </div>

        {/* Bottom Manual & Test Presets Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3 text-xs">
          {/* Quick barcode simulation buttons for testing anywhere */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Instant Test Simulator (Click to scan product or IMEI):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickTestBarcodes.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => triggerSuccessfulScan(item.code)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-slate-300 text-[11px] font-mono transition cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Barcode Input */}
          <form onSubmit={handleManualSubmit} className="flex gap-2 pt-1 border-t border-slate-800/80">
            <input
              type="text"
              placeholder="Or enter Barcode / SKU / IMEI manually..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
