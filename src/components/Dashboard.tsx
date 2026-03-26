import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, LinkItem, Playlist } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FolderPlus, Code } from 'lucide-react';
import LinkRow from './LinkRow';
import PlaylistRow from './PlaylistRow';

export default function Dashboard({ user, profile }: { user: User; profile: UserProfile }) {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', subtitle: '', url: '' });
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const link: LinkItem = { id: crypto.randomUUID(), ...newLink, color: '#18181b', pinned: false };
    await updateDoc(doc(db, 'users', user.uid), { links: [...profile.links, link] });
    setIsAddingLink(false);
    setNewLink({ title: '', subtitle: '', url: '' });
  };

  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const playlist: Playlist = { id: crypto.randomUUID(), name: newPlaylistName };
    await updateDoc(doc(db, 'users', user.uid), { playlists: [...(profile.playlists || []), playlist] });
    setIsAddingPlaylist(false);
    setNewPlaylistName('');
  };

  const displayLinks = [...profile.links].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <button onClick={() => setIsAddingLink(true)} className="flex-1 flex items-center justify-center gap-2 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg hover:scale-[1.01] transition-all"><Plus size={24} /> Add URL</button>
        <button onClick={() => setIsAddingPlaylist(true)} className="px-8 flex items-center justify-center gap-2 py-5 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl font-black text-lg hover:bg-zinc-50 transition-all"><FolderPlus size={24} className="text-orange-500" /> New Playlist</button>
      </div>

      <AnimatePresence>
        {isAddingPlaylist && (
          <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleAddPlaylist} className="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-orange-100 dark:border-orange-900/20 shadow-xl space-y-4">
            <h3 className="font-black text-xl italic text-orange-600">Create New Playlist</h3>
            <input type="text" placeholder="Playlist Name..." value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 outline-none border-2 border-transparent focus:border-orange-500" required autoFocus />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setIsAddingPlaylist(false)} className="px-4 py-2 text-zinc-400 font-bold text-sm">Cancel</button><button type="submit" className="px-6 py-2 bg-orange-500 text-white rounded-xl font-bold">Create</button></div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div className="flex justify-between items-end px-2"><h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">My Content</h2><p className="text-[10px] text-zinc-400 italic">Tip: Click title to open link • Click dot to color</p></div>
        {displayLinks.filter(l => !l.playlistId).map(link => <LinkRow key={link.id} link={link} user={user} profile={profile} />)}
        {(profile.playlists || []).map(p => <PlaylistRow key={p.id} playlist={p} links={profile.links.filter(l => l.playlistId === p.id)} user={user} profile={profile} />)}
      </div>
    </div>
  );
}
