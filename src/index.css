@import "tailwindcss";

@theme {
  --color-zinc-950: #09090b;
  --color-brand-primary: #6366f1;
  --color-brand-secondary: #ec4899;
  --color-brand-accent: #f59e0b;
}

/* Enable class-based dark mode in Tailwind 4 */
@variant dark (&:where(.dark, .dark *));

@layer base {
  body {
    @apply transition-colors duration-500;
  }
}

/* ✅ Dotted background */
.mesh-gradient {
  background-color: #f8fafc;
  background-image:
    radial-gradient(circle, rgba(99, 102, 241, 0.25) 1px, transparent 1px),
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.06) 0, transparent 50%),
    radial-gradient(at 50% 0%, rgba(236, 72, 153, 0.06) 0, transparent 50%),
    radial-gradient(at 100% 0%, rgba(245, 158, 11, 0.06) 0, transparent 50%);
  background-size: 24px 24px, 100% 100%, 100% 100%, 100% 100%;
}

.dark .mesh-gradient {
  background-color: #09090b;
  background-image:
    radial-gradient(circle, rgba(99, 102, 241, 0.2) 1px, transparent 1px),
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0, transparent 50%),
    radial-gradient(at 50% 0%, rgba(236, 72, 153, 0.12) 0, transparent 50%),
    radial-gradient(at 100% 0%, rgba(245, 158, 11, 0.12) 0, transparent 50%);
  background-size: 24px 24px, 100% 100%, 100% 100%, 100% 100%;
}

.glass-card {
  @apply bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50;
}
