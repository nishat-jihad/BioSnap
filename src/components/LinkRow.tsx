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
    
    let finalUrl = editData.url.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const newLinks = profile.links.map(l => l.id === link.id ? { ...l, ...editData, url: finalUrl } : l);
    await updateProfile(newLinks);
    setIsEditing(false);
    setIsMenuOpen(false);
  };

  const changeColor = async (color: string) => {
    const newLinks = profile.links.map(l => l.id === link.id ? { ...l, color } : l);
    await updateProfile(newLinks);
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
        className="glass-card p-4 flex items-center justify-between hover:shadow-lg transition-all"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-5 h-5 rounded-full border-2 border-white/50 dark:border-white/20 shadow-sm transition-transform hover:scale-125"
              style={{ backgroundColor: link.color }}
            />
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute left-0 top-10 z-20 p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-64"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        '#18181b', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
                        '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
                        '#d946ef', '#ec4899', '#f43f5e', '#64748b', '#71717a', '#a1a1aa'
                      ].map(c => (
                        <button
                          key={c}
                          onClick={() => changeColor(c)}
                          className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${link.color === c ? 'border-brand-primary scale-110' : 'border-white/50 dark:border-white/10'}`}
                          style={{ backgroundColor: c }}
                        >
                          {link.color === c && <Check size={12} className="text-white drop-shadow-sm" />}
                        </button>
                      ))}
                    </div>
                    
                    <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Custom Hex</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={link.color}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                              changeColor(val);
                            }
                          }}
                          className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                          placeholder="#000000"
                        />
                        <div 
                          className="w-9 h-9 rounded-xl border-2 border-white/50 dark:border-white/10 shadow-inner shrink-0"
                          style={{ backgroundColor: link.color }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{link.title}</h3>
              {link.pinned && <Pin size={12} className="text-brand-accent fill-brand-accent" />}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{link.subtitle || 'No description'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-400 hover:text-brand-primary transition-colors"
          >
            <ExternalLink size={18} />
          </a>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-zinc-400 hover:text-brand-primary transition-colors"
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
            className="absolute right-0 top-full mt-2 z-30 w-56 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 overflow-hidden"
          >
            <button
              onClick={togglePin}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-brand-primary/10 hover:text-brand-primary rounded-xl transition-colors"
            >
              <Pin size={16} />
              {link.pinned ? 'Unpin' : 'Pin to Top'}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-brand-primary/10 hover:text-brand-primary rounded-xl transition-colors"
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
                  className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors ${!link.playlistId ? 'bg-brand-primary/20 text-brand-primary font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                >
                  None
                </button>
                {profile.playlists.map(p => (
                  <button
                    key={p.id}
                    onClick={() => moveToPlaylist(p.id)}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors ${link.playlistId === p.id ? 'bg-brand-primary/20 text-brand-primary font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
            
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleEdit}
              className="w-full max-w-md glass-card p-8 space-y-6"
            >
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">Edit Link</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editData.title}
                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    placeholder="Title"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Subtitle</label>
                  <input
                    type="text"
                    value={editData.subtitle}
                    onChange={e => setEditData({ ...editData, subtitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    placeholder="Subtitle"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">URL</label>
                  <input
                    type="text"
                    required
                    value={editData.url}
                    onChange={e => setEditData({ ...editData, url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    placeholder="URL (e.g. google.com)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/25 hover:scale-105 transition-all"
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
