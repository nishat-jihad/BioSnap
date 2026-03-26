import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, LinkItem, Playlist } from '../types';
import { Folder, ChevronDown, MoreVertical, PlusCircle, Trash2 } from 'lucide-react';
import LinkRow from './LinkRow';
import { motion, AnimatePresence } from 'motion/react';

interface PlaylistRowProps {
  playlist: Playlist;
  links: LinkItem[];
  user: User;
  profile: UserProfile;
}

export default function PlaylistRow({ playlist, links, user, profile }: PlaylistRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', subtitle: '', url: '' });

  // প্লেলিস্টের ভেতরে লিংক অ্যাড করার ফাংশন
  const handleAddToPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const link: LinkItem = { 
      id: crypto.randomUUID(), 
      ...newLink, 
      color: '#6366f1', 
      pinned: false,
      playlistId: playlist.id // এই আইডিটি লিংকটিকে প্লেলিস্টের সাথে কানেক্ট করবে
    };

    await updateDoc(doc(db, 'users', user.uid), { 
      links: [...profile.links, link] 
    });
    
    setIsAddingToPlaylist(false);
    setNewLink({ title: '', subtitle: '', url: '' });
    setIsOpen(true);
  };

  const deletePlaylist = async () => {
    const updatedPlaylists = profile.playlists.filter(p => p.id !== playlist.id);
    const updatedLinks = profile.links.map(l => 
      l.playlistId === playlist.id ? { ...l, playlistId: undefined } : l
    );
    await updateDoc(doc(db, 'users', user.uid), { 
      playlists: updatedPlaylists,
      links: updatedLinks
    });
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden bg-white/50 dark:bg-zinc-900/50">
      <div className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center gap-4 flex-grow cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
            <Folder size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tight">{playlist.name}</h3>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{links.length} links</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* এই বাটনটি দিয়ে প্লেলিস্টে লিংক অ্যাড করা যাবে */}
          <button 
            onClick={() => setIsAddingToPlaylist(true)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
            title="Add link to this playlist"
          >
            <PlusCircle size={20} />
          </button>
          <button onClick={deletePlaylist} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
          <button onClick={() => setIsOpen(!isOpen)} className={`p-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}><ChevronDown size={20} /></button>
        </div>
      </div>

      <AnimatePresence>
        {isAddingToPlaylist && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddToPlaylist}
            className="p-6 border-t border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 space-y-3"
          >
            <input type="text" placeholder="Link Title" value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} className="w-full p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-indigo-500" required />
            <input type="url" placeholder="https://..." value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} className="w-full p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-indigo-500" required />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddingToPlaylist(false)} className="text-xs font-bold text-zinc-400 uppercase">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase">Add to {playlist.name}</button>
            </div>
          </motion.form>
        )}

        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 space-y-3">
              {links.length === 0 ? (
                <p className="text-center py-8 text-sm text-zinc-400 italic">No links in this playlist yet.</p>
              ) : (
                links.map(link => <LinkRow key={link.id} link={link} user={user} profile={profile} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
