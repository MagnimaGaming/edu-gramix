import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { auth, db } from '../firebaseConfig'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

export default function VerifyEmail() {
    const navigate = useNavigate()
    const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
    const [message, setMessage] = useState('Neural handshake in progress…')

    useEffect(() => {
        const verify = async () => {
            if (!isSignInWithEmailLink(auth, window.location.href)) {
                setStatus('error')
                setMessage('Invalid or expired verification link.')
                return
            }

            let email = window.localStorage.getItem('emailForSignIn')
            if (!email) {
                email = window.prompt('Please confirm your email address')
            }

            try {
                const result = await signInWithEmailLink(auth, email, window.location.href)
                window.localStorage.removeItem('emailForSignIn')
                const user = result.user

                const docRef = doc(db, 'users', user.uid)
                const docSnap = await getDoc(docRef)

                if (!docSnap.exists()) {
                    await setDoc(docRef, {
                        email: user.email,
                        college: 'SASI Institute of Technology and Engineering',
                        profileCompleted: false,
                        createdAt: new Date().toISOString(),
                    })
                    setStatus('success')
                    setMessage('Identity verified. Redirecting to onboarding…')
                    setTimeout(() => navigate('/onboarding'), 1800)
                } else {
                    setStatus('success')
                    setMessage('Welcome back. Redirecting to dashboard…')
                    setTimeout(() => navigate('/dashboard'), 1800)
                }
            } catch (err) {
                setStatus('error')
                setMessage(err.message.replace('Firebase: ', '').replace(/\(auth.*\)\.?/, ''))
            }
        }

        verify()
    }, [navigate])

    const colors = {
        verifying: '#00f5ff',
        success: '#00f5ff',
        error: '#ff6b6b',
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00f5ff] opacity-[0.04] blur-[130px] pointer-events-none" />

            <div className="z-10 flex flex-col items-center gap-8 text-center px-6">
                {/* Pulsing core */}
                <div className="relative">
                    {status === 'verifying' && (
                        <>
                            {[100, 140, 180].map((s, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full border border-[#00f5ff]/20"
                                    style={{ width: s, height: s, top: '50%', left: '50%', x: '-50%', y: '-50%' }}
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                                />
                            ))}
                        </>
                    )}
                    <motion.div
                        animate={status === 'verifying' ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                        transition={{ duration: 1.5, repeat: status === 'verifying' ? Infinity : 0 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                        style={{
                            background: `radial-gradient(circle at 35% 35%, ${colors[status]}, #003c42)`,
                            boxShadow: `0 0 30px ${colors[status]}60`,
                        }}
                    >
                        {status === 'error' ? '✕' : status === 'success' ? '✓' : '⬡'}
                    </motion.div>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <p className="text-[10px] tracking-[0.3em] text-[#00f5ff]/50 uppercase font-bold font-mono">
                        {status === 'verifying' ? '[AUTH] Verifying…' : status === 'success' ? '[AUTH] Verified' : '[AUTH] Failed'}
                    </p>
                    <p className="text-white/60 text-sm max-w-xs leading-relaxed" style={{ color: status === 'error' ? '#ff6b6b' : undefined }}>
                        {message}
                    </p>
                </div>

                {status === 'error' && (
                    <button
                        onClick={() => navigate('/auth')}
                        className="px-6 py-3 border border-[#00f5ff]/40 rounded-xl text-[#00f5ff] text-sm font-bold tracking-widest uppercase hover:bg-[#00f5ff]/10 transition-all"
                    >
                        Return to Auth
                    </button>
                )}
            </div>
        </div>
    )
}
