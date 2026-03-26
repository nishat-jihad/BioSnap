import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Playlist, LinkItem, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, Folder, Trash2, MoreHorizontal } from 'lucide-react';
import LinkRow from './LinkRow';

interface PlaylistRowProps {
  key?: string;
  playlist: Playlist;
  links: LinkItem[];
  user: User;
  profile: UserProfile;
}

export default function PlaylistRow({ playlist, links, user, profile }: PlaylistRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const deletePlaylist = async () => {
    const newPlaylists = profile.playlists.filter(p => p.id !== playlist.id);
    // Also clear playlistId from links
    const newLinks = profile.links.map(l => l.playlistId === playlist.id ? { ...l, playlistId: undefined } : l);
    
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      playlists: newPlaylists,
      links: newLinks
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-left"
        >
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
            <Folder size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{playlist.name}</h3>
            <p className="text-xs text-zinc-500">{links.length} links</p>
          </div>
          {isOpen ? <ChevronDown size={20} className="text-zinc-400" /> : <ChevronRight size={20} className="text-zinc-400" />}
        </button>

        <div className="relative ml-2">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>
          
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-full mt-2 z-20 w-40 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-1"
              >
                <button
                  onClick={deletePlaylist}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Playlist
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pl-6 space-y-3 overflow-hidden"
          >
            {links.length === 0 ? (
              <p className="text-sm text-zinc-400 italic py-2">No links in this playlist yet.</p>
            ) : (
              links.map(link => (
                <LinkRow key={link.id} link={link} user={user} profile={profile} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
