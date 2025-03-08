
import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  showCountdown?: boolean;
  className?: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onCapture, 
  showCountdown = false,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraOn(true);
          setError(null);
          
          // Wait a moment for camera to initialize before marking as ready
          setTimeout(() => setIsReady(true), 1000);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera. Please ensure you have granted camera permissions.');
        setIsCameraOn(false);
      }
    };

    initCamera();

    // Cleanup when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle countdown timer for automatic capture
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(prev => (prev !== null && prev > 0) ? prev - 1 : null);
    }, 1000);
    
    if (countdown === 1) {
      // Capture when countdown reaches 1
      setTimeout(() => {
        captureImage();
      }, 800);
    }
    
    return () => clearTimeout(timer);
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(3);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    // Flash effect
    setTimeout(() => {
      onCapture(imageDataUrl);
      setIsCapturing(false);
    }, 300);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Flash overlay */}
      {isCapturing && (
        <div className="absolute inset-0 bg-white z-10 camera-flash"></div>
      )}
      
      {/* Camera UI */}
      <div className="relative">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isReady ? "opacity-100" : "opacity-0"
          )}
        />
        
        {/* Scanning animation overlay */}
        {isReady && !isCapturing && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-[2px] w-full bg-primary/50 camera-scan"></div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <p className="text-white p-4 text-center max-w-xs">{error}</p>
          </div>
        )}
        
        {/* Camera not ready state */}
        {!isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="w-12 h-12 rounded-full border-2 border-primary/80 animate-pulse-ring"></div>
            <p className="text-white absolute mt-16">Initializing camera...</p>
          </div>
        )}
        
        {/* Countdown overlay */}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-6xl font-bold text-white animate-bounce">
              {countdown}
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Camera controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        {isReady && (
          <button
            onClick={showCountdown ? startCountdown : captureImage}
            disabled={!isReady || isCapturing || countdown !== null}
            className="w-16 h-16 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            aria-label="Take photo"
          >
            <div className="w-12 h-12 rounded-full bg-primary"></div>
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
