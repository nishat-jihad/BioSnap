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
  key?: string;
  user: User;
  profile: UserProfile;
}

export default function Dashboard({ user, profile }: DashboardProps) {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Form states
  const [newLink, setNewLink] = useState({ title: '', subtitle: '', url: '' });
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalUrl = newLink.url.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const link: LinkItem = {
      id: crypto.randomUUID(),
      title: newLink.title,
      subtitle: newLink.subtitle,
      url: finalUrl,
      color: '#18181b', // Default zinc-900
      pinned: false
    };

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      links: [...profile.links, link]
    });
    setIsAddingLink(false);
    setNewLink({ title: '', subtitle: '', url: '' });
  };

  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const playlist: Playlist = {
      id: crypto.randomUUID(),
      name: newPlaylistName
    };

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      playlists: [...profile.playlists, playlist]
    });
    setIsAddingPlaylist(false);
    setNewPlaylistName('');
  };

  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#09090b' : '#fafafa'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${profile.username}-biosnap.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Could not generate PDF. Please try again.");
    }
  };

  const exportHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profile.fullName} | BioSnap</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #fafafa; font-family: sans-serif; }
    </style>
</head>
<body class="p-8 max-w-2xl mx-auto">
    <header class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-2">${profile.fullName}</h1>
        <p class="text-zinc-500">@${profile.username}</p>
    </header>
    <div class="space-y-4">
        ${profile.links.filter(l => !l.playlistId).map(link => `
            <a href="${link.url}" target="_blank" class="block p-4 rounded-2xl shadow-sm border border-zinc-100 bg-white" style="border-left: 8px solid ${link.color}">
                <h3 class="font-bold">${link.title}</h3>
                <p class="text-sm text-zinc-500">${link.subtitle}</p>
            </a>
        `).join('')}
        ${profile.playlists.map(p => `
            <div class="mt-8">
                <h2 class="text-xl font-bold mb-4">${p.name}</h2>
                <div class="space-y-4">
                    ${profile.links.filter(l => l.playlistId === p.id).map(link => `
                        <a href="${link.url}" target="_blank" class="block p-4 rounded-2xl shadow-sm border border-zinc-100 bg-white" style="border-left: 8px solid ${link.color}">
                            <h3 class="font-bold">${link.title}</h3>
                            <p class="text-sm text-zinc-500">${link.subtitle}</p>
                        </a>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.username}-biosnap.html`;
    a.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome, {profile.fullName.split(' ')[0]}</h1>
          <p className="text-zinc-500">Manage your digital presence effortlessly.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Updated PDF Button */}
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-xs font-bold"
          >
            <FileText size={16} className="text-red-500" />
            Export as PDF
          </button>
          
          {/* Updated HTML Button */}
          <button
            onClick={exportHTML}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-xs font-bold"
          >
            <Code size={16} className="text-blue-500" />
            Export as HTML
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsAddingLink(true)}
          className="flex-1 flex items-center justify-center gap-2 py-5 bg-brand-primary text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-primary/20"
        >
          <Plus size={24} />
          Add URL
        </button>
        <button
          onClick={() => setIsAddingPlaylist(true)}
          className="px-8 flex items-center justify-center gap-2 py-5 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl font-black text-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200/20 dark:shadow-none"
        >
          <FolderPlus size={24} className="text-brand-accent" />
          <span className="hidden sm:inline">New Playlist</span>
        </button>
      </div>

      <AnimatePresence>
        {isAddingLink && (
          <motion.form
            initial={{ height: 0, opacity: 0, scale: 0.95 }}
            animate={{ height: 'auto', opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.95 }}
            onSubmit={handleAddLink}
            className="glass-card p-8 rounded-[2rem] space-y-5 overflow-hidden shadow-2xl shadow-brand-primary/5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Portfolio"
                  value={newLink.title}
                  onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-brand-primary outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Check out my work"
                  value={newLink.subtitle}
                  onChange={e => setNewLink({ ...newLink, subtitle: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-brand-primary outline-none transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">URL</label>
              <input
                type="text"
                required
                placeholder="e.g. mywork.com"
                value={newLink.url}
                onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-brand-primary outline-none transition-all font-medium"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingLink(false)}
                className="px-6 py-3 text-sm font-black text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-brand-primary text-white rounded-xl text-sm font-black shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
              >
                Save Link
              </button>
            </div>
          </motion.form>
        )}

        {isAddingPlaylist && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddPlaylist}
            className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 overflow-hidden"
          >
            <input
              type="text"
              required
              placeholder="Playlist Name (e.g. Socials)"
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingPlaylist(false)}
                className="px-4 py-2 text-sm font-semibold text-zinc-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm font-bold"
              >
                Create Playlist
              </button>
