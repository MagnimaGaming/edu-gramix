import { useState, useEffect, createContext, useContext } from 'react'
import { auth, db } from '../firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)

            if (currentUser) {
                // Subscribe to profile changes
                const unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
                    if (doc.exists()) {
                        setProfile(doc.data())
                    } else {
                        setProfile(null)
                    }
                })
                return () => unsubscribeProfile()
            } else {
                setProfile(null)
            }
        })

        return () => unsubscribeAuth()
    }, [])

    return (
        <AuthContext.Provider value={{ user, profile, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
