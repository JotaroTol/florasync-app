import React, { useContext } from 'react';
import { AlertCircle, AlertTriangle, ListTodo, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { db } from '../db';
import { UserContext } from '../App';

export default function Alerts() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const inventory = useSupabaseQuery('inventory', { eq: { userId: user.id } }, [user.id]) || [];
  const events = useSupabaseQuery('events', { eq: { userId: user.id } }, [user.id]) || [];
  const plants = useSupabaseQuery('plants', { eq: { userId: user.id } }, [user.id]) || [];

  const todayStr = new Date().toISOString().split('T')[0];
  
  // 1. Low Inventory Alerts
  const lowInventory = inventory.filter(i => i.stock < 100);

  // 2. Overdue or Today's Tasks
  const pendingTodos = events.filter(e => e.type === 'todo' && !e.completed && e.date <= todayStr);
  const overdueTodos = pendingTodos.filter(e => e.date < todayStr);
  const todaysTodos = pendingTodos.filter(e => e.date === todayStr);

  // 3. Pest / Warning Plants
  const pestPlants = plants.filter(p => p.status === 'pest');

  const totalAlerts = lowInventory.length + overdueTodos.length + todaysTodos.length + pestPlants.length;

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-red-400 to-amber-200 bg-clip-text text-transparent pb-2 flex items-center gap-3">
          <AlertCircle size={32} className="text-red-400" /> Pusat Peringatan
        </h1>
        <p className="text-gray-400">Anda memiliki {totalAlerts} hal yang membutuhkan perhatian.</p>
      </header>

      <div className="flex flex-col gap-8 max-w-4xl">
        
        {/* Inventory Alerts */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
            <AlertTriangle className="text-red-400" size={20} /> Peringatan Inventaris
          </h2>
          {lowInventory.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Stok aman, tidak ada peringatan.</p>
          ) : (
            <div className="grid gap-3">
              {lowInventory.map(item => (
                <div key={`inv-${item.id}`} onClick={() => navigate(`/inventory?edit=${item.id}`)} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-between hover:bg-red-500/20 transition-colors cursor-pointer relative">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-100">{item.name}</h4>
                      <p className="text-sm text-red-400 mt-0.5">Stok kritis! Hanya tersisa {item.stock} {item.unit}.</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/inventory?edit=${item.id}`); }} className="text-sm font-semibold bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/40 relative z-20 cursor-pointer pointer-events-auto">Restock</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pest Alerts */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
            <ShieldAlert className="text-red-400" size={20} /> Serangan Hama
          </h2>
          {pestPlants.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Tidak ada tanaman yang diserang hama.</p>
          ) : (
            <div className="grid gap-3">
              {pestPlants.map(plant => (
                <div key={`pest-${plant.id}`} onClick={() => navigate(`/plants/${plant.id}`)} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-between hover:bg-red-500/20 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-100">{plant.name}</h4>
                      <p className="text-sm text-red-400 mt-0.5">Status: {plant.statusText}</p>
                    </div>
                  </div>
                  <ArrowRight className="text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Task Alerts */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
            <ListTodo className="text-amber-400" size={20} /> Jadwal Tertunda & Hari Ini
          </h2>
          {pendingTodos.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Semua jadwal telah diselesaikan.</p>
          ) : (
            <div className="grid gap-3">
              {pendingTodos.map(todo => {
                const plant = plants.find(p => p.id === todo.plantId);
                const isOverdue = todo.date < todayStr;
                return (
                  <div key={`todo-${todo.id}`} onClick={() => navigate(`/plants/${todo.plantId}`)} className={`bg-amber-500/10 border ${isOverdue ? 'border-red-500/40 border-l-4' : 'border-amber-500/20'} p-4 rounded-xl flex items-center justify-between hover:bg-amber-500/20 transition-colors cursor-pointer`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 font-bold text-xs flex-col leading-none">
                        <span>{new Date(todo.date).getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-100">{plant?.name || 'Tanaman Dihapus'}</h4>
                        <p className={`text-sm mt-0.5 ${isOverdue ? 'text-red-400 font-medium' : 'text-amber-400'}`}>
                          {isOverdue && <span className="uppercase text-[10px] font-bold bg-red-500/20 px-1.5 py-0.5 rounded mr-2">Terlewat</span>}
                          {todo.activities.map(a => a.type === 'produk' ? a.name : a.title).join(', ')}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="text-gray-400" />
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
