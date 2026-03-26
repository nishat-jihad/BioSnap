import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, LinkItem, Playlist } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FolderPlus, Link as LinkIcon, Type, AlignLeft } from 'lucide-react';
import LinkRow from './LinkRow';
import PlaylistRow from './PlaylistRow';

export default function Dashboard({ user, profile }: { user: User; profile: UserProfile }) {
  const [activeForm, setActiveForm] = useState<'link' | 'playlist' | null>(null);
  const [newLink, setNewLink] = useState({ title: '', subtitle: '', url: '' });
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // সরাসরি লিংক অ্যাড করার ফাংশন
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.url) return;
    const link: LinkItem = { id: crypto.randomUUID(), ...newLink, color: '#18181b', pinned: false };
    await updateDoc(doc(db, 'users', user.uid), { links: [...(profile.links || []), link] });
    setNewLink({ title: '', subtitle: '', url: '' });
    setActiveForm(null);
  };

  // নতুন প্লেলিস্ট বানানোর ফাংশন
  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const playlist: Playlist = { id: crypto.randomUUID(), name: newPlaylistName.trim() };
    await updateDoc(doc(db, 'users', user.uid), { playlists: [...(profile.playlists || []), playlist] });
    setNewPlaylistName('');
    setActiveForm(null);
  };

  const displayLinks = [...(profile.links || [])].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));

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
        {/* লিংক অ্যাড করার ফর্ম (টাইটেল, সাবটাইটেল সহ) */}
        {activeForm === 'link' && (
          <motion.form key="link-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleAddLink} className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-indigo-500/20 shadow-2xl space-y-4">
            <h3 className="font-black text-xl italic text-indigo-600">Add New URL</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Title" value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 outline-none" required />
              <input type="text" placeholder="Subtitle (Optional)" value={newLink.subtitle} onChange={e => setNewLink({...newLink, subtitle: e.target.value})} className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 outline-none" />
              <input type="url" placeholder="https://..." value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 outline-none" required />
            </div>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setActiveForm(null)} className="px-4 py-2 font-bold text-zinc-400">Cancel</button><button type="submit" className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md">Save Link</button></div>
          </motion.form>
        )}

        {/* প্লেলিস্ট তৈরির ফর্ম */}
        {activeForm === 'playlist' && (
          <motion.form key="playlist-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleAddPlaylist} className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-orange-500/20 shadow-2xl space-y-4">
            <h3 className="font-black text-xl italic text-orange-600">Create Playlist</h3>
            <input type="text" placeholder="Playlist Name..." value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-500 outline-none" required autoFocus />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setActiveForm(null)} className="px-4 py-2 font-bold text-zinc-400">Cancel</button><button type="submit" className="px-8 py-2 bg-orange-500 text-white rounded-xl font-bold shadow-md">Create</button></div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* কন্টেন্ট লিস্ট */}
      <div className="space-y-6">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">My Content</h2>
        
        {/* মেইন লিংকগুলো */}
        {displayLinks.filter(l => !l.playlistId).map(link => (
          <LinkRow key={link.id} link={link} user={user} profile={profile} />
        ))}
        
        {/* প্লেলিস্টগুলো (যেগুলোর ভেতর লিংক থাকবে) */}
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
