/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile } from './types';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Navbar from './components/Navbar';
import { motion, AnimatePresence } from 'motion/react';

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
        // Listen for profile changes
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
    <div className="min-h-screen mesh-gradient text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Navbar 
        user={user} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
      />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
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

      <footer className="mt-auto py-12 border-t border-white/10 text-center">
        <div className="flex justify-center gap-8 mb-6">
          <a href="/" className="text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-brand-primary transition-colors">Home</a>
          <a href="#" className="text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-brand-secondary transition-colors">About Us</a>
          <button 
            onClick={() => setShowContact(true)}
            className="text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-brand-accent transition-colors"
          >
            Contact Us
          </button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">B</span>
            </div>
            <span className="font-black tracking-tighter text-zinc-400">BioSnap</span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            &copy; 2026 BioSnap. Crafted with passion.
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {showContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContact(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-8 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent" />
              
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center mx-auto">
                  <span className="font-black text-2xl">@</span>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tighter">Get in Touch</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                    Have questions or feedback? We'd love to hear from you.
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Email Address</p>
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">alamnishat456@gmail.com</p>
                </div>

                <button
                  onClick={() => setShowContact(false)}
                  className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
