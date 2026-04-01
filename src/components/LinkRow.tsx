import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, LinkItem } from '../types';
import { ExternalLink, Pin } from 'lucide-react';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: link.title, subtitle: link.subtitle || '', url: link.url });

  const togglePin = async () => {
    const updatedLinks = profile.links.map(l => l.id === link.id ? { ...l, pinned: !l.pinned } : l);
    await updateDoc(doc(db, 'users', user.uid), { links: updatedLinks });
  };

  const changeColor = async (color: string) => {
    const updatedLinks = profile.links.map(l => l.id === link.id ? { ...l, color } : l);
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

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData.url.trim()) return;
    const updatedLinks = profile.links.map(l => l.id === link.id ? { ...l, ...editData } : l);
    await updateDoc(doc(db, 'users', user.uid), { links: updatedLinks });
    setIsEditing(false);
  };

  const faviconUrl = getFaviconUrl(link.url);

  return (
    <div className="flex items-start gap-3">
      <button onClick={() => setIsEditing(!isEditing)} className="cta" title="Edit link">
        <span>Edit</span>
        <svg width="15px" height="10px" viewBox="0 0 13 10">
          <path d="M1,5 L11,5"></path>
          <polyline points="8 1 12 5 8 9"></polyline>
        </svg>
      </button>

      <div className="flex-1 min-w-0 space-y-2">
        {isEditing && (
          <form onSubmit={handleEditSave} className="p-4 rounded-2xl space-y-2"
            style={{ background: '#f0f0f0', boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff' }}>
            <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Editing link</p>
            <input type="text" placeholder="Title" value={editData.title}
              onChange={e => setEditData({ ...editData, title: e.target.value })} className="neu-input" required autoFocus />
            <input type="text" placeholder="Subtitle (optional)" value={editData.subtitle}
              onChange={e => setEditData({ ...editData, subtitle: e.target.value })} className="neu-input" />
            <input type="url" placeholder="https://..." value={editData.url}
              onChange={e => setEditData({ ...editData, url: e.target.value })} className="neu-input" required />
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setIsEditing(false)} className="neu-inline-cancel-btn">CANCEL</button>
              <button type="submit" className="neu-inline-add-btn">SAVE</button>
            </div>
          </form>
        )}

        <div className="neu-card p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="relative w-8 h-8">
                {faviconUrl && !faviconError ? (
                  <img src={faviconUrl} alt="" onError={() => setFaviconError(true)}
                    className="w-8 h-8 rounded-lg object-contain bg-zinc-100 p-1" />
                ) : (
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: link.color }} />
                )}
                <input type="color" value={link.color} onChange={(e) => changeColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Change color" />
              </div>
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="group/link flex items-center gap-2">
                  <h3 className="font-bold text-zinc-900 truncate hover:text-indigo-600 transition-colors">{link.title}</h3>
                  <ExternalLink size={14} className="text-zinc-300 group-hover/link:text-indigo-500 transition-colors" />
                </a>
                {link.pinned && <Pin size={12} className="text-orange-500 fill-orange-500" />}
              </div>
              <p className="text-sm text-zinc-500 truncate">{link.subtitle}</p>
              <p className="text-[10px] text-zinc-400 font-medium mt-1">↑ Click title to visit link</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handleCopy} className={`copy-btn ${copied ? 'copied' : ''}`} title="Copy link">
                <span>
                  <svg width="11" height="11" fill="#6366f1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 467 512.22">
                    <path fillRule="nonzero" d="M131.07 372.11c.37 1 .57 2.08.57 3.2 0 1.13-.2 2.21-.57 3.21v75.91c0 10.74 4.41 20.53 11.5 27.62s16.87 11.49 27.62 11.49h239.02c10.75 0 20.53-4.4 27.62-11.49s11.49-16.88 11.49-27.62V152.42c0-10.55-4.21-20.15-11.02-27.18l-.47-.43c-7.09-7.09-16.87-11.5-27.62-11.5H170.19c-10.75 0-20.53 4.41-27.62 11.5s-11.5 16.87-11.5 27.61v219.69zm-18.67 12.54H57.23c-15.82 0-30.1-6.58-40.45-17.11C6.41 356.97 0 342.4 0 326.52V57.79c0-15.86 6.5-30.3 16.97-40.78l.04-.04C27.51 6.49 41.94 0 57.79 0h243.63c15.87 0 30.3 6.51 40.77 16.98l.03.03c10.48 10.48 16.99 24.93 16.99 40.78v36.85h50c15.9 0 30.36 6.5 40.82 16.96l.54.58c10.15 10.44 16.43 24.66 16.43 40.24v302.01c0 15.9-6.5 30.36-16.96 40.82-10.47 10.47-24.93 16.97-40.83 16.97H170.19c-15.9 0-30.35-6.5-40.82-16.97-10.47-10.46-16.97-24.92-16.97-40.82v-69.78zM340.54 94.64V57.79c0-10.74-4.41-20.53-11.5-27.63-7.09-7.08-16.86-11.48-27.62-11.48H57.79c-10.78 0-20.56 4.38-27.62 11.45l-.04.04c-7.06 7.06-11.45 16.84-11.45 27.62v268.73c0 10.86 4.34 20.79 11.38 27.97 6.95 7.07 16.54 11.49 27.17 11.49h55.17V152.42c0-15.9 6.5-30.35 16.97-40.82 10.47-10.47 24.92-16.96 40.82-16.96h170.35z"></path>
                  </svg>
                  Copy link
                </span>
                <span>Copied ✓</span>
              </button>

              <button onClick={togglePin} className={`neu-pin-btn ${link.pinned ? 'neu-pin-btn--active' : ''}`}
                title={link.pinned ? 'Unpin' : 'Pin to top'}>
                <Pin size={16} />
              </button>

              <button onClick={deleteLink} className="trash-btn" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 14" className="trash-icon bin-top">
                  <g clipPath="url(#clip0_35_24)">
                    <path fill="black" d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"></path>
                  </g>
                  <defs><clipPath id="clip0_35_24"><rect fill="white" height="14" width="69"></rect></clipPath></defs>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 57" className="trash-icon bin-bottom">
                  <g clipPath="url(#clip0_35_22)">
                    <path fill="black" d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"></path>
                  </g>
                  <defs><clipPath id="clip0_35_22"><rect fill="white" height="57" width="69"></rect></clipPath></defs>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
