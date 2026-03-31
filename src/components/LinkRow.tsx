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

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

export default function LinkRow({ link, user, profile }: LinkRowProps) {
  const [copied, setCopied] = useState(false);
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const faviconUrl = getFaviconUrl(link.url);

  return (
    // ✅ Neumorphic card
    <div className="neu-card p-4">
      <div className="flex items-center gap-4">

        {/* Favicon / Color picker */}
        <div className="relative flex flex-col items-center gap-1">
          <div className="relative w-8 h-8">
            {faviconUrl && !faviconError ? (
              <img
                src={faviconUrl}
                alt=""
                onError={() => setFaviconError(true)}
                className="w-8 h-8 rounded-lg object-contain bg-zinc-100 p-1"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg"
                style={{ backgroundColor: link.color }}
              />
            )}
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

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center gap-2"
            >
              <h3 className="font-bold text-zinc-900 truncate hover:text-indigo-600 transition-colors">
                {link.title}
              </h3>
              <ExternalLink size={14} className="text-zinc-300 group-hover/link:text-indigo-500 transition-colors" />
            </a>
            {link.pinned && <Pin size={12} className="text-orange-500 fill-orange-500" />}
          </div>
          <p className="text-sm text-zinc-500 truncate">{link.subtitle}</p>
          <p className="text-[10px] text-zinc-400 font-medium mt-1">↑ Click title to visit link</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className={`p-2 rounded-xl transition-colors ${copied ? 'text-emerald-500' : 'text-zinc-400 hover:text-zinc-700'}`}
            title="Copy link"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <button
            onClick={togglePin}
            className={`p-2 rounded-xl transition-colors ${link.pinned ? 'text-orange-500' : 'text-zinc-400 hover:text-zinc-700'}`}
            title={link.pinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin size={18} />
          </button>
          <button
            onClick={deleteLink}
            className="p-2 text-zinc-400 hover:text-red-500 rounded-xl transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
