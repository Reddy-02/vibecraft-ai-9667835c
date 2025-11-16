import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';

declare global {
  interface Window {
    FaceLandmarker: any;
    FilesetResolver: any;
  }
}

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

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializeFaceLandmarker();
    };

    return () => {
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
      document.body.removeChild(script);
    };
  }, []);

  const initializeFaceLandmarker = async () => {
    try {
      const vision = await window.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );

      faceLandmarkerRef.current = await window.FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
      });

      startWebcam();
    } catch (err) {
      setError('Failed to initialize face detection');
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
          
          // Draw HUD circle around face
          const landmarks = result.faceLandmarks[0];
          const centerX = landmarks.reduce((sum: number, p: any) => sum + p.x, 0) / landmarks.length;
          const centerY = landmarks.reduce((sum: number, p: any) => sum + p.y, 0) / landmarks.length;
          
          const radius = 150;
          
          const emotionColors: Record<Emotion, string> = {
            happy: '#fbbf24',
            sad: '#3b82f6',
            angry: '#ef4444',
            surprised: '#a855f7',
            neutral: '#6b7280',
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
    <Card className="glass-panel p-6 relative overflow-hidden">
      <div className="absolute inset-0 hologram-grid opacity-20" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neon-purple">Emotion Scan</h2>
          <div className="flex items-center gap-2">
            <span className="text-4xl">{emotionEmojis[emotion]}</span>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Mood</p>
              <p className="text-xl font-bold capitalize text-neon-cyan">{emotion}</p>
            </div>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden border-2 border-neon-purple/30">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
              <div className="text-center">
                <div className="animate-pulse-glow w-16 h-16 mx-auto mb-4 rounded-full bg-neon-purple" />
                <p className="text-neon-cyan">Initializing face detection...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
              <p className="text-destructive">{error}</p>
            </div>
          )}
          
          <video
            ref={videoRef}
            className="w-full h-auto"
            autoPlay
            playsInline
            muted
          />
          
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    </Card>
  );
};

export default FaceEmotionMP;
