import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, LinkItem } from '../types';
import { ExternalLink, MoreVertical, Pin, Trash2, Palette } from 'lucide-react';

interface LinkRowProps {
  link: LinkItem;
  user: User;
  profile: UserProfile;
}

export default function LinkRow({ link, user, profile }: LinkRowProps) {
  const [showOptions, setShowOptions] = useState(false);

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

  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        {/* কালার চেঞ্জ করার অপশন এবং ছোট টেক্সট */}
        <div className="relative flex flex-col items-center gap-1">
          <input
            type="color"
            value={link.color}
            onChange={(e) => changeColor(e.target.value)}
            className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-800 cursor-pointer overflow-hidden"
            title="Change color"
          />
          <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-tighter">Color</span>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            {/* সরাসরি লিংকে যাওয়ার জন্য ক্লিক করার জায়গা */}
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
          
          {/* ইউজার গাইডেন্স টেক্সট */}
          <p className="text-[10px] text-zinc-300 dark:text-zinc-600 font-medium mt-1">
            ↑ Click title to visit link
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={togglePin}
            className={`p-2 rounded-xl transition-colors ${link.pinned ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            title={link.pinned ? "Unpin from top" : "Pin to top"}
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
