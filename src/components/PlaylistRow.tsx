import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Playlist, LinkItem, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, Folder, Trash2, MoreHorizontal, Plus } from 'lucide-react';
import LinkRow from './LinkRow';

interface PlaylistRowProps {
  playlist: Playlist;
  links: LinkItem[];
  user: User;
  profile: UserProfile;
}

export default function PlaylistRow({ playlist, links, user, profile }: PlaylistRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [inlineLink, setInlineLink] = useState({ title: '', url: '' });

  const handleInlineAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineLink.url) return;

    const newLink: LinkItem = {
      id: crypto.randomUUID(),
      title: inlineLink.title || 'Untitled',
      url: inlineLink.url,
      color: '#18181b',
      pinned: false,
      playlistId: playlist.id
    };

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      links: [...profile.links, newLink]
    });

    setInlineLink({ title: '', url: '' });
    setIsAdding(false);
    setIsOpen(true);
  };

  const deletePlaylist = async () => {
    const newPlaylists = profile.playlists.filter(p => p.id !== playlist.id);
    const newLinks = profile.links.map(l => l.playlistId === playlist.id ? { ...l, playlistId: undefined } : l);
    await updateDoc(doc(db, 'users', user.uid), {
      playlists: newPlaylists,
      links: newLinks
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between group">
        {/* ✅ Neumorphic Playlist Card */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center gap-3 p-4 neu-card transition-all text-left rounded-2xl"
        >
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500 shadow-inner">
            <Folder size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{playlist.name}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{links.length} links</p>
          </div>
          <div className="p-1 rounded-full bg-zinc-100/50 dark:bg-zinc-800/50">
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </button>

        <div className="relative ml-2 flex gap-2">
          {/* ✅ Neumorphic + Button */}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="neu-playlist-action-btn"
            title="Add link to playlist"
          >
            <Plus size={18} className="text-indigo-500" />
          </button>

          {/* ✅ Neumorphic ··· Button */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="neu-playlist-action-btn"
            title="Options"
          >
            <MoreHorizontal size={18} className="text-zinc-500" />
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
        {/* ✅ Neumorphic Inline Add Form */}
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            onSubmit={handleInlineAdd}
            className="mx-4 p-5 rounded-2xl space-y-3"
            style={{ background: '#f0f0f0', boxShadow: '8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff' }}
          >
            {/* ✅ Title input — neumorphic search style */}
            <input
              type="text"
              placeholder="Title..."
              value={inlineLink.title}
              onChange={e => setInlineLink({...inlineLink, title: e.target.value})}
              className="neu-inline-input"
              required
            />
            {/* ✅ URL input — neumorphic search style */}
            <input
              type="url"
              placeholder="https://..."
              value={inlineLink.url}
              onChange={e => setInlineLink({...inlineLink, url: e.target.value})}
              className="neu-inline-input"
              required
            />
            <div className="flex justify-end gap-2 pt-1">
              {/* ✅ Neumorphic Cancel button */}
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="neu-inline-cancel-btn"
              >
                CANCEL
              </button>
              {/* ✅ Neumorphic Add button */}
              <button
                type="submit"
                className="neu-inline-add-btn"
              >
                ADD
              </button>
            </div>
          </motion.form>
        )}

        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pl-6 space-y-3 overflow-hidden"
          >
            {links.length === 0 ? (
              <p className="text-sm text-zinc-400 italic py-4 text-center">No links yet. Click + to add one!</p>
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
