import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RingProps {
    radius: number;
    tube: number;
    color: string;
    speed: number;
    rotationAxis: [number, number, number];
    emissiveIntensity?: number;
}

function Ring({ radius, tube, color, speed, rotationAxis, emissiveIntensity = 1 }: RingProps) {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += rotationAxis[0] * speed * delta;
            meshRef.current.rotation.y += rotationAxis[1] * speed * delta;
            meshRef.current.rotation.z += rotationAxis[2] * speed * delta;
        }
    });

    return (
        <mesh ref={meshRef}>
            <torusGeometry args={[radius, tube, 16, 100]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity}
                transparent
                opacity={0.85}
            />
        </mesh>
    );
}

function CoreSphere() {
    const meshRef = useRef<THREE.Mesh>(null!);
    const timeRef = useRef(0);

    useFrame((_, delta) => {
        timeRef.current += delta;
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 1.5 + Math.sin(timeRef.current * 2) * 0.5;
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshStandardMaterial
                color="#00e5ff"
                emissive="#00e5ff"
                emissiveIntensity={2}
                transparent
                opacity={0.9}
            />
        </mesh>
    );
}

function Particles() {
    const count = 60;
    const positions = useRef(
        new Float32Array(
            Array.from({ length: count * 3 }, (_, i) => {
                const idx = i % 3;
                if (idx === 0) return (Math.random() - 0.5) * 4;
                if (idx === 1) return (Math.random() - 0.5) * 4;
                return (Math.random() - 0.5) * 4;
            })
        )
    );
    const pointsRef = useRef<THREE.Points>(null!);

    useFrame((_, delta) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions.current, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#00e5ff"
                size={0.04}
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

interface ArcReactorCoreProps {
    size?: number;
    state?: string;
}

const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({ size = 200, state = 'idle' }) => {
    const isActive = state === 'listening' || state === 'speaking' || state === 'processing';

    return (
        <div style={{ width: size, height: size }} className="relative">
            <Canvas
                camera={{ position: [0, 0, 4], fov: 50 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.2} />
                <pointLight position={[0, 0, 3]} intensity={2} color="#00e5ff" />
                <pointLight position={[0, 0, -3]} intensity={1} color="#0097a7" />

                <CoreSphere />
                <Ring radius={0.7} tube={0.04} color="#00e5ff" speed={isActive ? 2 : 0.8} rotationAxis={[1, 0, 0]} emissiveIntensity={2} />
                <Ring radius={1.0} tube={0.03} color="#00bcd4" speed={isActive ? -1.5 : -0.6} rotationAxis={[0, 1, 0.3]} emissiveIntensity={1.5} />
                <Ring radius={1.3} tube={0.025} color="#0097a7" speed={isActive ? 1.2 : 0.4} rotationAxis={[0.5, 0.5, 0]} emissiveIntensity={1} />
                <Ring radius={1.6} tube={0.02} color="#006064" speed={isActive ? -0.8 : -0.3} rotationAxis={[0.3, 0, 1]} emissiveIntensity={0.8} />
                <Particles />
            </Canvas>
            {/* Glow overlay */}
            <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)',
                    animation: isActive ? 'pulse-cyan 1s ease-in-out infinite' : 'pulse-cyan 3s ease-in-out infinite',
                }}
            />
        </div>
    );
};

export default ArcReactorCore;
