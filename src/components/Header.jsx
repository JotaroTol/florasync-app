import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, Bell, AlertTriangle, ListTodo, Sprout, Bug, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { db } from '../db';
import { UserContext } from '../App';

export default function Header() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // Queries
  const profile = useSupabaseQuery('userProfile', { eq: { userId: user.id } }, [user.id], true);
  const plants = useSupabaseQuery('plants', { eq: { userId: user.id } }, [user.id]) || [];
  const pests = useSupabaseQuery('pests', { eq: { userId: user.id } }, [user.id]) || [];
  const events = useSupabaseQuery('events', { eq: { userId: user.id } }, [user.id]) || [];
  const inventory = useSupabaseQuery('inventory', { eq: { userId: user.id } }, [user.id]) || [];

  // Notifications Logic
  const todayStr = new Date().toISOString().split('T')[0];
  // Overdue or due today
  const pendingTodos = events.filter(e => e.type === 'todo' && !e.completed && e.date <= todayStr);
  const lowInventory = inventory.filter(i => i.stock < 100);
  const totalNotifs = pendingTodos.length + lowInventory.length;

  // Search Logic
  const searchResults = {
    plants: plants.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.varietas.toLowerCase().includes(searchQuery.toLowerCase())),
    pests: pests.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  };
  const hasSearchResults = searchQuery.length > 0 && (searchResults.plants.length > 0 || searchResults.pests.length > 0);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchDropdown(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global check to forward overdue Evaluasi Hama/Penyakit to today
  useEffect(() => {
    const fixOverdueTodos = async () => {
      const overdue = await db.events.filter(e => e.userId === user.id && e.type === 'todo' && !e.completed && e.date < todayStr).toArray();
      for (const e of overdue) {
        if (e.activities && e.activities.some(a => a.title === 'Evaluasi Hama/Penyakit')) {
          await db.events.update(e.id, { date: todayStr });
        }
      }
    };
    fixOverdueTodos();
  }, [todayStr]);

  return (
    <header className="h-20 bg-forest-bg/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-50">
      
      {/* Search Bar */}
      <div className="relative w-96" ref={searchRef}>
        <div className="flex items-center bg-forest-surface border border-white/10 rounded-full px-4 py-2.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <Search size={18} className="text-gray-400 mr-3 shrink-0" />
          <input 
            type="text" 
            placeholder="Cari tanaman atau hama..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="bg-transparent border-none outline-none text-sm text-gray-100 w-full placeholder-gray-500" 
          />
        </div>

        {/* Search Dropdown */}
        {showSearchDropdown && searchQuery.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-2 bg-forest-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
            {!hasSearchResults ? (
              <div className="p-4 text-center text-sm text-gray-400">Tidak ada hasil ditemukan.</div>
            ) : (
              <div className="flex flex-col">
                {searchResults.plants.length > 0 && (
                  <div className="p-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase px-2 mb-1">Tanaman</h4>
                    {searchResults.plants.map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => { navigate(`/plants/${p.id}`); setShowSearchDropdown(false); setSearchQuery(''); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center gap-3 transition-colors"
                      >
                        <Sprout size={16} /> <div><p className="text-sm font-semibold">{p.name}</p><p className="text-[10px] text-gray-400">{p.varietas}</p></div>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.pests.length > 0 && (
                  <div className="p-2 border-t border-white/5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase px-2 mb-1">Hama & Penyakit</h4>
                    {searchResults.pests.map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => { navigate(`/pests`); setShowSearchDropdown(false); setSearchQuery(''); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 flex items-center gap-3 transition-colors"
                      >
                        <Bug size={16} /> <span className="text-sm font-semibold">{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative bg-forest-surface border border-white/10 rounded-full w-11 h-11 flex items-center justify-center hover:bg-forest-surface/80 hover:-translate-y-0.5 transition-all"
          >
            <Bell size={20} />
            {totalNotifs > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-forest-bg">
                {totalNotifs}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-forest-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[400px]">
              <div className="p-4 border-b border-white/10 font-semibold flex items-center justify-between">
                <span>Notifikasi</span>
                {totalNotifs > 0 && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">{totalNotifs} Baru</span>}
              </div>
              <div className="overflow-y-auto p-2">
                {totalNotifs === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">Semua aman, tidak ada notifikasi baru.</div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {lowInventory.map(item => (
                      <div key={`inv-${item.id}`} onClick={() => { navigate(`/inventory?edit=${item.id}`); setShowNotifDropdown(false); }} className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-start gap-3 cursor-pointer transition-colors relative pointer-events-auto">
                        <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-100 font-semibold">{item.stock <= 0 ? 'Stok Habis!' : 'Stok Menipis!'}</p>
                          <p className="text-xs text-red-400">{item.name} hanya tersisa {item.stock} {item.unit}. Segera restock.</p>
                        </div>
                      </div>
                    ))}
                    {pendingTodos.map(todo => {
                      const plant = plants.find(p => p.id === todo.plantId);
                      return (
                        <div key={`td-${todo.id}`} onClick={() => {navigate(`/plants/${todo.plantId}`); setShowNotifDropdown(false);}} className="p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg flex items-start gap-3 cursor-pointer transition-colors">
                          <ListTodo size={18} className="text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-100 font-semibold">Jadwal Perawatan</p>
                            <p className="text-xs text-amber-400">{plant?.name}: {todo.activities.map(a => a.type === 'produk' ? a.name : a.title).join(', ')}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Profile */}
        <Link to="/settings" className="flex items-center gap-3 hover:-translate-y-0.5 transition-all">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-tight">{user?.name || profile?.ownerName || 'Pengguna'}</p>
            <p className="text-xs text-emerald-400">{user?.role === 'guest' ? 'Tamu' : (profile?.farmName || 'Kebun')}</p>
          </div>
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Profile" className="w-11 h-11 rounded-full border-2 border-white/10 hover:border-emerald-500 transition-all object-cover" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-forest-surface border-2 border-white/10 flex items-center justify-center text-gray-400 hover:border-emerald-500 transition-all">
              <User size={20} />
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
