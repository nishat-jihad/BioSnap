import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// সরাসরি আপনার Firebase কনফিগারেশন ডাটা
const firebaseConfig = {
  apiKey: "AIzaSyAwl8qklsbUEhIz9R1s4CSO0zGSQkwnLhM",
  authDomain: "biosnap-6e5c5.firebaseapp.com",
  projectId: "biosnap-6e5c5",
  storageBucket: "biosnap-6e5c5.firebasestorage.app",
  messagingSenderId: "1014269687184",
  appId: "1:1014269687184:web:c93b85fee093e4304eef15",
  measurementId: "G-HMEQY9H2JV"
};

// Firebase ইনিশিয়ালাইজ করা
const app = initializeApp(firebaseConfig);

// এক্সপোর্ট করা যাতে অন্য ফাইলে ব্যবহার করা যায়
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// লগইন করার সময় একাউন্ট সিলেক্ট করার অপশন দেখাবে
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
