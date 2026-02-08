import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { Camera, Scan, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Emotion = 'happy' | 'sad' | 'surprised' | 'neutral' | 'angry';

interface FaceCaptureProps {
  onEmotionCaptured: (emotion: Emotion) => void;
  onScanningChange: (isScanning: boolean) => void;
}

const emotionConfig: Record<Emotion, { label: string; emoji: string }> = {
  happy: { label: 'Happy', emoji: '😊' },
  sad: { label: 'Sad', emoji: '😢' },
  surprised: { label: 'Surprised', emoji: '😮' },
  neutral: { label: 'Neutral', emoji: '😐' },
  angry: { label: 'Angry', emoji: '😠' },
};

const FaceCapture = ({ onEmotionCaptured, onScanningChange }: FaceCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'idle' | 'initializing' | 'ready' | 'scanning' | 'captured' | 'error'>('idle');
  const [capturedEmotion, setCapturedEmotion] = useState<Emotion | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const faceLandmarkerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initializeFaceLandmarker = async () => {
    try {
      setStatus('initializing');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
      );

      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numFaces: 1,
      });

      await startWebcam();
    } catch (err) {
      setError(`Initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatus('error');
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setStatus('ready');
        };
      }
    } catch (err) {
      setError('Camera access denied');
      setStatus('error');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const detectEmotionFromLandmarks = (landmarks: any): Emotion => {
    if (!landmarks || landmarks.length === 0) return 'neutral';

    const face = landmarks[0];
    
    const leftMouth = face[61];
    const rightMouth = face[291];
    const topLip = face[13];
    const bottomLip = face[14];
    const leftEyeTop = face[159];
    const leftEyeBottom = face[145];
    const rightEyeTop = face[386];
    const rightEyeBottom = face[374];
    const leftBrow = face[70];
    const rightBrow = face[300];
    
    const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);
    const mouthHeight = Math.abs(bottomLip.y - topLip.y);
    const mouthRatio = mouthHeight / mouthWidth;
    
    const leftEyeOpen = Math.abs(leftEyeTop.y - leftEyeBottom.y);
    const rightEyeOpen = Math.abs(rightEyeTop.y - rightEyeBottom.y);
    const eyeOpenness = (leftEyeOpen + rightEyeOpen) / 2;
    
    const mouthCenterY = (topLip.y + bottomLip.y) / 2;
    const isSmiling = leftMouth.y > mouthCenterY && rightMouth.y > mouthCenterY;
    
    const browHeight = (leftBrow.y + rightBrow.y) / 2;
    const eyeHeight = (leftEyeTop.y + rightEyeTop.y) / 2;
    const browRaised = eyeHeight - browHeight > 0.03;

    if (isSmiling && mouthRatio > 0.15) return 'happy';
    if (browRaised && eyeOpenness > 0.02) return 'surprised';
    if (mouthRatio < 0.08 && !isSmiling) return 'sad';
    if (mouthRatio > 0.2 && !isSmiling) return 'angry';
    
    return 'neutral';
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !faceLandmarkerRef.current) return;

    setStatus('scanning');
    onScanningChange(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const result = await faceLandmarkerRef.current.detect(video);
      
      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const emotion = detectEmotionFromLandmarks(result.faceLandmarks);
        setCapturedEmotion(emotion);
        onEmotionCaptured(emotion);
        setStatus('captured');
        saveMoodToHistory(emotion);
        stopWebcam();
      } else {
        setError('No face detected. Please try again.');
        setStatus('ready');
      }
    } catch (err) {
      setError('Detection failed. Please try again.');
      setStatus('ready');
    }
    
    onScanningChange(false);
  }, [onEmotionCaptured, onScanningChange]);

  const saveMoodToHistory = (emotion: Emotion) => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const stored = localStorage.getItem('moodHistory');
    let history = stored ? JSON.parse(stored) : [];
    
    history = history.filter((h: any) => {
      const entryDate = new Date(h.date + ' ' + new Date().getFullYear());
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      return entryDate >= currentDate;
    });
    
    const todayEntry = history.find((h: any) => h.date === today);
    if (todayEntry) {
      todayEntry[emotion] = (todayEntry[emotion] || 0) + 1;
    } else {
      const newEntry = { date: today, happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0 };
      newEntry[emotion] = 1;
      history.push(newEntry);
    }
    
    localStorage.setItem('moodHistory', JSON.stringify(history));
  };

  const resetCapture = () => {
    setCapturedEmotion(null);
    setCapturedImage(null);
    setError('');
    setStatus('idle');
    initializeFaceLandmarker();
  };

  useEffect(() => {
    initializeFaceLandmarker();
    return () => {
      stopWebcam();
      if (faceLandmarkerRef.current) {
        try {
          faceLandmarkerRef.current.close();
        } catch (e) {
          console.error('Error closing face landmarker:', e);
        }
      }
    };
  }, []);

  return (
    <motion.div
      className="relative z-10 w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="glass-panel p-5 border-glow">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Face Scan</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Single capture analysis</p>
          </div>
          <div className={`
            flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border
            ${status === 'scanning' ? 'bg-accent/50 text-foreground/70 border-border/50' :
              status === 'captured' ? 'bg-accent/50 text-foreground/70 border-border/50' :
              status === 'error' ? 'bg-destructive/10 text-destructive border-destructive/20' :
              'bg-secondary/60 text-muted-foreground border-border/40'}
          `}>
            {status === 'scanning' && <Scan className="w-3 h-3 animate-pulse" />}
            {status === 'captured' && <CheckCircle className="w-3 h-3" />}
            {status === 'error' && <AlertCircle className="w-3 h-3" />}
            {status === 'idle' && <Camera className="w-3 h-3" />}
            {status === 'initializing' && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {status === 'ready' && <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 animate-pulse" />}
            <span className="capitalize">{status}</span>
          </div>
        </div>

        {/* Video/Capture Area */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-secondary/40 mb-5">
          <AnimatePresence mode="wait">
            {status !== 'captured' ? (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scan overlay */}
                {status === 'scanning' && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 via-transparent to-foreground/5" />
                    <motion.div
                      className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/40 to-transparent"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="text-foreground/60 text-xs font-medium tracking-widest uppercase">
                      Analyzing…
                    </div>
                  </motion.div>
                )}

                {/* Corner brackets */}
                <div className="absolute top-3 left-3 w-8 h-8 border-l border-t border-foreground/20 rounded-tl-md" />
                <div className="absolute top-3 right-3 w-8 h-8 border-r border-t border-foreground/20 rounded-tr-md" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-l border-b border-foreground/20 rounded-bl-md" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-r border-b border-foreground/20 rounded-br-md" />
              </motion.div>
            ) : (
              <motion.div
                key="captured"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full"
              >
                {capturedImage && (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state */}
          {status === 'initializing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
              <div className="w-10 h-10 rounded-full border-2 border-muted border-t-foreground/50 animate-spin mb-3" />
              <p className="text-xs text-muted-foreground">Initializing camera…</p>
            </div>
          )}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="flex items-center gap-2.5 p-3 rounded-xl bg-destructive/5 border border-destructive/10 mb-4"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {capturedEmotion && status === 'captured' && (
            <motion.div
              className="p-4 rounded-xl bg-secondary/50 border border-border/40 mb-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-4xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  {emotionConfig[capturedEmotion].emoji}
                </motion.span>
                <div>
                  <p className="text-xl font-semibold text-foreground">
                    {emotionConfig[capturedEmotion].label}
                  </p>
                  <p className="text-xs text-muted-foreground">Detected emotion</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-2.5">
          {status === 'captured' ? (
            <Button
              onClick={resetCapture}
              className="flex-1 h-11 rounded-xl bg-secondary hover:bg-accent text-foreground border border-border/40"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Scan Again
            </Button>
          ) : (
            <Button
              onClick={captureAndAnalyze}
              disabled={status !== 'ready'}
              className="flex-1 h-11 rounded-xl btn-premium"
            >
              {status === 'scanning' ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-muted-foreground/40 border-t-background rounded-full animate-spin" />
                  Scanning…
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4 mr-2" />
                  Capture & Analyze
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FaceCapture;
