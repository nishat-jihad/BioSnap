import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogOut, Home, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  user: User | null;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onContactClick: () => void;
}

export default function Navbar({ user, isDarkMode, toggleTheme, onContactClick }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group transition-all">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-primary/10 border border-white/20 overflow-hidden"
          >
            <img
              src="/biosnap.png"
              alt="BioSnap"
              className="w-full h-full object-contain p-1.5"
              onError={() => console.error("Logo failed to load")}
            />
          </motion.div>
          <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
            BioSnap
          </span>
        </a>

        <div className="flex items-center gap-3">
          {/* Nav links */}
          <div className="hidden md:flex items-center gap-3 mr-1">

            {/* ✅ Home — neumorphic */}
            <a href="/" className="neu-btn">
              <Home size={15} className="text-brand-primary" /> Home
            </a>

            {/* ✅ Contact — neumorphic */}
            <button onClick={onContactClick} className="neu-btn">
              <Mail size={15} className="text-brand-secondary" /> Contact
            </button>
          </div>

          {/* ✅ Dark/Light Toggle — custom style */}
          <div className="toggle-wrapper" onClick={toggleTheme} title="Toggle theme">
            <input
              className="toggle-checkbox"
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
            <div className="toggle-container">
              <div className="toggle-button">
                <div className="toggle-button-circles-container">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="toggle-button-circle" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Logout — neumorphic */}
          {user && (
            <button onClick={() => signOut(auth)} className="neu-btn">
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
