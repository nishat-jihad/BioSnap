import React, { useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, LinkItem, Playlist } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FolderPlus, FileText, Code } from 'lucide-react';
import LinkRow from './LinkRow';
import PlaylistRow from './PlaylistRow';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DashboardProps {
  user: User;
  profile: UserProfile;
}

export default function Dashboard({ user, profile }: DashboardProps) {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  
  // এই রিফ-টি এখন পুরো কন্টেন্ট ক্যাপচার করবে
  const dashboardRef = useRef<HTMLDivElement>(null);

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

  // সংশোধিত PDF ফাংশন
  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    
    try {
      // বাটনগুলো পিডিএফে যাতে না আসে তাই সাময়িকভাবে হাইড করা
      const exportButtons = document.getElementById('export-actions');
      if (exportButtons) exportButtons.style.visibility = 'hidden';

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#09090b' : '#fafafa'
      });

      if (exportButtons) exportButtons.style.visibility = 'visible';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${profile.username}-profile.pdf`);
    } catch (error) {
      console.error("Export Error:", error);
    }
  };

  const exportHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${profile.fullName} | BioSnap</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="p-10 bg-zinc-50 font-sans">
        <h1 class="text-3xl font-bold">${profile.fullName}</h1>
        <p class="text-zinc-500 mb-8">@${profile.username}</p>
        <div class="space-y-4">
          ${profile.links.map(l => `
            <div class="p-4 bg-white rounded-xl shadow-sm border-l-4" style="border-color: ${l.color}">
              <h3 class="font-bold">${l.title}</h3>
              <p class="text-sm text-zinc-500">${l.subtitle}</p>
              <a href="${l.url}" class="text-blue-500 text-xs">${l.url}</a>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.username}-profile.html`;
    a.click();
  };

  return (
    // রিফটি একদম মেইন ডিভ-এ দেওয়া হলো যাতে পুরো কন্টেন্ট পাওয়া যায়
    <div ref={dashboardRef} className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome, {profile.fullName.split(' ')[0]}</h1>
          <p className="text-zinc-500">Manage your digital presence effortlessly.</p>
        </div>
        
        {/* Export Actions ID যোগ করা হয়েছে যাতে এগুলো পিডিএফে না আসে */}
        <div id="export-actions" className="flex items-center gap-2">
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-xs font-bold">
            <FileText size={16} className="text-red-500" />
            Export as PDF
          </button>
          <button onClick={exportHTML} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-xs font-bold">
            <Code size={16} className="text-blue-500" />
            Export as HTML
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setIsAddingLink(true)} className="flex-1 flex items-center justify-center gap-2 py-5 bg-brand-primary text-white rounded-2xl font-black text-lg hover:scale-[1.02] transition-all">
          <Plus size={24} /> Add URL
        </button>
        <button onClick={() => setIsAddingPlaylist(true)} className="px-8 flex items-center justify-center gap-2 py-5 bg-white dark:bg-zinc-900 border-2 border-zinc-100 rounded-2xl font-black text-lg hover:bg-zinc-50 transition-all">
          <FolderPlus size={24} className="text-brand-accent" /> New Playlist
        </button>
      </div>

      <AnimatePresence>
        {isAddingLink && (
          <motion.form initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} onSubmit={handleAddLink} className="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Title" value={newLink.title} onChange={e => setNewLink({ ...newLink, title: e.target.value })} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 outline-none border-2 border-transparent focus:border-brand-primary" required />
              <input type="text" placeholder="Subtitle" value={newLink.subtitle} onChange={e => setNewLink({ ...newLink, subtitle: e.target.value })} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 outline-none border-2 border-transparent focus:border-brand-primary" />
            </div>
            <input type="text" placeholder="URL (e.g. google.com)" value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 outline-none border-2 border-transparent focus:border-brand-primary" required />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddingLink(false)} className="px-4 py-2 text-zinc-400">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-brand-primary text-white rounded-xl font-bold">Save Link</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Pinned Section */}
        {profile.links.some(l => l.pinned) && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-tighter">Pinned Links</h2>
            {profile.links.filter(l => l.pinned).map(link => <LinkRow key={link.id} link={link} user={user} profile={profile} />)}
          </div>
        )}

        {/* Playlists & Other Links */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-tighter">My Content</h2>
          {profile.links.filter(l => !l.pinned && !l.playlistId).map(link => <LinkRow key={link.id} link={link} user={user} profile={profile} />)}
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
    </div>
  );
}
