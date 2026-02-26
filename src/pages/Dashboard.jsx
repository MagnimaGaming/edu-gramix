import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebaseConfig'
import { useAuth } from '../hooks/useAuth'
import HomeView from './dashboard/HomeView'
import ResumeAuditor from './dashboard/ResumeAuditor'
import InterviewSim from './dashboard/InterviewSim'
import ProgressTracker from './dashboard/ProgressTracker'
import AccountView from './dashboard/AccountView'

// ── Sidebar Icons ──────────────────────────────────────────────────────────
const NAV = [
    {
        id: 'home', label: 'Dashboard', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
            </svg>
        )
    },
    {
        id: 'auditor', label: 'Resume Auditor', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        )
    },
    {
        id: 'sim', label: 'Interview Sim', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
            </svg>
        )
    },
    {
        id: 'progress', label: 'Progress Tracker', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    },
    {
        id: 'account', label: 'My Account', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )
    },
]

const VIEWS = { home: HomeView, auditor: ResumeAuditor, sim: InterviewSim, progress: ProgressTracker, account: AccountView }

export default function Dashboard() {
    const navigate = useNavigate()
    const { user, profile, loading } = useAuth()
    const [active, setActive] = useState('home')
    const [status, setStatus] = useState('Online')

    useEffect(() => {
        // Auth bypass enabled: direct access allowed
    }, [navigate])

    useEffect(() => {
        const t = setInterval(() => {
            setStatus(s => s === 'Online' ? 'Syncing' : 'Online')
        }, 6000)
        return () => clearInterval(t)
    }, [])

    const handleLogout = async () => {
        await auth.signOut()
        navigate('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-24 h-24 rounded-full bg-[#00f5ff] blur-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 border-2 border-[#00f5ff]/20 border-t-[#00f5ff] rounded-full z-10 relative shadow-[0_0_15px_rgba(0,245,255,0.3)]"
                    />
                </div>
                <p className="text-[10px] tracking-[0.4em] text-[#00f5ff] uppercase font-bold font-mono animate-pulse">Initializing Neural Core...</p>
            </div>
        )
    }

    const ActiveView = VIEWS[active]

    return (
        <div className="flex h-screen bg-[#050505] overflow-hidden text-[#cccccc]">
            {/* ── Sidebar ────────────────────────────────────────────────── */}
            <aside
                className="relative flex flex-col items-center py-6 gap-2 z-30 shrink-0"
                style={{
                    width: '68px',
                    background: 'rgba(5,5,5,0.95)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                    borderRight: '1px solid rgba(0,245,255,0.08)',
                }}
            >
                {/* Logo mark */}
                <div className="mb-8 p-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f5ff] to-[#003c42] flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.2)]">
                        <span className="text-white font-black text-xs">EG</span>
                    </div>
                </div>

                {/* Nav items */}
                <nav className="flex flex-col gap-4 flex-1">
                    {NAV.map(item => {
                        const isActive = active === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActive(item.id)}
                                title={item.label}
                                className="relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300"
                                style={{
                                    color: isActive ? '#00f5ff' : 'rgba(255,255,255,0.2)',
                                    background: isActive ? 'rgba(0,245,255,0.08)' : 'transparent',
                                }}
                            >
                                <div className={`transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]' : 'group-hover:text-white/40'}`}>
                                    {item.icon}
                                </div>

                                {/* Active indicator glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeGlow"
                                        className="absolute -left-[14px] top-2 bottom-2 w-[3px] rounded-r-full bg-[#00f5ff] shadow-[0_0_12px_rgba(0,245,255,1)]"
                                    />
                                )}

                                {/* Tooltip */}
                                <span className="absolute left-16 bg-[#0d0d0d] border border-[#00f5ff]/20 text-[#00f5ff] text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-2xl translate-x-1 group-hover:translate-x-0">
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </nav>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white/10 hover:text-[#ff6b6b] hover:bg-[#ff6b6b]/10 transition-all duration-300 mb-2"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </aside>

            {/* ── Main Area ─────────────────────────────────────────────── */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top Bar */}
                <header
                    className="flex items-center justify-between px-8 py-5 shrink-0"
                    style={{
                        background: 'rgba(5,5,5,0.8)',
                        backdropFilter: 'blur(40px)',
                        WebkitBackdropFilter: 'blur(40px)',
                        borderBottom: '1px solid rgba(0,245,255,0.05)',
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div className="py-1 px-3 bg-[#00f5ff]/5 border border-[#00f5ff]/10 rounded-full">
                            <p className="text-[9px] tracking-[0.35em] text-[#00f5ff]/60 uppercase font-black font-mono">
                                V1.0 // System.Root // {NAV.find(n => n.id === active)?.label}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Neural Status */}
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                            <motion.div
                                animate={{
                                    scale: status === 'Syncing' ? [1, 1.4, 1] : [1, 1.1, 1],
                                    opacity: status === 'Syncing' ? [1, 0.4, 1] : [0.8, 0.5, 0.8]
                                }}
                                transition={{ duration: status === 'Syncing' ? 0.7 : 3, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                    background: status === 'Online' ? '#00f5ff' : '#00f5ff',
                                    boxShadow: status === 'Online' ? '0 0 8px #00f5ff' : '0 0 12px #00f5ff'
                                }}
                            />
                            <span className="text-[9px] tracking-[0.25em] uppercase font-black font-mono text-white/40">
                                Neural <span className={status === 'Syncing' ? 'text-[#00f5ff]' : 'text-white/60'}>{status}</span>
                            </span>
                        </div>

                        {/* Profile chip */}
                        <div className="flex items-center gap-3 pl-4 border-l border-white/[0.05]">
                            <div className="flex flex-col items-end hidden sm:block">
                                <span className="text-white/80 text-[11px] font-black tracking-tight leading-none">
                                    {profile?.displayName || user?.email?.split('@')[0]}
                                </span>
                                <span className="text-white/20 text-[8px] font-bold uppercase tracking-widest mt-1">
                                    {profile?.targetRole || 'Initializing...'}
                                </span>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00f5ff]/20 to-transparent border border-[#00f5ff]/20 flex items-center justify-center text-[#00f5ff] text-xs font-black shadow-[0_0_15px_rgba(0,245,255,0.05)]">
                                {(profile?.displayName?.[0] || user?.email?.[0] || '?').toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <ActiveView profile={profile} />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Global Background Glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-[#00f5ff] opacity-[0.02] blur-[180px] pointer-events-none z-0" />
        </div>
    )
}
