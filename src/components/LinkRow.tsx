import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, LinkItem } from '../types';
import { ExternalLink, Pin, Copy, Check } from 'lucide-react';

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

        {/* Favicon / Color picker — ✅ "Color" label removed */}
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
          {/* ✅ "Color" text label removed */}
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
        <div className="flex items-center gap-2">
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

          {/* ✅ Animated Trash Delete Button */}
          <button
            onClick={deleteLink}
            className="trash-btn"
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 69 14"
              className="trash-icon bin-top"
            >
              <g clipPath="url(#clip0_35_24)">
                <path
                  fill="black"
                  d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
                ></path>
              </g>
              <defs>
                <clipPath id="clip0_35_24">
                  <rect fill="white" height="14" width="69"></rect>
                </clipPath>
              </defs>
            </svg>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 69 57"
              className="trash-icon bin-bottom"
            >
              <g clipPath="url(#clip0_35_22)">
                <path
                  fill="black"
                  d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
                ></path>
              </g>
              <defs>
                <clipPath id="clip0_35_22">
                  <rect fill="white" height="57" width="69"></rect>
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
