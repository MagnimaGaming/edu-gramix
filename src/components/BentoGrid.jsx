import { motion } from 'framer-motion'

const FEATURES = [
    {
        id: 'ats',
        title: 'ATS Compatibility',
        desc: 'Score your resume against real ATS algorithms used by Fortune 500 companies.',
        icon: '⬡',
        accent: '#00f5ff',
        size: 'col-span-2 row-span-2',
        tag: 'Core Engine',
        img: '/assets/features/ats.png'
    },
    {
        id: 'keyword',
        title: 'Keyword Optimization',
        desc: 'Pinpoint missing power-words. Align with job descriptions in real time.',
        icon: '◈',
        accent: '#7b61ff',
        size: 'col-span-1 row-span-1',
        tag: 'NLP Layer',
        img: '/assets/features/keyword.png'
    },
    {
        id: 'impact',
        title: 'Impact Analysis',
        desc: 'Quantify every bullet. Weak verbs get flagged. Strong statements get amplified.',
        icon: '◎',
        accent: '#ff6b6b',
        size: 'col-span-1 row-span-1',
        tag: 'Scoring',
        img: '/assets/features/impact.png'
    },
    {
        id: 'metrics',
        title: 'Metrics Intelligence',
        desc: 'Numbers activate hiring managers. We show you exactly where to add them.',
        icon: '◇',
        accent: '#ffd93d',
        size: 'col-span-1 row-span-1',
        tag: 'Analytics',
        img: '/assets/features/metrics.png'
    },
    {
        id: 'role',
        title: 'Role Alignment',
        desc: 'Match seniority, domain, and tone to any target role across 50+ industries.',
        icon: '✦',
        accent: '#00f5ff',
        size: 'col-span-1 row-span-1',
        tag: 'AI Match',
        img: '/assets/features/role.png'
    },
]

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
    }),
}

export default function BentoGrid() {
    return (
        <section className="relative bg-[#050505] py-28 px-6 md:px-12 lg:px-20">
            {/* Heading */}
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16 flex flex-col gap-3"
                >
                    <span className="text-xs font-bold tracking-[0.25em] text-[#00f5ff] uppercase">
                        Feature Suite
                    </span>
                    <h2 className="font-display font-black text-[clamp(2rem,5vw,3.5rem)] tracking-tight leading-tight text-white">
                        Every tool you need.<br />
                        <span className="text-white/30">Nothing you don't.</span>
                    </h2>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[200px] md:auto-rows-[220px] gap-4">
                    {FEATURES.map((feat, i) => (
                        <motion.div
                            key={feat.id}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-60px' }}
                            whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
                            className={`group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0d0d0d] cursor-default ${feat.id === 'ats' ? 'col-span-2 row-span-2 md:col-span-1 md:row-span-2' : ''
                                } ${feat.id === 'ats' ? 'md:col-span-2' : ''
                                }`}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0 overflow-hidden">
                                <img
                                    src={feat.img}
                                    alt={feat.title}
                                    className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000 opacity-[0.15] group-hover:opacity-30 blur-[2px] group-hover:blur-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent" />
                            </div>

                            {/* Top glow */}
                            <div
                                className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
                                style={{ background: `linear-gradient(90deg, transparent, ${feat.accent}80, transparent)` }}
                            />

                            {/* Corner accent */}
                            <div
                                className="absolute top-4 right-4 w-6 h-6 rounded-full opacity-20 group-hover:opacity-60 transition-opacity duration-400 blur-sm z-10"
                                style={{ background: feat.accent }}
                            />

                            {/* Content */}
                            <div className="relative h-full flex flex-col justify-between p-6 md:p-7 z-10">
                                <div className="flex items-start justify-between">
                                    <span
                                        className="text-3xl md:text-4xl leading-none"
                                        style={{ color: feat.accent, filter: `drop-shadow(0 0 10px ${feat.accent}60)` }}
                                    >
                                        {feat.icon}
                                    </span>
                                    <span
                                        className="text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full border opacity-60 group-hover:opacity-100 transition-opacity"
                                        style={{ borderColor: `${feat.accent}40`, color: feat.accent }}
                                    >
                                        {feat.tag}
                                    </span>
                                </div>

                                <div>
                                    <h3
                                        className="font-display font-black text-[clamp(1rem,2.2vw,1.5rem)] text-white leading-tight mb-2 tracking-tight"
                                    >
                                        {feat.title}
                                    </h3>
                                    <p className="text-white/40 text-sm leading-relaxed font-sans group-hover:text-white/60 transition-colors duration-300">
                                        {feat.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Hover shimmer */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl z-20"
                                style={{
                                    background: `radial-gradient(ellipse at 70% 20%, ${feat.accent}08 0%, transparent 70%)`,
                                }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
