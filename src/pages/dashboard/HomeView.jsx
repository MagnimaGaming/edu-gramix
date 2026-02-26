import { motion } from 'framer-motion'

// Removed hardcoded mock data

function ScoreGauge({ score = 74 }) {
    const r = 60
    const circ = 2 * Math.PI * r
    const offset = circ - (score / 100) * circ

    return (
        <div className="relative flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44">
            <svg width="100%" height="100%" viewBox="0 0 160 160" className="-rotate-90">
                <circle cx="80" cy="80" r={r} stroke="rgba(255,255,255,0.03)" strokeWidth="10" fill="none" />
                <motion.circle
                    cx="80" cy="80" r={r}
                    stroke="url(#gaugeGrad)" strokeWidth="10" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{ filter: 'drop-shadow(0 0 8px #00f5ff40)' }}
                />
                <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#003c42" />
                        <stop offset="100%" stopColor="#00f5ff" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
                <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                    className="text-3xl sm:text-4xl font-black text-white tabular-nums"
                >{score}<span className="text-lg text-white/30 ml-0.5">%</span></motion.span>
                <span className="text-[8px] tracking-[0.25em] text-[#00f5ff]/60 uppercase font-black">Velocity</span>
            </div>
        </div>
    )
}

const itemEntry = (delay) => ({
    initial: { opacity: 0, scale: 0.95, y: 15 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
})

export default function HomeView({ profile }) {
    // ── Safe date parser for Firestore Timestamps ──
    const safeDate = (val) => {
        if (!val) return new Date()
        if (val.toDate) return val.toDate()
        return new Date(val)
    }

    // ── Dynamic Data Calculation ──
    const targetRole = profile?.targetRole || 'Software Engineer'
    const skillsFound = profile?.skills || []

    // Derived from history
    const intHistory = profile?.interviewHistory || []
    const auditHistory = profile?.auditHistory || []

    // Activity timeline (combine latest 4)
    const combinedActivity = [
        ...intHistory.map(h => ({ type: 'interview', date: safeDate(h.date), score: h.score || 0, label: `Mock Interview — ${h.role || 'General'}` })),
        ...auditHistory.map(a => ({ type: 'audit', date: safeDate(a.date), score: Math.round(a.score || 0), label: 'Resume Audit' }))
    ].sort((a, b) => b.date - a.date).slice(0, 4)

    const activityData = combinedActivity.map((a, i) => {
        // Find previous score of same type
        const prevItems = combinedActivity.slice(i + 1).filter(p => p.type === a.type)
        const prev = prevItems.length > 0 ? prevItems[0].score : a.score

        let tag = 'BASELINE'
        if (a.score > prev) tag = 'IMPROVED'
        if (a.score < prev) tag = 'NEEDS WORK'
        if (a.type === 'audit' && a.score === prev) tag = 'UPDATED'

        return {
            date: a.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            label: a.label,
            score: a.score,
            prev,
            tag
        }
    })

    // Velocity / Score calculation
    const lastInt = intHistory.length > 0 ? (intHistory[0].score || 0) : 0
    const lastAudit = auditHistory.length > 0 ? Math.round(auditHistory[0].score || 0) : 0
    let velocity = 0
    if (lastInt && lastAudit) velocity = Math.round((lastInt + lastAudit) / 2)
    else if (lastInt) velocity = lastInt
    else if (lastAudit) velocity = lastAudit

    // Calculate confidence delta (compare two most recent scores)
    const allScores = combinedActivity.map(a => a.score)
    const currentScore = allScores[0] || 0
    const previousScore = allScores[1] || currentScore

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div {...itemEntry(0)}>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-[2px] bg-[#00f5ff] shadow-[0_0_8px_#00f5ff]" />
                        <p className="text-[10px] tracking-[0.4em] text-[#00f5ff] uppercase font-black font-mono">Employability Velocity</p>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-tight">
                        Command <span className="text-white/20">Center.</span>
                    </h1>
                </motion.div>

                <motion.div {...itemEntry(0.1)} className="flex items-center gap-8 px-6 py-4 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
                    <div className="space-y-1 text-right">
                        <p className="text-[9px] tracking-widest text-white/30 uppercase font-bold">Confidence Delta</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-white/40 font-mono">{previousScore}%</span>
                            <span className="text-[#00f5ff]">→</span>
                            <span className="text-xl font-black text-[#00f5ff] shadow-text-neon-cyan">{currentScore}%</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#00f5ff]/10 flex items-center justify-center text-[#00f5ff] text-lg">
                        📈
                    </div>
                </motion.div>
            </div>

            {/* ── BENTO GRID START ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5 auto-rows-[minmax(180px,auto)]">

                {/* 1. Velocity Hero Card (Big) */}
                <motion.div {...itemEntry(0.15)} className="md:col-span-6 lg:col-span-8 row-span-2 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0d0d0d] to-[#050505] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f5ff]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex flex-col sm:flex-row items-center gap-10 h-full">
                        <ScoreGauge score={velocity} />
                        <div className="flex-1 space-y-6 w-full">
                            <div className="space-y-1">
                                <p className="text-[11px] tracking-[0.3em] text-[#00f5ff] uppercase font-black font-mono">Neural Alignment</p>
                                <h3 className="text-2xl font-black text-white tracking-tight leading-none uppercase">{targetRole}</h3>
                                {velocity === 0 ? (
                                    <p className="text-white/30 text-xs font-semibold mt-2 leading-relaxed">System scan pending. Complete a Resume Audit or Mock Interview to generate your velocity score.</p>
                                ) : (
                                    <p className="text-white/30 text-xs font-semibold mt-2 leading-relaxed">System scan tracking aggregate metrics for <span className="text-white">{targetRole}</span> alignment.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {['Resume Strength', 'Interview Skill', 'Role Alignment'].map((label, i) => {
                                    const val = [lastAudit, lastInt, velocity][i] || 0
                                    return (
                                        <div key={label} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase font-black">{label}</span>
                                                <span className="text-xs font-black text-white font-mono">{val}%</span>
                                            </div>
                                            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden p-[1px]">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${val}%` }}
                                                    transition={{ duration: 1.2, delay: 0.5 + i * 0.15 }}
                                                    className="h-full rounded-full bg-gradient-to-r from-[#003c42] to-[#00f5ff]"
                                                    style={{ boxShadow: '0 0 10px #00f5ff40' }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Elite Action Box (High Contrast) */}
                <motion.div {...itemEntry(0.25)} className="md:col-span-6 lg:col-span-4 row-span-2 rounded-3xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/[0.03] p-8 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#ff6b6b]/20" />
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl">🚨</span>
                            <h4 className="text-[11px] tracking-[0.4em] text-[#ff6b6b] uppercase font-black font-mono">Elite Analysis</h4>
                        </div>
                        <p className="text-lg font-black text-white leading-tight mb-4 tracking-tighter uppercase">Metrics Missing in Experience Segment</p>
                        <p className="text-white/40 text-sm font-medium leading-relaxed">Your resume is a <span className="line-through">list of duties</span>. Transform it into a list of <strong className="text-white">achievements</strong> to bypass the ATS filter.</p>

                        <div className="mt-8 space-y-3">
                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                <p className="text-[10px] text-[#ff6b6b]/60 uppercase font-black mb-1">Coach Tip</p>
                                <p className="text-[11px] text-white/60 italic leading-snug">"Add percentages or currency values to every bullet point."</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full py-4 mt-6 border-2 border-[#ff6b6b] text-[#ff6b6b] text-[10px] font-black tracking-[0.3em] uppercase rounded-xl hover:bg-[#ff6b6b] hover:text-white transition-all duration-300">
                        Fix v3 Resume →
                    </button>
                </motion.div>

                {/* 3. Skill Heatmap (Medium) */}
                <motion.div {...itemEntry(0.3)} className="md:col-span-6 lg:col-span-7 row-span-2 rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-[11px] tracking-[0.3em] text-[#00f5ff] uppercase font-black font-mono mb-1">Skill Heatmap</p>
                            <h4 className="text-xl font-black text-white uppercase">Industry Gap Analysis</h4>
                        </div>
                        <div className="p-2 rounded-lg bg-white/[0.04]">
                            💻
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-[10px] tracking-widest text-white/20 uppercase font-black">Synthesized in Profile</p>
                            <div className="flex flex-wrap gap-2">
                                {skillsFound.length > 0 ? skillsFound.map(s => (
                                    <span key={s} className="px-3 py-1.5 rounded-lg border border-[#00f5ff]/30 bg-[#00f5ff]/5 text-[#00f5ff] text-[10px] font-bold shadow-[0_0_10px_rgba(0,245,255,0.05)]">{s}</span>
                                )) : (
                                    <span className="text-[10px] text-white/30 italic">No skills added to profile yet.</span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] tracking-widest text-[#ff6b6b]/40 uppercase font-black">Critically Missing</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] text-white/30 italic">Complete a resume audit to detect missing high-value skills.</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 4. Activity Tracker (Narrow) */}
                <motion.div {...itemEntry(0.35)} className="md:col-span-6 lg:col-span-5 row-span-2 rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-8 overflow-hidden">
                    <p className="text-[11px] tracking-[0.3em] text-[#00f5ff] uppercase font-black font-mono mb-6">Neural Activity</p>
                    <div className="relative space-y-0">
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.05]" />
                        {activityData.length > 0 ? activityData.map((a, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="relative pl-7 pb-6 last:pb-0"
                            >
                                <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-[#0d0d0d] ${a.type === 'interview' ? 'border-[#00f5ff] shadow-[0_0_10px_#00f5ff80]' : 'border-[#4ade80] shadow-[0_0_10px_#4ade8080]'
                                    }`} />
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[9px] text-white/20 tracking-widest uppercase font-bold">{a.date}</p>
                                        <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded bg-white/[0.03] ${a.tag === 'IMPROVED' ? 'text-[#00f5ff]' : a.tag === 'NEEDS WORK' ? 'text-[#ff6b6b]' : 'text-white/40'
                                            }`}>{a.tag}</span>
                                    </div>
                                    <p className="text-sm text-white/70 font-black uppercase tracking-tight">{a.label}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-white/30">SCORE</span>
                                            <span className={`text-sm font-black font-mono ${a.type === 'interview' ? 'text-[#00f5ff]' : 'text-[#4ade80]'}`}>{a.score}%</span>
                                        </div>
                                        {a.prev !== a.score && (
                                            <div className={`px-1.5 py-0.5 rounded ${a.score > a.prev ? 'bg-[#00f5ff]/10' : 'bg-[#ff6b6b]/10'}`}>
                                                <span className={`text-[9px] font-black ${a.score > a.prev ? 'text-[#00f5ff]' : 'text-[#ff6b6b]'}`}>
                                                    {a.score > a.prev ? '+' : ''}{a.score - a.prev}% Δ
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="pl-7 pb-6">
                                <p className="text-[10px] text-white/30 italic">No activity recorded yet.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    )
}
