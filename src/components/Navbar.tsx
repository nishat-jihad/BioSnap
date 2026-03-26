import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Sun, Moon, LogOut, Home, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  user: User | null;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onContactClick: () => void; // App.tsx এর মডাল ওপেন করার জন্য এটি জরুরি
}

export default function Navbar({ user, isDarkMode, toggleTheme, onContactClick }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* লোগো এবং ব্র্যান্ড নেম সেকশন */}
        <a href="/" className="flex items-center gap-3 group transition-all">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-primary/10 border border-white/20 overflow-hidden"
          >
            {/* সরাসরি /biosnap.png পাথ ব্যবহার করা হয়েছে */}
            <img 
              src="/biosnap.png" 
              alt="BioSnap" 
              className="w-full h-full object-contain p-1.5"
              onError={(e) => {
                // ইমেজ লোড না হলে কনসোলে এরর দেখাবে
                console.error("Logo failed to load from /biosnap.png");
              }}
            />
          </motion.div>
          
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
              BioSnap
            </span>
          </div>
        </a>

        <div className="flex items-center gap-6">
          {/* মাঝখানের নেভিগেশন লিংকসমূহ */}
          <div className="hidden md:flex items-center gap-8 mr-4">
            <a href="/" className="text-sm font-black uppercase tracking-widest hover:text-brand-primary transition-colors flex items-center gap-2">
              <Home size={16} className="text-brand-primary" /> Home
            </a>
            
            {/* Contact বাটনে ক্লিক করলে App.tsx এর setShowContact(true) ট্রিগার হবে */}
            <button 
              onClick={onContactClick}
              className="text-sm font-black uppercase tracking-widest hover:text-brand-secondary transition-colors flex items-center gap-2"
            >
              <Mail size={16} className="text-brand-secondary" /> Contact
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* ডার্ক/লাইট মোড টগল বাটন */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-brand-primary/50 hover:text-brand-primary transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* ইউজার লগইন থাকলে লগআউট বাটন দেখাবে */}
            {user && (
              <button
                onClick={() => signOut(auth)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 active:scale-95 transition-all text-sm font-black uppercase tracking-wider shadow-lg shadow-zinc-900/20 dark:shadow-white/10"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
