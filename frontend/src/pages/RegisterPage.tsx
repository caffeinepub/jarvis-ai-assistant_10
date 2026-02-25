import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRegister } from '../hooks/useQueries';
import HolographicBackground from '../components/HolographicBackground';
import PasswordInput from '../components/PasswordInput';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { identity, login: iiLogin, isInitializing } = useInternetIdentity();
    const registerMutation = useRegister();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identity) {
            setError('Please connect your identity first.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setError('');
        try {
            await registerMutation.mutateAsync({ username, email, password });
            setSuccess(true);
            setTimeout(() => navigate({ to: '/login' }), 2000);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Registration failed';
            if (msg.includes('already exists')) {
                setError('An account already exists for this identity. Please login.');
            } else {
                setError(msg);
            }
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-jarvis-dark">
            <HolographicBackground />

            {/* Animated corner decorations */}
            <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-jarvis-gold/50 animate-pulse-gold" />
            <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-jarvis-gold/50 animate-pulse-gold" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-jarvis-gold/50 animate-pulse-gold" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-jarvis-gold/50 animate-pulse-gold" />

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-jarvis-gold/40"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md px-4 animate-power-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img
                        src="/assets/generated/arc-reactor-logo.dim_256x256.png"
                        alt="JARVIS"
                        className="w-16 h-16 mx-auto mb-4 animate-float"
                        style={{ filter: 'drop-shadow(0 0 15px rgba(255,167,38,0.8))' }}
                    />
                    <h1 className="font-orbitron text-2xl font-bold text-gold-jarvis text-glow-gold tracking-widest">
                        NEW USER REGISTRATION
                    </h1>
                    <p className="text-muted-foreground font-rajdhani text-sm tracking-widest mt-1">
                        CREATE YOUR JARVIS PROFILE
                    </p>
                </div>

                <div
                    className="rounded-sm p-6 space-y-4"
                    style={{
                        background: 'rgba(6, 10, 20, 0.9)',
                        border: '1px solid rgba(255, 167, 38, 0.3)',
                        boxShadow: '0 0 40px rgba(255,167,38,0.08), inset 0 0 40px rgba(255,167,38,0.02)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <div className="text-center">
                        <h2 className="font-orbitron text-sm tracking-widest text-gold-jarvis uppercase">
                            Identity Registration
                        </h2>
                        <div className="mt-2 h-px bg-gradient-to-r from-transparent via-jarvis-gold/50 to-transparent" />
                    </div>

                    {success ? (
                        <div className="text-center py-6 space-y-3">
                            <CheckCircle className="w-12 h-12 text-jarvis-green mx-auto" />
                            <p className="font-orbitron text-sm text-jarvis-green tracking-wider">
                                REGISTRATION SUCCESSFUL
                            </p>
                            <p className="text-muted-foreground font-rajdhani text-sm">
                                Redirecting to login...
                            </p>
                        </div>
                    ) : !identity ? (
                        <div className="space-y-4">
                            <p className="text-sm font-rajdhani text-muted-foreground text-center">
                                Connect your identity to register
                            </p>
                            <button
                                onClick={handleConnect}
                                disabled={isConnecting || isInitializing}
                                className="w-full py-3 rounded-sm jarvis-btn-gold flex items-center justify-center gap-2 text-sm"
                            >
                                {(isConnecting || isInitializing) && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isInitializing ? 'INITIALIZING...' : isConnecting ? 'CONNECTING...' : 'CONNECT IDENTITY'}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-orbitron tracking-widest text-muted-foreground uppercase">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="Your name"
                                    required
                                    className="w-full px-4 py-3 rounded-sm jarvis-input"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-orbitron tracking-widest text-muted-foreground uppercase">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="user@domain.com"
                                    required
                                    className="w-full px-4 py-3 rounded-sm jarvis-input"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-orbitron tracking-widest text-muted-foreground uppercase">
                                    Password
                                </label>
                                <PasswordInput
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-orbitron tracking-widest text-muted-foreground uppercase">
                                    Confirm Password
                                </label>
                                <PasswordInput
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat password"
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
                                disabled={registerMutation.isPending}
                                className="w-full py-3 rounded-sm jarvis-btn-gold flex items-center justify-center gap-2 text-sm"
                            >
                                {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                {registerMutation.isPending ? 'REGISTERING...' : 'CREATE PROFILE'}
                            </button>
                        </form>
                    )}

                    <div className="text-center pt-2 border-t border-jarvis-gold/10">
                        <p className="text-xs font-rajdhani text-muted-foreground">
                            Already registered?{' '}
                            <Link to="/login" className="text-gold-jarvis hover:text-glow-gold transition-all">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
