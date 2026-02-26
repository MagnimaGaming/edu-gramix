import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider, db } from '../firebaseConfig'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    getRedirectResult
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useAuth } from '../hooks/useAuth'

// ── Particle background (pure CSS-driven) ──────────────────────────────
function Particles() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {Array.from({ length: 60 }).map((_, i) => (
                <span
                    key={i}
                    className="particle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 8}s`,
                        animationDuration: `${6 + Math.random() * 10}s`,
                        width: `${1 + Math.random() * 2}px`,
                        height: `${1 + Math.random() * 2}px`,
                        opacity: 0.3 + Math.random() * 0.5,
                    }}
                />
            ))}
        </div>
    )
}

// ── Neon input field ─────────────────────────────────────────────────
function NeonInput({ label, type = 'text', value, onChange, required = true }) {
    return (
        <div className="relative group">
            <input
                type={type}
                required={required}
                value={value}
                onChange={onChange}
                placeholder=" "
                className="peer w-full bg-transparent border-b border-white/20 py-3 pt-6 text-white text-sm outline-none focus:border-[#00f5ff] transition-colors duration-300 autofill:bg-transparent"
            />
            <label className="absolute left-0 top-5 text-white/30 text-xs font-bold tracking-[0.18em] uppercase peer-placeholder-shown:top-5 peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-[#00f5ff] peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:text-[10px] transition-all duration-300 pointer-events-none">
                {label}
            </label>
            <div className="absolute bottom-0 left-0 h-px w-0 bg-[#00f5ff] group-focus-within:w-full transition-all duration-500 shadow-[0_0_8px_#00f5ff]" />
        </div>
    )
}

export default function AuthPage() {
    const navigate = useNavigate()
    const { user, profile, loading: authLoading } = useAuth()
    const [mode, setMode] = useState('login') // 'login' | 'signup'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')

    // ── Handle Google redirect result on mount ────────────────────────
    useEffect(() => {
        getRedirectResult(auth).then(async (result) => {
            if (result?.user) {
                const userDoc = await getDoc(doc(db, 'users', result.user.uid))
                if (!userDoc.exists()) {
                    navigate('/onboarding')
                } else {
                    navigate('/dashboard')
                }
            }
        }).catch(err => {
            console.error('Redirect Error:', err)
        })
    }, [navigate])

    useEffect(() => {
        if (user && !authLoading) {
            if (profile?.profileCompleted) {
                navigate('/dashboard', { replace: true })
            } else if (profile) {
                navigate('/onboarding', { replace: true })
            }
        }
    }, [user, profile, authLoading, navigate])


    // ── Login ─────────────────────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault()
        setError(''); setSuccess('')
        setLoading(true)
        try {
            await signInWithEmailAndPassword(auth, email, password)
            setSuccess('Neural Access Granted! Synchronizing...')
            // Navigation handled by useEffect
        } catch (err) {
            setError('Access Denied: ' + err.message.replace('Firebase:', ''))
        } finally {
            setLoading(false)
        }
    }

    // ── Signup → create account instantly ──────────────────────────────
    const handleSignup = async (e) => {
        e.preventDefault()
        setError(''); setSuccess('')

        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password)

            // Initialize empty profile
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                createdAt: new Date().toISOString(),
                profileCompleted: false,
                displayName: '', // Initialized later in onboarding
                targetRole: ''
            })

            setSuccess('Core account created! Initializing profile...')
            setTimeout(() => navigate('/onboarding'), 1500)
        } catch (err) {
            setError('Account creation failed: ' + err.message.replace('Firebase:', ''))
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        setError(''); setSuccess('')
        setLoading(true)
        try {
            const { user } = await signInWithPopup(auth, googleProvider)
            const userDoc = await getDoc(doc(db, 'users', user.uid))

            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    displayName: user.displayName || '',
                    createdAt: new Date().toISOString(),
                    profileCompleted: false
                })
                setSuccess('Google session verified. Initializing...')
                setTimeout(() => navigate('/onboarding'), 1500)
            } else {
                setSuccess('Google session verified. Resuming...')
                setTimeout(() => navigate('/dashboard'), 1000)
            }
        } catch (err) {
            setError('Google authentication failed: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center overflow-hidden relative">
            <Particles />

            {/* Radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#00f5ff] opacity-[0.04] blur-[130px] pointer-events-none" />

            {/* Logo */}
            <a href="/" className="absolute top-8 left-8 font-black text-xl tracking-tight text-white z-20">
                Edu<span className="text-[#00f5ff]">Gramix</span>
            </a>

            {/* Floating card */}
            <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div
                    className="rounded-3xl border border-white/[0.08] p-8 md:p-10"
                    style={{
                        background: 'rgba(13,13,13,0.85)',
                        backdropFilter: 'blur(28px)',
                        WebkitBackdropFilter: 'blur(28px)',
                        boxShadow: '0 0 60px rgba(0,245,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                >
                    {/* Top line glow */}
                    <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#00f5ff]/40 to-transparent rounded-full" />

                    {/* Header */}
                    <div className="text-center mb-8">
                        <p className="text-[10px] tracking-[0.3em] text-[#00f5ff]/60 uppercase font-bold mb-2 font-mono">
                            EduGramix // Neural Auth
                        </p>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                            {mode === 'login' ? 'Welcome Back' : 'Join the Evolution'}
                        </h1>
                    </div>

                    {/* Mode toggle tabs */}
                    <div className="flex mb-8 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
                        {['login', 'signup'].map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                                className={`flex-1 py-2 text-xs font-bold tracking-[0.14em] uppercase rounded-lg transition-all duration-300 ${mode === m
                                    ? 'bg-[#00f5ff] text-[#050505] shadow-[0_0_20px_rgba(0,245,255,0.4)]'
                                    : 'text-white/40 hover:text-white/70'
                                    }`}
                            >
                                {m === 'login' ? 'Login' : 'Sign Up'}
                            </button>
                        ))}
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-5 px-4 py-3 rounded-xl text-xs text-red-400 border border-red-400/20 bg-red-400/5"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Success */}
                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="mb-5 px-4 py-4 rounded-xl text-sm text-[#00f5ff] border border-[#00f5ff]/20 bg-[#00f5ff]/5 text-center leading-relaxed"
                            >
                                <span className="block text-xl mb-2">✓</span>
                                {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Forms */}
                    {!success && (
                        <AnimatePresence mode="wait">
                            <motion.form
                                key={mode}
                                initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                                transition={{ duration: 0.25 }}
                                onSubmit={mode === 'login' ? handleLogin : handleSignup}
                                className="space-y-6"
                            >
                                <NeonInput
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <NeonInput
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                {mode === 'signup' && (
                                    <NeonInput
                                        label="Confirm Password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-4 font-black text-sm tracking-[0.18em] uppercase rounded-xl border-2 border-[#00f5ff] text-[#00f5ff] relative overflow-hidden btn-neon disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                    style={{ boxShadow: '0 0 20px rgba(0,245,255,0.2)' }}
                                >
                                    <span>
                                        {loading
                                            ? 'Processing…'
                                            : mode === 'login'
                                                ? 'Access Core'
                                                : 'Create Account'}
                                    </span>
                                </motion.button>
                            </motion.form>
                        </AnimatePresence>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/[0.07]" />
                        <span className="text-white/20 text-[10px] tracking-widest uppercase font-bold">Or</span>
                        <div className="flex-1 h-px bg-white/[0.07]" />
                    </div>

                    {/* Google */}
                    <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/70 text-sm font-semibold hover:bg-white/[0.07] hover:text-white transition-all duration-200 disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Footer toggle */}
                    <p className="text-center text-white/30 text-xs mt-6">
                        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                        <button
                            type="button"
                            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
                            className="ml-2 text-[#00f5ff] hover:underline font-semibold"
                        >
                            {mode === 'login' ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
