import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, enableIndexedDbPersistence } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile } from './types';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Navbar from './components/Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, X } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch(() => {});
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
          if (docSnap.exists()) setProfile(docSnap.data() as UserProfile);
          setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    isDarkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
        className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 dark:border-t-white rounded-full" 
      />
    </div>
  );

  return (
    <div className="min-h-screen mesh-gradient text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Analytics />
      <Navbar 
        user={user} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        onContactClick={() => setShowContact(true)} 
      />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl flex-grow">
        <AnimatePresence mode="wait">
          {!user ? <Landing /> : !profile ? <Onboarding user={user} /> : <Dashboard user={user} profile={profile} />}
        </AnimatePresence>
      </main>

      {/* Dark Footer with Logo */}
      <footer className="mt-auto py-10 bg-zinc-900 text-zinc-400 border-t border-white/5 text-center">
        <div className="flex justify-center gap-8 mb-4">
          <button onClick={() => window.scrollTo(0,0)} className="text-xs font-black uppercase tracking-widest hover:text-white transition-colors">Home</button>
          <button onClick={() => setShowContact(true)} className="text-xs font-black uppercase tracking-widest hover:text-white transition-colors">Contact Us</button>
        </div>
        <p className="text-[10px] font-bold text-zinc-500 mb-4 tracking-tighter uppercase italic">alamnishat456@gmail.com</p>
        
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center overflow-hidden">
               <img src="/biosnap.png" alt="Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <span className="font-black tracking-tighter text-zinc-100 uppercase">BioSnap</span>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">&copy; 2026 Crafted with passion.</p>
        </div>
      </footer>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowContact(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center">
              <button onClick={() => setShowContact(false)} className="absolute top-6 right-6 p-2"><X size={20} className="text-zinc-400" /></button>
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Mail size={32} /></div>
              <h2 className="text-3xl font-black tracking-tighter mb-2">Get in Touch</h2>
              <button onClick={() => window.location.href = "mailto:alamnishat456@gmail.com"} className="w-full bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700 text-left hover:border-indigo-500 transition-all">
                <p className="text-[10px] font-black uppercase text-zinc-400">Email Address</p>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">alamnishat456@gmail.com</p>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
