import React, { useState, useContext } from 'react';
import { Map, MapPin, Navigation, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { db } from '../db';
import ImageUploader from './ImageUploader';
import { UserContext } from '../App';

export default function Locations() {
  const { user } = useContext(UserContext);
  const isGuest = user?.role === 'guest';
  const locationsData = useSupabaseQuery('locations', { eq: { userId: user.id } }, [user.id]) || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    coordinates: '',
    area: '',
    photoUrl: ''
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        address: item.address,
        coordinates: item.coordinates,
        area: item.area,
        photoUrl: item.photoUrl || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', address: '', coordinates: '', area: '', photoUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      userId: user.id,
      area: parseFloat(formData.area) || 0
    };

    if (editingItem) {
      await db.locations.update(editingItem.id, dataToSave);
    } else {
      await db.locations.add(dataToSave);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus lahan ini? Semua tanaman di dalamnya bisa kehilangan referensi lahan.")) {
      await db.locations.delete(id);
    }
  };

  const getGPSLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            coordinates: `${position.coords.latitude}, ${position.coords.longitude}`
          }));
        },
        (error) => {
          alert("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi diaktifkan.");
        }
      );
    } else {
      alert("Browser Anda tidak mendukung Geolocation.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10 relative">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent pb-2 flex items-center gap-3">
            <Map size={32} className="text-blue-400" /> Manajemen Lahan
          </h1>
          <p className="text-gray-400">Kelola blok lahan, greenhouse, dan koordinat kebun Anda.</p>
        </div>
        {!isGuest && (
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-blue-600 hover:bg-blue-500 text-white border-none py-2 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} /> Tambah Lahan
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {locationsData.map(loc => (
          <div key={loc.id} className="card-glass overflow-hidden flex flex-col group">
            <div className="h-40 bg-forest-surface relative">
              {loc.photoUrl ? (
                <img src={loc.photoUrl} alt={loc.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <MapPin size={32} className="mb-2 opacity-50" />
                  <span className="text-xs">Tidak ada foto lahan</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-forest-bg via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <h3 className="text-xl font-bold text-white shadow-sm">{loc.name}</h3>
                {!isGuest && (
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(loc)} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-500/50 transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(loc.id)} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-500/50 transition-colors"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-5 flex flex-col gap-4 flex-1">
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-start gap-2 text-gray-300">
                  <MapPin size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <span>{loc.address || 'Alamat tidak diisi'}</span>
                </div>
                {loc.coordinates && (
                  <div className="flex items-center gap-2 text-gray-400 text-xs ml-6">
                    <Navigation size={12} /> {loc.coordinates}
                  </div>
                )}
              </div>
              
              <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-sm text-gray-400">Luas Area:</span>
                <span className="font-bold text-blue-400">{loc.area} m²</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="bg-forest-bg border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-auto">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
                <MapPin size={20} /> {editingItem ? 'Edit Lahan' : 'Tambah Lahan Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Nama Lahan / Blok</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-blue-500 outline-none" required />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Alamat Lengkap</label>
                  <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows="2" className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Koordinat GPS</label>
                    <input type="text" value={formData.coordinates} onChange={e => setFormData({...formData, coordinates: e.target.value})} placeholder="-6.20, 106.81" className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-blue-500 outline-none text-xs font-mono" />
                    <button type="button" onClick={getGPSLocation} className="mt-2 text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300"><Navigation size={12}/> Dapatkan Lokasi Saat Ini</button>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Luas Area (m²)</label>
                    <input type="number" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-blue-500 outline-none font-mono" required />
                  </div>
                </div>

                <div className="mt-2">
                  <ImageUploader 
                    label="Foto Lahan / Area" 
                    value={formData.photoUrl} 
                    onChange={(base64) => setFormData({...formData, photoUrl: base64})} 
                  />
                </div>
              </div>

              {/* Map Preview */}
              <div className="bg-forest-surface rounded-xl border border-white/5 overflow-hidden h-64 md:h-auto flex flex-col">
                <div className="p-3 bg-black/20 text-xs text-gray-400 font-semibold border-b border-white/5">Pratinjau Peta</div>
                <div className="flex-1 w-full bg-gray-900 relative">
                  {formData.coordinates ? (
                    <iframe 
                      title="map-preview"
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      style={{border:0}}
                      src={`https://maps.google.com/maps?q=${formData.coordinates}&z=15&output=embed`}
                      allowFullScreen
                    ></iframe>
                  ) : formData.address ? (
                    <iframe 
                      title="map-preview"
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      style={{border:0}}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.address)}&z=15&output=embed`}
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm p-6 text-center">
                      Masukkan koordinat atau alamat untuk melihat pratinjau peta.
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4 border-t border-white/10 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-forest-surface text-gray-300 font-semibold rounded-lg hover:bg-white/5 transition-colors">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors">Simpan Lahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
