import React from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, MessageSquare, Github, Globe, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const email = "alamnishat456@gmail.com";
  const phoneNumber = "+8801XXXXXXXXX"; // এখানে আপনার সঠিক মোবাইল নম্বরটি বসিয়ে দিন

  const handleEmailClick = () => {
    window.location.href = `mailto:${email}?subject=Feedback/Inquiry for BioSnap`;
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
      >
        <div className="p-8 md:p-12">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-bold text-sm"
          >
            <ArrowLeft size={18} /> BACK
          </button>

          <div className="space-y-6">
            <div className="inline-flex p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
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
              {/* Primary Email Card */}
              <button 
                onClick={handleEmailClick}
                className="group flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent hover:border-indigo-500 rounded-3xl transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm text-red-500">
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

              {/* Mobile Number Card */}
              <button 
                onClick={handlePhoneClick}
                className="group flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent hover:border-emerald-500 rounded-3xl transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm text-emerald-500">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Call Directly</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{phoneNumber}</p>
                  </div>
                </div>
                <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 font-bold text-sm">
                  Call Now →
                </div>
              </button>

              <div className="flex gap-4">
                <a 
                  href="https://github.com/nishat-jihad" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-zinc-900 text-white rounded-2xl hover:bg-black transition-colors font-bold"
                >
                  <Github size={20} /> GitHub
                </a>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl hover:bg-zinc-50 transition-colors font-bold text-zinc-900 dark:text-zinc-100"
                >
                  <Globe size={20} /> Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/30 p-6 text-center border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-sm text-zinc-400 font-medium">
            Project BioSnap • Created for Students by Nishat
          </p>
        </div>
      </motion.div>
    </div>
  );
}
