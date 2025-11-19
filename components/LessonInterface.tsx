import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle, RefreshCcw, Play, AlertCircle, Loader2, Settings2, ChevronRight } from 'lucide-react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { SIGN_REFERENCES } from '../constants';

// --- CONFIGURATION ---
const PASS_THRESHOLD = 85; // Minimum similarity score (0-100) required to pass
const PROGRESS_SPEED = 0.5; // How fast progress fills when holding correct sign (per frame)

// Types for the Engine
interface ComparisonResult {
  isMatch: boolean;
  score: number; // 0-100%
  errors: string[]; // List of specific feedback strings e.g., "Straighten Index"
  vector: number[]; // The user's current vector
}

const LessonInterface: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  
  const [currentSign, setCurrentSign] = useState<string>('A');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [cameraError, setCameraError] = useState<{title: string, message: string} | null>(null);
  const [comparisonState, setComparisonState] = useState<ComparisonResult>({
    isMatch: false, score: 0, errors: [], vector: []
  });
  
  const [progress, setProgress] = useState(0);
  const [accuracyHistory, setAccuracyHistory] = useState<number[]>([]);

  // Initialize MediaPipe HandLandmarker
  useEffect(() => {
    const initLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm"
        );
        
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.7, // Increased for better robustness
          minTrackingConfidence: 0.7,      // Increased for better robustness
          minHandPresenceConfidence: 0.7   // Increased for better robustness
        });
        
        landmarkerRef.current = landmarker;
        setIsModelLoading(false);
        startCamera();
      } catch (error) {
        console.error("Error loading MediaPipe model:", error);
        setCameraError({
            title: "System Error", 
            message: "Failed to load computer vision model. Please refresh the page."
        });
        setIsModelLoading(false);
      }
    };

    initLandmarker();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported");
      }

      let stream: MediaStream;
      
      try {
        // First try with ideal constraints for best quality/experience
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user"
          } 
        });
      } catch (constraintError) {
        console.warn("Optimal constraints failed, falling back to default video settings", constraintError);
        // Fallback: Try getting any video stream available
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Error playing video:", e));
            setIsCameraActive(true);
        };
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      
      let title = "Camera Error";
      let message = "An unexpected error occurred. Please refresh the page.";

      if (err.message === "Camera API not supported") {
         title = "Browser Not Supported";
         message = "Your browser does not support camera access or the connection is not secure (HTTPS).";
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        title = "Camera Permission Denied";
        message = "Signappse needs camera access to provide feedback. Please click the lock icon in your address bar, allow camera access, and refresh the page.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        title = "No Camera Found";
        message = "We couldn't detect a connected camera. Please ensure your device has a working camera.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        title = "Camera Unavailable";
        message = "Your camera seems to be in use by another app (like Zoom or Teams). Please close other apps using the camera and try again.";
      } else if (err.name === 'OverconstrainedError') {
          title = "Resolution Not Supported";
          message = "Your camera doesn't support the required video settings.";
      }

      setCameraError({ title, message });
      setIsCameraActive(false);
    }
  };

  // --- Math Engine ---

  const calculateAngle = (a: any, b: any, c: any) => {
    if (!a || !b || !c) return 0;
    
    // Calculate vector BA (b -> a) and BC (b -> c)
    // Using world landmarks ensures these are in real-world metric space,
    // providing aspect-ratio independence and true 3D angles.
    const v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    const v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
    
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
    
    // Safety check to prevent division by zero
    if (mag1 * mag2 === 0) return 0;
    
    const cosine = dot / (mag1 * mag2);
    // Clamp value to handle floating point errors slightly outside [-1, 1]
    const angle = (Math.acos(Math.max(-1, Math.min(1, cosine))) * 180) / Math.PI;
    
    return isNaN(angle) ? 0 : angle;
  };

  const distance = (p1: any, p2: any) => {
    if (!p1 || !p2) return 0;
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
  };

  // COMPARISON ENGINE: Core Logic
  const compareHandToSign = (landmarks: any[], signName: string): ComparisonResult => {
    const reference = SIGN_REFERENCES[signName];
    if (!reference) return { isMatch: false, score: 0, errors: ['Unknown Sign'], vector: [] };

    // 1. Extract User Vector (Angles of 5 fingers)
    // We use "Global Extension" methodology: Angle between Wrist(0) -> MCP -> Tip.
    // This is much more robust than local joint angles for "Open" vs "Closed" detection.
    // Angle near 180 = Straight. Angle near 0 = Curled/Fist.
    
    // NOTE: Thumb logic uses CMC(1)->MCP(2)->Tip(4)
    const currentAngles = [
        calculateAngle(landmarks[1], landmarks[2], landmarks[4]),  // Thumb (CMC-MCP-Tip)
        calculateAngle(landmarks[0], landmarks[5], landmarks[8]),  // Index (Wrist-MCP-Tip)
        calculateAngle(landmarks[0], landmarks[9], landmarks[12]), // Middle
        calculateAngle(landmarks[0], landmarks[13], landmarks[16]), // Ring
        calculateAngle(landmarks[0], landmarks[17], landmarks[20])  // Pinky
    ];

    const target = reference.vector;
    const variance = reference.variance;
    const errors: string[] = [];
    let totalDeviance = 0;

    // 2. Check Finger Angles
    const fingerNames = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
    
    currentAngles.forEach((angle, i) => {
        const diff = Math.abs(angle - target[i]);
        
        // Normalize deviation for score (0 deviation = 1.0, >variance = 0.0)
        const maxAllowed = variance[i] * 2; 
        const componentScore = Math.max(0, 1 - (diff / maxAllowed));
        
        totalDeviance += (1 - componentScore);

        if (diff > variance[i]) {
            const direction = angle < target[i] ? "Straighten" : "Curl";
            if (errors.length < 2) { 
               errors.push(`${direction} ${fingerNames[i]}`);
            }
        }
    });

    // 3. Check Constraints (e.g. Proximity)
    if (reference.constraints?.thumbIndexProximity) {
        const d = distance(landmarks[4], landmarks[5]); // Thumb Tip to Index MCP
        const palmScale = distance(landmarks[0], landmarks[9]); // Wrist to Middle MCP
        const normalizedDist = d / (palmScale || 1); // Safety div
        
        // Relaxed threshold to prevent false positives
        if (normalizedDist > 0.5) { 
            errors.push("Move Thumb closer to Hand");
            totalDeviance += 0.5;
        }
    }

    // 4. Compute Final Score
    // Max deviance is approx 5 (one for each finger) + 1 (constraint).
    const finalScore = Math.max(0, Math.min(100, (1 - (totalDeviance / 4)) * 100));
    
    // 5. THRESHOLD CHECK
    const isPassing = errors.length === 0 && finalScore >= PASS_THRESHOLD;

    return {
        isMatch: isPassing,
        score: finalScore,
        errors: errors,
        vector: currentAngles
    };
  };

  // Render Loop
  useEffect(() => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current || !landmarkerRef.current) return;

    let animationFrameId: number;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const landmarker = landmarkerRef.current;

    if (!ctx) return;

    const drawSkeleton = (landmarks: any[], isCorrect: boolean) => {
        const drawConnectors = (indices: number[]) => {
            ctx.beginPath();
            if(!landmarks[indices[0]]) return;
            
            const start = landmarks[indices[0]];
            ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
            for (let i = 1; i < indices.length; i++) {
                const p = landmarks[indices[i]];
                if(p) ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
            }
            ctx.stroke();
        };

        ctx.strokeStyle = isCorrect ? '#0BE6A8' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = isCorrect ? 4 : 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        const fingers = [
            [0, 1, 2, 3, 4],       // Thumb
            [0, 5, 6, 7, 8],       // Index
            [0, 9, 10, 11, 12],    // Middle
            [0, 13, 14, 15, 16],   // Ring
            [0, 17, 18, 19, 20]    // Pinky
        ];

        fingers.forEach(indices => drawConnectors(indices));

        // Joints
        landmarks.forEach((p: any) => {
            if(!p) return;
            ctx.beginPath();
            ctx.arc(p.x * canvas.width, p.y * canvas.height, isCorrect ? 4 : 2, 0, 2 * Math.PI);
            ctx.fillStyle = isCorrect ? '#0BE6A8' : '#1174F2';
            ctx.fill();
        });
    };

    const render = async () => {
      if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
      }

      const startTimeMs = performance.now();
      const results = landmarker.detectForVideo(video, startTimeMs);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0]; 
          const analysisLandmarks = results.worldLandmarks && results.worldLandmarks.length > 0 
              ? results.worldLandmarks[0] 
              : landmarks;

          const result = compareHandToSign(analysisLandmarks, currentSign);
          setComparisonState(result);

          drawSkeleton(landmarks, result.isMatch);

          if (result.isMatch) {
              setProgress(prev => Math.min(prev + PROGRESS_SPEED, 100));
              setAccuracyHistory(prev => [...prev.slice(-19), 100]);
          } else {
              setAccuracyHistory(prev => [...prev.slice(-19), result.score]);
          }
      } else {
          setComparisonState(prev => ({ ...prev, score: 0, errors: ['No hand detected'] }));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isCameraActive, isModelLoading, currentSign]); 

  const smoothedAccuracy = accuracyHistory.length > 0 
    ? Math.round(accuracyHistory.reduce((a, b) => a + b, 0) / accuracyHistory.length)
    : 0;

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-6 bg-slate-900 overflow-y-auto">
      
      {/* Left: Context & Instruction */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-brand-surface rounded-2xl p-1 border border-slate-700 shadow-xl relative overflow-hidden aspect-video group">
            <img 
                src="https://images.unsplash.com/photo-1551847677-dc82d764e1eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Instructor"
                className="w-full h-full object-cover rounded-xl opacity-60 group-hover:opacity-40 transition-opacity"
            />
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-brand-navy/80 backdrop-blur-md p-6 rounded-2xl border border-slate-600 text-center">
                    <div className="text-brand-blue text-sm font-bold uppercase tracking-wider mb-1">Target Sign</div>
                    <div className="text-6xl font-extrabold text-white mb-2">{currentSign}</div>
                    <div className="text-slate-400 text-xs">Match the hand shape shown</div>
                 </div>
             </div>
             
             {/* Sign Selector - Scrollable */}
             <div className="absolute bottom-4 left-0 right-0 px-4">
                 <div className="flex justify-start gap-2 overflow-x-auto pb-2 px-2 no-scrollbar snap-x">
                    {Object.keys(SIGN_REFERENCES).map(sign => (
                        <button 
                            key={sign}
                            onClick={() => { setCurrentSign(sign); setProgress(0); }}
                            className={`flex-shrink-0 w-10 h-10 rounded-lg font-bold border transition-all snap-center ${
                                currentSign === sign 
                                ? 'bg-brand-blue border-brand-blue text-white shadow-lg scale-110' 
                                : 'bg-slate-900/80 border-slate-600 text-slate-400 hover:text-white'
                            }`}
                        >
                            {sign}
                        </button>
                    ))}
                 </div>
             </div>
        </div>

        <div className="bg-brand-surface rounded-2xl p-6 border border-slate-800 flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">Real-Time Analysis</h2>
            <div className="space-y-4 mt-4">
                {/* Live Vector Data Visualization */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 uppercase font-bold">
                        <span>Thumb</span>
                        <span>Index</span>
                        <span>Mid</span>
                        <span>Ring</span>
                        <span>Pinky</span>
                    </div>
                    <div className="flex justify-between items-end h-24 gap-2">
                        {comparisonState.vector.map((val, i) => {
                            const target = SIGN_REFERENCES[currentSign]?.vector[i] || 0;
                            const diff = Math.abs(val - target);
                            const isGood = diff < (SIGN_REFERENCES[currentSign]?.variance[i] || 30);
                            
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <div className="w-full bg-slate-800 rounded-t overflow-hidden relative h-full">
                                        {/* Target Marker */}
                                        <div 
                                            className="absolute w-full h-0.5 bg-white/30 z-10"
                                            style={{ bottom: `${(target / 180) * 100}%` }}
                                        />
                                        {/* Current Value Bar */}
                                        <div 
                                            className={`absolute bottom-0 w-full transition-all duration-300 ${isGood ? 'bg-brand-accent' : 'bg-brand-blue'}`}
                                            style={{ height: `${(val / 180) * 100}%` }}
                                        />
                                    </div>
                                    <div className="absolute -top-8 bg-black text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {Math.round(val)}°
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-xs text-slate-400 uppercase font-bold">Feedback</div>
                        <div className={`text-xs font-bold px-2 py-0.5 rounded ${comparisonState.score >= PASS_THRESHOLD ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            Target: {PASS_THRESHOLD}%
                        </div>
                    </div>
                    {comparisonState.errors.length > 0 ? (
                        <div className="space-y-2">
                             {comparisonState.errors.map((err, i) => (
                                 <div key={i} className="flex items-center gap-2 text-brand-error font-medium animate-pulse">
                                     <AlertCircle className="w-4 h-4" />
                                     <span>{err}</span>
                                 </div>
                             ))}
                        </div>
                    ) : comparisonState.score >= PASS_THRESHOLD ? (
                        <div className="flex items-center gap-2 text-brand-accent font-bold">
                             <CheckCircle className="w-5 h-5" />
                             <span>Excellent form! Hold it...</span>
                        </div>
                    ) : (
                        <div className="text-slate-500 italic">Align your hand to the camera...</div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Right: Camera Feed */}
      <div className="flex-1 flex flex-col gap-4">
         <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-700 aspect-video flex-1">
            
            {isModelLoading && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-20">
                    <Loader2 className="w-10 h-10 text-brand-accent animate-spin mb-3" />
                    <div className="text-brand-accent font-medium animate-pulse">Loading Engine...</div>
                 </div>
            )}

            {!isCameraActive && !isModelLoading && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900">
                   <Camera className="w-12 h-12 text-slate-600 animate-pulse" />
                   <span className="ml-4 text-slate-400">Initializing camera...</span>
                </div>
            )}

            {cameraError && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-900/95 p-8 text-center backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-red-500/10 p-4 rounded-full mb-4">
                        <AlertCircle className="w-12 h-12 text-brand-error" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{cameraError.title}</h3>
                    <p className="text-slate-400 max-w-md mb-6 leading-relaxed">{cameraError.message}</p>
                    <button 
                        onClick={() => {
                            setCameraError(null);
                            startCamera();
                        }}
                        className="px-6 py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" /> Try Again
                    </button>
                 </div>
            )}

            <video 
                ref={videoRef}
                autoPlay 
                muted 
                playsInline
                className={`absolute inset-0 w-full h-full object-cover mirror-mode transition-opacity duration-500 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
                style={{ transform: 'scaleX(-1)' }}
            />
            
            <canvas 
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ transform: 'scaleX(-1)' }}
            />

            {/* HUD Overlay */}
            {isCameraActive && !cameraError && (
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                 <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-xs font-mono text-brand-accent border border-brand-accent/20 shadow-sm">
                     SCORE: {Math.round(comparisonState.score)}% <span className="text-slate-500 mx-1">|</span> TARGET: {PASS_THRESHOLD}%
                 </div>
                 
                 <div className={`px-4 py-2 rounded-lg font-bold text-sm shadow-lg backdrop-blur-md border transition-all duration-300 transform ${
                     comparisonState.isMatch 
                     ? 'bg-green-500/90 border-green-400 text-white scale-110 shadow-[0_0_20px_rgba(74,222,128,0.5)]' 
                     : 'bg-slate-900/80 border-slate-600 text-slate-300'
                 }`}>
                    {comparisonState.isMatch ? 'PERFECT MATCH' : 'ADJUSTING...'}
                 </div>
              </div>
            )}

            {/* Feedback Glow */}
            {!cameraError && (
            <div className={`absolute inset-0 border-4 transition-all duration-300 pointer-events-none z-10 rounded-2xl ${
                comparisonState.isMatch 
                ? 'border-brand-accent shadow-[inset_0_0_60px_rgba(11,230,168,0.4)]' 
                : comparisonState.score > 70 ? 'border-yellow-500/30' : 'border-transparent'
            }`}></div>
            )}
         </div>

         {/* Progress Bar */}
         <div className="bg-brand-surface rounded-2xl p-6 border border-slate-800">
             <div className="flex justify-between items-center mb-3">
                 <div>
                    <span className="font-bold text-white block">Lesson Progress</span>
                    <span className="text-xs text-slate-500">Maintain {PASS_THRESHOLD}% accuracy to advance</span>
                 </div>
                 <span className="text-brand-accent font-mono text-xl">{Math.round(progress)}%</span>
             </div>
             <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden relative">
                 <div 
                    className={`h-full transition-all duration-300 ease-out ${comparisonState.isMatch ? 'bg-brand-accent shadow-[0_0_10px_#0BE6A8]' : 'bg-brand-blue'}`}
                    style={{ width: `${progress}%` }}
                 ></div>
             </div>
             {progress >= 100 && (
                 <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3 text-green-400 animate-in fade-in slide-in-from-bottom-2">
                     <CheckCircle className="w-5 h-5" />
                     <span className="font-medium">Lesson Complete! +50 XP</span>
                     <button 
                        onClick={() => {
                            setProgress(0);
                        }}
                        className="ml-auto text-sm bg-green-500/20 px-3 py-1 rounded hover:bg-green-500/30 transition-colors"
                     >
                        Next Sign
                     </button>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};

export default LessonInterface;