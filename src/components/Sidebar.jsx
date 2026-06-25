import React, { useContext } from 'react';
import { LayoutDashboard, Leaf, CalendarDays, AlertCircle, Settings, Bug, Package, Map, LogOut, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

export default function Sidebar({ activeTab }) {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'locations', label: 'Manajemen Lahan', icon: Map, path: '/locations' },
    { id: 'plants', label: 'Tanaman Saya', icon: Leaf, path: '/plants' },
    { id: 'calendar', label: 'Jadwal Global', icon: CalendarDays, path: '/calendar' },
    { id: 'inventory', label: 'Gudang / Stok', icon: Package, path: '/inventory' },
    { id: 'pests', label: 'Database Hama', icon: Bug, path: '/pests' },
    { id: 'alerts', label: 'Peringatan', icon: AlertCircle, path: '/alerts' },
    { id: 'about', label: 'Tentang Aplikasi', icon: Info, path: '/about' },
  ].filter(item => {
    // If owner, show everything. Dashboard always shown. Otherwise, check user permissions.
    if (!user || user.role === 'owner') return true;
    if (item.id === 'dashboard' || item.id === 'about') return true;
    return user.permissions?.includes(item.id);
  });

  return (
    <aside className="w-64 bg-forest-surface border-r border-white/10 flex flex-col py-6 transition-all duration-300">
      <div className="px-6 mb-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 text-emerald-500 font-bold text-2xl">
          <Leaf size={28} />
          <span className="pb-1">FloraSync</span>
        </div>
        <span className="text-[11px] text-gray-500 ml-10 font-medium">v1.1.1</span>
      </div>
      
      <nav className="flex-1 flex flex-col gap-2 px-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500' 
                  : 'text-gray-400 hover:bg-forest-surface/80 hover:text-gray-100 hover:translate-x-1'
              }`}
            >
              <Icon size={20} />
              <span className="leading-normal pt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
        <Link to="/settings" className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium w-full ${activeTab === 'settings' ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500' : 'text-gray-400 hover:bg-forest-surface/80 hover:text-gray-100 hover:translate-x-1'}`}>
          <Settings size={20} />
          <span className="leading-normal pt-0.5">Pengaturan</span>
        </Link>
        <button 
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={20} />
          <span className="leading-normal pt-0.5">Logout</span>
        </button>
      </div>
    </aside>
  );
}
