import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Link2, Pencil, Shield, ChevronDown } from 'lucide-react';

interface HomeProps {
  onGetStarted: () => void;
}

const TYPEWRITER_PHRASES = [
  'Save Time',
  'Boost Productivity',
  'Save Multiple Links In A Single Place',
];

export default function Home({ onGetStarted }: HomeProps) {
  const [displayText, setDisplayText] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Typewriter engine (fixed — no stale closure) ───────────────────────────
  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (displayText === phrase) {
        // পুরো word type হয়েছে → 1.8s অপেক্ষা → delete শুরু
        timeout = setTimeout(() => setIsDeleting(true), 1800);
      } else {
        // একটা একটা করে letter যোগ করো
        timeout = setTimeout(
          () => setDisplayText(phrase.slice(0, displayText.length + 1)),
          80
        );
      }
    } else {
      if (displayText === '') {
        // সব মুছে গেছে → পরের phrase-এ যাও
        setIsDeleting(false);
        setPhraseIdx((i) => (i + 1) % TYPEWRITER_PHRASES.length);
      } else {
        // একটা একটা করে letter মুছো
        timeout = setTimeout(
          () => setDisplayText(displayText.slice(0, -1)),
          45
        );
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIdx]);

  // ── Scroll reveal ──────────────────────────────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.home-reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('home-visible')),
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="w-full">

      {/* HERO */}
      <section className="min-h-[88vh] flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">

        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-brand-secondary/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/20 text-brand-primary text-xs font-black uppercase tracking-widest mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
          Free forever · No credit card needed
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none mb-6 max-w-3xl"
        >
          Here you can{' '}
          <span className="relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
              {displayText}
            </span>
            <span
              className="inline-block w-0.5 h-[0.85em] bg-brand-primary ml-1 align-middle"
              style={{ animation: 'blink 0.75s step-end infinite alternate' }}
            />
          </span>
          <br />
          <span className="text-zinc-900 dark:text-zinc-100">In One Click</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="text-zinc-500 dark:text-zinc-400 text-lg font-medium max-w-md mb-10 leading-relaxed"
        >
          Organize all your important links in one beautiful, private page.
          No clutter. No chaos. Just your links, always ready.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={onGetStarted}
            className="neu-primary-btn flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg"
          >
            Get Started <ArrowRight size={20} />
          </button>

          <a href="#how-it-works" className="neu-btn text-sm">
            See how it works <ChevronDown size={15} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-400 text-[10px] font-bold uppercase tracking-widest"
          style={{ animation: 'heroScroll 2s ease infinite' }}
        >
          Scroll ↓
        </motion.div>
      </section>

      {/* WHAT YOU CAN DO */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="home-reveal mb-14">
            <p className="text-xs font-black uppercase tracking-widest text-brand-primary mb-2">
              What you can do here?
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 leading-tight">
              Everything you need,<br />nothing you don't.
            </h2>
            <p className="mt-3 text-zinc-500 dark:text-zinc-400 font-medium max-w-sm">
              BioSnap keeps your digital life organized — beautifully and privately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.article whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }} className="home-reveal glass-card rounded-[2rem] p-8 relative overflow-hidden group" style={{ transitionDelay: '0.1s' }}>
              <div className="absolute top-4 right-5 text-6xl font-black text-brand-primary/8 select-none leading-none">01</div>
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-5 group-hover:bg-brand-primary/20 transition-colors">
                <Link2 size={22} className="text-brand-primary" />
              </div>
              <h3 className="font-black text-zinc-900 dark:text-zinc-100 text-lg mb-2 tracking-tight">Save Multiple Links</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Save multiple links in a single website — no more forgetting where you saved something.
              </p>
            </motion.article>

            <motion.article whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }} className="home-reveal glass-card rounded-[2rem] p-8 relative overflow-hidden group" style={{ transitionDelay: '0.2s' }}>
              <div className="absolute top-4 right-5 text-6xl font-black text-brand-secondary/8 select-none leading-none">02</div>
              <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center mb-5 group-hover:bg-brand-secondary/20 transition-colors">
                <Pencil size={22} className="text-brand-secondary" />
              </div>
              <h3 className="font-black text-zinc-900 dark:text-zinc-100 text-lg mb-2 tracking-tight">Edit or Delete Any Time</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Your links are always under your control. Update, rename or remove them whenever you want.
              </p>
            </motion.article>

            <motion.article whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }} className="home-reveal glass-card rounded-[2rem] p-8 relative overflow-hidden group" style={{ transitionDelay: '0.3s' }}>
              <div className="absolute top-4 right-5 text-6xl font-black text-brand-accent/8 select-none leading-none">03</div>
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-5 group-hover:bg-brand-accent/20 transition-colors">
                <Shield size={22} className="text-brand-accent" />
              </div>
              <h3 className="font-black text-zinc-900 dark:text-zinc-100 text-lg mb-2 tracking-tight">Full Free & 100% Private</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Full free and 100% private. Your data belongs to you — we never sell or share it.
              </p>
            </motion.article>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 bg-zinc-900 dark:bg-zinc-950 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.3) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="home-reveal mb-14">
            <p className="text-xs font-black uppercase tracking-widest text-brand-primary/60 mb-2">How it works?</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-100 leading-tight">Simple as 1 – 2 – 3</h2>
            <p className="mt-3 text-zinc-500 font-medium max-w-sm">Get started in under a minute. No setup, no complexity.</p>
          </div>

          <div className="relative pl-10">
            <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-gradient-to-b from-brand-primary/60 via-brand-secondary/40 to-brand-accent/20" />

            {[
              { n: '1', color: 'brand-primary', label: 'Step One', text: 'Press get started and then sign in using your email or Google', note: 'Quick and secure — no password required if you use Google.' },
              { n: '2', color: 'brand-secondary', label: 'Step Two', text: 'Simply click "Add URL", enter your website title, subtitle and link, then save', note: 'Takes about 10 seconds per link. Edit or delete anytime from your dashboard.' },
              { n: '3', color: 'brand-accent', label: 'Step Three', text: 'Click "Playlist" if you want to save multiple links of the same category website', note: 'Group related links into one playlist — e.g. all design tools or study resources.' },
            ].map((step, i) => (
              <div key={step.n} className="home-reveal relative mb-12 last:mb-0" style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className={`absolute -left-6 top-0.5 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg bg-gradient-to-br ${step.color === 'brand-primary' ? 'from-indigo-400 to-indigo-600' : ''} ${step.color === 'brand-secondary' ? 'from-pink-400 to-pink-600' : ''} ${step.color === 'brand-accent' ? 'from-amber-400 to-amber-600' : ''}`}>
                  {step.n}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">{step.label}</p>
                <p className="text-zinc-100 font-bold text-lg leading-snug mb-1.5">{step.text}</p>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">{step.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-brand-primary/10 via-brand-secondary/5 to-transparent blur-3xl" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-[2.5rem] p-12 shadow-2xl shadow-brand-primary/10"
          >
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 leading-tight mb-4">
              Ready to boost your productivity and save time with full free{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">BioSnap?</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-10 leading-relaxed">
              Join thousands of people who have already simplified their digital life. No credit card. No catch.
            </p>
            <button onClick={onGetStarted} className="neu-primary-btn inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xl mx-auto">
              <span>✧</span>
              Get started
              <ArrowRight size={22} />
            </button>
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Free forever · No setup required</p>
          </motion.div>
        </div>
      </section>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes heroScroll {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-8px); }
        }
        .home-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .home-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
