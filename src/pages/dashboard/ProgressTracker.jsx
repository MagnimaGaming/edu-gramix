import { motion } from 'framer-motion'

// Removed hardcoded MILESTONES array

function MilestoneCard({ item, index, totalMilestones }) {
    const isLocked = item.status === 'locked'
    const isCurrent = item.status === 'current'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-8 rounded-3xl border transition-all duration-500 ${isLocked ? 'border-white/[0.04] bg-white/[0.01] opacity-40' :
                isCurrent ? 'border-[#00f5ff]/40 bg-[#00f5ff]/[0.02] shadow-[0_0_40px_rgba(0,245,255,0.03)]' :
                    'border-white/[0.08] bg-[#0d0d0d] hover:border-[#00f5ff]/20'
                }`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <p className={`text-[8px] font-black tracking-[0.3em] uppercase font-mono ${isLocked ? 'text-white/20' : 'text-[#00f5ff]/60'}`}>
                        {item.date} // Step 0{item.id}
                    </p>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">{item.title}</h4>
                </div>
                {item.score && (
                    <div className="px-3 py-1 bg-[#00f5ff]/10 rounded-lg">
                        <span className="text-sm font-black text-[#00f5ff] font-mono">{item.score}%</span>
                    </div>
                )}
                {isLocked && <span className="text-xl">🔒</span>}
                {isCurrent && (
                    <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="px-3 py-1 bg-[#ffd93d]/10 border border-[#ffd93d]/30 rounded-lg text-[8px] font-black text-[#ffd93d] uppercase tracking-widest"
                    >
                        In Progress
                    </motion.span>
                )}
            </div>

            <p className="text-white/40 text-sm font-medium leading-relaxed">{item.desc}</p>

            {/* Visual connector */}
            {index < (totalMilestones || 0) - 1 && (
                <div className="absolute left-1/2 -bottom-10 w-px h-10 bg-gradient-to-b from-white/[0.1] to-transparent hidden xl:block" />
            )}
        </motion.div>
    )
}

export default function ProgressTracker({ profile }) {
    // ── Helper: safely parse Firestore Timestamp or ISO string ──
    const safeDate = (val) => {
        if (!val) return null
        if (val.toDate) return val.toDate() // Firestore Timestamp
        return new Date(val)
    }

    // ── Generate dynamic milestones ──
    const milestones = []
    let step = 1

    // Step 1: Profile Initialization
    const createdDate = safeDate(profile?.createdAt)
    milestones.push({
        id: step++,
        title: 'Neural Initialization',
        date: createdDate ? createdDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Registered',
        status: 'completed',
        score: 100,
        desc: 'Profile matrix synchronization complete. Target role configured.'
    })

    const audits = profile?.auditHistory || []
    const interviews = profile?.interviewHistory || []
    const totalSims = audits.length + interviews.length

    // Sort all actions chronologically
    const allActions = [
        ...audits.map(a => ({ type: 'audit', ...a })),
        ...interviews.map(i => ({ type: 'interview', ...i }))
    ].sort((a, b) => (safeDate(a.date) || 0) - (safeDate(b.date) || 0))

    // Add up to 4 historical actions
    allActions.slice(0, 4).forEach(action => {
        const isAudit = action.type === 'audit'
        const actionDate = safeDate(action.date)
        milestones.push({
            id: step++,
            title: isAudit ? 'Resume Audit' : `Interview: ${action.role || 'General'}`,
            date: actionDate ? actionDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent',
            status: 'completed',
            score: Math.round(action.score || 0),
            desc: isAudit ? 'Document parsed and evaluated against industry standards.' : `Simulation completed with ${action.questionsAnswered || 0} questions.`
        })
    })

    // Next Action
    milestones.push({
        id: step++,
        title: totalSims === 0 ? 'First Simulation Required' : 'Advanced Alignment',
        date: 'Ongoing',
        status: 'current',
        score: null,
        desc: totalSims === 0 ? 'Complete a Resume Audit or Mock Interview to begin tracking.' : 'Continuing evaluation to build aggregate baseline.'
    })

    // Locked Goal
    milestones.push({
        id: step++,
        title: 'Final Certification',
        date: 'Locked',
        status: 'locked',
        score: null,
        desc: 'Unlock by maintaining >85% aggregate score across 5+ simulations.'
    })

    const completedCount = milestones.filter(m => m.status === 'completed').length
    const totalCount = milestones.length
    const progressPercent = Math.round((completedCount / totalCount) * 100)

    // Calculate generic stats
    const avgScore = totalSims > 0 ? Math.round(allActions.reduce((acc, val) => acc + val.score, 0) / totalSims) : 0
    const timeSpent = Math.max(0.5, Math.round((totalSims * 15) / 60 * 10) / 10) // rough estimate: 15min per sim
    const tier = avgScore >= 90 ? 'Diamond' : avgScore >= 75 ? 'Gold' : avgScore >= 50 ? 'Silver' : 'Bronze'

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            {/* Header & Main Stat */}
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-[2px] bg-[#00f5ff] shadow-[0_0_8px_#00f5ff]" />
                            <p className="text-[10px] tracking-[0.4em] text-[#00f5ff] uppercase font-black font-mono">Performance Analytics</p>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight uppercase leading-none">Neural <span className="text-white/20">Progression.</span></h2>
                    </div>

                    <p className="text-white/30 text-base max-w-xl leading-relaxed">
                        Your employability evolution is tracked in real-time. Reach <span className="text-white font-bold">90% aggregate score</span> across all simulations to unlock Tier-1 Referral privileges.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Avg score', val: `${avgScore}%` },
                            { label: 'Est. Time', val: `${timeSpent}h` },
                            { label: 'Simulations', val: totalSims.toString() },
                            { label: 'Tier', val: tier },
                        ].map(s => (
                            <div key={s.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                                <p className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">{s.label}</p>
                                <p className="text-sm font-black text-white uppercase">{s.val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full lg:w-96 rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-8 flex flex-col justify-center">
                    <div className="space-y-2 mb-8 text-center">
                        <p className="text-[10px] tracking-[0.3em] text-[#00f5ff] uppercase font-black font-mono">System Aggregate</p>
                        <h3 className="text-5xl font-black text-white">{progressPercent}<span className="text-2xl text-white/20">%</span></h3>
                    </div>

                    <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden mb-4 p-[1px]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-[#003c42] to-[#00f5ff] shadow-[0_0_15px_rgba(0,245,255,0.4)]"
                        />
                    </div>
                    <div className="flex justify-between text-[9px] font-black tracking-widest uppercase">
                        <span className="text-white/20">Phase 01</span>
                        <span className="text-[#00f5ff]">{completedCount}/{totalCount} Milestones</span>
                        <span className="text-white/20">Phase 02</span>
                    </div>
                </div>
            </div>

            {/* Milestones Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {milestones.map((item, i) => (
                    <MilestoneCard key={item.id} item={item} index={i} totalMilestones={milestones.length} />
                ))}
            </div>
        </div>
    )
}
