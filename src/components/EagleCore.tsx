/**
 * EagleCore — Three.js amber eagle holographic core
 * Renders eagle-clean.png sprite with orbiting amber particle cloud
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  active?: boolean;
}

function ParticleField({ count = 800 }: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null!);
  const timeRef = useRef(0);

  const { positions, angles, radii, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ang = new Float32Array(count);
    const rad = new Float32Array(count);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radiusX = 1.5 + Math.random() * 1.5;
      const radiusY = 0.8 + Math.random() * 0.5;
      const radiusZ = 1.2 + Math.random() * 1.0;

      pos[i * 3] = Math.cos(angle) * radiusX;
      pos[i * 3 + 1] = Math.sin(angle) * radiusY;
      pos[i * 3 + 2] = Math.sin(angle * 0.5) * radiusZ;

      ang[i] = angle;
      rad[i] = Math.random();
      spd[i] = 0.2 + Math.random() * 0.3;
    }

    return { positions: pos, angles: ang, radii: rad, speeds: spd };
  }, [count]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;

    const posArray = meshRef.current.geometry.attributes.position.array as Float32Array;
    const posCount = count;

    for (let i = 0; i < posCount; i++) {
      const speed = speeds[i];
      const t = timeRef.current * speed;
      
      const ox = Math.cos(angles[i] + t) * (1.5 + radii[i] * 1.5);
      const oy = Math.sin(angles[i] + t * 0.7) * (0.8 + radii[i] * 0.5) + Math.sin(t * 2) * 0.1;
      const oz = Math.sin(angles[i] * 0.5 + t * 0.3) * (1.2 + radii[i]);

      posArray[i * 3] = ox;
      posArray[i * 3 + 1] = oy;
      posArray[i * 3 + 2] = oz;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.rotation.y += delta * 0.08;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#F5A623"
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function EagleSprite({ active = false }: { active?: boolean }) {
  const spriteRef = useRef<THREE.Sprite>(null!);
  const materialRef = useRef<THREE.SpriteMaterial>(null!);

  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load('/eagle-clean.png');
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame(() => {
    if (!spriteRef.current || !materialRef.current) return;

    if (active) {
      const pulse = 0.9 + Math.sin(Date.now() * 0.002) * 0.1;
      materialRef.current.opacity = pulse;
      const glow = 0.6 + Math.sin(Date.now() * 0.003) * 0.2;
      materialRef.current.color.setRGB(
        0.96 * glow + 0.04,
        0.65 * glow + 0.35,
        0.14 * glow + 0.86
      );
    }
  });

  return (
    <sprite ref={spriteRef} scale={[2.2, 2.2, 1]}>
      <spriteMaterial
        ref={materialRef}
        map={texture}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}

interface EagleCoreSceneProps {
  active?: boolean;
}

function EagleCoreScene({ active = false }: EagleCoreSceneProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!active) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <EagleSprite active={active} />
      <ParticleField count={800} />
      <ambientLight intensity={0.1} />
      <pointLight
        position={[0, 0, 0]}
        color="#F5A623"
        intensity={active ? 2.5 : 1.5}
        distance={5}
        decay={2}
      />
    </group>
  );
}

export interface EagleCoreProps {
  active?: boolean;
  className?: string;
}

export function EagleCore({ active = false, className = '' }: EagleCoreProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <EagleCoreScene active={active} />
      </Canvas>
    </div>
  );
}

export default EagleCore;