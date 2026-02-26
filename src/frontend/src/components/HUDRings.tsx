import React, { useEffect, useRef } from 'react';

interface HUDRingsProps {
    size?: number;
    isActive?: boolean;
    state?: 'idle' | 'listening' | 'processing' | 'speaking' | 'wake-listening';
}

const HUDRings: React.FC<HUDRingsProps> = ({ size = 300, isActive = false, state = 'idle' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const timeRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = size;
        canvas.height = size;

        const cx = size / 2;
        const cy = size / 2;

        const getStateColor = () => {
            switch (state) {
                case 'listening': return { r: 0, g: 229, b: 255 };
                case 'processing': return { r: 255, g: 167, b: 38 };
                case 'speaking': return { r: 0, g: 200, b: 150 };
                case 'wake-listening': return { r: 100, g: 200, b: 255 };
                default: return { r: 0, g: 180, b: 220 };
            }
        };

        const drawArc = (radius: number, startAngle: number, endAngle: number, color: string, lineWidth: number) => {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        };

        const drawDashedArc = (radius: number, rotation: number, segments: number, color: string) => {
            const segAngle = (Math.PI * 2) / segments;
            for (let i = 0; i < segments; i++) {
                const start = rotation + i * segAngle;
                const end = start + segAngle * 0.6;
                drawArc(radius, start, end, color, 1.5);
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, size, size);
            timeRef.current += 0.02;
            const t = timeRef.current;
            const c = getStateColor();
            const alpha = isActive ? 1 : 0.6;
            const pulse = 0.7 + Math.sin(t * 2) * 0.3;

            // Outer ring
            drawArc(cx - 8, 0, Math.PI * 2, `rgba(${c.r},${c.g},${c.b},${0.15 * alpha})`, 1);

            // Rotating dashed rings
            drawDashedArc(cx - 15, t * 0.5, 12, `rgba(${c.r},${c.g},${c.b},${0.4 * alpha})`);
            drawDashedArc(cx - 30, -t * 0.3, 8, `rgba(${c.r},${c.g},${c.b},${0.3 * alpha})`);
            drawDashedArc(cx - 50, t * 0.7, 16, `rgba(${c.r},${c.g},${c.b},${0.25 * alpha})`);

            // Solid arcs
            drawArc(cx - 20, t, t + Math.PI * 1.2, `rgba(${c.r},${c.g},${c.b},${0.6 * alpha * pulse})`, 2);
            drawArc(cx - 20, t + Math.PI, t + Math.PI * 1.8, `rgba(${c.r},${c.g},${c.b},${0.4 * alpha})`, 1.5);
            drawArc(cx - 40, -t * 0.8, -t * 0.8 + Math.PI * 0.8, `rgba(${c.r},${c.g},${c.b},${0.5 * alpha * pulse})`, 2);
            drawArc(cx - 60, t * 0.6, t * 0.6 + Math.PI * 1.5, `rgba(${c.r},${c.g},${c.b},${0.3 * alpha})`, 1);
            drawArc(cx - 75, -t * 0.4, -t * 0.4 + Math.PI * 0.6, `rgba(${c.r},${c.g},${c.b},${0.35 * alpha})`, 1.5);

            // Tick marks
            for (let i = 0; i < 36; i++) {
                const angle = (i / 36) * Math.PI * 2 + t * 0.1;
                const r1 = cx - 8;
                const r2 = i % 3 === 0 ? cx - 2 : cx - 5;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
                ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
                ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${(i % 3 === 0 ? 0.6 : 0.3) * alpha})`;
                ctx.lineWidth = i % 3 === 0 ? 1.5 : 0.8;
                ctx.stroke();
            }

            // Center glow
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx * 0.4);
            grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${0.15 * alpha * pulse})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, cx * 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Expanding pulse rings when active
            if (state === 'listening' || state === 'speaking') {
                const pulseRadius = ((t * 30) % (cx - 10)) + 10;
                const pulseAlpha = 1 - pulseRadius / (cx - 10);
                ctx.beginPath();
                ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${pulseAlpha * 0.5})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Data readout lines
            const lineCount = 4;
            for (let i = 0; i < lineCount; i++) {
                const angle = (i / lineCount) * Math.PI * 2 + t * 0.2;
                const r = cx - 65;
                const lx = cx + Math.cos(angle) * r;
                const ly = cy + Math.sin(angle) * r;
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(lx + Math.cos(angle) * 15, ly + Math.sin(angle) * 15);
                ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${0.5 * alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            animRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animRef.current);
    }, [size, isActive, state]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="pointer-events-none"
            style={{ width: size, height: size }}
        />
    );
};

export default HUDRings;
