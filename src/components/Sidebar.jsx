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

  React.useEffect(() => {
    if (isCollapsed) {
      document.documentElement.classList.add('sidebar-collapsed');
    } else {
      document.documentElement.classList.remove('sidebar-collapsed');
    }
  }, [isCollapsed]);

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
    <aside className={`bg-forest-surface border-r border-white/10 flex flex-col py-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] relative shrink-0 z-[100] select-none ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Toggle Button - Perfectly centered on border and positioned above main layout */}
      <button 
        type="button"
        onClick={handleToggleCollapse}
        className="absolute -right-4 top-8 w-8 h-8 rounded-full bg-forest-surface border border-white/10 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-forest-bg hover:border-emerald-500/30 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[110] shadow-md cursor-pointer hover:scale-110 active:scale-95"
        title={isCollapsed ? "Buka Menu" : "Tutup Menu"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Brand/Logo Area - mb-3 for compact spacing */}
      <div className={`mb-3 flex flex-col shrink-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'pl-5 pr-2' : 'pl-6 pr-6'}`}>
        <div className={`flex items-center text-emerald-500 font-bold text-2xl relative transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'gap-0' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center shrink-0 hover:bg-emerald-500/20 hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
            <Leaf size={20} className="shrink-0 text-emerald-400 animate-[pulse_3s_infinite]" />
          </div>
          <div className={`flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
            isCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-40 opacity-100'
          }`}>
            <span className="pb-0.5 leading-none text-emerald-400 font-bold text-xl">FloraSync</span>
            <span className="text-[11px] text-gray-500 font-medium leading-none mt-1">v1.1.19</span>
          </div>
        </div>
      </div>
      
      {/* Navigation Items - No scroll, overflow hidden */}
      <nav className="flex-1 flex flex-col gap-1.5 px-3 overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              style={{
                transition: 'padding 0.5s cubic-bezier(0.4,0,0.2,1), gap 0.5s cubic-bezier(0.4,0,0.2,1), background-color 0.35s cubic-bezier(0.4,0,0.2,1), color 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)'
              }}
              className={`flex items-center rounded-xl font-medium py-3 relative overflow-hidden ${
                isCollapsed ? 'pl-[18px] pr-[18px] gap-0' : 'pl-4 pr-4 gap-4 hover:translate-x-1.5'
              } ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
              }`}
            >
              {/* Premium Vertical Spring-Stretching Active Indicator - Smooth Liquid */}
              <span 
                className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-emerald-500 transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] origin-center ${
                  isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                }`}
              />
              <Icon size={20} className="shrink-0 transition-transform duration-300 hover:scale-110 relative z-10" />
              <span className={`leading-normal pt-0.5 whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden relative z-10 ${
                isCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-40 opacity-100'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Area - No scroll, overflow hidden */}
      <div className="px-3 flex flex-col gap-1.5 mt-4 pt-4 border-t border-white/10 shrink-0 overflow-hidden">
        <Link 
          to="/settings" 
          title={isCollapsed ? "Pengaturan" : undefined}
          style={{
            transition: 'padding 0.5s cubic-bezier(0.4,0,0.2,1), gap 0.5s cubic-bezier(0.4,0,0.2,1), background-color 0.35s cubic-bezier(0.4,0,0.2,1), color 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)'
          }}
          className={`flex items-center rounded-xl font-medium py-3 relative overflow-hidden ${
            isCollapsed ? 'pl-[18px] pr-[18px] gap-0' : 'pl-4 pr-4 gap-4 hover:translate-x-1.5'
          } ${
            activeTab === 'settings' 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
          }`}
        >
          {/* Premium Vertical Active Indicator - Smooth Liquid */}
          <span 
            className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-emerald-500 transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] origin-center ${
              activeTab === 'settings' ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
            }`}
          />
          <Settings size={20} className="shrink-0 relative z-10" />
          <span className={`leading-normal pt-0.5 whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden relative z-10 ${
            isCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-40 opacity-100'
          }`}>
            Pengaturan
          </span>
        </Link>
        <button 
          type="button"
          onClick={() => { logout(); navigate('/'); }}
          title={isCollapsed ? "Logout" : undefined}
          style={{
            transition: 'padding 0.5s cubic-bezier(0.4,0,0.2,1), gap 0.5s cubic-bezier(0.4,0,0.2,1), background-color 0.35s cubic-bezier(0.4,0,0.2,1), color 0.35s cubic-bezier(0.4,0,0.2,1)'
          }}
          className={`flex items-center rounded-xl font-medium py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 ${
            isCollapsed ? 'pl-[18px] pr-[18px] gap-0' : 'pl-4 pr-4 gap-4'
          }`}
        >
          <LogOut size={20} className="shrink-0 relative z-10" />
          <span className={`leading-normal pt-0.5 whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden relative z-10 ${
            isCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-40 opacity-100'
          }`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
