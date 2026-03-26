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
          className="flex-1 flex items-center gap-3 p-4 glass-card hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-all text-left"
        >
          <div className="p-2.5 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-xl text-brand-primary shadow-inner">
            <Folder size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{playlist.name}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{links.length} links</p>
          </div>
          <div className="p-1 rounded-full bg-zinc-100/50 dark:bg-zinc-800/50">
            {isOpen ? <ChevronDown size={18} className="text-zinc-500" /> : <ChevronRight size={18} className="text-zinc-500" />}
          </div>
        </button>

        <div className="relative ml-2">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2.5 text-zinc-400 hover:text-brand-primary hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-xl transition-all"
          >
            <MoreHorizontal size={20} />
          </button>
          
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute right-0 top-full mt-2 z-20 w-44 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-1.5"
              >
                <button
                  onClick={deletePlaylist}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
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
