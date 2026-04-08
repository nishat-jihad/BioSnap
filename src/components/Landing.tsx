import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Chrome } from 'lucide-react';

export default function Landing() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try { await signInWithPopup(auth, googleProvider); }
    catch (err: any) { setError(err.message); }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      try { await createUserWithEmailAndPassword(auth, email, password); }
      catch (err: any) {
        if (err.code === 'auth/email-already-in-use') await signInWithEmailAndPassword(auth, email, password);
        else throw err;
      }
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 px-2">
      <div className="text-center mb-8 sm:mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl font-black tracking-tighter mb-4 leading-none"
        >
          Your Bio, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
            Perfectly Snapped.
          </span>
        </motion.h1>
        <p className="text-zinc-700 dark:text-zinc-200 text-lg sm:text-xl font-medium mb-2">
          The most colorful way to manage your digital life.
        </p>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest">
          Save your link in a single site and use whenever you want
        </p>
      </div>

      <div className="glass-card p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-brand-primary/10">
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 px-4 font-bold mb-6 sm:mb-8 neu-google-btn"
        >
          <Chrome size={20} className="text-brand-primary" />
          Continue with Google
        </button>

        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
            <span className="bg-white dark:bg-zinc-900 px-4 text-zinc-400">Or use your email</span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary z-10" size={18} />
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neu-search-input"
                placeholder="hello@biosnap.me"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary z-10" size={18} />
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neu-search-input"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 transition-all neu-primary-btn"
          >
            Get Started
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
