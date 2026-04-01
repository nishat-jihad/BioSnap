import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutMeProps {
  onClose: () => void;
}

export default function AboutMe({ onClose }: AboutMeProps) {
  const features: string[] = [
    'Save links with titles and subtitles for clarity.',
    'Automatically display site favicons.',
    'Edit, delete, or pin important links.',
    'Organize multiple sites under categories or playlists.',
    'Copy site URLs quickly for sharing or reference.',
    'Search saved links for fast access.',
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 z-10"
          type="button"
        >
          <X size={20} className="text-zinc-400" />
        </button>

        <div className="p-10">
          {/* Main Title */}
          <h1 className="text-5xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
            About Me
          </h1>

          {/* Introduction */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
              Introduction
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Hi, I am Nishat Alam, a student and a dedicated coder. I have a passion for
              creating simple, practical tools that help people manage their digital life more
              efficiently.
            </p>
          </div>

          {/* About the Website */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
              About the Website
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              I created Biosnap, a lightweight link organizer designed to solve the common problem
              of losing track of important websites. Many users visit multiple websites daily, and
              finding them later can be frustrating. Biosnap provides a central place to save,
              organize, and access your links quickly and easily.
            </p>
          </div>

          {/* Key Features */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-3">
              Key Features
            </h2>
            <ul className="space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-zinc-600 dark:text-zinc-400">
                  <span className="mt-2 w-2 h-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary flex-shrink-0 inline-block" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy and Security */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
              Privacy and Security
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              All user data remains private. No information is collected or shared, ensuring
              100% secure and worry-free use.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
              Contact
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              For feedback, suggestions, or inquiries, you can reach me at{' '}
              
                href="mailto:alamnishat456@gmail.com"
                className="font-semibold text-brand-primary hover:underline"
              >
                alamnishat456@gmail.com
              </a>
              .
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
