import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const CONTACT_INFO = [
    { icon: '◎', label: 'Email', value: 'hello@edugramix.ai' },
    { icon: '◈', label: 'Discord', value: 'discord.gg/edugramix' },
    { icon: '◇', label: 'Response', value: 'Within 24 hours' },
]

export default function ContactUs() {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-100px' })
    const [state, setState] = useState({ name: '', email: '', message: '' })
    const [sent, setSent] = useState(false)
    const [sending, setSending] = useState(false)

    const handleChange = (e) =>
        setState((s) => ({ ...s, [e.target.name]: e.target.value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        setSending(true)
        setTimeout(() => {
            setSent(true)
            setSending(false)
        }, 1200)
    }

    return (
        <section
            ref={ref}
            className="relative bg-[#0a0a0a] py-28 px-6 md:px-12 lg:px-20 overflow-hidden"
        >
            {/* Background noise texture */}
            <div className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                }}
            />

            {/* Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00f5ff] opacity-[0.03] blur-[100px] pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto">
                {/* Section header */}
                <motion.div
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
                    transition={{ duration: 0.7 }}
                    className="mb-16"
                >
                    <span className="text-xs font-bold tracking-[0.25em] text-[#00f5ff] uppercase">
                        Get In Touch
                    </span>
                    <h2 className="mt-3 font-display font-black text-[clamp(2rem,5vw,3.5rem)] tracking-tight leading-tight text-white">
                        Ready to start<br />
                        <span className="text-white/30">your ascent?</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                    {/* ── Left: Contact info ── */}
                    <motion.div
                        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="lg:col-span-2 flex flex-col gap-8"
                    >
                        <p className="text-white/40 text-base font-sans leading-relaxed">
                            Whether you're a candidate, enterprise, or just
                            curious — we'd love to connect.
                        </p>

                        <div className="flex flex-col gap-5">
                            {CONTACT_INFO.map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-[#00f5ff] text-lg group-hover:border-[#00f5ff]/30 transition-colors">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-white/30 tracking-[0.15em] uppercase font-bold">{item.label}</p>
                                        <p className="text-sm text-white/70 font-sans">{item.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-[#00f5ff]/20 via-transparent to-transparent" />

                        <p className="text-xs text-white/20 font-sans">
                            © 2026 EduGramix. All rights reserved.
                        </p>
                    </motion.div>

                    {/* ── Right: Form ── */}
                    <motion.div
                        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="lg:col-span-3"
                    >
                        <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 md:p-10"
                            style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                        >
                            {/* Top glow line */}
                            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#00f5ff]/30 to-transparent rounded-full" />

                            {sent ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-12 gap-5 text-center"
                                >
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                                        style={{ background: 'rgba(0,245,255,0.1)', boxShadow: '0 0 30px rgba(0,245,255,0.2)' }}
                                    >
                                        ✓
                                    </div>
                                    <h3 className="font-display font-black text-2xl text-white">Message Received</h3>
                                    <p className="text-white/40 text-sm font-sans">We'll be in touch within 24 hours.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    {/* Name */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase">
                                            Name
                                        </label>
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            value={state.name}
                                            onChange={handleChange}
                                            placeholder="Your full name"
                                            className="glass-input w-full px-4 py-3.5 rounded-xl text-white text-sm font-sans placeholder-white/20 bg-transparent"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase">
                                            Email
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            value={state.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            className="glass-input w-full px-4 py-3.5 rounded-xl text-white text-sm font-sans placeholder-white/20 bg-transparent"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] font-bold tracking-[0.18em] text-white/35 uppercase">
                                            Message
                                        </label>
                                        <textarea
                                            name="message"
                                            required
                                            rows={5}
                                            value={state.message}
                                            onChange={handleChange}
                                            placeholder="Tell us what you're building or how we can help..."
                                            className="glass-input w-full px-4 py-3.5 rounded-xl text-white text-sm font-sans placeholder-white/20 bg-transparent resize-none"
                                        />
                                    </div>

                                    {/* Submit */}
                                    <motion.button
                                        type="submit"
                                        disabled={sending}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn-neon mt-2 w-full py-4 text-sm font-black tracking-[0.15em] uppercase text-[#00f5ff] border-2 border-[#00f5ff] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ boxShadow: '0 0 20px rgba(0,245,255,0.2)' }}
                                    >
                                        <span>{sending ? 'Sending…' : 'Send Message'}</span>
                                    </motion.button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
