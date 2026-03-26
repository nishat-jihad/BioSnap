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
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  
  // ১. লিংক অ্যাড করার জন্য স্টেট (টাইটেল, সাবটাইটেল সহ)
  const [newLink, setNewLink] = useState({ title: '', subtitle: '', url: '' });
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.url) return;

    const link: LinkItem = { 
      id: crypto.randomUUID(), 
      ...newLink, 
      color: '#18181b', 
      pinned: false 
    };

    await updateDoc(doc(db, 'users', user.uid), { 
      links: [...(profile.links || []), link] 
    });
    
    setIsAddingLink(false);
    setNewLink({ title: '', subtitle: '', url: '' });
  };

  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const playlist: Playlist = { 
      id: crypto.randomUUID(), 
      name: newPlaylistName.trim() 
    };

    await updateDoc(doc(db, 'users', user.uid), { 
      playlists: [...(profile.playlists || []), playlist] 
    });
    
    setIsAddingPlaylist(false);
    setNewPlaylistName('');
  };

  const displayLinks = [...(profile.links || [])].sort((a, b) => 
    (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1)
  );

  return (
    <div className="space-y-8">
      {/* অ্যাকশন বাটনসমূহ */}
      <div className="flex gap-4">
        <button 
          onClick={() => { setIsAddingLink(true); setIsAddingPlaylist(false); }} 
          className="flex-1 flex items-center justify-center gap-2 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={24} /> Add URL
        </button>
        <button 
          onClick={() => { setIsAddingPlaylist(true); setIsAddingLink(false); }} 
          className="px-8 flex items-center justify-center gap-2 py-5 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl font-black text-lg hover:bg-zinc-50 transition-all"
        >
          <FolderPlus size={24} className="text-orange-500" /> New Playlist
        </button>
      </div>

      <AnimatePresence>
        {/* ২. Add URL ফর্ম - এখানে টাইটেল, সাবটাইটেল সব অপশন আছে */}
        {isAddingLink && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            onSubmit={handleAddLink} 
            className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-900/20 shadow-2xl space-y-5 overflow-hidden"
          >
            <div className="space-y-4">
              <div className="relative">
                <Type className="absolute left-4 top-4 text-zinc-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Link Title (e.g. My Portfolio)" 
                  value={newLink.title} 
                  onChange={e => setNewLink({...newLink, title: e.target.value})} 
                  className="w-full pl-12 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 outline-none border-2 border-transparent focus:border-indigo-500 transition-all" 
                  required 
                />
              </div>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 text-zinc-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Subtitle (Optional)" 
                  value={newLink.subtitle} 
                  onChange={e => setNewLink({...newLink, subtitle: e.target.value})} 
                  className="w-full pl-12 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 outline-none border-2 border-transparent focus:border-indigo-500 transition-all" 
                />
              </div>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-4 text-zinc-400" size={20} />
                <input 
                  type="url" 
                  placeholder="https://example.com" 
                  value={newLink.url} 
                  onChange={e => setNewLink({...newLink, url: e.target.value})} 
                  className="w-full pl-12 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 outline-none border-2 border-transparent focus:border-indigo-500 transition-all" 
                  required 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAddingLink(false)} className="px-6 py-2 text-zinc-400 font-bold hover:text-zinc-600 transition-colors">Cancel</button>
              <button type="submit" className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md">Save Link</button>
            </div>
          </motion.form>
        )}

        {/* ৩. New Playlist ফর্ম */}
        {isAddingPlaylist && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            onSubmit={handleAddPlaylist} 
            className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-orange-100 dark:border-orange-900/20 shadow-2xl space-y-5 overflow-hidden"
          >
            <div className="relative">
              <FolderPlus className="absolute left-4 top-4 text-zinc-400" size={20} />
              <input 
                type="text" 
                placeholder="Playlist Name (e.g. My Courses)" 
                value={newPlaylistName} 
                onChange={e => setNewPlaylistName(e.target.value)} 
                className="w-full pl-12 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 outline-none border-2 border-transparent focus:border-orange-500 transition-all" 
                required 
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddingPlaylist(false)} className="px-6 py-2 text-zinc-400 font-bold hover:text-zinc-600 transition-colors">Cancel</button>
              <button type="submit" className="px-8 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-md">Create Playlist</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* কন্টেন্ট ডিসপ্লে সেকশন */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">My Content</h2>
        </div>
        
        {/* প্লেলিস্ট ছাড়া লিংকগুলো */}
        {displayLinks.filter(l => !l.playlistId).map(link => (
          <LinkRow key={link.id} link={link} user={user} profile={profile} />
        ))}
        
        {/* প্লেলিস্টগুলো এবং তাদের ভিতরের লিংক */}
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
