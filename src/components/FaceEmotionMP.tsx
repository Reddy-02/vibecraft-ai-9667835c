import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

type Emotion = 'happy' | 'sad' | 'surprised' | 'neutral' | 'angry';

interface FaceEmotionMPProps {
  onEmotionDetected?: (emotion: Emotion) => void;
}

const FaceEmotionMP = ({ onEmotionDetected }: FaceEmotionMPProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const faceLandmarkerRef = useRef<any>(null);
  const emotionBufferRef = useRef<Emotion[]>([]);
  const lastSaveTimeRef = useRef<number>(Date.now());
  const scriptLoadedRef = useRef(false);

  const saveMoodToHistory = (emotion: Emotion) => {
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 5000) return;
    
    lastSaveTimeRef.current = now;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const stored = localStorage.getItem('moodHistory');
    let history = stored ? JSON.parse(stored) : [];
    
    const todayEntry = history.find((h: any) => h.date === today);
    if (todayEntry) {
      todayEntry[emotion] = (todayEntry[emotion] || 0) + 1;
    } else {
      const newEntry = {
        date: today,
        happy: 0,
        sad: 0,
        angry: 0,
        surprised: 0,
        neutral: 0,
      };
      newEntry[emotion] = 1;
      history.push(newEntry);
      
      if (history.length > 7) {
        history = history.slice(-7);
      }
    }
    
    localStorage.setItem('moodHistory', JSON.stringify(history));
  };

  useEffect(() => {
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;
    
    initializeFaceLandmarker();

    return () => {
      if (faceLandmarkerRef.current) {
        try {
          faceLandmarkerRef.current.close();
        } catch (e) {
          console.error('Error closing face landmarker:', e);
        }
      }
    };
  }, []);

  const initializeFaceLandmarker = async () => {
    try {
      console.log('Initializing FilesetResolver...');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
      );

      console.log('Creating FaceLandmarker...');
      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
      });

      console.log('FaceLandmarker initialized successfully');
      startWebcam();
    } catch (err) {
      console.error('Initialization error:', err);
      setError(`Failed to initialize face detection: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsLoading(false);
          detectEmotion();
        };
      }
    } catch (err) {
      setError('Camera access denied');
      setIsLoading(false);
    }
  };

  const detectEmotionFromLandmarks = (landmarks: any): Emotion => {
    if (!landmarks || landmarks.length === 0) return 'neutral';

    const face = landmarks[0];
    
    // Mouth corners
    const leftMouth = face[61];
    const rightMouth = face[291];
    const topLip = face[13];
    const bottomLip = face[14];
    
    // Eyes
    const leftEyeTop = face[159];
    const leftEyeBottom = face[145];
    const rightEyeTop = face[386];
    const rightEyeBottom = face[374];
    
    // Eyebrows
    const leftBrow = face[70];
    const rightBrow = face[300];
    
    // Calculate metrics
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

    // Emotion detection logic
    if (isSmiling && mouthRatio > 0.15) return 'happy';
    if (browRaised && eyeOpenness > 0.02) return 'surprised';
    if (mouthRatio < 0.08 && !isSmiling) return 'sad';
    if (mouthRatio > 0.2 && !isSmiling) return 'angry';
    
    return 'neutral';
  };

  const smoothEmotion = (newEmotion: Emotion): Emotion => {
    emotionBufferRef.current.push(newEmotion);
    if (emotionBufferRef.current.length > 5) {
      emotionBufferRef.current.shift();
    }

    const counts = emotionBufferRef.current.reduce((acc, e) => {
      acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {} as Record<Emotion, number>);

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Emotion;
  };

  const detectEmotion = async () => {
    if (!videoRef.current || !canvasRef.current || !faceLandmarkerRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const detect = async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const result = await faceLandmarkerRef.current.detectForVideo(video, performance.now());
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
          const detectedEmotion = detectEmotionFromLandmarks(result.faceLandmarks);
          const smoothedEmotion = smoothEmotion(detectedEmotion);
          
          setEmotion(smoothedEmotion);
          onEmotionDetected?.(smoothedEmotion);
          
          // Save to mood history
          saveMoodToHistory(smoothedEmotion);
          
          // Draw HUD circle around face
          const landmarks = result.faceLandmarks[0];
          const centerX = landmarks.reduce((sum: number, p: any) => sum + p.x, 0) / landmarks.length;
          const centerY = landmarks.reduce((sum: number, p: any) => sum + p.y, 0) / landmarks.length;
          
          const radius = 150;
          
          const emotionColors: Record<Emotion, string> = {
            happy: '#d9d9d9',
            sad: '#595959',
            angry: '#404040',
            surprised: '#bfbfbf',
            neutral: '#808080',
          };
          
          // Glow circle
          ctx.beginPath();
          ctx.arc(centerX * canvas.width, centerY * canvas.height, radius, 0, Math.PI * 2);
          ctx.strokeStyle = emotionColors[smoothedEmotion];
          ctx.lineWidth = 4;
          ctx.shadowBlur = 30;
          ctx.shadowColor = emotionColors[smoothedEmotion];
          ctx.stroke();
          ctx.shadowBlur = 0;
          
          // Draw face mesh dots
          landmarks.forEach((landmark: any) => {
            ctx.beginPath();
            ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 1, 0, Math.PI * 2);
            ctx.fillStyle = `${emotionColors[smoothedEmotion]}80`;
            ctx.fill();
          });
          
          // Neon border
          ctx.strokeStyle = emotionColors[smoothedEmotion];
          ctx.lineWidth = 3;
          ctx.strokeRect(0, 0, canvas.width, canvas.height);
        }
      }
      
      requestAnimationFrame(detect);
    };

    detect();
  };

  const emotionEmojis: Record<Emotion, string> = {
    happy: '😊',
    sad: '😢',
    surprised: '😮',
    neutral: '😐',
    angry: '😠',
  };

  return (
    <Card className="glass-panel p-6 premium-glow h-full">
      <h2 className="text-xl font-light mb-6 text-foreground">Emotion Detection</h2>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive-foreground p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground text-sm">Initializing...</div>
        </div>
      )}

      <div className="relative" style={{ display: isLoading ? 'none' : 'block' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-lg border border-border/50"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>

      {emotion && (
        <div className="mt-6 p-4 bg-card/50 backdrop-blur-sm rounded-lg text-center border border-border/30">
          <div className="text-4xl mb-2">{emotionEmojis[emotion]}</div>
          <div className="text-lg font-light capitalize text-foreground">
            {emotion}
          </div>
        </div>
      )}
    </Card>
  );
};

export default FaceEmotionMP;
