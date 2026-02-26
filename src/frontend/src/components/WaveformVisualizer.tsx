import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
    state: 'idle' | 'listening' | 'processing' | 'speaking' | 'wake-listening';
    width?: number;
    height?: number;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
    state,
    width = 300,
    height = 80,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const timeRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = width;
        canvas.height = height;

        const barCount = 48;
        const barWidth = width / barCount - 1;

        const getColor = () => {
            switch (state) {
                case 'listening': return { r: 0, g: 229, b: 255 };
                case 'speaking': return { r: 0, g: 200, b: 150 };
                case 'processing': return { r: 255, g: 167, b: 38 };
                case 'wake-listening': return { r: 100, g: 200, b: 255 };
                default: return { r: 0, g: 150, b: 180 };
            }
        };

        const getBarHeight = (i: number, t: number): number => {
            const center = barCount / 2;
            const distFromCenter = Math.abs(i - center) / center;

            switch (state) {
                case 'listening': {
                    const wave1 = Math.sin(t * 4 + i * 0.4) * 0.5 + 0.5;
                    const wave2 = Math.sin(t * 6 + i * 0.3) * 0.3 + 0.3;
                    const envelope = 1 - distFromCenter * 0.5;
                    return (wave1 * 0.6 + wave2 * 0.4) * envelope * height * 0.85;
                }
                case 'speaking': {
                    const wave = Math.sin(t * 8 + i * 0.5) * 0.5 + 0.5;
                    const wave2 = Math.sin(t * 5 + i * 0.2) * 0.3 + 0.3;
                    const envelope = Math.sin((i / barCount) * Math.PI);
                    return (wave * 0.7 + wave2 * 0.3) * envelope * height * 0.9;
                }
                case 'processing': {
                    const progress = (t * 2) % 1;
                    const wave = Math.sin(t * 10 + i * 0.6) * 0.3 + 0.3;
                    const sweep = Math.max(0, 1 - Math.abs(i / barCount - progress) * 5);
                    return (wave + sweep * 0.5) * height * 0.7;
                }
                case 'wake-listening': {
                    const wave = Math.sin(t * 2 + i * 0.3) * 0.2 + 0.25;
                    return wave * height * 0.5;
                }
                default: {
                    const wave = Math.sin(t * 1.5 + i * 0.4) * 0.1 + 0.12;
                    return wave * height * 0.4;
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            timeRef.current += 0.016;
            const t = timeRef.current;
            const c = getColor();

            for (let i = 0; i < barCount; i++) {
                const barH = getBarHeight(i, t);
                const x = i * (barWidth + 1);
                const y = (height - barH) / 2;

                const grad = ctx.createLinearGradient(x, y, x, y + barH);
                grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},0.3)`);
                grad.addColorStop(0.5, `rgba(${c.r},${c.g},${c.b},0.9)`);
                grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0.3)`);

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, barH, 2);
                ctx.fill();
            }

            // Center line
            ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.2)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.stroke();

            animRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animRef.current);
    }, [state, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="rounded"
            style={{ width, height }}
        />
    );
};

export default WaveformVisualizer;
