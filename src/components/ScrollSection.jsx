import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import TextOverlay from './TextOverlay'

gsap.registerPlugin(ScrollTrigger)

const TOTAL = 200
const LERP = 0.1

const BOOT_MESSAGES = [
    { tag: '[SYSTEM]', text: 'Initializing EduGramix Core...', min: 0, max: 30 },
    { tag: '[DATA]', text: 'Parsing Industry Standards 2026...', min: 30, max: 58 },
    { tag: '[ANALYSIS]', text: 'Calibrating Behavioral Neural Nets...', min: 58, max: 82 },
    { tag: '[READY]', text: 'Neural Interface Online.', min: 82, max: 100 },
]

function lerp(a, b, t) { return a + (b - a) * t }

function drawCover(ctx, img, w, h) {
    if (!img?.naturalWidth) return
    const ia = img.naturalWidth / img.naturalHeight
    const ca = w / h
    let dw, dh, dx, dy
    if (ia > ca) { dh = h; dw = h * ia; dx = (w - dw) / 2; dy = 0 }
    else { dw = w; dh = w / ia; dx = 0; dy = (h - dh) / 2 }
    ctx.drawImage(img, dx, dy, dw, dh)
}

function getBootMsg(pct) {
    return BOOT_MESSAGES.find(m => pct >= m.min && pct < m.max) ?? BOOT_MESSAGES[3]
}

// exitPhase: 'idle' | 'core' | 'flash' | done (showLoader = false)
export default function ScrollSection() {
    const sectionRef = useRef(null)
    const canvasRef = useRef(null)
    const imagesRef = useRef([])
    const currentRef = useRef(0)
    const targetRef = useRef(0)
    const rafRef = useRef(null)
    const doneRef = useRef(false)

    const [showLoader, setShowLoader] = useState(true)
    const [progress, setProgress] = useState(0)
    // exitPhase drives the staged exit animation inside the preloader
    const [exitPhase, setExitPhase] = useState('idle')
    const [scrollPct, setScrollPct] = useState(0)

    // ── Preload all 200 frames ──
    useEffect(() => {
        let loaded = 0
        const imgs = new Array(TOTAL)

        for (let i = 0; i < TOTAL; i++) {
            const img = new Image()
            const n = String(i + 1).padStart(3, '0')
            img.src = `/frames/ezgif-frame-${n}.jpg`
            img.onload = img.onerror = () => {
                loaded++
                setProgress(Math.round((loaded / TOTAL) * 100))
                if (loaded === TOTAL && !doneRef.current) {
                    doneRef.current = true
                    imagesRef.current = imgs

                    // Stage 1: expand core
                    setTimeout(() => {
                        setExitPhase('core')
                        // Stage 2: white flash (contained in preloader div)
                        setTimeout(() => {
                            setExitPhase('flash')
                            // Stage 3: unmount preloader entirely
                            setTimeout(() => {
                                setShowLoader(false)
                            }, 350)
                        }, 450)
                    }, 400)
                }
            }
            imgs[i] = img
        }
    }, [])

    // ── Canvas resize ──
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize)
    }, [])

    // ── rAF draw loop — starts only after loader is gone ──
    useEffect(() => {
        if (showLoader) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx) return

        const tick = () => {
            currentRef.current = lerp(currentRef.current, targetRef.current, LERP)
            const idx = Math.min(Math.round(currentRef.current), TOTAL - 1)
            const img = imagesRef.current[idx]
            if (img?.complete && img.naturalWidth) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                drawCover(ctx, img, canvas.width, canvas.height)
            }
            rafRef.current = requestAnimationFrame(tick)
        }
        tick()
        return () => cancelAnimationFrame(rafRef.current)
    }, [showLoader])

    // ── GSAP ScrollTrigger — starts only after loader is gone ──
    useEffect(() => {
        if (showLoader || !sectionRef.current) return

        const trigger = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2,
            onUpdate: (self) => {
                targetRef.current = self.progress * (TOTAL - 1)
                setScrollPct(self.progress)
            },
        })

        return () => trigger.kill()
    }, [showLoader])

    const bootMsg = getBootMsg(progress)

    return (
        <>
            {/* ── Neural Boot Preloader ──
          The flash div lives INSIDE here so it unmounts together with the preloader.
          This prevents the white screen bug where a standalone flash overlay stays mounted. */}
            <AnimatePresence>
                {showLoader && (
                    <motion.div
                        key="preloader"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] gap-10 overflow-hidden"
                    >
                        {/* White flash — scoped inside the preloader */}
                        <AnimatePresence>
                            {exitPhase === 'flash' && (
                                <motion.div
                                    key="flash"
                                    className="absolute inset-0 bg-white z-10 pointer-events-none"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                />
                            )}
                        </AnimatePresence>

                        {/* AI Core with rings */}
                        <div className="relative flex items-center justify-center">
                            {[120, 170, 220].map((size, i) => (
                                <div
                                    key={i}
                                    className="neural-ring absolute"
                                    style={{ width: size, height: size, animationDelay: `${i * 0.3}s` }}
                                />
                            ))}
                            <motion.div
                                animate={
                                    exitPhase === 'core'
                                        ? { scale: 7, opacity: 0 }
                                        : { scale: [1, 1.08, 1] }
                                }
                                transition={
                                    exitPhase === 'core'
                                        ? { duration: 0.45, ease: 'easeOut' }
                                        : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                                }
                                className="w-20 h-20 rounded-full z-10"
                                style={{
                                    background: 'radial-gradient(circle at 35% 35%, #00f5ff, #006e7a)',
                                    boxShadow: '0 0 24px #00f5ff, 0 0 80px #00f5ff50',
                                }}
                            />
                        </div>

                        {/* Percent + typing message */}
                        <div className="flex flex-col items-center gap-3">
                            <motion.span
                                key={progress}
                                initial={{ opacity: 0.5, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="font-display font-black text-[clamp(2.5rem,7vw,4rem)] text-[#00f5ff] tabular-nums"
                                style={{ textShadow: '0 0 30px rgba(0,245,255,0.6)' }}
                            >
                                {progress}%
                            </motion.span>
                            <motion.p
                                key={bootMsg.tag}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-xs font-bold tracking-[0.14em] text-[#00f5ff]/65 text-center px-6"
                            >
                                <span className="text-[#00f5ff]">{bootMsg.tag}</span>{' '}
                                {bootMsg.text}
                            </motion.p>
                        </div>

                        {/* Progress bar */}
                        <div className="w-72 sm:w-96 h-[2px] bg-white/[0.07] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-150"
                                style={{
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, #00c8d4, #00f5ff)',
                                    boxShadow: '0 0 10px #00f5ff',
                                }}
                            />
                        </div>

                        <span className="absolute bottom-8 text-[10px] tracking-[0.4em] text-white/15 uppercase font-bold">
                            EduGramix
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── 400vh Scroll Section ── */}
            <div ref={sectionRef} className="canvas-scroll-section">
                <div className="canvas-sticky">
                    <canvas ref={canvasRef} id="edugm-canvas" />

                    {/* Vignette */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                'radial-gradient(ellipse at center, transparent 50%, rgba(5,5,5,0.4) 100%)',
                        }}
                    />

                    {!showLoader && <TextOverlay progress={scrollPct} />}
                </div>
            </div>
        </>
    )
}
