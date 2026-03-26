import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, LinkItem, Playlist } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FolderPlus, Code } from 'lucide-react';
import LinkRow from './LinkRow';
import PlaylistRow from './PlaylistRow';

interface DashboardProps {
  user: User;
  profile: UserProfile;
}

export default function Dashboard({ user, profile }: DashboardProps) {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', subtitle: '', url: '' });
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = newLink.url.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;
    const link: LinkItem = { 
      id: crypto.randomUUID(), 
      title: newLink.title, 
      subtitle: newLink.subtitle, 
      url: finalUrl, 
      color: '#18181b', 
      pinned: false 
    };
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { links: [...profile.links, link] });
    setIsAddingLink(false);
    setNewLink({ title: '', subtitle: '', url: '' });
  };

  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const playlist: Playlist = { id: crypto.randomUUID(), name: newPlaylistName };
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { playlists: [...profile.playlists, playlist] });
    setIsAddingPlaylist(false);
    setNewPlaylistName('');
  };

  const exportHTML = () => {
    const htmlContent = `<!DOCTYPE html><html><head><title>${profile.fullName}</title><script src="https://cdn.tailwindcss.com"></script></head><body class="p-10 bg-zinc-50 font-sans"><h1 class="text-3xl font-bold">${profile.fullName}</h1><p class="text-zinc-500 mb-8">@${profile.username}</p><div class="space-y-4">${profile.links.map(l => `<div class="p-4 bg-white rounded-xl shadow-sm border-l-4" style="border-color: ${l.color}"><h3 class="font-bold">${l.title}</h3><p class="text-sm text-zinc-500">${l.subtitle}</p><a href="${l.url}" class="text-blue-500 text-xs">${l.url}</a></div>`).join('')}</div></body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${profile.username}.html`; a.click();
  };

  // পিন করা লিংকগুলোকে সবার উপরে দেখানোর জন্য সর্টিং লজিক
  const displayLinks = [...profile.links].sort((a, b) => {
    if (a.pinned === b.pinned) return 0;
    return a.pinned ? -1 : 1;
  });

  return (
    <div className="space-y-8 p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome, {profile.fullName.split(' ')[0]}</h1>
          <p className="text-zinc-500">Manage your digital presence effortlessly.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={exportHTML} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-xs font-bold transition-all shadow-sm">
            <Code size={16} className="text-blue-500" /> Export as HTML
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setIsAddingLink(true)} className="flex-1 flex items-center justify-center gap-2 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:scale-[1.01] transition-all shadow-lg">
          <Plus size={24} /> Add URL
        </button>
        <button onClick={() => setIsAddingPlaylist(true)} className="px-8 flex items-center justify-center gap-2 py-5 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl font-black text-lg hover:bg-zinc-50 transition-all">
          <FolderPlus size={24} className="text-orange-500" /> New Playlist
        </button>
      </div>

      <AnimatePresence>
        {isAddingLink && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            onSubmit={handleAddLink} 
            className="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Title" value={newLink.title} onChange={e => setNewLink({ ...newLink, title: e.target.value })} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 outline-none border-2 border-transparent focus:border-indigo-500" required />
              <input type="text" placeholder="Subtitle" value={newLink.subtitle} onChange={e => setNewLink({ ...newLink, subtitle: e.target.value })} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 outline-none border-2 border-transparent focus:border-indigo-500" />
            </div>
            <input type="text" placeholder="URL" value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 outline-none border-2 border-transparent focus:border-indigo-500" required />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddingLink(false)} className="px-4 py-2 text-zinc-400">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Save Link</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">My Content</h2>
          {/* ইউজারদের জন্য গাইডেন্স টেক্সট */}
          <p className="text-[10px] text-zinc-400 italic">
            Tip: Click title to open link • Click color dot to edit
          </p>
        </div>

        {/* সর্ট করা লিস্ট রেন্ডার হচ্ছে */}
        {displayLinks.filter(l => !l.playlistId).map(link => (
          <LinkRow key={link.id} link={link} user={user} profile={profile} />
        ))}
        
        {profile.playlists.map(playlist => (
          <PlaylistRow 
            key={playlist.id} 
            playlist={playlist} 
            links={profile.links.filter(l => l.playlistId === playlist.id)} 
            user={user} 
            profile={profile} 
          />
        ))}
      </div>
    </div>
  );
}
