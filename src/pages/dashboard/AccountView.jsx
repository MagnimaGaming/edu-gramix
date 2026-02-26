import { useState } from 'react'
import { motion } from 'framer-motion'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebaseConfig'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'

const ROLES = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'UI/UX Designer',
    'DevOps Engineer', 'Machine Learning Engineer', 'Business Analyst', 'Cybersecurity Analyst',
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
]

const TECH_OPTIONS = [
    'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust', 'AWS',
    'Docker', 'Kubernetes', 'Tailwind CSS', 'Firebase', 'MongoDB', 'PostgreSQL',
    'Java', 'C++', 'Swift', 'Flutter', 'TensorFlow', 'PyTorch',
]

const entry = (delay) => ({
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
})

function InfoRow({ label, value, icon }) {
    return (
        <div className="flex items-center gap-4 py-4 border-b border-white/[0.04] last:border-0">
            <div className="w-10 h-10 rounded-xl bg-[#00f5ff]/[0.06] border border-[#00f5ff]/10 flex items-center justify-center text-base shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black tracking-[0.25em] text-white/25 uppercase">{label}</p>
                <p className="text-sm font-bold text-white/80 truncate mt-0.5">{value || '—'}</p>
            </div>
        </div>
    )
}

export default function AccountView({ profile }) {
    const user = auth.currentUser
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    // Editable fields
    const [displayName, setDisplayName] = useState(profile?.displayName || '')
    const [targetRole, setTargetRole] = useState(profile?.targetRole || '')
    const [gradYear, setGradYear] = useState(profile?.graduationYear || '2027')
    const [expLevel, setExpLevel] = useState(profile?.experienceLevel || 'Fresher')
    const [skillsList, setSkillsList] = useState(profile?.skillsList || [])
    const [techStack, setTechStack] = useState(profile?.techStack || [])
    const [skillInput, setSkillInput] = useState('')

    // Password change
    const [showPwChange, setShowPwChange] = useState(false)
    const [currentPw, setCurrentPw] = useState('')
    const [newPw, setNewPw] = useState('')
    const [pwMsg, setPwMsg] = useState('')

    const handleSave = async () => {
        if (!displayName.trim() || !targetRole) {
            setError('Name and Target Role are required.')
            return
        }
        setError('')
        setSaving(true)
        try {
            await setDoc(doc(db, 'users', user.uid), {
                displayName: displayName.trim(),
                targetRole,
                graduationYear: gradYear,
                experienceLevel: expLevel,
                skillsList,
                techStack,
                updatedAt: new Date().toISOString(),
            }, { merge: true })
            setSaved(true)
            setEditing(false)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        setPwMsg('')
        if (!currentPw || !newPw) { setPwMsg('Both fields required.'); return }
        if (newPw.length < 6) { setPwMsg('New password must be at least 6 characters.'); return }
        try {
            const cred = EmailAuthProvider.credential(user.email, currentPw)
            await reauthenticateWithCredential(user, cred)
            await updatePassword(user, newPw)
            setPwMsg('✅ Password updated successfully!')
            setCurrentPw('')
            setNewPw('')
            setTimeout(() => { setShowPwChange(false); setPwMsg('') }, 2500)
        } catch (err) {
            setPwMsg(`❌ ${err.code === 'auth/wrong-password' ? 'Current password is incorrect.' : err.message}`)
        }
    }

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault()
            if (!skillsList.includes(skillInput.trim())) {
                setSkillsList([...skillsList, skillInput.trim()])
            }
            setSkillInput('')
        }
    }

    const toggleTech = (t) => {
        setTechStack(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
    }

    // Stats
    const intHistory = profile?.interviewHistory || []
    const auditHistory = profile?.auditHistory || []
    const totalSims = intHistory.length + auditHistory.length
    const avgScore = totalSims > 0
        ? Math.round([...intHistory.map(h => h.score || 0), ...auditHistory.map(a => a.score || 0)].reduce((a, b) => a + b, 0) / totalSims)
        : 0

    const safeDate = (val) => {
        if (!val) return null
        if (val.toDate) return val.toDate()
        return new Date(val)
    }
    const memberSince = safeDate(profile?.createdAt || profile?.updatedAt)

    const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/90 placeholder-white/20 outline-none focus:border-[#00f5ff]/40 focus:shadow-[0_0_15px_rgba(0,245,255,0.08)] transition-all"

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <motion.div {...entry(0)}>
                <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-[2px] bg-[#00f5ff] shadow-[0_0_8px_#00f5ff]" />
                    <p className="text-[10px] tracking-[0.4em] text-[#00f5ff] uppercase font-black font-mono">Profile Matrix</p>
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight uppercase leading-none">
                    My <span className="text-white/20">Account.</span>
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── LEFT: Profile Card ── */}
                <motion.div {...entry(0.1)} className="lg:col-span-1 rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-8 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00f5ff]/20 to-[#003c42]/20 border-2 border-[#00f5ff]/30 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(0,245,255,0.1)]">
                        <span className="text-4xl font-black text-[#00f5ff]">
                            {(profile?.displayName?.[0] || user?.email?.[0] || '?').toUpperCase()}
                        </span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{profile?.displayName || 'Agent'}</h3>
                    <p className="text-[10px] text-white/30 font-bold tracking-widest uppercase mt-1">{profile?.targetRole || 'Unassigned'}</p>

                    {/* Quick Stats */}
                    <div className="w-full mt-8 space-y-1">
                        <div className="flex justify-between text-[10px] py-2 border-b border-white/[0.04]">
                            <span className="text-white/30 font-bold uppercase tracking-widest">Tier</span>
                            <span className="text-[#00f5ff] font-black">{avgScore >= 90 ? 'Diamond' : avgScore >= 75 ? 'Gold' : avgScore >= 50 ? 'Silver' : 'Bronze'}</span>
                        </div>
                        <div className="flex justify-between text-[10px] py-2 border-b border-white/[0.04]">
                            <span className="text-white/30 font-bold uppercase tracking-widest">Simulations</span>
                            <span className="text-white/70 font-black">{totalSims}</span>
                        </div>
                        <div className="flex justify-between text-[10px] py-2 border-b border-white/[0.04]">
                            <span className="text-white/30 font-bold uppercase tracking-widest">Avg Score</span>
                            <span className="text-white/70 font-black">{avgScore}%</span>
                        </div>
                        <div className="flex justify-between text-[10px] py-2">
                            <span className="text-white/30 font-bold uppercase tracking-widest">Member Since</span>
                            <span className="text-white/70 font-black">{memberSince ? memberSince.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '—'}</span>
                        </div>
                    </div>

                    {/* Edit / Save Toggle */}
                    <button
                        onClick={() => editing ? handleSave() : setEditing(true)}
                        disabled={saving}
                        className={`w-full mt-8 py-3.5 rounded-xl text-[10px] font-black tracking-[0.3em] uppercase transition-all duration-300 border-2 ${editing
                            ? 'border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80] hover:text-black'
                            : 'border-[#00f5ff] text-[#00f5ff] hover:bg-[#00f5ff] hover:text-black'
                            }`}
                        style={{ boxShadow: editing ? '0 0 20px rgba(74,222,128,0.1)' : '0 0 20px rgba(0,245,255,0.1)' }}
                    >
                        {saving ? '⏳ Saving...' : editing ? '✓ Save Changes' : '✎ Edit Profile'}
                    </button>

                    {saved && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-[#4ade80] font-bold mt-3 tracking-widest uppercase">
                            ✅ Profile Synced
                        </motion.p>
                    )}
                </motion.div>

                {/* ── RIGHT: Details ── */}
                <motion.div {...entry(0.2)} className="lg:col-span-2 space-y-6">

                    {/* Info Card */}
                    <div className="rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-8">
                        <p className="text-[10px] tracking-[0.3em] text-[#00f5ff] uppercase font-black font-mono mb-6">Profile Details</p>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">{error}</div>
                        )}

                        {!editing ? (
                            <div>
                                <InfoRow label="Full Name" value={profile?.displayName} icon="👤" />
                                <InfoRow label="Email" value={user?.email} icon="✉️" />
                                <InfoRow label="Target Role" value={profile?.targetRole} icon="🎯" />
                                <InfoRow label="Graduation Year" value={profile?.graduationYear} icon="🎓" />
                                <InfoRow label="Experience Level" value={profile?.experienceLevel} icon="📊" />
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-2 block">Full Name</label>
                                    <input value={displayName} onChange={e => setDisplayName(e.target.value)} className={inputCls} placeholder="Your name" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-2 block">Target Role</label>
                                    <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
                                        className={`${inputCls} appearance-none cursor-pointer`}>
                                        <option value="" disabled>Select role</option>
                                        {ROLES.map(r => <option key={r} value={r} className="bg-[#0d0d0d]">{r}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-2 block">Graduation Year</label>
                                        <select value={gradYear} onChange={e => setGradYear(e.target.value)}
                                            className={`${inputCls} appearance-none cursor-pointer`}>
                                            {['2025', '2026', '2027', '2028', '2029'].map(y => <option key={y} value={y} className="bg-[#0d0d0d]">{y}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-2 block">Experience</label>
                                        <select value={expLevel} onChange={e => setExpLevel(e.target.value)}
                                            className={`${inputCls} appearance-none cursor-pointer`}>
                                            <option value="Fresher" className="bg-[#0d0d0d]">Fresher</option>
                                            <option value="Experienced" className="bg-[#0d0d0d]">Experienced</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Skills & Tech Stack */}
                    <div className="rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-8">
                        <p className="text-[10px] tracking-[0.3em] text-[#00f5ff] uppercase font-black font-mono mb-6">Skills & Tech Stack</p>

                        {/* Skills */}
                        <div className="mb-6">
                            <p className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-3">Skills</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {(editing ? skillsList : (profile?.skillsList || [])).map(s => (
                                    <span key={s} className="px-3 py-1.5 rounded-lg border border-[#00f5ff]/20 bg-[#00f5ff]/5 text-[#00f5ff] text-[10px] font-bold flex items-center gap-2">
                                        {s}
                                        {editing && (
                                            <button onClick={() => setSkillsList(prev => prev.filter(x => x !== s))} className="text-white/30 hover:text-red-400 transition-colors">×</button>
                                        )}
                                    </span>
                                ))}
                                {(editing ? skillsList : (profile?.skillsList || [])).length === 0 && (
                                    <span className="text-[10px] text-white/20 italic">No skills added</span>
                                )}
                            </div>
                            {editing && (
                                <input
                                    value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                    placeholder="Type a skill and press Enter"
                                    className={inputCls}
                                />
                            )}
                        </div>

                        {/* Tech Stack */}
                        <div>
                            <p className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-3">Tech Stack</p>
                            <div className="flex flex-wrap gap-2">
                                {(editing ? TECH_OPTIONS : (profile?.techStack || [])).map(t => {
                                    const active = editing ? techStack.includes(t) : true
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => editing && toggleTech(t)}
                                            disabled={!editing}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-200 ${active
                                                ? 'border-[#00f5ff]/30 bg-[#00f5ff]/10 text-[#00f5ff]'
                                                : 'border-white/[0.06] bg-white/[0.02] text-white/20 hover:border-white/10 hover:text-white/40'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    )
                                })}
                                {!editing && (profile?.techStack || []).length === 0 && (
                                    <span className="text-[10px] text-white/20 italic">No technologies selected</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="rounded-3xl border border-white/[0.08] bg-[#0d0d0d] p-8">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[10px] tracking-[0.3em] text-[#00f5ff] uppercase font-black font-mono">Security</p>
                            <button
                                onClick={() => setShowPwChange(!showPwChange)}
                                className="text-[9px] font-black text-white/30 tracking-widest uppercase hover:text-[#00f5ff] transition-colors"
                            >
                                {showPwChange ? '✕ Cancel' : '🔒 Change Password'}
                            </button>
                        </div>

                        {!showPwChange ? (
                            <div>
                                <InfoRow label="Auth Provider" value="Email & Password" icon="🔐" />
                                <InfoRow label="Account UID" value={user?.uid?.slice(0, 16) + '...'} icon="🆔" />
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <input
                                    type="password"
                                    value={currentPw}
                                    onChange={e => setCurrentPw(e.target.value)}
                                    placeholder="Current Password"
                                    className={inputCls}
                                />
                                <input
                                    type="password"
                                    value={newPw}
                                    onChange={e => setNewPw(e.target.value)}
                                    placeholder="New Password (min 6 chars)"
                                    className={inputCls}
                                />
                                {pwMsg && (
                                    <p className={`text-xs font-bold ${pwMsg.startsWith('✅') ? 'text-[#4ade80]' : 'text-red-400'}`}>{pwMsg}</p>
                                )}
                                <button
                                    onClick={handlePasswordChange}
                                    className="w-full py-3 rounded-xl border-2 border-[#ffd93d] text-[#ffd93d] text-[10px] font-black tracking-[0.3em] uppercase hover:bg-[#ffd93d] hover:text-black transition-all duration-300"
                                >
                                    Update Password
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
