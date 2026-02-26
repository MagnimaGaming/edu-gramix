import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Each scene: { id, start, end, align, content }
const SCENES = [
    {
        id: 'scene1',
        start: 0,
        end: 0.20,
        align: 'center',
        heading: 'THE FUTURE OF\nPREPARATION',
        headingLevel: 'h1',
        sub: null,
    },
    {
        id: 'scene2',
        start: 0.40,
        end: 0.60,
        align: 'left',
        heading: 'AI-POWERED\nAUDIT',
        headingLevel: 'h2',
        sub: 'Sharp insight meets supportive coaching.',
    },
    {
        id: 'scene3',
        start: 0.80,
        end: 1.0,
        align: 'right',
        heading: 'NEURAL\nCONFIDENCE',
        headingLevel: 'h2',
        sub: null,
        counter: true,
    },
]

function isActive(progress, start, end) {
    return progress >= start - 0.01 && progress <= end + 0.01
}

/** Ticking counter 72 → 87 */
function Counter({ progress, sceneStart, sceneEnd }) {
    const [val, setVal] = useState(72)
    const prevRef = useRef(72)

    useEffect(() => {
        const t = Math.max(0, Math.min(1, (progress - sceneStart) / (sceneEnd - sceneStart)))
        const target = Math.round(72 + t * (87 - 72))
        if (target !== prevRef.current) {
            prevRef.current = target
            setVal(target)
        }
    }, [progress, sceneStart, sceneEnd])

    const pct = ((val - 72) / (87 - 72)) * 100

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-5 flex flex-col items-end gap-2"
        >
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#00f5ff] uppercase">
                Confidence Score
            </span>
            <span
                className="font-display font-black text-[clamp(3.5rem,10vw,6.5rem)] leading-none text-white"
                style={{ textShadow: '0 0 40px rgba(0,245,255,0.3)' }}
            >
                {val}%
            </span>
            <div className="w-40 h-[3px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ background: 'linear-gradient(90deg,#00c8d4,#00f5ff)', boxShadow: '0 0 8px #00f5ff' }}
                />
            </div>
        </motion.div>
    )
}

const alignClass = {
    center: 'items-center text-center',
    left: 'items-start text-left',
    right: 'items-end text-right',
}

const enterVariant = {
    center: { opacity: 0, y: 30, scale: 0.97 },
    left: { opacity: 0, x: -40 },
    right: { opacity: 0, x: 40 },
}

export default function TextOverlay({ progress }) {
    return (
        <div className="absolute inset-0 pointer-events-none z-20">
            <AnimatePresence mode="wait">
                {SCENES.map((scene) => {
                    if (!isActive(progress, scene.start, scene.end)) return null

                    const Tag = scene.headingLevel

                    return (
                        <motion.div
                            key={scene.id}
                            className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 ${alignClass[scene.align]}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Backdrop blur panel behind text */}
                            <div className="scene-backdrop rounded-2xl p-6 md:p-10 max-w-2xl"
                                style={{ background: 'rgba(5,5,5,0.4)' }}>

                                {/* Cyan accent line */}
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className="w-12 h-[2px] mb-5 origin-left"
                                    style={{
                                        background: '#00f5ff',
                                        boxShadow: '0 0 10px #00f5ff',
                                        ...(scene.align === 'right' ? { marginLeft: 'auto', transformOrigin: 'right' } : {}),
                                        ...(scene.align === 'center' ? { margin: '0 auto 20px' } : {}),
                                    }}
                                />

                                <motion.div
                                    initial={enterVariant[scene.align]}
                                    animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <Tag
                                        className="font-display font-black leading-[0.95] tracking-tight text-white"
                                        style={{
                                            fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)',
                                            textShadow: '0 2px 40px rgba(0,0,0,0.8)',
                                            whiteSpace: 'pre-line',
                                        }}
                                    >
                                        {scene.heading}
                                    </Tag>
                                </motion.div>

                                {scene.sub && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25, duration: 0.6 }}
                                        className="mt-4 font-sans text-[clamp(0.95rem,2vw,1.2rem)] text-white/60 leading-relaxed"
                                    >
                                        {scene.sub}
                                    </motion.p>
                                )}

                                {scene.counter && (
                                    <Counter
                                        progress={progress}
                                        sceneStart={scene.start}
                                        sceneEnd={scene.end}
                                    />
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
