import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  X,
  FlipHorizontal,
  Flashlight,
  FlashlightOff,
  Barcode,
  Search,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Keyboard,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Product } from '../types';

interface UniversalCameraBarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (detectedCode: string, matchedProduct?: Product) => void;
  products?: Product[];
  title?: string;
  subtitle?: string;
}

export const UniversalCameraBarcodeScanner: React.FC<UniversalCameraBarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScanResult,
  products = [],
  title = 'Universal Camera Barcode & IMEI Scanner',
  subtitle = 'Compatible with Android, Apple iOS, Windows & Linux devices',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);

  // Synthesize realistic POS beep using Web Audio API
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5 note
      osc.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.04); // E6 high chirp

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.13);

      // Trigger haptic vibration on Android/mobile if available
      if (navigator.vibrate) {
        navigator.vibrate(60);
      }
    } catch (e) {
      // Audio not permitted or not supported, ignore safely
    }
  };

  const handleDetected = (code: string) => {
    const clean = code.trim();
    if (!clean) return;

    playBeep();
    setLastScannedCode(clean);

    // Look up in products catalog
    const found = products.find(
      (p) =>
        p.barcode.toLowerCase() === clean.toLowerCase() ||
        p.sku.toLowerCase() === clean.toLowerCase() ||
        p.name.toLowerCase().includes(clean.toLowerCase())
    );

    setMatchedProduct(found || null);
    onScanResult(clean, found);
  };

  // Start device camera
  const startCamera = async () => {
    stopCamera();
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser or requires HTTPS.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for Apple iOS Safari
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        await videoRef.current.play();
      }

      setHasCameraPermission(true);

      // Check if torch/flashlight is supported
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities && videoTrack.getCapabilities()) as any;
        if (capabilities && capabilities.torch) {
          setTorchSupported(true);
        } else {
          setTorchSupported(false);
        }
      }

      // Initialize BarcodeDetector if available
      initBarcodeDetector(stream);
    } catch (err: any) {
      console.warn('Camera access could not be initialized:', err);
      setHasCameraPermission(false);
      setErrorMessage(
        err?.message ||
          'Camera access not allowed or device has no camera. You can use manual entry or tap quick barcodes below.'
      );
    }
  };

  // Stop device camera
  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
  };

  // Native BarcodeDetector loop if supported
  const initBarcodeDetector = (stream: MediaStream) => {
    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['code_128', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'code_39'],
        });

        const checkFrame = async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) {
            animFrameRef.current = requestAnimationFrame(checkFrame);
            return;
          }

          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const raw = barcodes[0].rawValue;
              if (raw && raw !== lastScannedCode) {
                handleDetected(raw);
              }
            }
          } catch (e) {
            // detection frame skipped
          }

          animFrameRef.current = requestAnimationFrame(checkFrame);
        };

        animFrameRef.current = requestAnimationFrame(checkFrame);
      } catch (e) {
        // BarcodeDetector failed to initialize
      }
    }
  };

  // Toggle Torch / Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack && (videoTrack.applyConstraints as any)) {
      try {
        const nextState = !torchOn;
        await (videoTrack as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (e) {
        console.warn('Failed to toggle torch:', e);
      }
    }
  };

  // Flip Camera between Rear and Front
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setLastScannedCode(null);
      setMatchedProduct(null);
      setManualCode('');
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {title}
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                  LIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport & Live Overlay */}
        <div className="relative bg-black h-72 sm:h-80 flex items-center justify-center overflow-hidden">
          {/* Live Video Element */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover"
          />

          {/* Futuristic Target Reticle & Laser Sweep Animation */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Darkened vignette around target */}
            <div className="absolute inset-0 border-[30px] sm:border-[45px] border-black/55 backdrop-blur-[1px]" />

            {/* Viewfinder Target Box */}
            <div className="relative w-64 h-44 sm:w-72 sm:h-48 border-2 border-emerald-500/70 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] overflow-hidden">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br" />

              {/* Scanning red/green laser beam */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_2s_infinite]" />

              <div className="absolute inset-x-0 bottom-2 text-center">
                <span className="text-[10px] font-mono tracking-wider bg-slate-950/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40 shadow">
                  ALIGN BARCODE / IMEI INSIDE BOX
                </span>
              </div>
            </div>
          </div>

          {/* Camera Permission / Error Fallback Overlay */}
          {hasCameraPermission === false && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center z-10">
              <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-xs font-semibold text-slate-200 mb-1">
                Camera access not active or permission denied
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mb-4">{errorMessage}</p>
              <button
                onClick={startCamera}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                Retry Camera Access
              </button>
            </div>
          )}

          {/* Top Camera Controls on HUD */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            {torchSupported && (
              <button
                onClick={toggleTorch}
                title={torchOn ? 'Turn flashlight off' : 'Turn flashlight on'}
                className={`p-2 rounded-xl backdrop-blur-md transition cursor-pointer ${
                  torchOn
                    ? 'bg-amber-500 text-slate-950 shadow-lg'
                    : 'bg-black/60 text-slate-200 hover:bg-black/80'
                }`}
              >
                {torchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={flipCamera}
              title="Flip Camera (Front / Rear)"
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-slate-200 backdrop-blur-md transition cursor-pointer"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute scanner beep' : 'Enable scanner beep'}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-slate-200 backdrop-blur-md transition cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Scan Status Badge */}
        {lastScannedCode && (
          <div className="px-5 py-2.5 bg-emerald-950/60 border-y border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-emerald-300 font-semibold">Scanned: </span>
                <span className="font-mono text-white font-bold">{lastScannedCode}</span>
                {matchedProduct && (
                  <span className="ml-2 text-slate-300">({matchedProduct.name})</span>
                )}
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
              MATCHED
            </span>
          </div>
        )}

        {/* Manual Barcode / IMEI Input & Quick Select Section */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Manual Input Form */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              Manual Barcode, IMEI (15 Digits), or SKU Input:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter or paste barcode/IMEI (e.g. 195949102938)..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualCode) {
                      handleDetected(manualCode);
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (manualCode) handleDetected(manualCode);
                }}
                disabled={!manualCode}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                Scan Code
              </button>
            </div>
          </div>

          {/* Quick Demo Scan Buttons from Catalog */}
          {products.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Quick Tap to Simulate Scan (Inventory Items)
                </span>
                <span className="text-[10px] text-slate-500">Tap to test scanner</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {products.slice(0, 6).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleDetected(product.barcode)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-amber-400">
                        {product.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">
                        Barcode: {product.barcode}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] bg-slate-900 text-amber-400 border border-slate-700 px-1.5 py-0.5 rounded font-mono">
                      TEST SCAN
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Device and Platform Guidelines */}
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-[11px] text-slate-400 flex items-start gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-300">
                Multi-Platform Web Scanner Notice:
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                Works seamlessly in Google Chrome, Apple Safari, Microsoft Edge, and Android/iOS.
                External USB or Bluetooth laser handheld barcode guns will also automatically type directly into the field.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-800/80 border-t border-slate-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition cursor-pointer"
          >
            Done / Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
