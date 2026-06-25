import React, { useState } from 'react';
import { CalendarDays, Plus, Trash2, FlaskConical, Save } from 'lucide-react';

export default function CalendarSchedule() {
  const [schedules, setSchedules] = useState([
    { id: 1, week: 'Minggu ke-1 (MST)', product: 'NPK 16-16-16', dose: '10 gram', plant: 'Tomat Ceri' },
    { id: 2, week: 'Minggu ke-3 (MST)', product: 'Pupuk Kandang', dose: '500 gram', plant: 'Cabai Rawit' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ week: '', product: '', dose: '', plant: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSchedule.week || !newSchedule.product || !newSchedule.dose) return;
    
    setSchedules([...schedules, { ...newSchedule, id: Date.now() }]);
    setNewSchedule({ week: '', product: '', dose: '', plant: '' });
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10">
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent pb-2">Jadwal Pemupukan</h1>
          <p className="text-gray-400">Atur jadwal aplikasi pupuk dan dosis untuk setiap minggu.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 text-white border-none py-2.5 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5"
        >
          {isAdding ? 'Batal' : <><Plus size={18} /> Tambah Jadwal</>}
        </button>
      </header>

      {/* Add Schedule Form */}
      {isAdding && (
        <div className="card-glass p-6 mb-8 border-emerald-500/30 bg-emerald-900/10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-400">
            <FlaskConical size={20} /> Tambah Dosis Baru
          </h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-400 font-medium uppercase mb-2">Minggu Aplikasi</label>
              <input 
                type="text" 
                placeholder="Misal: Minggu ke-1" 
                value={newSchedule.week}
                onChange={e => setNewSchedule({...newSchedule, week: e.target.value})}
                className="w-full bg-forest-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-medium uppercase mb-2">Tanaman (Opsional)</label>
              <input 
                type="text" 
                placeholder="Misal: Tomat" 
                value={newSchedule.plant}
                onChange={e => setNewSchedule({...newSchedule, plant: e.target.value})}
                className="w-full bg-forest-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-medium uppercase mb-2">Nama Produk / Pupuk</label>
              <input 
                type="text" 
                placeholder="Misal: NPK 16-16-16" 
                value={newSchedule.product}
                onChange={e => setNewSchedule({...newSchedule, product: e.target.value})}
                className="w-full bg-forest-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-medium uppercase mb-2">Dosis</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Misal: 50 gram" 
                  value={newSchedule.dose}
                  onChange={e => setNewSchedule({...newSchedule, dose: e.target.value})}
                  className="w-full bg-forest-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  required
                />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2.5 flex items-center justify-center transition-colors">
                  <Save size={18} />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Schedule List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="card-glass p-6 flex flex-col relative group">
            <button 
              onClick={() => handleDelete(schedule.id)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-forest-surface border border-white/5 flex items-center justify-center text-emerald-500">
                <CalendarDays size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-emerald-400">{schedule.week}</h3>
                <p className="text-xs text-gray-400">{schedule.plant || 'Semua Tanaman'}</p>
              </div>
            </div>
            
            <div className="bg-forest-bg rounded-xl p-4 border border-white/5 mt-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400 uppercase font-medium">Produk</span>
                <span className="font-medium text-white">{schedule.product}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 uppercase font-medium">Dosis</span>
                <span className="font-bold text-amber-400">{schedule.dose}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
