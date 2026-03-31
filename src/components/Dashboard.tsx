import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, LinkItem, Playlist } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FolderPlus, Search } from 'lucide-react';
import LinkRow from './LinkRow';
import PlaylistRow from './PlaylistRow';

export default function Dashboard({ user, profile }: { user: User; profile: UserProfile }) {
  const [activeForm, setActiveForm] = useState<'link' | 'playlist' | null>(null);
  const [newLink, setNewLink] = useState({ title: '', subtitle: '', url: '' });
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // ✅ Feature 1: Search
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Feature 3: Drag & Drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.url) return;
    const link: LinkItem = { id: crypto.randomUUID(), ...newLink, color: '#18181b', pinned: false };
    await updateDoc(doc(db, 'users', user.uid), { links: [...(profile.links || []), link] });
    setNewLink({ title: '', subtitle: '', url: '' });
    setActiveForm(null);
  };

  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const playlist: Playlist = { id: crypto.randomUUID(), name: newPlaylistName.trim() };
    await updateDoc(doc(db, 'users', user.uid), { playlists: [...(profile.playlists || []), playlist] });
    setNewPlaylistName('');
    setActiveForm(null);
  };

  // ✅ Feature 1: Search logic — title first, then subtitle, then URL
  const sortedLinks = [...(profile.links || [])].sort((a, b) =>
    a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1
  );

  const filterLinks = (links: LinkItem[]) => {
    if (!searchQuery.trim()) return links;
    const q = searchQuery.toLowerCase();
    return links
      .map(link => {
        let score = 0;
        if (link.title.toLowerCase().includes(q)) score = 3;
        else if (link.subtitle?.toLowerCase().includes(q)) score = 2;
        else if (link.url.toLowerCase().includes(q)) score = 1;
        return { link, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.link);
  };

  const displayLinks = filterLinks(sortedLinks.filter(l => !l.playlistId));

  // ✅ Feature 3: Drag & Drop handlers
  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const links = [...(profile.links || [])];
    const fromIndex = links.findIndex(l => l.id === draggedId);
    const toIndex = links.findIndex(l => l.id === targetId);
    const [moved] = links.splice(fromIndex, 1);
    links.splice(toIndex, 0, moved);
    await updateDoc(doc(db, 'users', user.uid), { links });
    setDraggedId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="space-y-8">
      {/* মেইন বাটন দুইটা */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveForm(activeForm === 'link' ? null : 'link')}
          className={`flex-1 flex items-center justify-center gap-2 py-5 rounded-2xl font-black text-lg transition-all ${activeForm === 'link' ? 'bg-zinc-800 text-white' : 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700'}`}
        >
          <Plus size={24} /> Add URL
        </button>
        <button
          onClick={() => setActiveForm(activeForm === 'playlist' ? null : 'playlist')}
          className={`px-8 flex items-center justify-center gap-2 py-5 rounded-2xl font-black text-lg transition-all ${activeForm === 'playlist' ? 'bg-zinc-800 text-white' : 'bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800'}`}
        >
          <FolderPlus size={24} className="text-orange-500" /> New Playlist
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeForm === 'link' && (
          <motion.form key="link-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleAddLink} className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-indigo-500/20 shadow-2xl space-y-4">
            <h3 className="font-black text-xl italic text-indigo-600">Add New URL</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Title" value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 outline-none" required />
              <input type="text" placeholder="Subtitle (Optional)" value={newLink.subtitle} onChange={e => setNewLink({...newLink, subtitle: e.target.value})} className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 outline-none" />
              <input type="url" placeholder="https://..." value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 outline-none" required />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setActiveForm(null)} className="px-4 py-2 font-bold text-zinc-400">Cancel</button>
              <button type="submit" className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md">Save Link</button>
            </div>
          </motion.form>
        )}

        {activeForm === 'playlist' && (
          <motion.form key="playlist-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleAddPlaylist} className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-orange-500/20 shadow-2xl space-y-4">
            <h3 className="font-black text-xl italic text-orange-600">Create Playlist</h3>
            <input type="text" placeholder="Playlist Name..." value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-500 outline-none" required autoFocus />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setActiveForm(null)} className="px-4 py-2 font-bold text-zinc-400">Cancel</button>
              <button type="submit" className="px-8 py-2 bg-orange-500 text-white rounded-xl font-bold shadow-md">Create</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">My Content</h2>
        </div>

        {/* ✅ Feature 1: Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 outline-none text-sm font-medium transition-all"
          />
        </div>

        {/* ✅ Feature 3: Drag & Drop enabled links */}
        {displayLinks.map(link => (
          <div
            key={link.id}
            draggable
            onDragStart={() => handleDragStart(link.id)}
            onDragOver={e => handleDragOver(e, link.id)}
            onDrop={() => handleDrop(link.id)}
            onDragEnd={handleDragEnd}
            className={`transition-all cursor-grab active:cursor-grabbing ${
              dragOverId === link.id ? 'scale-[1.02] opacity-70' : ''
            } ${draggedId === link.id ? 'opacity-40' : ''}`}
          >
            <LinkRow link={link} user={user} profile={profile} />
          </div>
        ))}

        {/* Search এ কিছু না পেলে */}
        {searchQuery && displayLinks.length === 0 && (
          <p className="text-center text-sm text-zinc-400 py-6">No links found for "{searchQuery}"</p>
        )}

        {(profile.playlists || []).map(p => (
          <PlaylistRow
            key={p.id}
            playlist={p}
            links={profile.links.filter(l => l.playlistId === p.id)}
            user={user}
            profile={profile}
          />
        ))}
      </div>
    </div>
  );
}
