/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

// Firebase Persistence এনাবল করা (ক্রোম এবং অন্যান্য ব্রাউজারে ডাটা সিঙ্ক ঠিক রাখার জন্য)
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Persistence failed: multiple tabs open");
    } else if (err.code === 'unimplemented') {
      console.warn("Persistence not available in this browser");
    }
  });
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // রিয়েল-টাইম ডাটা সিঙ্ক নিশ্চিত করতে onSnapshot ব্যবহার
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore Error:", error);
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
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // ইমেইল পাঠানোর ফাংশন
  const handleEmailRedirect = () => {
    window.location.href = "mailto:alamnishat456@gmail.com?subject=Inquiry from BioSnap";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full dark:border-zinc-800 dark:border-t-zinc-100"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient text-zinc-900 dark:text-zinc-100 transition-colors duration-300 flex flex-col">
      <Navbar 
        user={user} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
      />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl flex-grow">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Landing />
            </motion.div>
          ) : !profile ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Onboarding user={user} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dashboard user={user} profile={profile} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto py-12 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <div className="flex justify-center gap-8 mb-6">
          <button onClick={() => window.scrollTo(0,0)} className="text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-indigo-600 transition-colors">Home</button>
          <button onClick={() => setShowContact(true)} className="text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-orange-500 transition-colors">Contact Us</button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">B</span>
            </div>
            <span className="font-black tracking-tighter text-zinc-400">BioSnap</span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            &copy; 2026 BioSnap. Crafted with passion.
          </p>
        </div>
      </footer>

      {/* Contact Us Modal */}
      <AnimatePresence>
        {showContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContact(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              <button 
                onClick={() => setShowContact(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={20} className="text-zinc-400" />
              </button>

              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Mail size={32} />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tighter">Get in Touch</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                    Have questions about BioSnap? Reach out directly.
                  </p>
                </div>

                <button 
                  onClick={handleEmailRedirect}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-left hover:border-indigo-500 transition-all group"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Email Address</p>
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">alamnishat456@gmail.com</p>
                </button>

                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider italic">
                  Tip: Clicking the email will open your mail app.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
