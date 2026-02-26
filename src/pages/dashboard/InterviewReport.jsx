import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

/* ── Score Ring ── */
function ScoreRing({ score, size = 160, strokeW = 10, delay = 0 }) {
    const r = (size - strokeW) / 2
    const circ = 2 * Math.PI * r
    const offset = circ - (score / 100) * circ
    const color = score >= 80 ? '#22d3ee' : score >= 50 ? '#ffd93d' : '#f97316'
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} fill="none" />
                <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round"
                    strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 2, delay, ease: [0.22, 1, 0.36, 1] }}
                    style={{ filter: `drop-shadow(0 0 10px ${color}60)` }} />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">{score}</span>
                <span className="text-[8px] text-white/30 uppercase tracking-widest font-black">/ 100</span>
            </div>
        </div>
    )
}

/* ── Meter Bar ── */
function MeterBar({ label, value, delay = 0 }) {
    const color = value >= 75 ? '#22d3ee' : value >= 50 ? '#ffd93d' : '#f97316'
    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.5 }} className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</span>
                <span className="text-sm font-black font-mono" style={{ color }}>{value}%</span>
            </div>
            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
                    transition={{ duration: 1.5, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}40` }} />
            </div>
        </motion.div>
    )
}

/* ── Evaluate answers locally ── */
function evaluateInterview(questions, answers, role, difficulty) {
    const results = []
    const strengths = new Set()
    const weaknesses = new Set()

    answers.forEach((answer, i) => {
        const q = questions[i] || ''
        const lower = answer.toLowerCase()
        const words = answer.trim().split(/\s+/).length
        const hasNumbers = /\d+/.test(answer)
        const techTerms = ['api', 'database', 'component', 'algorithm', 'architecture', 'performance', 'cache', 'server', 'function', 'class', 'deploy', 'test', 'security', 'scale', 'optimize', 'framework', 'library', 'react', 'node', 'python', 'sql', 'docker', 'kubernetes', 'aws', 'css', 'html', 'javascript', 'typescript', 'git', 'http', 'rest', 'graphql', 'mongodb', 'redis']
        const foundTerms = techTerms.filter(t => lower.includes(t))
        const hasExamples = /for example|for instance|such as|in my project|i built|i used|i implemented|we developed/i.test(lower)
        const hasTradeoffs = /however|although|tradeoff|downside|alternatively|on the other hand|drawback|limitation/i.test(lower)
        const hasStructure = /first|second|third|finally|additionally|moreover|in conclusion|to summarize/i.test(lower)
        const hasFillers = /um+|uh+|like,|you know|basically|actually|literally|sort of|kind of/gi
        const fillerCount = (answer.match(hasFillers) || []).length

        let techScore = 25
        techScore += Math.min(25, foundTerms.length * 5)
        if (hasExamples) techScore += 15
        if (hasTradeoffs) techScore += 10
        if (hasNumbers) techScore += 10
        if (words < 8) techScore = Math.min(techScore, 20)
        techScore = Math.min(98, techScore)

        let commScore = 30
        if (words >= 30) commScore += 20; else if (words >= 15) commScore += 10
        if (hasStructure) commScore += 15
        commScore -= fillerCount * 5
        if (hasExamples) commScore += 10
        commScore = Math.max(10, Math.min(98, commScore))

        const overall = Math.round(techScore * 0.6 + commScore * 0.4)

        // Track strengths/weaknesses
        if (foundTerms.length >= 3) strengths.add('Strong technical vocabulary')
        if (hasExamples) strengths.add('Uses concrete real-world examples')
        if (hasTradeoffs) strengths.add('Discusses tradeoffs and alternatives')
        if (hasNumbers) strengths.add('Quantifies impact with numbers')
        if (hasStructure) strengths.add('Well-structured and organized answers')
        if (words >= 40) strengths.add('Provides detailed, comprehensive responses')

        if (words < 15) weaknesses.add('Answers are too short — expand with details')
        if (foundTerms.length < 2) weaknesses.add('Low technical depth — use more domain terms')
        if (!hasExamples) weaknesses.add('Missing concrete examples from real projects')
        if (!hasTradeoffs) weaknesses.add('Does not discuss tradeoffs or limitations')
        if (fillerCount > 2) weaknesses.add('Too many filler words — practice clarity')
        if (!hasNumbers) weaknesses.add('No quantified metrics — add numbers for credibility')

        let feedback = ''
        if (overall >= 75) feedback = `Strong answer on "${q.slice(0, 50)}...". You showed solid understanding.`
        else if (overall >= 50) feedback = `Decent answer on "${q.slice(0, 50)}...". Could use more depth and specifics.`
        else feedback = `Weak answer on "${q.slice(0, 50)}...". Need much more technical detail and examples.`

        results.push({ question: q, answer, techScore, commScore, overall, feedback, wordCount: words })
    })

    const avgTech = results.length ? Math.round(results.reduce((a, r) => a + r.techScore, 0) / results.length) : 0
    const avgComm = results.length ? Math.round(results.reduce((a, r) => a + r.commScore, 0) / results.length) : 0
    const avgOverall = results.length ? Math.round(results.reduce((a, r) => a + r.overall, 0) / results.length) : 0

    const verdict = avgOverall >= 80 ? 'Strong Hire' : avgOverall >= 60 ? 'Hire' : 'Needs Practice'
    const verdictColor = avgOverall >= 80 ? '#22d3ee' : avgOverall >= 60 ? '#4ade80' : '#f97316'

    return {
        results, avgTech, avgComm, avgOverall, verdict, verdictColor,
        strengths: [...strengths].slice(0, 5),
        weaknesses: [...weaknesses].slice(0, 5),
    }
}

/* ═══════════════════════════════════════════════════════════════════════
   INTERVIEW REPORT CARD
   ═══════════════════════════════════════════════════════════════════════ */

export default function InterviewReport({ role, difficulty, questions, answers, scores, elapsedSec, onNewSession, onReturnDashboard }) {
    const [eval_, setEval] = useState(null)
    const [synced, setSynced] = useState(false)
    const fmtTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`

    // Run evaluation on mount
    useEffect(() => {
        const result = evaluateInterview(questions, answers, role, difficulty)
        setEval(result)

        // Firestore sync
        const user = auth.currentUser
        if (user) {
            setDoc(doc(db, 'users', user.uid), {
                lastInterviewScore: result.avgOverall,
                lastInterviewRole: role,
                lastInterviewDifficulty: difficulty,
                lastInterviewDate: new Date().toISOString(),
                interviewHistory: [{
                    score: result.avgOverall, techScore: result.avgTech, commScore: result.avgComm,
                    verdict: result.verdict, role, difficulty,
                    questionsAnswered: answers.length, date: new Date().toISOString(),
                }],
            }, { merge: true }).then(() => setSynced(true)).catch(() => { })
        }
    }, [])

    if (!eval_) return (
        <div className="flex items-center justify-center h-96">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 border-2 border-[#22d3ee]/20 border-t-[#22d3ee] rounded-full" />
        </div>
    )

    const { results, avgTech, avgComm, avgOverall, verdict, verdictColor, strengths, weaknesses } = eval_

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-5xl mx-auto space-y-6 pb-10">

            {/* ── Header ── */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3">
                    <span className="w-10 h-[2px] bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
                    <p className="text-[10px] tracking-[0.4em] text-[#22d3ee] uppercase font-black font-mono">Neural Analysis Complete</p>
                    <span className="w-10 h-[2px] bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight uppercase">Interview <span className="text-white/20">Report.</span></h2>
                <p className="text-xs text-white/30">{role} · {difficulty} · {answers.length} Questions · {fmtTime(elapsedSec)}</p>
            </motion.div>

            {/* ── TOP: Overall Score + Verdict ── */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                className="rounded-3xl border border-white/[0.08] p-8 flex flex-col md:flex-row items-center gap-8"
                style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', boxShadow: `0 0 40px ${verdictColor}08` }}>
                <ScoreRing score={avgOverall} delay={0.5} />
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                        <p className="text-[9px] text-white/25 uppercase tracking-widest font-black mb-1">Final Verdict</p>
                        <p className="text-2xl font-black uppercase tracking-tight" style={{ color: verdictColor }}>{verdict}</p>
                    </div>
                    <div className="space-y-3">
                        <MeterBar label="Technical Accuracy" value={avgTech} delay={0.6} />
                        <MeterBar label="Communication & Clarity" value={avgComm} delay={0.8} />
                    </div>
                    {synced && (
                        <p className="text-[8px] text-[#22d3ee]/40 uppercase tracking-widest font-mono">✓ Synced to your profile</p>
                    )}
                </div>
            </motion.div>

            {/* ── MIDDLE: Strengths + Weaknesses ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
                    className="rounded-3xl border border-white/[0.08] p-6 space-y-4"
                    style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)' }}>
                    <p className="text-[10px] tracking-[0.3em] text-[#4ade80] uppercase font-black font-mono">✓ Key Strengths</p>
                    <div className="space-y-2.5">
                        {strengths.length ? strengths.map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 + i * 0.1 }}
                                className="flex items-start gap-2.5">
                                <span className="text-[#4ade80] text-xs mt-0.5">✓</span>
                                <p className="text-xs text-white/50 leading-relaxed">{s}</p>
                            </motion.div>
                        )) : <p className="text-xs text-white/20 italic">No distinct strengths detected. Keep practicing!</p>}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
                    className="rounded-3xl border border-white/[0.08] p-6 space-y-4"
                    style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)' }}>
                    <p className="text-[10px] tracking-[0.3em] text-[#f97316] uppercase font-black font-mono">⚠ Critical Weaknesses</p>
                    <div className="space-y-2.5">
                        {weaknesses.length ? weaknesses.map((w, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 + i * 0.1 }}
                                className="flex items-start gap-2.5">
                                <span className="text-[#f97316] text-xs mt-0.5">▸</span>
                                <p className="text-xs text-white/50 leading-relaxed">{w}</p>
                            </motion.div>
                        )) : <p className="text-xs text-white/20 italic">No critical weaknesses. Excellent performance!</p>}
                    </div>
                </motion.div>
            </div>

            {/* ── BOTTOM: Per-Question Breakdown ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
                className="rounded-3xl border border-white/[0.08] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)' }}>
                <div className="px-6 py-4 border-b border-white/[0.05]">
                    <p className="text-[10px] tracking-[0.3em] text-[#22d3ee] uppercase font-black font-mono">Question-by-Question Breakdown</p>
                </div>
                <div className="divide-y divide-white/[0.04]">
                    {results.map((r, i) => {
                        const c = r.overall >= 75 ? '#22d3ee' : r.overall >= 50 ? '#ffd93d' : '#f97316'
                        const tag = r.overall >= 75 ? 'STRONG' : r.overall >= 50 ? 'AVERAGE' : 'WEAK'
                        return (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 + i * 0.1 }}
                                className="px-6 py-5 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-white/25 tracking-widest uppercase mb-1">Q{i + 1}</p>
                                        <p className="text-sm text-white/60 leading-relaxed">{r.question}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="px-2 py-0.5 border rounded-full text-[7px] font-black tracking-widest"
                                            style={{ borderColor: `${c}30`, color: c, background: `${c}08` }}>{tag}</span>
                                        <span className="text-lg font-black font-mono" style={{ color: c }}>{r.overall}</span>
                                    </div>
                                </div>
                                <div className="pl-4 border-l-2 border-white/[0.06] space-y-1">
                                    <p className="text-[10px] text-white/30 leading-relaxed line-clamp-2">{r.answer}</p>
                                    <p className="text-[9px] text-white/20 italic">{r.feedback}</p>
                                </div>
                                <div className="flex gap-4 text-[8px] text-white/20 font-mono">
                                    <span>Tech: {r.techScore}%</span><span>Comm: {r.commScore}%</span><span>{r.wordCount} words</span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>

            {/* ── Action Buttons ── */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button onClick={onNewSession}
                    className="px-10 py-4 rounded-2xl text-xs font-black tracking-[0.3em] uppercase btn-neon border-2 border-[#22d3ee] text-[#22d3ee]"
                    style={{ boxShadow: '0 0 25px rgba(34,211,238,0.15)' }}>
                    <span>⚡ Retry Simulation</span>
                </button>
                <button onClick={onReturnDashboard || (() => { })}
                    className="px-10 py-4 rounded-2xl text-xs font-black tracking-[0.2em] uppercase border border-white/[0.1] text-white/40 hover:text-white/70 hover:border-white/20 transition-all">
                    ← Return to Command Center
                </button>
            </div>
        </motion.div>
    )
}
