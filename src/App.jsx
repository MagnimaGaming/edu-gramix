import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Hero from './components/Hero'
import ScrollSection from './components/ScrollSection'
import BentoGrid from './components/BentoGrid'
import ContactUs from './components/ContactUs'
import AuthPage from './pages/AuthPage'
import VerifyEmail from './pages/VerifyEmail'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import { AuthProvider } from './hooks/useAuth'

function LandingPage() {
    return (
        <main className="bg-[#050505]">
            {/* Section 1: Hero */}
            <Hero />

            {/* Section 2: 3D Scroll (Neural Boot → GSAP Canvas) */}
            <ScrollSection />

            {/* Section 3: Feature Bento Grid */}
            <BentoGrid />

            {/* Section 4: Contact */}
            <ContactUs />
        </main>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/verify" element={<VerifyEmail />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
