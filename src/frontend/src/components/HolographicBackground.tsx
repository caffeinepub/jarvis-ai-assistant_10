import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
}

const HolographicBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Initialize particles
        const colors = ['#00e5ff', '#00bcd4', '#0097a7', '#ffa726'];
        particlesRef.current = Array.from({ length: 80 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.6 + 0.1,
            color: colors[Math.floor(Math.random() * colors.length)],
        }));

        let time = 0;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 0.005;

            // Draw hex grid
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
            ctx.lineWidth = 0.5;
            const hexSize = 40;
            const hexH = hexSize * Math.sqrt(3);
            for (let row = -1; row < canvas.height / hexH + 2; row++) {
                for (let col = -1; col < canvas.width / (hexSize * 1.5) + 2; col++) {
                    const x = col * hexSize * 1.5;
                    const y = row * hexH + (col % 2 === 0 ? 0 : hexH / 2);
                    ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI / 3) * i - Math.PI / 6;
                        const px = x + hexSize * Math.cos(angle);
                        const py = y + hexSize * Math.sin(angle);
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
            }

            // Draw radial glow
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(canvas.width, canvas.height) * 0.6);
            grad.addColorStop(0, `rgba(0, 229, 255, ${0.04 + Math.sin(time) * 0.02})`);
            grad.addColorStop(0.5, 'rgba(0, 188, 212, 0.02)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw scan line
            const scanY = ((time * 80) % (canvas.height + 100)) - 50;
            const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
            scanGrad.addColorStop(0, 'transparent');
            scanGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.06)');
            scanGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = scanGrad;
            ctx.fillRect(0, scanY - 20, canvas.width, 40);

            // Update and draw particles
            particlesRef.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
                ctx.fill();
            });

            // Draw connecting lines between nearby particles
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.06)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particlesRef.current.length; i++) {
                for (let j = i + 1; j < particlesRef.current.length; j++) {
                    const dx = particlesRef.current[i].x - particlesRef.current[j].x;
                    const dy = particlesRef.current[i].y - particlesRef.current[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.globalAlpha = (1 - dist / 100) * 0.3;
                        ctx.beginPath();
                        ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
                        ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;

            animFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            {/* HUD background image */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: 'url(/assets/generated/hud-background.dim_1920x1080.png)' }}
            />
            {/* Canvas for dynamic effects */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ mixBlendMode: 'screen' }}
            />
            {/* Scanlines overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.015) 2px, rgba(0,229,255,0.015) 4px)',
                }}
            />
        </div>
    );
};

export default HolographicBackground;
