import React, { useState, useContext } from 'react';
import { CalendarDays, Plus, ListTodo, Copy, ChevronDown, Check } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { db } from '../db';
import { UserContext } from '../App';

export default function Schedule() {
  const { user } = useContext(UserContext);
  const isGuest = user?.role === 'guest';
  const templates = useSupabaseQuery('templates', {}) || [];
  const plants = useSupabaseQuery('plants', { eq: { userId: user.id } }, [user.id]) || [];
  const events = useSupabaseQuery('events', { eq: { userId: user.id } }, [user.id]) || [];

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'history'

  // Get upcoming incomplete todos
  const upcomingTodos = events
    .filter(e => e.type === 'todo' && !e.completed)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Get history (completed todos)
  const historyTodos = events
    .filter(e => e.type === 'todo' && e.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // descending order

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent pb-2 flex items-center gap-3">
          <CalendarDays size={32} className="text-emerald-400" /> Jadwal Global
        </h1>
        <p className="text-gray-400">Kelola jadwal seluruh tanaman dan lihat riwayat perawatan.</p>
      </header>

      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`font-semibold px-4 py-2 rounded-lg transition-colors ${activeTab === 'upcoming' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-white/5'}`}
        >
          Akan Datang
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`font-semibold px-4 py-2 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-white/5'}`}
        >
          Riwayat
        </button>
      </div>

      {activeTab === 'upcoming' && (
        <div className="flex flex-col gap-4">
          {upcomingTodos.length === 0 ? (
            <div className="text-center py-20 card-glass">
              <Check size={48} className="mx-auto mb-4 text-emerald-500/50" />
              <h3 className="text-xl font-bold text-gray-200">Semua Tugas Selesai!</h3>
              <p className="text-gray-500 mt-2">Tidak ada jadwal perawatan yang tertunda.</p>
            </div>
          ) : (
            upcomingTodos.map(todo => {
              const plant = plants.find(p => p.id === todo.plantId);
              return (
                <div key={todo.id} className="card-glass p-5 flex items-center justify-between border-l-4 border-l-amber-500">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-xl font-bold leading-none">{new Date(todo.date).getDate()}</span>
                      <span className="text-[10px] uppercase font-bold">{new Date(todo.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-100">{plant ? plant.name : 'Tanaman Dihapus'}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <ListTodo size={14} /> 
                        {todo.activities?.map(a => a.type === 'produk' ? a.name : a.title).join(', ')}
                      </div>
                    </div>
                  </div>
                  {!isGuest && (
                    <button className="bg-forest-surface hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 text-gray-300 hover:text-emerald-400 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                      Tandai Selesai
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="flex flex-col gap-4">
          {historyTodos.length === 0 ? (
            <div className="text-center py-20 card-glass">
              <Check size={48} className="mx-auto mb-4 text-emerald-500/50" />
              <h3 className="text-xl font-bold text-gray-200">Belum ada riwayat</h3>
              <p className="text-gray-500 mt-2">Tugas yang sudah diselesaikan akan muncul di sini.</p>
            </div>
          ) : (
            historyTodos.map(todo => {
              const plant = plants.find(p => p.id === todo.plantId);
              return (
                <div key={todo.id} className="card-glass p-5 flex items-center justify-between border-l-4 border-l-emerald-500 opacity-70">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-xl font-bold leading-none">{new Date(todo.date).getDate()}</span>
                      <span className="text-[10px] uppercase font-bold">{new Date(todo.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-100 line-through decoration-emerald-500/50">{plant ? plant.name : 'Tanaman Dihapus'}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <Check size={14} className="text-emerald-500" /> 
                        {todo.activities?.map(a => a.type === 'produk' ? a.name : a.title).join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-emerald-500 font-semibold text-sm flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Selesai
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
