import React, { useState, useEffect, useContext } from 'react';
import { Search, Bell, Sprout, Leaf, Droplets, Bug, Plus, Edit2, RotateCcw, CheckCircle, AlertTriangle, CloudRain, Sun, Cloud, Loader, Flower, Apple, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { db } from '../db';
import { UserContext } from '../App';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const plantsData = useSupabaseQuery('plants', { eq: { userId: user.id } }, [user.id]) || [];
  const eventsData = useSupabaseQuery('events', { eq: { userId: user.id } }, [user.id]) || [];
  const profile = useSupabaseQuery('userProfile', { eq: { userId: user.id } }, [user.id], true);
  
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [selectedWeatherDay, setSelectedWeatherDay] = useState(null); // 0, 1, or 2

  // Fetch Weather from Open-Meteo
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const lat = profile?.lat || -6.2146;
        const lon = profile?.lon || 106.8451;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=Asia%2FJakarta&forecast_days=3`);
        const data = await res.json();
        setWeatherData(data);
      } catch (err) {
        console.error("Failed to fetch weather", err);
      } finally {
        setWeatherLoading(false);
      }
    };
    if (profile !== undefined) {
      fetchWeather();
    }
  }, [profile]);

  const getWeatherIcon = (code) => {
    if (code <= 3) return <Sun size={32} className="text-amber-400 mb-2" />;
    if (code <= 48) return <Cloud size={32} className="text-gray-400 mb-2" />;
    return <CloudRain size={32} className="text-blue-400 mb-2" />;
  };

  const getWeatherText = (code) => {
    switch(code) {
      case 0: return 'Cerah';
      case 1: case 2: return 'Cerah Berawan';
      case 3: return 'Berawan';
      case 45: case 48: return 'Berkabut';
      case 51: case 53: case 55: return 'Gerimis';
      case 61: case 63: case 65: return 'Hujan Ringan';
      case 71: case 73: case 75: return 'Salju';
      case 95: case 96: case 99: return 'Badai Petir';
      default: return 'Tidak Diketahui';
    }
  };

  const getFormattedDate = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "-") return "-";
    try {
      return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch(e) {
      return "-";
    }
  };

  const computeLastFertilized = (plantId) => {
    const historyEvents = eventsData.filter(e => e.plantId === plantId && (e.type === 'history' || e.completed === true));
    historyEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    for (const e of historyEvents) {
      if (e.activities && e.activities.some(act => act.type === 'produk' && act.category === 'Pupuk')) {
        return formatDate(e.date);
      }
    }
    return 'Belum pernah';
  };

  const getStatusBadge = (status, text) => {
    switch (status) {
      case 'healthy':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400"><CheckCircle size={14} /> {text}</span>;
      case 'pest':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 animate-pulse"><Bug size={14} /> {text}</span>;
      case 'warning':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400"><AlertTriangle size={14} /> {text}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent pb-2">Ringkasan Kebun</h1>
        <p className="text-gray-400">Pantau kondisi tanaman Anda hari ini.</p>
      </div>

      {/* NEW: Weather & Priority Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card-glass p-6 lg:col-span-2">
          <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
            <h2 className="text-lg font-semibold text-emerald-400">Prakiraan Cuaca</h2>
            <span className="text-xs text-gray-500">Lokasi: {profile?.city || 'Jakarta'} | Sumber: Open-Meteo</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {weatherLoading ? (
               <div className="col-span-3 flex justify-center py-4"><Loader className="animate-spin text-emerald-500" /></div>
            ) : weatherData ? (
              <>
                <div onClick={() => setSelectedWeatherDay(0)} className="cursor-pointer hover:bg-emerald-500/10 transition-colors bg-forest-bg p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                  <span className="text-xs text-emerald-400 uppercase font-bold mb-1">Saat Ini</span>
                  <span className="text-[10px] text-gray-500 mb-2">{getFormattedDate(0)}</span>
                  {getWeatherIcon(weatherData.current.weather_code)}
                  <span className="text-lg font-bold text-white">{Math.round(weatherData.current.temperature_2m)}°C</span>
                  <span className="text-xs text-gray-400 mt-1">{getWeatherText(weatherData.current.weather_code)}</span>
                </div>
                <div onClick={() => setSelectedWeatherDay(1)} className="cursor-pointer hover:bg-emerald-500/10 transition-colors bg-forest-bg p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-400 uppercase font-bold mb-1">Besok</span>
                  <span className="text-[10px] text-gray-500 mb-2">{getFormattedDate(1)}</span>
                  {getWeatherIcon(weatherData.daily.weather_code[1])}
                  <span className="text-lg font-bold text-white">{Math.round(weatherData.daily.temperature_2m_max[1])}°C</span>
                  <span className="text-xs text-gray-500 mt-1">{getWeatherText(weatherData.daily.weather_code[1])}</span>
                </div>
                <div onClick={() => setSelectedWeatherDay(2)} className="cursor-pointer hover:bg-emerald-500/10 transition-colors bg-forest-bg p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-400 uppercase font-bold mb-1">Lusa</span>
                  <span className="text-[10px] text-gray-500 mb-2">{getFormattedDate(2)}</span>
                  {getWeatherIcon(weatherData.daily.weather_code[2])}
                  <span className="text-lg font-bold text-white">{Math.round(weatherData.daily.temperature_2m_max[2])}°C</span>
                  <span className="text-xs text-gray-500 mt-1">{getWeatherText(weatherData.daily.weather_code[2])}</span>
                </div>
              </>
            ) : (
              <div className="col-span-3 text-center text-sm text-gray-500 py-4">Gagal memuat cuaca</div>
            )}
          </div>
        </div>
        
        <div className="card-glass p-6 bg-gradient-to-br from-forest-surface to-emerald-900/20 border-emerald-500/20">
          <h2 className="text-lg font-semibold mb-4 text-amber-400 border-b border-white/10 pb-2 flex items-center gap-2">
            <AlertTriangle size={18}/> Prioritas Hari Ini
          </h2>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-32 pr-2">
            {eventsData.filter(e => e.type === 'todo' && !e.completed && e.date <= new Date().toISOString().split('T')[0]).length === 0 ? (
              <p className="text-sm text-gray-400 italic mt-2">Tidak ada jadwal tertunda.</p>
            ) : (
              eventsData.filter(e => e.type === 'todo' && !e.completed && e.date <= new Date().toISOString().split('T')[0]).map(todo => {
                const plant = plantsData.find(p => p.id === todo.plantId);
                return (
                  <div key={todo.id} onClick={() => navigate(`/plants/${todo.plantId}`)} className="bg-white/5 p-3 rounded-lg border border-white/5 border-l-2 border-l-amber-500 cursor-pointer hover:bg-white/10 transition-colors">
                    <span className="text-xs text-gray-400">{plant?.name || 'Tanaman Dihapus'}</span>
                    <p className="text-sm font-semibold text-gray-200">
                      {todo.activities.map(a => a.type === 'produk' ? a.name : a.title).join(', ')}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        <div 
          onClick={() => navigate('/plants?filter=pest')}
          className="card-glass p-6 flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:border-emerald-500/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-red-500 bg-red-500/15 group-hover:scale-110 transition-transform">
            <Bug size={28} />
          </div>
          <div>
            <h3 className="text-sm text-gray-400 font-medium mb-1 group-hover:text-red-400 transition-colors">Terkena Hama/Penyakit</h3>
            <p className="text-3xl font-bold">{plantsData.filter(p => p.status === 'pest').length}</p>
          </div>
        </div>
        <div 
          onClick={() => navigate('/plants?filter=semai')}
          className="card-glass p-6 flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:border-emerald-500/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-emerald-500 bg-emerald-500/15 group-hover:scale-110 transition-transform">
            <Sprout size={28} />
          </div>
          <div>
            <h3 className="text-sm text-gray-400 font-medium mb-1 group-hover:text-emerald-400 transition-colors">Fase Semai</h3>
            <p className="text-3xl font-bold">{plantsData.filter(p => p.phase === 'Semai').length}</p>
          </div>
        </div>
        <div 
          onClick={() => navigate('/plants?filter=vegetatif')}
          className="card-glass p-6 flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:border-emerald-500/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-emerald-400 bg-emerald-500/15 group-hover:scale-110 transition-transform">
            <Leaf size={28} />
          </div>
          <div>
            <h3 className="text-sm text-gray-400 font-medium mb-1 group-hover:text-emerald-400 transition-colors">Fase Vegetatif</h3>
            <p className="text-3xl font-bold">{plantsData.filter(p => p.phase === 'Vegetatif').length}</p>
          </div>
        </div>
        <div 
          onClick={() => navigate('/plants?filter=generatif')}
          className="card-glass p-6 flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:border-emerald-500/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-amber-400 bg-amber-500/15 group-hover:scale-110 transition-transform">
            <Flower size={28} />
          </div>
          <div>
            <h3 className="text-sm text-gray-400 font-medium mb-1 group-hover:text-amber-400 transition-colors">Fase Generatif</h3>
            <p className="text-3xl font-bold">{plantsData.filter(p => p.phase === 'Generatif').length}</p>
          </div>
        </div>
        <div 
          onClick={() => navigate('/plants?filter=panen')}
          className="card-glass p-6 flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:border-emerald-500/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-orange-400 bg-orange-500/15 group-hover:scale-110 transition-transform">
            <Apple size={28} />
          </div>
          <div>
            <h3 className="text-sm text-gray-400 font-medium mb-1 group-hover:text-orange-400 transition-colors">Telah Dipanen</h3>
            <p className="text-3xl font-bold">
              {plantsData.filter(p => p.phase === 'Panen' || eventsData.some(e => e.plantId === p.id && e.type === 'history' && e.activities && e.activities.some(a => a.type === 'panen'))).length}
            </p>
          </div>
        </div>
        <div 
          onClick={() => navigate('/plants?filter=mati')}
          className="card-glass p-6 flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:border-blue-500/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-blue-400 bg-blue-500/15 group-hover:scale-110 transition-transform">
            <CheckCircle size={28} />
          </div>
          <div>
            <h3 className="text-sm text-gray-400 font-medium mb-1 group-hover:text-blue-400 transition-colors">Selesai Masa Tanam</h3>
            <p className="text-3xl font-bold">
              {plantsData.filter(p => p.phase === 'Selesai Masa Tanam').length}
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <section className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Status Tanaman Detail</h2>
        </div>
        <div className="card-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Nama Tanaman</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Fase</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Tanggal Semai</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Tanggal Tanam</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Terakhir Dipupuk</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Status / Hama</th>
                </tr>
              </thead>
              <tbody>
                {plantsData.map((plant) => (
                  <tr 
                    key={plant.id} 
                    onClick={() => navigate(`/plants/${plant.id}`)}
                    className="border-b border-white/5 hover:bg-emerald-500/5 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3 font-medium">
                        <div className="w-10 h-10 rounded-lg bg-forest-surface flex items-center justify-center text-gray-400">
                          <Leaf size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span>{plant.name}</span>
                          <span className="text-xs text-gray-500">{plant.varietas}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{plant.phase}</td>
                    <td className="p-4 text-sm">{formatDate(plant.sownDate)}</td>
                    <td className="p-4 text-sm">{formatDate(plant.plantedDate)}</td>
                    <td className="p-4 text-sm">{computeLastFertilized(plant.id)}</td>
                    <td className="p-4">{getStatusBadge(plant.status, plant.statusText)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Weather Detail Modal */}
      {selectedWeatherDay !== null && weatherData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedWeatherDay(null)}>
          <div className="bg-forest-surface border border-emerald-500/30 rounded-2xl p-6 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedWeatherDay(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <h3 className="text-xl font-semibold mb-4 text-emerald-400 text-center">
              Detail Cuaca: {selectedWeatherDay === 0 ? 'Saat Ini' : selectedWeatherDay === 1 ? 'Besok' : 'Lusa'}
            </h3>
            
            <div className="flex flex-col items-center mb-6">
              {getWeatherIcon(selectedWeatherDay === 0 ? weatherData.current.weather_code : weatherData.daily.weather_code[selectedWeatherDay])}
              <span className="text-2xl font-bold mt-2 text-white">
                {selectedWeatherDay === 0 ? `${Math.round(weatherData.current.temperature_2m)}°C` : `${Math.round(weatherData.daily.temperature_2m_max[selectedWeatherDay])}°C`}
              </span>
              <span className="text-emerald-400 font-medium text-sm">
                {getWeatherText(selectedWeatherDay === 0 ? weatherData.current.weather_code : weatherData.daily.weather_code[selectedWeatherDay])}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-forest-bg p-4 rounded-xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">Curah Hujan</span>
                <span className="font-semibold text-blue-400 flex items-center gap-1">
                  <Droplets size={14}/> 
                  {selectedWeatherDay === 0 ? `${weatherData.current.precipitation} mm` : `${weatherData.daily.precipitation_sum[selectedWeatherDay]} mm`}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">Angin Kencang</span>
                <span className="font-semibold text-gray-200 flex items-center gap-1">
                  <Wind size={14}/> 
                  {selectedWeatherDay === 0 ? `${weatherData.current.wind_speed_10m} km/h` : `${weatherData.daily.wind_speed_10m_max[selectedWeatherDay]} km/h`}
                </span>
              </div>
              {selectedWeatherDay === 0 && (
                <div className="flex flex-col col-span-2 pt-2 mt-2 border-t border-white/5">
                  <span className="text-gray-400 text-xs">Kelembaban Udara</span>
                  <span className="font-semibold text-gray-200">
                    {weatherData.current.relative_humidity_2m}%
                  </span>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
