import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const NAV_LINKS = ['Features', 'How It Works', 'Pricing', 'Blog']

export default function Hero() {
    const navigate = useNavigate()
    return (
        <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#050505]">
            {/* Background grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(0,245,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.8) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#00f5ff] opacity-[0.04] blur-[120px] pointer-events-none" />

            {/* ── Nav ── */}
            <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="font-display font-black text-xl tracking-tight"
                >
                    Edu<span className="text-[#00f5ff]">Gramix</span>
                </motion.div>

                <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="hidden md:flex items-center gap-8"
                >
                    {NAV_LINKS.map((link) => (
                        <li key={link}>
                            <a
                                href="#"
                                className="text-sm font-medium text-white/50 hover:text-white transition-colors duration-200 tracking-wide"
                            >
                                {link}
                            </a>
                        </li>
                    ))}
                </motion.ul>

                <motion.button
                    onClick={() => navigate('/auth')}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-sm font-semibold px-5 py-2.5 border border-[#00f5ff]/30 rounded-full text-[#00f5ff] hover:bg-[#00f5ff]/10 hover:border-[#00f5ff]/60 transition-all duration-200 shadow-[0_0_15px_rgba(0,245,255,0.1)]"
                >
                    GetStarted
                </motion.button>
            </nav>

            {/* ── Hero Body ── */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-24">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00f5ff]/20 bg-[#00f5ff]/5 text-[#00f5ff] text-xs font-bold tracking-[0.2em] uppercase"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff] animate-pulse" />
                    AI-Powered · 2026 Edition
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display font-black text-[clamp(2.8rem,8vw,7rem)] leading-[0.95] tracking-tight mb-6"
                >
                    <span className="neon-gradient">Interview.</span>
                    <br />
                    <span className="text-white">Evolved.</span>
                </motion.h1>

                {/* Subtext */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.55 }}
                    className="max-w-lg text-[clamp(1rem,2vw,1.2rem)] text-white/50 leading-relaxed mb-12"
                >
                    Not practice. Simulation.
                    <br />
                    AI that audits your every word, pause, and posture.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center gap-4"
                >
                    {/* Primary neon button */}
                    <button
                        onClick={() => navigate('/auth')}
                        className="btn-neon relative px-10 py-4 text-sm font-black tracking-[0.15em] uppercase text-[#00f5ff] border-2 border-[#00f5ff] rounded-sm shadow-neon-cyan hover:shadow-neon-cyan transition-shadow duration-300"
                    >
                        <span>Get Started Free</span>
                    </button>

                    {/* Secondary ghost */}
                    <button className="px-8 py-4 text-sm font-semibold tracking-wide text-white/40 hover:text-white/70 transition-colors duration-200 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        Watch Demo
                    </button>
                </motion.div>

                {/* Social proof */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="mt-16 flex flex-col sm:flex-row items-center gap-6 text-white/25 text-xs font-medium tracking-widest uppercase"
                >
                    <span>Trusted by 10,000+ candidates</span>
                    <span className="hidden sm:block w-px h-4 bg-white/10" />
                    <span>87% interview success rate</span>
                    <span className="hidden sm:block w-px h-4 bg-white/10" />
                    <span>Fortune 500 Ready</span>
                </motion.div>
            </div>

            {/* Scroll cue */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5">
                    <motion.div
                        animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-0.5 h-2 bg-white/40 rounded-full"
                    />
                </div>
                <span className="text-[10px] tracking-[0.3em] text-white/20 uppercase">Scroll</span>
            </motion.div>
        </section>
    )
}
