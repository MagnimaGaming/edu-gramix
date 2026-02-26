import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InterviewReport from './InterviewReport'

/* ═══════════════════════════════════════════════════════════════════════
   QUESTION BANKS BY ROLE & DIFFICULTY
   ═══════════════════════════════════════════════════════════════════════ */

const QUESTION_BANK = {
    'Frontend Developer': {
        Friendly: [
            'Tell me about a recent project you built with React or any frontend framework.',
            'What is the difference between CSS Grid and Flexbox? When would you choose one over the other?',
            'Can you explain what a component lifecycle is in React?',
            'What tools do you use for debugging frontend issues?',
            'How do you make a website responsive?',
        ],
        Standard: [
            'Explain the Virtual DOM in React and why it improves performance.',
            'How would you optimize a React application that has slow rendering?',
            'Describe the difference between server-side rendering and client-side rendering.',
            'Walk me through how you would implement authentication in a single-page application.',
            'What are Web Vitals and how do you measure them?',
        ],
        Strict: [
            'Design a real-time collaborative text editor. Walk me through the architecture and conflict resolution.',
            'You have a React app with 10,000 list items and scroll lag. Diagnose and fix it with three strategies.',
            'Explain the event loop, microtask queue, and macrotask queue in JavaScript.',
            'Implement a custom hook that handles infinite scrolling with intersection observer and error recovery.',
            'Your client-side bundle is 4MB. Walk me through reducing it to under 200KB.',
        ],
    },
    'Data Scientist': {
        Friendly: [
            'What is the difference between supervised and unsupervised learning?',
            'Can you explain what overfitting is and how you prevent it?',
            'What Python libraries do you use most for data analysis?',
            'Walk me through how you would clean a messy dataset.',
            'What is the difference between classification and regression?',
        ],
        Standard: [
            'Explain the bias-variance tradeoff and how it affects model selection.',
            'You have a dataset with 95% class imbalance. How would you handle this?',
            'Compare Random Forest and Gradient Boosting. When would you choose each?',
            'Walk me through feature engineering for a customer churn prediction model.',
            'How do you validate a machine learning model beyond just accuracy?',
        ],
        Strict: [
            'Design an end-to-end ML pipeline for real-time fraud detection at 1M transactions per hour.',
            'Explain the mathematics behind backpropagation for a two-layer neural network.',
            'You deployed a model with 94% accuracy but stakeholders say it is useless. Diagnose it.',
            'Compare transformer architectures to RNNs for sequential data.',
            'Design an A/B testing framework for a recommendation engine with network effects.',
        ],
    },
    'Backend Developer': {
        Friendly: [
            'What is a REST API and how does it differ from GraphQL?',
            'Explain the difference between SQL and NoSQL databases.',
            'What is middleware in the context of web servers?',
            'How do you handle errors in a backend application?',
            'Describe a backend project you have worked on.',
        ],
        Standard: [
            'Design a rate limiting system for an API. What algorithms would you consider?',
            'Explain database indexing. When can indexes hurt performance?',
            'How would you implement caching in a backend service?',
            'Walk me through authentication with JWT tokens and refresh tokens.',
            'What is the N+1 query problem and how do you solve it?',
        ],
        Strict: [
            'Design a distributed message queue with exactly-once delivery guarantees.',
            'API handles 50K req/s but P99 latency spiked to 2s. Walk me through debugging.',
            'Implement a distributed lock. Compare Redlock and ZooKeeper approaches.',
            'Design the backend for a ride-sharing app including geospatial indexing.',
            'Migrate 500GB from PostgreSQL to DynamoDB with zero downtime. Your strategy?',
        ],
    },
    'Full Stack Developer': {
        Friendly: [
            'What does full stack development mean to you?',
            'Describe a project where you worked on both frontend and backend.',
            'What is your preferred tech stack and why?',
            'How do you decide what logic goes on the frontend vs backend?',
            'How do you stay up to date with new technologies?',
        ],
        Standard: [
            'Walk me through deploying a full-stack application to production.',
            'How would you implement real-time notifications in a web application?',
            'Explain WebSockets vs Server-Sent Events vs long polling.',
            'Design the data model and API for a simple e-commerce platform.',
            'How do you handle file uploads securely in a web application?',
        ],
        Strict: [
            'Design a real-time analytics dashboard ingesting 100K events/sec with live charts.',
            'Your full-stack app has a memory leak crashing the server every 6 hours. Debug it.',
            'Implement end-to-end type safety from database to UI.',
            'Design a multi-tenant SaaS platform with role-based access and tenant isolation.',
            'Architect an offline-first PWA with conflict resolution for multi-device sync.',
        ],
    },
}

const ROLES = Object.keys(QUESTION_BANK)
const DIFFICULTIES = ['Friendly', 'Standard', 'Strict']

/* ── AI Feedback ── */
const FEEDBACK_BANK = {
    Friendly: {
        good: [
            'That was a solid answer! You explained it clearly. Let us continue.',
            'Nice work! I can see you have practical experience here.',
            'Good answer! You covered the key points well.',
        ],
        avg: [
            'Decent answer. Try to add a specific example next time.',
            'You are on the right track. A bit more detail would strengthen your response.',
            'Fair enough. Consider mentioning the tradeoffs in your next answer.',
        ],
        weak: [
            'That could use more depth, but I appreciate the attempt. Let us try another.',
            'A bit vague. Try to be more specific with technologies or numbers.',
            'Needs work, but do not worry — practice helps. Next question.',
        ],
    },
    Standard: {
        good: [
            'Strong answer. Good technical depth and structure. Moving on.',
            'Well articulated. You demonstrated solid understanding.',
            'Impressive answer. The specific examples were effective.',
        ],
        avg: [
            'Acceptable, but you missed discussing the tradeoffs.',
            'You covered the basics. Deeper implementation details would be expected.',
            'Okay, but quantify the impact next time. Numbers are convincing.',
        ],
        weak: [
            'That answer lacks specificity. Practice articulating concrete solutions.',
            'Too surface-level. Discuss implementation details and edge cases.',
            'Not strong enough. Study the underlying concepts more.',
        ],
    },
    Strict: {
        good: [
            'Acceptable. You demonstrated strong fundamentals. Continue.',
            'That meets the bar. Good use of specific details and tradeoffs.',
            'Solid. Your systems thinking is evident.',
        ],
        avg: [
            'Partially correct. You missed critical failure modes.',
            'The basic idea is right, but a senior candidate would go deeper.',
            'Decent attempt, but I expect precise terminology and quantified impact.',
        ],
        weak: [
            'That would not pass the bar at a top company. More depth needed.',
            'Too vague. In a real interview, this would be a red flag.',
            'Insufficient. Study the fundamentals and practice precision.',
        ],
    },
}

function scoreAnswer(answer, difficulty) {
    if (!answer || answer.trim().length < 5) return { level: 'weak', score: 15 }
    const words = answer.trim().split(/\s+/).length
    const lower = answer.toLowerCase()
    const hasNumbers = /\d+/.test(answer)
    const hasTechTerms = ['api', 'database', 'component', 'algorithm', 'architecture', 'performance', 'cache', 'server', 'client', 'function', 'class', 'module', 'deploy', 'test', 'security', 'scale', 'optimize', 'pattern', 'framework', 'library'].filter(t => lower.includes(t)).length
    const hasExamples = /for example|for instance|such as|like when|in my project|i built|i used|i implemented/i.test(lower)
    const hasTradeoffs = /however|although|tradeoff|downside|alternatively|on the other hand|but|drawback/i.test(lower)
    let score = 30
    if (words >= 40) score += 20; else if (words >= 20) score += 12; else if (words >= 10) score += 5
    score += Math.min(20, hasTechTerms * 5)
    if (hasNumbers) score += 8
    if (hasExamples) score += 12
    if (hasTradeoffs) score += 10
    score = Math.min(98, score)
    const t = { Friendly: { good: 55, avg: 35 }, Standard: { good: 65, avg: 45 }, Strict: { good: 75, avg: 55 } }[difficulty] || { good: 65, avg: 45 }
    const level = score >= t.good ? 'good' : score >= t.avg ? 'avg' : 'weak'
    return { level, score }
}

function pickFeedback(difficulty, level) {
    const list = FEEDBACK_BANK[difficulty]?.[level] || FEEDBACK_BANK.Standard.avg
    return list[Math.floor(Math.random() * list.length)]
}

/* ═══════════════════════════════════════════════════════════════════════
   TTS
   ═══════════════════════════════════════════════════════════════════════ */

function speak(text, onEnd) {
    if (!window.speechSynthesis) { onEnd?.(); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.92; u.pitch = 1.0; u.volume = 0.9
    const voices = window.speechSynthesis.getVoices()
    const pref = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'))
    if (pref) u.voice = pref
    u.onend = () => onEnd?.()
    window.speechSynthesis.speak(u)
}

/* ═══════════════════════════════════════════════════════════════════════
   AUDIO WAVEFORM
   ═══════════════════════════════════════════════════════════════════════ */

function AudioWaveform({ stream }) {
    const canvasRef = useRef(null)
    const animRef = useRef(null)

    useEffect(() => {
        if (!stream) return
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const analyser = ctx.createAnalyser()
        ctx.createMediaStreamSource(stream).connect(analyser)
        analyser.fftSize = 64
        const buf = new Uint8Array(analyser.frequencyBinCount)
        const draw = () => {
            const c = canvasRef.current; if (!c) return
            const g = c.getContext('2d')
            analyser.getByteFrequencyData(buf)
            g.clearRect(0, 0, c.width, c.height)
            const bw = c.width / buf.length * 0.8, gap = c.width / buf.length * 0.2
            for (let i = 0; i < buf.length; i++) {
                const v = buf[i] / 255, h = Math.max(2, v * c.height * 0.8)
                const gr = g.createLinearGradient(0, c.height, 0, 0)
                gr.addColorStop(0, 'rgba(34,211,238,0.2)'); gr.addColorStop(1, 'rgba(34,211,238,0.8)')
                g.fillStyle = gr; g.fillRect(i * (bw + gap), c.height / 2 - h / 2, bw, h)
            }
            animRef.current = requestAnimationFrame(draw)
        }
        draw()
        return () => { cancelAnimationFrame(animRef.current); ctx.close() }
    }, [stream])

    return <canvas ref={canvasRef} width={180} height={32} className="opacity-70" />
}

/* ═══════════════════════════════════════════════════════════════════════
   CONFIDENCE GAUGE
   ═══════════════════════════════════════════════════════════════════════ */

function ConfidenceGauge({ value }) {
    const color = value >= 85 ? '#22d3ee' : value >= 70 ? '#ffd93d' : '#f97316'
    return (
        <div className="flex items-center gap-2">
            <div className="w-14 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div animate={{ width: `${value}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full"
                    style={{ background: color, boxShadow: `0 0 6px ${color}50` }} />
            </div>
            <span className="text-[10px] font-black font-mono" style={{ color }}>{value}%</span>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════
   CHAT BUBBLE
   ═══════════════════════════════════════════════════════════════════════ */

function ChatBubble({ msg }) {
    const isAI = msg.role === 'ai'
    return (
        <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
        >
            <div className={`max-w-[88%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${isAI ? 'bg-cyan-950/40 border border-[#22d3ee]/10 text-white/80' : 'bg-white/[0.08] border border-white/[0.06] text-white/70'
                }`}>
                {isAI && <p className="text-[8px] font-black tracking-[0.15em] text-[#22d3ee]/50 uppercase mb-1">Neural Interviewer</p>}
                {!isAI && <p className="text-[8px] font-black tracking-[0.15em] text-white/25 uppercase mb-1">Your Answer</p>}
                <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
        </motion.div>
    )
}





/* ═══════════════════════════════════════════════════════════════════════
   MAIN INTERVIEW SIMULATOR
   ═══════════════════════════════════════════════════════════════════════ */

export default function InterviewSim({ profile }) {
    const [status, setStatus] = useState('setup') // setup | linking | active | report
    const [role, setRole] = useState(profile?.targetRole && ROLES.includes(profile.targetRole) ? profile.targetRole : 'Frontend Developer')
    const [difficulty, setDifficulty] = useState('Standard')
    const [questionIdx, setQuestionIdx] = useState(0)
    const [messages, setMessages] = useState([])
    const [confidence, setConfidence] = useState(82)
    const [elapsedSec, setElapsedSec] = useState(0)
    const [aiThinking, setAiThinking] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [manualInput, setManualInput] = useState('')
    const [silenceError, setSilenceError] = useState('')
    const transcriptRef = useRef('')

    // ── Speech recognition state ──
    const [transcript, setTranscript] = useState('')
    const [isListening, setIsListening] = useState(false)
    const [speechSupported, setSpeechSupported] = useState(true)
    const recognitionRef = useRef(null)

    // ── Media state ──
    const [stream, setStream] = useState(null)
    const [mediaError, setMediaError] = useState(null)
    const [micMuted, setMicMuted] = useState(false)
    const [camOff, setCamOff] = useState(false)

    // ── Refs ──
    const videoRef = useRef(null)
    const chatEndRef = useRef(null)
    const timerRef = useRef(null)
    const answersRef = useRef([])
    const scoresRef = useRef([])
    const questionsRef = useRef([])

    /* ── Initialize Speech Recognition once ── */
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setSpeechSupported(false)
            return
        }
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
            let finalText = ''
            let interimText = ''
            for (let i = 0; i < event.results.length; i++) {
                const r = event.results[i]
                if (r.isFinal) finalText += r[0].transcript + ' '
                else interimText += r[0].transcript
            }
            const t = (finalText + interimText).trim()
            setTranscript(t)
            transcriptRef.current = t
        }

        recognition.onerror = (e) => {
            if (e.error !== 'no-speech' && e.error !== 'aborted') {
                console.warn('Speech recognition error:', e.error)
            }
        }

        recognition.onend = () => {
            // Auto-restart if we still want to listen
            if (recognitionRef.current?._shouldListen) {
                try { recognition.start() } catch (e) { /* already started */ }
            }
        }

        recognitionRef.current = recognition
    }, [])

    /* ── Start / Stop listening helpers ── */
    const startListening = useCallback(() => {
        if (!recognitionRef.current) return
        setTranscript('')
        recognitionRef.current._shouldListen = true
        try { recognitionRef.current.start() } catch (e) { /* already started */ }
        setIsListening(true)
    }, [])

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return
        recognitionRef.current._shouldListen = false
        try { recognitionRef.current.stop() } catch (e) { /* already stopped */ }
        setIsListening(false)
    }, [])

    /* ── Media helpers ── */
    const startMedia = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setStream(mediaStream)
            setMediaError(null)
            return mediaStream
        } catch (err) {
            setMediaError(
                err.name === 'NotAllowedError'
                    ? 'Camera & mic permissions denied. Allow access in browser settings.'
                    : 'Could not access camera/mic. Ensure they are connected.'
            )
            return null
        }
    }, [])

    const stopMedia = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop())
            setStream(null)
        }
    }, [stream])

    /* ── CRITICAL: Assign stream to video element whenever stream or ref changes ── */
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    /* ── Timer ── */
    useEffect(() => {
        if (status === 'active') {
            timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000)
        }
        return () => clearInterval(timerRef.current)
    }, [status])

    /* ── Confidence fluctuation ── */
    useEffect(() => {
        if (status !== 'active') return
        const t = setInterval(() => {
            setConfidence(c => Math.max(65, Math.min(98, c + Math.floor(Math.random() * 11) - 5)))
        }, 3500)
        return () => clearInterval(t)
    }, [status])

    /* ── Auto-scroll chat ── */
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
    const getQuestions = () => QUESTION_BANK[role]?.[difficulty] || QUESTION_BANK['Frontend Developer']['Standard']

    /* ── Start interview ── */
    const handleStart = async () => {
        setStatus('linking')
        const mediaStream = await startMedia()
        if (!mediaStream) { setStatus('setup'); return }

        answersRef.current = []
        scoresRef.current = []

        setTimeout(() => {
            setStatus('active')
            setElapsedSec(0); setQuestionIdx(0); setMessages([])

            const questions = getQuestions()
            questionsRef.current = questions
            const intro = `Welcome to your ${difficulty} ${role} interview. I am your interviewer today.\n\nLet us begin.\n\n${questions[0]}`
            setMessages([{ role: 'ai', text: intro }])
            speak(intro, () => { /* AI done speaking; user can click Start Speaking */ })
        }, 2500)
    }

    /* ── Toggle speaking (Start Speaking / Stop & Send) ── */
    const handleSpeechToggle = () => {
        if (isListening) {
            // CRITICAL: capture transcript BEFORE stopping to avoid stale closure
            const capturedTranscript = transcriptRef.current
            stopListening()
            submitAnswer(capturedTranscript)
        } else {
            setSilenceError('')
            startListening()
        }
    }

    /* ── Submit from manual input or send button ── */
    const handleSubmitAnswer = () => {
        const capturedTranscript = transcriptRef.current
        stopListening()
        submitAnswer(capturedTranscript || manualInput)
    }

    /* ── Core submit function — receives answer directly (no stale closure) ── */
    const submitAnswer = (currentAnswer) => {
        const answer = (currentAnswer || '').trim()
        if (aiThinking || analyzing) return

        // SILENCE PENALTY: reject empty/tiny answers
        if (!answer || answer.length < 5) {
            setSilenceError('⚠ No answer detected. You must speak or type to continue.')
            setMessages(prev => [...prev, {
                role: 'ai',
                text: 'Critical: No answer detected. Score: 0%. You must provide an answer to proceed. Try again — click Start Speaking or type your response.'
            }])
            answersRef.current.push('[NO ANSWER]')
            scoresRef.current.push({ level: 'weak', score: 0 })
            setTranscript('')
            setManualInput('')
            transcriptRef.current = ''
            return
        }

        setSilenceError('')
        setTranscript('')
        setManualInput('')
        transcriptRef.current = ''

        setMessages(prev => [...prev, { role: 'user', text: answer }])
        answersRef.current.push(answer)

        const evaluation = scoreAnswer(answer, difficulty)
        scoresRef.current.push(evaluation)

        // Show "Analyzing Neural Patterns..." state
        setAnalyzing(true)
        setAiThinking(true)
        const thinkTime = 2000 + Math.random() * 2000

        setTimeout(() => {
            setAnalyzing(false)
            const questions = getQuestions()
            const nextIdx = questionIdx + 1
            const feedback = pickFeedback(difficulty, evaluation.level)

            if (nextIdx < questions.length) {
                const aiMsg = `${feedback}\n\nQuestion ${nextIdx + 1}:\n${questions[nextIdx]}`
                setMessages(prev => [...prev, { role: 'ai', text: aiMsg }])
                setQuestionIdx(nextIdx)
                setAiThinking(false)
                speak(aiMsg, () => { /* AI done; user can click Start Speaking */ })
            } else {
                const avgScore = scoresRef.current.length > 0
                    ? Math.round(scoresRef.current.reduce((a, b) => a + b.score, 0) / scoresRef.current.length) : 0
                const closing = `${feedback}\n\nThat concludes our interview. You answered ${questions.length} questions with an average score of ${avgScore}%. Thank you for your time.`
                setMessages(prev => [...prev, { role: 'ai', text: closing }])
                setAiThinking(false)
                speak(closing, () => {
                    clearInterval(timerRef.current)
                    stopMedia()
                    setStatus('report')
                })
            }

            setConfidence(c => {
                const delta = evaluation.level === 'good' ? 5 : evaluation.level === 'avg' ? 0 : -7
                return Math.max(55, Math.min(98, c + delta))
            })
        }, thinkTime)
    }

    /* ── End early → report ── */
    const handleEnd = () => {
        stopListening(); window.speechSynthesis?.cancel(); stopMedia()
        clearInterval(timerRef.current)
        setStatus('report')
    }

    /* ── Reset to setup ── */
    const handleReset = () => {
        stopListening(); setTranscript(''); window.speechSynthesis?.cancel(); stopMedia()
        clearInterval(timerRef.current)
        setMessages([]); setElapsedSec(0); setQuestionIdx(0); setConfidence(82); setManualInput('')
        answersRef.current = []; scoresRef.current = []; questionsRef.current = []
        setSilenceError(''); setAnalyzing(false); transcriptRef.current = ''
        setStatus('setup')
    }

    /* ── Toggle mic/cam ── */
    const toggleMic = () => {
        if (stream) { stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled }); setMicMuted(m => !m) }
    }
    const toggleCam = () => {
        if (stream) { stream.getVideoTracks().forEach(t => { t.enabled = !t.enabled }); setCamOff(c => !c) }
    }

    /* ═══════════════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════════════ */

    if (status === 'report') {
        return (
            <InterviewReport
                role={role} difficulty={difficulty}
                questions={questionsRef.current} answers={answersRef.current}
                scores={scoresRef.current} elapsedSec={elapsedSec}
                onNewSession={handleReset}
                onReturnDashboard={() => { handleReset() }}
            />
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-[2px] bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
                        <p className="text-[10px] tracking-[0.4em] text-[#22d3ee] uppercase font-black font-mono">The Arena</p>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
                        Interview <span className="text-white/20">Simulator.</span>
                    </h2>
                </div>
                {status === 'active' && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
                            REC {fmtTime(elapsedSec)}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-white/25 uppercase tracking-widest font-black">Confidence</span>
                            <ConfidenceGauge value={confidence} />
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {/* ── SETUP ── */}
                {status === 'setup' && (
                    <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="rounded-3xl border border-white/[0.08] overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(24px)' }}>
                        <div className="p-10 flex flex-col items-center gap-8 text-center">
                            <div className="relative">
                                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                                    className="w-24 h-24 rounded-full flex items-center justify-center"
                                    style={{ background: 'radial-gradient(circle at 35% 35%, #22d3ee, #0e7490)', boxShadow: '0 0 40px rgba(34,211,238,0.25)' }}>
                                    <span className="text-4xl">🤖</span>
                                </motion.div>
                                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#22d3ee] border-4 border-[#0d0d0d] rounded-full" style={{ boxShadow: '0 0 10px #22d3ee' }} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Configure Your Interview</h3>
                                <p className="text-white/30 text-xs max-w-md leading-relaxed">Select your target role and difficulty. The AI will adapt questions accordingly.</p>
                            </div>
                            {mediaError && (
                                <div className="w-full max-w-md rounded-2xl border border-[#f97316]/20 p-4" style={{ background: 'rgba(249,115,22,0.06)' }}>
                                    <p className="text-[10px] font-black text-[#f97316] tracking-widest uppercase mb-1">Permissions Error</p>
                                    <p className="text-xs text-white/50">{mediaError}</p>
                                </div>
                            )}
                            <div className="w-full max-w-md space-y-3">
                                <p className="text-[9px] font-black text-white/30 tracking-[0.3em] uppercase text-left">Target Role</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {ROLES.map(r => (
                                        <button key={r} onClick={() => setRole(r)}
                                            className={`px-4 py-3 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all border ${role === r ? 'bg-[#22d3ee]/10 border-[#22d3ee]/30 text-[#22d3ee]' : 'border-white/[0.06] text-white/25 hover:text-white/40'
                                                }`}>{r}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full max-w-md space-y-3">
                                <p className="text-[9px] font-black text-white/30 tracking-[0.3em] uppercase text-left">Difficulty Level</p>
                                <div className="flex gap-2">
                                    {DIFFICULTIES.map(d => {
                                        const dc = { Friendly: { a: 'bg-[#4ade80]/10 border-[#4ade80]/30 text-[#4ade80]', i: '😊' }, Standard: { a: 'bg-[#22d3ee]/10 border-[#22d3ee]/30 text-[#22d3ee]', i: '🎯' }, Strict: { a: 'bg-[#f97316]/10 border-[#f97316]/30 text-[#f97316]', i: '🔥' } }
                                        return (
                                            <button key={d} onClick={() => setDifficulty(d)}
                                                className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all border ${difficulty === d ? dc[d].a : 'border-white/[0.06] text-white/25 hover:text-white/40'
                                                    }`}>{dc[d].i} {d}</button>
                                        )
                                    })}
                                </div>
                            </div>
                            <button onClick={handleStart}
                                className="px-12 py-4 rounded-2xl text-xs font-black tracking-[0.3em] uppercase btn-neon border-2 border-[#22d3ee] text-[#22d3ee] mt-2"
                                style={{ boxShadow: '0 0 25px rgba(34,211,238,0.15)' }}>
                                <span>⚡ Start Interview</span>
                            </button>
                            {!speechSupported && <p className="text-[10px] text-[#f97316]/60 italic">⚠ Speech recognition not supported. Use Chrome. You can type answers instead.</p>}
                        </div>
                    </motion.div>
                )}

                {/* ── LINKING ── */}
                {status === 'linking' && (
                    <motion.div key="linking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="rounded-3xl border border-white/[0.08] bg-[#0d0d0d] h-[550px] flex flex-col items-center justify-center gap-5">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                            className="w-14 h-14 border-2 border-[#22d3ee]/15 border-t-[#22d3ee] rounded-full"
                            style={{ boxShadow: '0 0 20px rgba(34,211,238,0.2)' }} />
                        <p className="text-[10px] tracking-[0.5em] text-[#22d3ee] uppercase font-black font-mono animate-pulse">Syncing Neural Sensors...</p>
                    </motion.div>
                )}

                {/* ════════════════════════════════════════════════════════════════
         ACTIVE INTERVIEW — FLIPPED LAYOUT
         LEFT  (70%) = Chat panel
         RIGHT (30%) = Video preview + controls
         ════════════════════════════════════════════════════════════════ */}
                {status === 'active' && (
                    <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-5" style={{ height: 'calc(100vh - 220px)', minHeight: '480px' }}>

                        {/* ── LEFT: AI Chat Panel (70%) ── */}
                        <div className="lg:col-span-8 rounded-3xl border border-white/[0.08] overflow-hidden flex flex-col"
                            style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(24px)' }}>

                            {/* Chat header */}
                            <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                                        className="w-2 h-2 rounded-full bg-[#22d3ee]" style={{ boxShadow: '0 0 8px #22d3ee' }} />
                                    <span className="text-[9px] font-black tracking-[0.15em] text-[#22d3ee] uppercase">Neural Interviewer Active</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[8px] text-white/15 font-mono">Q{questionIdx + 1}/{getQuestions().length}</span>
                                    <span className="text-[8px] text-white/15 font-mono">{fmtTime(elapsedSec)}</span>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}

                                {/* AI thinking */}
                                {aiThinking && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                        <div className="px-4 py-3 rounded-2xl bg-cyan-950/40 border border-[#22d3ee]/10">
                                            <p className="text-[8px] font-black tracking-[0.15em] text-[#22d3ee]/50 uppercase mb-1">Neural Interviewer</p>
                                            <div className="flex items-center gap-1.5">
                                                {[0, 1, 2].map(i => (
                                                    <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }}
                                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                        className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
                                                ))}
                                                <span className="text-[10px] text-white/30 ml-1">Evaluating...</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={chatEndRef} />
                            </div>

                            {/* Real-time transcript preview */}
                            {isListening && transcript && (
                                <div className="px-4 py-2 border-t border-white/[0.04]">
                                    <div className="px-3 py-2 rounded-xl bg-[#22d3ee]/[0.04] border border-[#22d3ee]/10">
                                        <p className="text-[8px] font-black text-[#22d3ee]/40 uppercase tracking-widest mb-0.5">Live Transcript</p>
                                        <p className="text-[11px] text-white/50 leading-snug">{transcript}</p>
                                    </div>
                                </div>
                            )}

                            {/* Manual text input + send */}
                            <div className="px-4 py-3 border-t border-white/[0.05]">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={manualInput}
                                        onChange={e => setManualInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSubmitAnswer() }}
                                        placeholder={isListening ? 'Or type your answer here...' : 'Type your answer...'}
                                        disabled={aiThinking}
                                        className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/70 text-[11px] placeholder-white/15 focus:outline-none focus:border-[#22d3ee]/30 transition-all disabled:opacity-40"
                                    />
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={aiThinking || (!(transcript || '').trim() && !manualInput.trim())}
                                        className="px-3 py-2.5 rounded-xl text-[#22d3ee] bg-[#22d3ee]/10 border border-[#22d3ee]/20 hover:bg-[#22d3ee]/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed text-sm font-black"
                                    >➤</button>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT: Video Preview (30%) ── */}
                        <div className="lg:col-span-4 flex flex-col gap-4">

                            {/* Video container with cyber glow */}
                            <div className="flex-1 rounded-3xl overflow-hidden relative"
                                style={{
                                    border: '1px solid rgba(6,182,212,0.5)',
                                    boxShadow: '0 0 15px rgba(6,182,212,0.3), inset 0 0 30px rgba(6,182,212,0.05)',
                                    background: '#0a0a0a',
                                }}>

                                {/* The video element — srcObject is set via useEffect */}
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover scale-x-[-1]"
                                    style={{ filter: camOff ? 'brightness(0)' : 'brightness(0.85)', minHeight: '200px' }}
                                />

                                {/* HUD overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                                {/* REC indicator */}
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                                    <div className="px-2 py-0.5 bg-[#ef4444]/20 border border-[#ef4444]/40 rounded text-[7px] font-black tracking-widest text-[#ef4444] uppercase flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" /> REC
                                    </div>
                                </div>

                                {/* Role & difficulty badge */}
                                <div className="absolute top-3 right-3 pointer-events-none text-right">
                                    <p className="text-[8px] font-mono text-white/30 tracking-wide">{role}</p>
                                    <p className="text-[7px] font-mono text-white/20">{difficulty}</p>
                                </div>

                                {/* Bottom: Waveform */}
                                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
                                    <AudioWaveform stream={stream} />
                                    <span className="text-[10px] font-black text-[#22d3ee] font-mono">{fmtTime(elapsedSec)}</span>
                                </div>
                            </div>

                            {/* ── Start Speaking / Stop & Send / Analyzing toggle button ── */}
                            <button
                                onClick={handleSpeechToggle}
                                disabled={aiThinking || analyzing}
                                className={`w-full py-3.5 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all border-2 ${analyzing
                                    ? 'border-[#22d3ee] text-[#22d3ee] bg-[#22d3ee]/5 animate-pulse cursor-wait'
                                    : isListening
                                        ? 'border-[#f97316] text-[#f97316] bg-[#f97316]/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]'
                                        : 'border-[#22d3ee] text-[#22d3ee] bg-[#22d3ee]/5 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                                style={analyzing ? { boxShadow: '0 0 25px rgba(34,211,238,0.3)' } : {}}
                            >
                                {analyzing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-3 h-3 border-2 border-[#22d3ee]/30 border-t-[#22d3ee] rounded-full" />
                                        Analyzing Neural Patterns...
                                    </span>
                                ) : isListening ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                                            className="w-2 h-2 rounded-full bg-[#f97316]" />
                                        Stop & Send
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">🎤 Start Speaking</span>
                                )}
                            </button>

                            {/* Controls row */}
                            <div className="flex gap-2">
                                <button onClick={toggleMic}
                                    className={`flex-1 py-2.5 rounded-xl text-[9px] font-black tracking-wider uppercase transition-all border ${micMuted ? 'border-[#ef4444]/30 text-[#ef4444] bg-[#ef4444]/10' : 'border-white/[0.08] text-white/40 hover:text-white/60'
                                        }`}>{micMuted ? '🔇 Unmute' : '🎤 Mute'}</button>
                                <button onClick={toggleCam}
                                    className={`flex-1 py-2.5 rounded-xl text-[9px] font-black tracking-wider uppercase transition-all border ${camOff ? 'border-[#f97316]/30 text-[#f97316] bg-[#f97316]/10' : 'border-white/[0.08] text-white/40 hover:text-white/60'
                                        }`}>{camOff ? '📷 Show' : '📹 Hide'}</button>
                            </div>

                            {/* End Interview button */}
                            <button onClick={handleEnd}
                                className="w-full py-3 rounded-2xl text-[9px] font-black tracking-[0.2em] uppercase border-2 border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"
                                style={{ boxShadow: '0 0 15px rgba(239,68,68,0.1)' }}>
                                ■ End Interview
                            </button>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
