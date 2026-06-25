import React, { useContext, useState } from 'react';
import { LayoutDashboard, Leaf, CalendarDays, AlertCircle, Settings, Bug, Package, Map, LogOut, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

export default function Sidebar({ activeTab }) {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Persist collapsed state in localStorage so it is remembered on refresh
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

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

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar_collapsed', String(nextState));
  };

  return (
    <aside className={`bg-forest-surface border-r border-white/10 flex flex-col py-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] relative shrink-0 z-40 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Toggle Button */}
      <button 
        type="button"
        onClick={handleToggleCollapse}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-forest-surface border border-white/10 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-forest-bg hover:border-emerald-500/30 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 shadow-md cursor-pointer hover:scale-110 active:scale-95"
        title={isCollapsed ? "Buka Menu" : "Tutup Menu"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Brand/Logo Area */}
      <div className={`mb-8 flex flex-col shrink-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'items-center px-4' : 'px-6'}`}>
        <div className="flex items-center gap-3 text-emerald-500 font-bold text-2xl relative">
          <div className={`flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isCollapsed ? 'w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-500/20 hover:scale-105' : ''
          }`}>
            <Leaf size={isCollapsed ? 24 : 28} className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0" />
          </div>
          <span className={`pb-1 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap ${
            isCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-40 opacity-100'
          }`}>
            FloraSync
          </span>
        </div>
        <span className={`text-[11px] text-gray-500 font-medium transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap ${
          isCollapsed ? 'max-w-0 opacity-0 h-0 mt-0 pointer-events-none' : 'max-w-40 opacity-100 ml-10 mt-1'
        }`}>
          v1.1.5
        </span>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-2 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-medium ${
                isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3 hover:translate-x-1.5'
              } ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[inset_4px_0_0_0_rgba(16,185,129,1)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
              }`}
            >
              <Icon size={20} className="shrink-0 transition-transform duration-300 hover:scale-110" />
              <span className={`leading-normal pt-0.5 whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
                isCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-40 opacity-100'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Area */}
      <div className="px-3 flex flex-col gap-2 mt-4 pt-4 border-t border-white/10 shrink-0">
        <Link 
          to="/settings" 
          title={isCollapsed ? "Pengaturan" : undefined}
          className={`flex items-center rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-medium ${
            isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3 hover:translate-x-1.5'
          } ${
            activeTab === 'settings' 
              ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-[inset_4px_0_0_0_rgba(16,185,129,1)]' 
              : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
          }`}
        >
          <Settings size={20} className="shrink-0" />
          <span className={`leading-normal pt-0.5 whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
            isCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-40 opacity-100'
          }`}>
            Pengaturan
          </span>
        </Link>
        <button 
          type="button"
          onClick={() => { logout(); navigate('/'); }}
          title={isCollapsed ? "Logout" : undefined}
          className={`flex items-center rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 ${
            isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          <span className={`leading-normal pt-0.5 whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
            isCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-40 opacity-100'
          }`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
