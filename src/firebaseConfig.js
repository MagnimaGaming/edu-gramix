import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCjut82y3U4SmTojFZ03hqZgNWjcOW5yfM",
    authDomain: "grmi-86c50.firebaseapp.com",
    projectId: "grmi-86c50",
    storageBucket: "grmi-86c50.firebasestorage.app",
    messagingSenderId: "204256437887",
    appId: "1:204256437887:web:efb1a5c8897dbc7a37814a",
    measurementId: "G-0N1CE7DYZ6"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, analytics };
