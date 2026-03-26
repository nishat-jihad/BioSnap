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
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-zinc-900 dark:bg-zinc-100 rounded-3xl mx-auto flex items-center justify-center mb-6"
        >
          <UserIcon size={40} className="text-white dark:text-zinc-900" />
        </motion.div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Complete Your Profile</h2>
        <p className="text-zinc-500">Let's set up your unique BioSnap identity.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Username</label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all"
              placeholder="johndoe"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Finish Setup'}
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
