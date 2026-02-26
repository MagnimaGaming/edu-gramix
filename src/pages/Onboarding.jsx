import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { auth, db } from '../firebaseConfig'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ROLES = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'UI/UX Designer',
    'DevOps Engineer',
    'Machine Learning Engineer',
    'Business Analyst',
    'Cybersecurity Analyst',
]

const GRAD_YEARS = ['2025', '2026', '2027', '2028', '2029']

const TECH_STACK_OPTIONS = [
    'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust', 'AWS', 'Docker', 'Kubernetes', 'Tailwind CSS', 'Framer Motion', 'GSAP', 'Firebase', 'MongoDB', 'PostgreSQL'
]

export default function Onboarding() {
    const navigate = useNavigate()
    const { user, profile, loading } = useAuth()
    const [step, setStep] = useState(0)
    const [form, setForm] = useState({
        name: '',
        gradYear: '2027',
        role: '',
        experienceLevel: 'Fresher', // 'Fresher' | 'Experienced'
        skillsList: [],
        techStack: [],
        resumeUploaded: false
    })
    const [skillInput, setSkillInput] = useState('')
    const [showTechDropdown, setShowTechDropdown] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [showFlash, setShowFlash] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)
    const [error, setError] = useState('')

    const update = (key, val) => setForm((f) => ({ ...f, [key]: val }))


    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault()
            if (!form.skillsList.includes(skillInput.trim())) {
                update('skillsList', [...form.skillsList, skillInput.trim()])
            }
            setSkillInput('')
        }
    }

    const removeSkill = (skill) => {
        update('skillsList', form.skillsList.filter(s => s !== skill))
    }

    const toggleTech = (tech) => {
        if (form.techStack.includes(tech)) {
            update('techStack', form.techStack.filter(t => t !== tech))
        } else {
            update('techStack', [...form.techStack, tech])
        }
    }

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setIsUploading(true)
            setTimeout(() => {
                setIsUploading(false)
                update('resumeUploaded', true)
            }, 2000)
        }
    }

    const handleFinish = async () => {
        // Auto-flush any skill that's typed but not yet Enter'd
        let finalSkills = form.skillsList
        if (skillInput.trim() && !form.skillsList.includes(skillInput.trim())) {
            finalSkills = [...form.skillsList, skillInput.trim()]
            setForm(f => ({ ...f, skillsList: finalSkills }))
            setSkillInput('')
        }

        if (!form.name || !form.role) {
            setError('Please complete your name and target role first.')
            return
        }
        setError('')
        setIsCompleting(true)
        try {
            const user = auth.currentUser
            if (!user) { navigate('/auth'); return }

            await setDoc(doc(db, 'users', user.uid), {
                displayName: form.name,
                graduationYear: form.gradYear,
                targetRole: form.role,
                experienceLevel: form.experienceLevel,
                skillsList: finalSkills,
                techStack: form.techStack,
                profileCompleted: true,
                updatedAt: new Date().toISOString(),
            }, { merge: true })

            // Trigger Light Flash
            setShowFlash(true)
            setTimeout(() => {
                navigate('/dashboard')
            }, 800)
        } catch (err) {
            setError(err.message)
            setIsCompleting(false)
        }
    }

    const steps = [
        // Step 0: Name & Grad Year
        <motion.div key="step0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tight">Identity & Timeline</h2>
                <p className="text-white/30 text-sm">Tell us who you are and when you graduate.</p>
            </div>

            <div className="space-y-4">
                <div className="relative group">
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#00f5ff] rounded-xl px-5 py-4 text-white text-sm placeholder-white/20 outline-none transition-colors"
                    />
                </div>

                <div className="grid grid-cols-5 gap-2">
                    {GRAD_YEARS.map((y) => (
                        <button
                            key={y}
                            onClick={() => update('gradYear', y)}
                            className={`py-3 rounded-xl border text-xs font-bold transition-all ${form.gradYear === y
                                ? 'border-[#00f5ff] text-[#00f5ff] bg-[#00f5ff]/10 shadow-[0_0_15px_rgba(0,245,255,0.2)]'
                                : 'border-white/[0.08] text-white/40 hover:border-white/20'
                                }`}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={() => { if (form.name.trim()) setStep(1); else setError('Please enter your name.') }}
                className="w-full py-4 font-black text-sm tracking-[0.15em] uppercase rounded-xl border-2 border-[#00f5ff] text-[#00f5ff] btn-neon"
            >
                <span>Continue</span>
            </button>
        </motion.div>,

        // Step 1: Role & Experience
        <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tight">Mission & Expertise</h2>
                <p className="text-white/30 text-sm">Define your target role and experience level.</p>
            </div>

            <div className="space-y-4">
                {/* Custom Toggle */}
                <div className="flex bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
                    {['Fresher', 'Experienced'].map((level) => (
                        <button
                            key={level}
                            onClick={() => update('experienceLevel', level)}
                            className={`flex-1 py-3 text-xs font-bold tracking-[0.14em] uppercase rounded-lg transition-all duration-300 ${form.experienceLevel === level
                                ? 'bg-[#00f5ff] text-[#050505] shadow-[0_0_20px_rgba(0,245,255,0.4)]'
                                : 'text-white/40 hover:text-white/70'
                                }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {ROLES.slice(0, 8).map((r) => (
                        <button
                            key={r}
                            onClick={() => update('role', r)}
                            className={`text-left px-4 py-3 rounded-xl border text-[11px] font-medium transition-all ${form.role === r
                                ? 'border-[#00f5ff] text-[#00f5ff] bg-[#00f5ff]/10'
                                : 'border-white/[0.06] text-white/50 active:scale-95'
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-4 font-bold text-xs border border-white/10 rounded-xl text-white/30">Back</button>
                <button
                    onClick={() => { if (form.role) setStep(2); else setError('Please select a role.') }}
                    className="flex-[2] py-4 font-black text-sm border-2 border-[#00f5ff] text-[#00f5ff] btn-neon"
                >
                    <span>Continue</span>
                </button>
            </div>
        </motion.div>,

        // Step 2: Skills, Tech & Resume
        <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight">Skill Matrix</h2>
                <p className="text-white/30 text-sm">Inject your technical DNA.</p>
            </div>

            <div className="space-y-5">
                {/* Skill Tagger */}
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                        {form.skillsList.map((skill) => (
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                key={skill}
                                className="px-3 py-1.5 rounded-full bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] text-[10px] font-bold flex items-center gap-2"
                            >
                                {skill}
                                <button onClick={() => removeSkill(skill)} className="hover:text-white">✕</button>
                            </motion.span>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder="Type a skill & press Enter (e.g. React, Python)"
                        className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#00f5ff] rounded-xl px-5 py-3 text-white text-sm outline-none transition-colors"
                    />
                    <p className="text-[9px] text-white/20 mt-1 px-1">Press <strong className="text-[#00f5ff]/50">Enter</strong> to add each skill as a tag, or it will be added automatically when you click Complete Profile.</p>
                </div>

                {/* Tech Dropdown (Simplified for layout) */}
                <div className="relative">
                    <button
                        onClick={() => setShowTechDropdown(!showTechDropdown)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-3 text-white text-sm text-left flex justify-between items-center"
                    >
                        <span>{form.techStack.length ? `${form.techStack.length} Technologies Selected` : 'Interested Tech Stack'}</span>
                        <span className="text-[#00f5ff]">{showTechDropdown ? '▲' : '▼'}</span>
                    </button>
                    <AnimatePresence>
                        {showTechDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 w-full mt-2 bg-[#0d0d0d] border border-white/[0.1] rounded-xl p-4 z-50 shadow-2xl backdrop-blur-xl"
                            >
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {TECH_STACK_OPTIONS.map(tech => (
                                        <button
                                            key={tech}
                                            onClick={() => toggleTech(tech)}
                                            className={`px-3 py-2 rounded-lg text-left text-[11px] border transition-all ${form.techStack.includes(tech)
                                                ? 'bg-[#00f5ff]/10 border-[#00f5ff]/40 text-[#00f5ff]'
                                                : 'bg-white/[0.02] border-white/[0.05] text-white/40 hover:text-white/70'
                                                }`}
                                        >
                                            {tech}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Resume Dropdown (Visual Only) */}
                <div className="relative group">
                    <input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <label
                        htmlFor="resume-upload"
                        className={`w-full h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${form.resumeUploaded
                            ? 'border-[#00f5ff] bg-[#00f5ff]/5'
                            : 'border-white/10 hover:border-[#00f5ff]/40 hover:bg-white/[0.02]'
                            }`}
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-[#00f5ff] border-t-transparent rounded-full" />
                                <span className="text-[10px] text-[#00f5ff] font-mono tracking-widest animate-pulse">SYSTEM SYNCING...</span>
                            </div>
                        ) : form.resumeUploaded ? (
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-2xl">📄</span>
                                <span className="text-[10px] text-[#00f5ff] font-bold uppercase tracking-widest">Resume Synced</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-white/20 text-xs font-bold tracking-widest uppercase mb-1">Upload Resume</span>
                                <span className="text-[9px] text-white/10">PDF, DOCX (Max 5MB)</span>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-xs border border-white/10 rounded-xl text-white/30">Back</button>
                <button
                    onClick={handleFinish}
                    disabled={isCompleting}
                    className="flex-[2] py-4 font-black text-sm border-2 border-[#00f5ff] text-[#00f5ff] btn-neon"
                >
                    <span>{isCompleting ? 'INITIALIZING...' : 'COMPLETE PROFILE'}</span>
                </button>
            </div>
        </motion.div>
    ]

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center overflow-hidden relative">
            <AnimatePresence>
                {showFlash && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] bg-white pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#00f5ff] opacity-[0.04] blur-[130px] pointer-events-none" />

            <div className="z-10 w-full max-w-lg mx-4">
                {/* Progress bar */}
                <div className="flex items-center gap-2 mb-8">
                    {['Identity', 'Expertise', 'Neural Matrix'].map((label, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-1.5">
                            <div className={`h-0.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#00f5ff] shadow-[0_0_8px_#00f5ff]' : 'bg-white/10'}`} />
                            <span className={`text-[9px] tracking-[0.2em] uppercase font-bold transition-colors ${i === step ? 'text-[#00f5ff]' : i < step ? 'text-white/40' : 'text-white/20'}`}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div
                    className="rounded-3xl border border-white/[0.08] p-8 md:p-10 relative overflow-hidden"
                    style={{
                        background: 'rgba(13,13,13,0.85)',
                        backdropFilter: 'blur(28px)',
                        WebkitBackdropFilter: 'blur(28px)',
                        boxShadow: '0 0 60px rgba(0,245,255,0.06)',
                    }}
                >
                    <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#00f5ff]/30 to-transparent" />
                    <p className="text-[10px] tracking-[0.3em] text-[#00f5ff]/60 uppercase font-bold font-mono mb-6">
                        Neural Onboarding · Step {step + 1} of 3
                    </p>

                    {error && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest mb-4">{error}</p>}

                    <AnimatePresence mode="wait">
                        {steps[step]}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
