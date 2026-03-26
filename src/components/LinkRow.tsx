import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LinkItem, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MoreVertical, Pin, Edit2, Trash2, Move, ExternalLink, Check } from 'lucide-react';

interface LinkRowProps {
  key?: string;
  link: LinkItem;
  user: User;
  profile: UserProfile;
}

export default function LinkRow({ link, user, profile }: LinkRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: link.title, subtitle: link.subtitle, url: link.url });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const updateProfile = async (newLinks: LinkItem[]) => {
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { links: newLinks });
  };

  const togglePin = async () => {
    const newLinks = profile.links.map(l => l.id === link.id ? { ...l, pinned: !l.pinned } : l);
    await updateProfile(newLinks);
    setIsMenuOpen(false);
  };

  const handleDelete = async () => {
    const newLinks = profile.links.filter(l => l.id !== link.id);
    await updateProfile(newLinks);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLinks = profile.links.map(l => l.id === link.id ? { ...l, ...editData } : l);
    await updateProfile(newLinks);
    setIsEditing(false);
    setIsMenuOpen(false);
  };

  const changeColor = async (color: string) => {
    const newLinks = profile.links.map(l => l.id === link.id ? { ...l, color } : l);
    await updateProfile(newLinks);
    setShowColorPicker(false);
  };

  const moveToPlaylist = async (playlistId: string | undefined) => {
    const newLinks = profile.links.map(l => l.id === link.id ? { ...l, playlistId } : l);
    await updateProfile(newLinks);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative group">
      <motion.div
        layout
        className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-700 transition-transform hover:scale-125"
              style={{ backgroundColor: link.color }}
            />
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute left-0 top-6 z-20 p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 grid grid-cols-4 gap-2"
                >
                  {['#18181b', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'].map(c => (
                    <button
                      key={c}
                      onClick={() => changeColor(c)}
                      className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{link.title}</h3>
              {link.pinned && <Pin size={12} className="text-zinc-400 fill-zinc-400" />}
            </div>
            <p className="text-sm text-zinc-500 truncate">{link.subtitle || 'No description'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ExternalLink size={18} />
          </a>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 z-30 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 overflow-hidden"
          >
            <button
              onClick={togglePin}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <Pin size={16} />
              {link.pinned ? 'Unpin' : 'Pin to Top'}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <Edit2 size={16} />
              Edit Link
            </button>
            
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
            
            <div className="px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Move to Playlist</p>
              <div className="space-y-1">
                <button
                  onClick={() => moveToPlaylist(undefined)}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors ${!link.playlistId ? 'bg-zinc-100 dark:bg-zinc-800 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                >
                  None
                </button>
                {profile.playlists.map(p => (
                  <button
                    key={p.id}
                    onClick={() => moveToPlaylist(p.id)}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors ${link.playlistId === p.id ? 'bg-zinc-100 dark:bg-zinc-800 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
            
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleEdit}
              className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl space-y-4"
            >
              <h2 className="text-2xl font-bold">Edit Link</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  value={editData.title}
                  onChange={e => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={editData.subtitle}
                  onChange={e => setEditData({ ...editData, subtitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none"
                  placeholder="Subtitle"
                />
                <input
                  type="url"
                  required
                  value={editData.url}
                  onChange={e => setEditData({ ...editData, url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none"
                  placeholder="URL"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-semibold text-zinc-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm font-bold"
                >
                  Update Link
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
