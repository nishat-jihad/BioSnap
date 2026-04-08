import { useState } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogOut, Home, Mail, Info, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: User | null;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onContactClick: () => void;
  onAboutMeClick: () => void;
}

export default function Navbar({ user, isDarkMode, toggleTheme, onContactClick, onAboutMeClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5">
        <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 sm:gap-3 group transition-all">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-9 h-9 sm:w-12 sm:h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-primary/10 border border-white/20 overflow-hidden"
            >
              <img src="/biosnap.png" alt="BioSnap" className="w-full h-full object-contain p-1.5" />
            </motion.div>
            <span className="font-black text-xl sm:text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
              BioSnap
            </span>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-3 mr-1">
              <a href="/" className="neu-btn"><Home size={15} className="text-brand-primary" /> Home</a>
              <button onClick={onAboutMeClick} className="neu-btn"><Info size={15} className="text-brand-accent" /> About Me</button>
              <button onClick={onContactClick} className="neu-btn"><Mail size={15} className="text-brand-secondary" /> Contact</button>
            </div>

            {/* Theme Toggle */}
            <div className="toggle-wrapper" onClick={toggleTheme} title="Toggle theme">
              <input className="toggle-checkbox" type="checkbox" checked={isDarkMode} onChange={toggleTheme} aria-label="Toggle dark mode" />
              <div className="toggle-container">
                <div className="toggle-button">
                  <div className="toggle-button-circles-container">
                    {Array.from({ length: 12 }).map((_, i) => (<div key={i} className="toggle-button-circle" />))}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Logout */}
            {user && (
              <button onClick={() => signOut(auth)} className="neu-btn hidden sm:flex">
                <LogOut size={15} /><span>Logout</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden neu-btn !p-2.5"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Down Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white/98 dark:bg-zinc-950/98 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800 shadow-2xl"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
                <a href="/" onClick={closeMobileMenu} className="mobile-nav-item">
                  <Home size={17} className="text-brand-primary" /><span>Home</span>
                </a>
                <button onClick={() => { onAboutMeClick(); closeMobileMenu(); }} className="mobile-nav-item">
                  <Info size={17} className="text-brand-accent" /><span>About Me</span>
                </button>
                <button onClick={() => { onContactClick(); closeMobileMenu(); }} className="mobile-nav-item">
                  <Mail size={17} className="text-brand-secondary" /><span>Contact</span>
                </button>
                {user && (
                  <button onClick={() => { signOut(auth); closeMobileMenu(); }} className="mobile-nav-item !text-red-500 dark:!text-red-400">
                    <LogOut size={17} /><span>Logout</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
