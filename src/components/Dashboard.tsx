import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, LinkItem, Playlist } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FolderPlus, Search } from 'lucide-react';
import LinkRow from './LinkRow';
import PlaylistRow from './PlaylistRow';

const LINKS_PER_PAGE = 8;

export default function Dashboard({ user, profile }: { user: User; profile: UserProfile }) {
  const [activeForm, setActiveForm] = useState<'link' | 'playlist' | null>(null);
  const [newLink, setNewLink] = useState({ title: '', subtitle: '', url: '' });
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'success' } | null>(null);

  const showToast = (msg: string, type: 'info' | 'success' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 150);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.url) return;
    const link: LinkItem = { id: crypto.randomUUID(), ...newLink, color: '#18181b', pinned: false };
    const allNewLinks = [...(profile.links || []), link];
    await updateDoc(doc(db, 'users', user.uid), { links: allNewLinks });

    const nonPlaylistLinks = allNewLinks.filter(l => !l.playlistId);
    const newLinkPage = Math.ceil(nonPlaylistLinks.length / LINKS_PER_PAGE);
    if (newLinkPage !== currentPage) {
      showToast(`Link saved! It's on page ${newLinkPage} →`, 'info');
    } else {
      showToast('Link saved!', 'success');
    }

    setNewLink({ title: '', subtitle: '', url: '' });
    setActiveForm(null);
  };

  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const playlist: Playlist = { id: crypto.randomUUID(), name: newPlaylistName.trim() };
    await updateDoc(doc(db, 'users', user.uid), { playlists: [...(profile.playlists || []), playlist] });
    showToast('Playlist created!', 'success');
    setNewPlaylistName('');
    setActiveForm(null);
  };

  const allLinks = [...(profile.links || [])].sort((a, b) =>
    a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1
  );
  const isSearching = searchQuery.trim().length > 0;

  const searchResults = isSearching
    ? allLinks.map(link => {
        const q = searchQuery.toLowerCase();
        let score = 0;
        if (link.title?.toLowerCase().includes(q)) score = 3;
        else if (link.subtitle?.toLowerCase().includes(q)) score = 2;
        else if (link.url?.toLowerCase().includes(q)) score = 1;
        return { link, score };
      }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).map(x => x.link)
    : [];

  const displayLinks = allLinks.filter(l => !l.playlistId);
  const totalPages = Math.max(1, Math.ceil(displayLinks.length / LINKS_PER_PAGE));
  const pagedLinks = displayLinks.slice((currentPage - 1) * LINKS_PER_PAGE, currentPage * LINKS_PER_PAGE);

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return; }
    const links = [...(profile.links || [])];
    const from = links.findIndex(l => l.id === draggedId);
    const to = links.findIndex(l => l.id === targetId);
    const [moved] = links.splice(from, 1);
    links.splice(to, 0, moved);
    await updateDoc(doc(db, 'users', user.uid), { links });
    setDraggedId(null); setDragOverId(null);
  };
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };

  return (
    <div className="space-y-8">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 z-[200]"
            style={{ transform: 'translateX(-50%)', pointerEvents: 'none' }}
          >
            <div className="px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl whitespace-nowrap"
              style={{
                background: toast.type === 'info' ? '#6366f1' : '#22c55e',
                color: 'white',
                boxShadow: toast.type === 'info' ? '0 8px 32px rgba(99,102,241,0.4)' : '0 8px 32px rgba(34,197,94,0.4)',
              }}
            >
              {toast.type === 'info' ? '📄' : '✅'} {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add URL + New Playlist */}
      <div className="flex gap-4">
        <button onClick={() => setActiveForm(activeForm === 'link' ? null : 'link')}
          className={`add-url-btn flex-1 py-5 text-lg ${activeForm === 'link' ? 'active' : ''}`}>
          <Plus size={24} /> Add URL
        </button>
        <button onClick={() => setActiveForm(activeForm === 'playlist' ? null : 'playlist')}
          className={`playlist-btn px-8 py-5 text-lg ${activeForm === 'playlist' ? 'active' : ''}`}>
          <FolderPlus size={24} className="text-orange-500" /> New Playlist
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeForm === 'link' && (
          <motion.form key="link-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleAddLink}
            className="p-8 rounded-[2rem] space-y-4"
            style={{ background: '#f0f0f0', boxShadow: '8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff' }}>
            <h3 className="font-black text-xl italic text-indigo-600">Add New URL</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Title" value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} className="neu-input" required />
              <input type="text" placeholder="Subtitle (Optional)" value={newLink.subtitle} onChange={e => setNewLink({...newLink, subtitle: e.target.value})} className="neu-input" />
              <input type="url" placeholder="https://..." value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} className="neu-input" required />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setActiveForm(null)} className="neu-btn text-xs">Cancel</button>
              <button type="submit" className="neu-btn text-xs" style={{ background: '#6366f1', color: 'white', boxShadow: '4px 4px 10px #4f52d9, -4px -4px 10px #7779ff' }}>Save Link</button>
            </div>
          </motion.form>
        )}
        {activeForm === 'playlist' && (
          <motion.form key="playlist-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleAddPlaylist}
            className="p-8 rounded-[2rem] space-y-4"
            style={{ background: '#f0f0f0', boxShadow: '8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff' }}>
            <h3 className="font-black text-xl italic text-orange-600">Create Playlist</h3>
            <input type="text" placeholder="Playlist Name..." value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} className="neu-input" required autoFocus />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setActiveForm(null)} className="neu-btn text-xs">Cancel</button>
              <button type="submit" className="neu-btn text-xs" style={{ background: '#f97316', color: 'white', boxShadow: '4px 4px 10px #d9620e, -4px -4px 10px #ff8534' }}>Create</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">My Content</h2>
          {displayLinks.length > 0 && (
            <span className="text-xs text-zinc-400 font-medium">{displayLinks.length} link{displayLinks.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10" />
          <input type="text" placeholder="Search all links including playlists..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} className="search-input w-full" />
        </div>

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
            {pagedLinks.map(link => (
              <div key={link.id} draggable
                onDragStart={() => handleDragStart(link.id)}
                onDragOver={e => handleDragOver(e, link.id)}
                onDrop={() => handleDrop(link.id)}
                onDragEnd={handleDragEnd}
                className={`transition-all cursor-grab active:cursor-grabbing ${dragOverId === link.id ? 'scale-[1.02] opacity-70' : ''} ${draggedId === link.id ? 'opacity-40' : ''}`}>
                <LinkRow link={link} user={user} profile={profile} />
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Links page navigation" className="pt-2">
                <ul className="pagination">
                  <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item${currentPage === page ? ' active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                    </li>
                  ))}
                  <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
                  </li>
                </ul>
              </nav>
            )}

            {(profile.playlists || []).map(p => (
              <PlaylistRow key={p.id} playlist={p} links={profile.links.filter(l => l.playlistId === p.id)} user={user} profile={profile} />
            ))}
          </>
        )}
      </div>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="back-to-top-btn fixed bottom-8 right-8 z-50" aria-label="Back to top">
            <svg viewBox="0 0 384 512" className="svgIcon">
              <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
