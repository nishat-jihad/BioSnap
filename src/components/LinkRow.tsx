import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, LinkItem } from '../types';
import { ExternalLink, Pin, Trash2, Copy, Check } from 'lucide-react';

interface LinkRowProps {
  link: LinkItem;
  user: User;
  profile: UserProfile;
}

// ✅ Feature 2: Favicon helper function
function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

export default function LinkRow({ link, user, profile }: LinkRowProps) {
  const [showOptions, setShowOptions] = useState(false);

  // ✅ Feature 4: Copy state
  const [copied, setCopied] = useState(false);

  // ✅ Feature 2: Favicon error fallback state
  const [faviconError, setFaviconError] = useState(false);

  const togglePin = async () => {
    const updatedLinks = profile.links.map(l =>
      l.id === link.id ? { ...l, pinned: !l.pinned } : l
    );
    await updateDoc(doc(db, 'users', user.uid), { links: updatedLinks });
  };

  const changeColor = async (color: string) => {
    const updatedLinks = profile.links.map(l =>
      l.id === link.id ? { ...l, color } : l
    );
    await updateDoc(doc(db, 'users', user.uid), { links: updatedLinks });
  };

  const deleteLink = async () => {
    const updatedLinks = profile.links.filter(l => l.id !== link.id);
    await updateDoc(doc(db, 'users', user.uid), { links: updatedLinks });
  };

  // ✅ Feature 4: Copy link to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const faviconUrl = getFaviconUrl(link.url);

  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 transition-all hover:shadow-md">
      <div className="flex items-center gap-4">

        {/* ✅ Feature 2: Favicon + Color picker */}
        <div className="relative flex flex-col items-center gap-1">
          {/* Favicon shown on top of color swatch */}
          <div className="relative w-8 h-8">
            {faviconUrl && !faviconError ? (
              <img
                src={faviconUrl}
                alt=""
                onError={() => setFaviconError(true)}
                className="w-8 h-8 rounded-lg object-contain bg-zinc-100 dark:bg-zinc-800 p-1"
              />
            ) : (
              // fallback: color square
              <div
                className="w-8 h-8 rounded-lg border-2 border-white dark:border-zinc-800"
                style={{ backgroundColor: link.color }}
              />
            )}
            {/* Hidden color input still available on click */}
            <input
              type="color"
              value={link.color}
              onChange={(e) => changeColor(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Change color"
            />
          </div>
          <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-tighter">Color</span>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center gap-2"
            >
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate hover:text-indigo-600 transition-colors">
                {link.title}
              </h3>
              <ExternalLink size={14} className="text-zinc-300 group-hover/link:text-indigo-500 transition-colors" />
            </a>
            {link.pinned && <Pin size={12} className="text-orange-500 fill-orange-500" />}
          </div>
          <p className="text-sm text-zinc-500 truncate">{link.subtitle}</p>
          <p className="text-[10px] text-zinc-300 dark:text-zinc-600 font-medium mt-1">
            ↑ Click title to visit link
          </p>
        </div>

        <div className="flex items-center gap-1">
          {/* ✅ Feature 4: Copy Button */}
          <button
            onClick={handleCopy}
            className={`p-2 rounded-xl transition-colors ${
              copied
                ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Copy link URL"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>

          <button
            onClick={togglePin}
            className={`p-2 rounded-xl transition-colors ${link.pinned ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            title={link.pinned ? 'Unpin from top' : 'Pin to top'}
          >
            <Pin size={18} />
          </button>

          <button
            onClick={deleteLink}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            title="Delete link"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
