import React, { useState, useEffect } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // ✅ Back to Top visibility
  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const allLinks = [...(profile.links || [])].sort((a, b) =>
    a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1
  );
  const isSearching = searchQuery.trim().length > 0;

  const searchResults = isSearching
    ? allLinks
        .map(link => {
          const q = searchQuery.toLowerCase();
          let score = 0;
          if (link.title?.toLowerCase().includes(q)) score = 3;
          else if (link.subtitle?.toLowerCase().includes(q)) score = 2;
          else if (link.url?.toLowerCase().includes(q)) score = 1;
          return { link, score };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(x => x.link)
    : [];

  const displayLinks = allLinks.filter(l => !l.playlistId);

  // ✅ Drag & Drop
  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return; }
    const links = [...(profile.links || [])];
    const fromIndex = links.findIndex(l => l.id === draggedId);
    const toIndex = links.findIndex(l => l.id === targetId);
    const [moved] = links.splice(fromIndex, 1);
    links.splice(toIndex, 0, moved);
    await updateDoc(doc(db, 'users', user.uid), { links });
    setDraggedId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };

  return (
    <div className="space-y-8">

      {/* ✅ Add URL + New Playlist buttons */}
      <div className="flex gap-4">

        {/* ✅ Add URL — dark glowing style */}
        <button
          onClick={() => setActiveForm(activeForm === 'link' ? null : 'link')}
          className="flex-1 flex items-center justify-center gap-2 py-5 rounded-2xl font-black text-lg transition-all"
          style={{
            background: activeForm === 'link'
              ? '#383e4b'
              : 'linear-gradient(173deg, #23272f 0%, #14161a 100%)',
            color: 'white',
            boxShadow: activeForm === 'link'
              ? 'inset 5px 5px 10px #0e1013, inset -5px -5px 10px #383e4b'
              : '10px 10px 20px #0e1013, -10px -10px 40px #383e4b',
            border: '1px solid transparent',
          }}
        >
          <Plus size={24} /> Add URL
        </button>

        {/* ✅ New Playlist — neumorphic */}
        <button
          onClick={() => setActiveForm(activeForm === 'playlist' ? null : 'playlist')}
          className="playlist-btn px-8 py-5 text-lg"
        >
          <FolderPlus size={24} className="text-orange-500" /> New Playlist
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeForm === 'link' && (
          <motion.form key="link-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleAddLink}
            className="p-8 rounded-[2.5rem] shadow-2xl space-y-4"
            style={{ background: 'linear-gradient(173deg, #23272f 0%, #14161a 100%)', boxShadow: '10px 10px 20px #0e1013, -10px -10px 40px #383e4b' }}
          >
            <h3 className="font-black text-xl italic text-yellow-400">Add New URL</h3>
            <div className="space-y-3">
              {/* ✅ Inputs with dark glowing style */}
              {[
                { placeholder: 'Title', value: newLink.title, onChange: (v: string) => setNewLink({...newLink, title: v}), type: 'text', required: true },
                { placeholder: 'Subtitle (Optional)', value: newLink.subtitle, onChange: (v: string) => setNewLink({...newLink, subtitle: v}), type: 'text', required: false },
                { placeholder: 'https://...', value: newLink.url, onChange: (v: string) => setNewLink({...newLink, url: v}), type: 'url', required: true },
              ].map((field, i) => (
                <div key={i} className="add-url-container">
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    required={field.required}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setActiveForm(null)} className="px-4 py-2 font-bold text-zinc-400">Cancel</button>
              <button type="submit" className="px-8 py-2 rounded-xl font-bold text-white"
                style={{ background: '#ffd43b', color: '#14161a', boxShadow: '0px 0px 20px rgba(255,212,59,0.4)' }}>
                Save Link
              </button>
            </div>
          </motion.form>
        )}

        {activeForm === 'playlist' && (
          <motion.form key="playlist-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleAddPlaylist}
            className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-orange-500/20 shadow-2xl space-y-4">
            <h3 className="font-black text-xl italic text-orange-600">Create Playlist</h3>
            <input type="text" placeholder="Playlist Name..." value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)}
              className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-orange-500 outline-none" required autoFocus />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setActiveForm(null)} className="px-4 py-2 font-bold text-zinc-400">Cancel</button>
              <button type="submit" className="px-8 py-2 bg-orange-500 text-white rounded-xl font-bold shadow-md">Create</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">My Content</h2>

        {/* ✅ Search bar — neumorphic style */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10" />
          <input
            type="text"
            placeholder="Search all links including playlists..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input w-full"
          />
        </div>

        {/* Search results */}
        {isSearching ? (
          <>
            {searchResults.length === 0 ? (
              <p className="text-center text-sm text-zinc-400 py-6">No links found for "{searchQuery}"</p>
            ) : (
              searchResults.map(link => (
                <div key={link.id}>
                  {link.playlistId && (
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-2 mb-1">
                      📁 {profile.playlists?.find(p => p.id === link.playlistId)?.name || 'Playlist'}
                    </p>
                  )}
                  <LinkRow link={link} user={user} profile={profile} />
                </div>
              ))
            )}
          </>
        ) : (
          <>
            {/* ✅ Drag & Drop enabled */}
            {displayLinks.map(link => (
              <div
                key={link.id}
                draggable
                onDragStart={() => handleDragStart(link.id)}
                onDragOver={e => handleDragOver(e, link.id)}
                onDrop={() => handleDrop(link.id)}
                onDragEnd={handleDragEnd}
                className={`transition-all cursor-grab active:cursor-grabbing ${dragOverId === link.id ? 'scale-[1.02] opacity-70' : ''} ${draggedId === link.id ? 'opacity-40' : ''}`}
              >
                <LinkRow link={link} user={user} profile={profile} />
              </div>
            ))}

            {(profile.playlists || []).map(p => (
              <PlaylistRow
                key={p.id}
                playlist={p}
                links={profile.links.filter(l => l.playlistId === p.id)}
                user={user}
                profile={profile}
              />
            ))}
          </>
        )}
      </div>

      {/* ✅ Back to Top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="back-to-top-btn fixed bottom-8 right-8 z-50"
            aria-label="Back to top"
          >
            <svg viewBox="0 0 384 512" className="svgIcon">
              <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
