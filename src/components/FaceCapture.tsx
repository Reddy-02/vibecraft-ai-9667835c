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

const FaceCapture = ({ onEmotionCaptured, onScanningChange }: FaceCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'idle' | 'initializing' | 'ready' | 'scanning' | 'captured' | 'error'>('idle');
  const [capturedEmotion, setCapturedEmotion] = useState<Emotion | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const faceLandmarkerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const emotionConfig: Record<Emotion, { label: string; emoji: string; color: string }> = {
    happy: { label: 'Happy', emoji: '😊', color: '#FFD700' },
    sad: { label: 'Sad', emoji: '😢', color: '#4A90D9' },
    surprised: { label: 'Surprised', emoji: '😮', color: '#C471ED' },
    neutral: { label: 'Neutral', emoji: '😐', color: '#8B9DC3' },
    angry: { label: 'Angry', emoji: '😠', color: '#E85454' },
  };

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

    // Create capture image
    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);

    // Simulate scanning delay for effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const result = await faceLandmarkerRef.current.detect(video);
      
      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const emotion = detectEmotionFromLandmarks(result.faceLandmarks);
        setCapturedEmotion(emotion);
        onEmotionCaptured(emotion);
        setStatus('captured');
        
        // Save to mood history
        saveMoodToHistory(emotion);
        
        // Stop webcam after capture
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
      className="relative z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      <div className="glass-panel p-6 md:p-8 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">Face Scan</h2>
            <p className="text-sm text-muted-foreground">Single capture analysis</p>
          </div>
          <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
            ${status === 'scanning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              status === 'captured' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              status === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-muted/30 text-muted-foreground border border-border/30'}
          `}>
            {status === 'scanning' && <Scan className="w-3 h-3 animate-pulse" />}
            {status === 'captured' && <CheckCircle className="w-3 h-3" />}
            {status === 'error' && <AlertCircle className="w-3 h-3" />}
            {status === 'idle' && <Camera className="w-3 h-3" />}
            {status === 'initializing' && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {status === 'ready' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            <span className="capitalize">{status}</span>
          </div>
        </div>

        {/* Video/Capture Area */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/50 mb-6">
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
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-transparent to-cyan-500/20" />
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="text-cyan-400 text-sm font-medium tracking-wider uppercase">
                      Analyzing...
                    </div>
                  </motion.div>
                )}

                {/* Corner brackets */}
                <div className="absolute top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-cyan-400/60 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-cyan-400/60 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-10 h-10 border-l-2 border-b-2 border-cyan-400/60 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-cyan-400/60 rounded-br-lg" />
              </motion.div>
            ) : (
              <motion.div
                key="captured"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full"
              >
                {capturedImage && (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state */}
          {status === 'initializing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <div className="w-12 h-12 rounded-full border-2 border-muted border-t-cyan-400 animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Initializing camera...</p>
            </div>
          )}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {capturedEmotion && status === 'captured' && (
            <motion.div
              className="p-5 rounded-2xl mb-6"
              style={{ backgroundColor: `${emotionConfig[capturedEmotion].color}20` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4">
                <motion.span
                  className="text-5xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  {emotionConfig[capturedEmotion].emoji}
                </motion.span>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {emotionConfig[capturedEmotion].label}
                  </p>
                  <p className="text-sm text-muted-foreground">Detected emotion</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3">
          {status === 'captured' ? (
            <Button
              onClick={resetCapture}
              className="flex-1 h-12 rounded-xl bg-muted/40 hover:bg-muted/60 text-foreground border border-border/30"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Scan Again
            </Button>
          ) : (
            <Button
              onClick={captureAndAnalyze}
              disabled={status !== 'ready'}
              className="flex-1 h-12 rounded-xl btn-premium text-black font-medium"
            >
              {status === 'scanning' ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Scanning...
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
