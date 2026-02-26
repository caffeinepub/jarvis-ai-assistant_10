import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Loader2, AlertCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLogin } from '../hooks/useQueries';
import HolographicBackground from '../components/HolographicBackground';
import PasswordInput from '../components/PasswordInput';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { identity, login: iiLogin, isInitializing } = useInternetIdentity();
    const loginMutation = useLogin();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    // If not authenticated with II, trigger login
    useEffect(() => {
        if (!isInitializing && !identity) {
            // Auto-trigger II login to get a principal
        }
    }, [isInitializing, identity]);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            await iiLogin();
        } catch {
            setError('Failed to connect. Please try again.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identity) {
            setError('Please connect your identity first.');
            return;
        }
        setError('');
        try {
            await loginMutation.mutateAsync({ email, password });
            navigate({ to: '/transition' });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Login failed';
            if (msg.includes('Account not found')) {
                setError('No account found. Please register first.');
            } else if (msg.includes('Invalid credentials')) {
                setError('Invalid email or password.');
            } else {
                setError(msg);
            }
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-jarvis-dark">
            <HolographicBackground />

            {/* Animated corner decorations */}
            <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-jarvis-cyan/50 animate-pulse-cyan" />
            <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-jarvis-cyan/50 animate-pulse-cyan" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-jarvis-cyan/50 animate-pulse-cyan" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-jarvis-cyan/50 animate-pulse-cyan" />

            {/* Main form */}
            <div className="relative z-10 w-full max-w-md px-4 animate-power-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block relative">
                        <img
                            src="/assets/generated/arc-reactor-logo.dim_256x256.png"
                            alt="JARVIS"
                            className="w-20 h-20 mx-auto mb-4 animate-float"
                            style={{ filter: 'drop-shadow(0 0 20px rgba(0,229,255,0.8))' }}
                        />
                        <div className="absolute inset-0 rounded-full animate-expand-ring border border-jarvis-cyan/30" />
                    </div>
                    <h1 className="font-orbitron text-3xl font-bold text-cyan-jarvis text-glow-cyan tracking-widest">
                        J.A.R.V.I.S
                    </h1>
                    <p className="text-muted-foreground font-rajdhani text-sm tracking-widest mt-1">
                        SYSTEM ACCESS REQUIRED
                    </p>
                </div>

                {/* Form panel */}
                <div
                    className="rounded-sm p-6 space-y-5"
                    style={{
                        background: 'rgba(6, 10, 20, 0.9)',
                        border: '1px solid rgba(0, 229, 255, 0.3)',
                        boxShadow: '0 0 40px rgba(0,229,255,0.1), inset 0 0 40px rgba(0,229,255,0.03)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <div className="text-center">
                        <h2 className="font-orbitron text-sm tracking-widest text-cyan-jarvis uppercase">
                            Authentication Portal
                        </h2>
                        <div className="mt-2 h-px bg-gradient-to-r from-transparent via-jarvis-cyan/50 to-transparent" />
                    </div>

                    {/* Step 1: Connect Identity */}
                    {!identity ? (
                        <div className="space-y-4">
                            <p className="text-sm font-rajdhani text-muted-foreground text-center">
                                Connect your identity to access the system
                            </p>
                            <button
                                type="button"
                                onClick={handleConnect}
                                disabled={isConnecting || isInitializing}
                                className="w-full py-3 rounded-sm jarvis-btn flex items-center justify-center gap-2 text-sm"
                            >
                                {isConnecting || isInitializing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : null}
                                {isInitializing ? 'INITIALIZING...' : isConnecting ? 'CONNECTING...' : 'CONNECT IDENTITY'}
                            </button>
                        </div>
                    ) : (
                        /* Step 2: Login form */
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1">
                                <label htmlFor="login-email" className="text-xs font-orbitron tracking-widest text-muted-foreground uppercase">
                                    Email
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="user@domain.com"
                                    required
                                    className="w-full px-4 py-3 rounded-sm jarvis-input"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="login-password" className="text-xs font-orbitron tracking-widest text-muted-foreground uppercase">
                                    Password
                                </label>
                                <PasswordInput
                                    id="login-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-sm bg-destructive/10 border border-destructive/30 text-destructive text-sm font-rajdhani">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="w-full py-3 rounded-sm jarvis-btn flex items-center justify-center gap-2 text-sm"
                            >
                                {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loginMutation.isPending ? 'AUTHENTICATING...' : 'INITIATE ACCESS'}
                            </button>
                        </form>
                    )}

                    <div className="text-center pt-2 border-t border-jarvis-cyan/10">
                        <p className="text-xs font-rajdhani text-muted-foreground">
                            No account?{' '}
                            <Link to="/register" className="text-cyan-jarvis hover:text-glow-cyan transition-all">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Bottom data readout */}
                <div className="mt-4 flex justify-between text-[10px] font-mono-tech text-muted-foreground opacity-50">
                    <span>SYS.AUTH v3.0</span>
                    <span>SECURE CHANNEL</span>
                    <span>ENCRYPTED</span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
