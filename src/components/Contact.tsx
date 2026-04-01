import React from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, MessageSquare, Github, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const email = "alamnishat456@gmail.com";

  const handleEmailClick = () => {
    window.location.href = `mailto:${email}?subject=Feedback/Inquiry for BioSnap`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full neu-contact-card overflow-hidden"
      >
        <div className="p-8 md:p-12">
          <button 
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-bold text-sm"
          >
            <ArrowLeft size={18} /> BACK
          </button>

          <div className="space-y-6">
            <div className="inline-flex p-4 neu-icon-box rounded-2xl text-indigo-600 dark:text-indigo-400">
              <MessageSquare size={32} />
            </div>
            
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Get in Touch
            </h1>
            
            <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Have a suggestion for <strong>BioSnap</strong> or found a bug? 
              I'm always open to discussing new ideas or academic collaborations.
            </p>

            <div className="grid grid-cols-1 gap-4 pt-4">
              {/* Email Card */}
              <button 
                onClick={handleEmailClick}
                className="neu-contact-item group flex items-center justify-between p-6 rounded-3xl transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 neu-contact-icon-wrap rounded-xl text-red-500">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Official Email</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{email}</p>
                  </div>
                </div>
                <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 font-bold text-sm">
                  Send Mail →
                </div>
              </button>

              {/* GitHub & Portfolio */}
              <div className="flex gap-4">
                <a 
                  href="https://github.com/nishat-jihad" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-4 neu-contact-dark-btn rounded-2xl font-bold"
                >
                  <Github size={20} /> GitHub
                </a>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 p-4 neu-contact-light-btn rounded-2xl font-bold text-zinc-900 dark:text-zinc-100"
                >
                  <Globe size={20} /> Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="neu-contact-footer p-6 text-center">
          <p className="text-sm text-zinc-400 font-medium">
            Project BioSnap • Created for Students by Nishat
          </p>
        </div>
      </motion.div>
    </div>
  );
}
