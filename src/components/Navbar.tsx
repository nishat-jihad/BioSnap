import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Sun, Moon, LogOut, Home, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  user: User | null;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function Navbar({ user, isDarkMode, toggleTheme }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center"
          >
            <span className="text-white dark:text-zinc-900 font-bold text-xl">B</span>
          </motion.div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">BioSnap</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-4">
            <a href="#" className="text-sm font-medium hover:text-zinc-500 transition-colors flex items-center gap-1">
              <Home size={16} /> Home
            </a>
            <a href="#" className="text-sm font-medium hover:text-zinc-500 transition-colors flex items-center gap-1">
              <Mail size={16} /> Contact Us
            </a>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && (
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
