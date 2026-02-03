import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, MeshDistortMaterial, Sphere, Ring, Text } from '@react-three/drei';
import * as THREE from 'three';

type Emotion = 'happy' | 'sad' | 'surprised' | 'neutral' | 'angry';

interface Scene3DProps {
  currentMood: Emotion;
  isScanning: boolean;
}

const emotionColors: Record<Emotion, string> = {
  happy: '#FFD700',
  sad: '#4A90D9',
  angry: '#E85454',
  surprised: '#C471ED',
  neutral: '#8B9DC3',
};

const HolographicOrb = ({ mood, isScanning }: { mood: Emotion; isScanning: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const ringRef3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x += isScanning ? 0.03 : 0.008;
      ringRef1.current.rotation.z += 0.002;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y += isScanning ? 0.025 : 0.006;
      ringRef2.current.rotation.x += 0.003;
    }
    if (ringRef3.current) {
      ringRef3.current.rotation.z += isScanning ? 0.02 : 0.004;
      ringRef3.current.rotation.y += 0.002;
    }
  });

  const color = emotionColors[mood];

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group>
        {/* Central orb */}
        <Sphere ref={meshRef} args={[1.2, 64, 64]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={isScanning ? 0.4 : 0.2}
            speed={isScanning ? 4 : 2}
            roughness={0.1}
            metalness={0.8}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </Sphere>

        {/* Holographic rings */}
        <Ring ref={ringRef1} args={[1.8, 1.85, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
        </Ring>
        <Ring ref={ringRef2} args={[2.2, 2.25, 64]} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </Ring>
        <Ring ref={ringRef3} args={[2.6, 2.63, 64]} rotation={[Math.PI / 4, Math.PI / 6, Math.PI / 3]}>
          <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
        </Ring>

        {/* Core glow */}
        <Sphere args={[0.8, 32, 32]}>
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </Sphere>
      </group>
    </Float>
  );
};

const FloatingParticles = ({ count = 100, mood }: { count?: number; mood: Emotion }) => {
  const points = useRef<THREE.Points>(null);
  const color = emotionColors[mood];

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

const HexGrid = ({ mood }: { mood: Emotion }) => {
  const gridRef = useRef<THREE.Group>(null);
  const color = emotionColors[mood];

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  const hexagons = useMemo(() => {
    const items = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 4;
      items.push({
        position: [Math.cos(angle) * radius, Math.sin(angle) * radius, -2] as [number, number, number],
        rotation: [0, 0, angle] as [number, number, number],
      });
    }
    return items;
  }, []);

  return (
    <group ref={gridRef}>
      {hexagons.map((hex, i) => (
        <Ring
          key={i}
          args={[0.8, 0.85, 6]}
          position={hex.position}
          rotation={hex.rotation}
        >
          <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
        </Ring>
      ))}
    </group>
  );
};

const Scene3D = ({ currentMood, isScanning }: Scene3DProps) => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color={emotionColors[currentMood]} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
        <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={0.8} color={emotionColors[currentMood]} />

        <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        
        <HolographicOrb mood={currentMood} isScanning={isScanning} />
        <FloatingParticles mood={currentMood} />
        <HexGrid mood={currentMood} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
