import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { User as UserIcon, AtSign, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  user: User;
}

export default function Onboarding({ user }: OnboardingProps) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        username: username.toLowerCase().replace(/\s+/g, ''),
        email: user.email,
        links: [],
        playlists: []
      });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-24 h-24 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-xl shadow-brand-primary/20"
        >
          <UserIcon size={48} className="text-white" />
        </motion.div>
        <h2 className="text-4xl font-black tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
          Complete Your Profile
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Let's set up your unique BioSnap identity.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
          <div className="relative group">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-primary transition-colors" size={20} />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-zinc-400"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Username</label>
          <div className="relative group">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-primary transition-colors" size={20} />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-zinc-400"
              placeholder="johndoe"
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30"
          >
            <p className="text-red-500 text-xs font-bold">{error}</p>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-brand-primary/25"
        >
          {loading ? 'Setting up...' : 'Finish Setup'}
          <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
}
