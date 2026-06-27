import React, { useState, useContext } from 'react';
import { Leaf, Edit2, RotateCcw, Plus, CheckCircle, Bug, AlertTriangle, X, Archive, Sprout } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { db } from '../db';
import { UserContext } from '../App';
import ImageUploader from './ImageUploader';
import CustomSelect from './CustomSelect';

export default function MyPlants() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filterParam = queryParams.get('filter');
  const { user } = useContext(UserContext);
  const isGuest = user?.role === 'guest';

  const plantsData = useSupabaseQuery('plants', { eq: { userId: user.id } }, [user.id]) || [];
  const locationsData = useSupabaseQuery('locations', { eq: { userId: user.id } }, [user.id]) || [];
  
  const [editingPlant, setEditingPlant] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = React.useRef(false);
  const [viewTab, setViewTab] = useState('aktif'); // 'aktif' | 'arsip'

  // Filter Logic
  const activePlants = plantsData.filter(p => p.phase !== 'Selesai Masa Tanam');
  const archivedPlants = plantsData.filter(p => p.phase === 'Selesai Masa Tanam');

  let basePlants = viewTab === 'aktif' ? activePlants : archivedPlants;

  const filteredPlants = filterParam 
    ? basePlants.filter(p => p.phase.toLowerCase() === filterParam.toLowerCase() || p.status === filterParam)
    : basePlants;

  const formatDate = (dateString) => {
    if (dateString === "-") return "-";
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status, text) => {
    switch (status) {
      case 'healthy': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400"><CheckCircle size={14} /> {text}</span>;
      case 'pest': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 animate-pulse"><Bug size={14} /> {text}</span>;
      case 'warning': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400"><AlertTriangle size={14} /> {text}</span>;
      default: return null;
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Yakin ingin menghapus tanaman ini beserta seluruh jadwalnya?")) {
      await db.plants.delete(id);
      // Delete associated events
      await db.events.where('plantId').equals(id).delete();
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (isSavingRef.current) return;

    // Failsafe 1: Tanggal Tanam tidak boleh sebelum Tanggal Semai
    if (editingPlant.plantedDate && editingPlant.plantedDate !== '-' && editingPlant.sownDate && editingPlant.sownDate !== '-') {
      if (editingPlant.plantedDate < editingPlant.sownDate) {
        alert("Gagal menyimpan: Tanggal Tanam tidak boleh sebelum Tanggal Semai!");
        return;
      }
    }

    // Failsafe 2: Tanggal Semai tidak boleh di masa depan
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (editingPlant.sownDate && editingPlant.sownDate !== '-') {
      if (editingPlant.sownDate > todayStr) {
        alert("Gagal menyimpan: Tanggal Semai tidak boleh di masa depan!");
        return;
      }
    }

    isSavingRef.current = true;
    setIsSaving(true);
    try {
      const dataToSave = {
        name: editingPlant.name,
        varietas: editingPlant.varietas,
        sownDate: editingPlant.sownDate,
        plantedDate: editingPlant.plantedDate,
        locationId: parseInt(editingPlant.locationId) || null,
        plantCount: parseInt(editingPlant.plantCount) || 0,
        photoUrl: editingPlant.photoUrl || ''
      };

      const todayStrLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      if (editingPlant.id) {
        let finalPhase = editingPlant.phase;
        if (editingPlant.phase === 'Semai' && dataToSave.plantedDate && dataToSave.plantedDate !== '-') {
          if (dataToSave.plantedDate <= todayStrLocal) {
            finalPhase = 'Vegetatif';
          }
        }
        await db.plants.update(editingPlant.id, {
          ...dataToSave,
          phase: finalPhase
        });
      } else {
        let finalPhase = "Semai";
        if (dataToSave.plantedDate && dataToSave.plantedDate !== '-') {
          if (dataToSave.plantedDate <= todayStrLocal) {
            finalPhase = "Vegetatif";
          }
        }
        await db.plants.add({
          ...dataToSave,
          userId: user.id,
          phase: finalPhase,
          status: "healthy",
          statusText: finalPhase === "Vegetatif" ? "Pindah Tanam" : "Baru Ditanam"
        });
      }
      setEditingPlant(null);
    } catch (error) {
      console.error("Error saving plant:", error);
      alert("Gagal menyimpan data tanaman. Silakan coba lagi.");
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const openAddPlantModal = () => {
    setEditingPlant({
      name: '',
      varietas: '',
      sownDate: new Date().toISOString().split('T')[0],
      plantedDate: '-',
      locationId: locationsData.length > 0 ? locationsData[0].id : '',
      plantCount: 1,
      photoUrl: ''
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10 relative">
      <header className="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-emerald-200 to-emerald-500 bg-clip-text text-transparent pb-2 flex items-center gap-3">
            <Leaf size={32} className="text-emerald-400" /> Daftar Tanaman
          </h1>
          <p className="text-gray-400">
            {filterParam ? `Menampilkan hasil filter: ${filterParam.toUpperCase()}` : 'Daftar seluruh tanaman yang sedang Anda kelola.'}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-forest-bg p-1 rounded-lg border border-white/5">
            <button onClick={() => setViewTab('aktif')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-all ${viewTab === 'aktif' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-white'}`}>
              <Sprout size={16} /> Aktif
            </button>
            <button onClick={() => setViewTab('arsip')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-all ${viewTab === 'arsip' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500 hover:text-white'}`}>
              <Archive size={16} /> Arsip
            </button>
          </div>
          {!isGuest && (
            <button onClick={openAddPlantModal} className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 text-white border-none py-2 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5">
              <Plus size={18} /> Tambah Tanaman
            </button>
          )}
        </div>
      </header>

      {/* Table Section */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Nama Tanaman</th>
                <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Lahan & Populasi</th>
                <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Fase</th>
                {viewTab === 'aktif' && <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Status / Hama</th>}
                {!isGuest && <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {plantsData.loading ? (
                <tr>
                  <td colSpan="5" className="p-8">
                    <div className="flex flex-col items-center justify-center gap-3 py-8 text-gray-400">
                      <Sprout size={36} className="text-emerald-500 animate-bounce" />
                      <span className="text-sm font-medium animate-pulse text-emerald-400/80">Memuat data tanaman...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPlants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-500">Tidak ada data tanaman yang sesuai.</td>
                </tr>
              ) : (
                filteredPlants.map((plant) => {
                  const loc = locationsData.find(l => l.id === parseInt(plant.locationId));
                  return (
                  <tr 
                    key={plant.id} 
                    onClick={() => navigate(`/plants/${plant.id}`)}
                    className="border-b border-white/5 hover:bg-emerald-500/5 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3 font-medium">
                        {plant.photoUrl ? (
                          <img src={plant.photoUrl} alt={plant.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-forest-surface flex items-center justify-center text-gray-400">
                            <Leaf size={20} />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-gray-100">{plant.name}</span>
                          <span className="text-xs text-gray-500">{plant.varietas}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-300 font-semibold">{loc ? loc.name : 'Belum ditentukan'}</span>
                        <span className="text-xs text-emerald-500">{plant.plantCount} Pohon</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{plant.phase}</td>
                    {viewTab === 'aktif' && <td className="p-4">{getStatusBadge(plant.status, plant.statusText)}</td>}
                    {!isGuest && (
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-3">
                          <button onClick={() => setEditingPlant({...plant})} className="text-gray-400 hover:text-emerald-400 hover:scale-110 transition-all"><Edit2 size={18} /></button>
                          <button onClick={(e) => handleDelete(e, plant.id)} className="text-gray-400 hover:text-red-400 hover:scale-110 transition-all"><RotateCcw size={18} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-forest-bg border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-emerald-400">{editingPlant.id ? 'Edit Tanaman' : 'Tambah Tanaman Baru'}</h3>
              <button onClick={() => !isSaving && setEditingPlant(null)} disabled={isSaving} className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"><X size={20}/></button>
            </div>
            <form onSubmit={handleEditSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase mb-1 block">Nama Tanaman</label>
                  <input type="text" value={editingPlant.name} onChange={e => setEditingPlant({...editingPlant, name: e.target.value})} className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase mb-1 block">Varietas</label>
                  <input type="text" value={editingPlant.varietas} onChange={e => setEditingPlant({...editingPlant, varietas: e.target.value})} className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase mb-1 block">Pilih Lahan (Lokasi)</label>
                  <CustomSelect 
                    value={editingPlant.locationId ? editingPlant.locationId.toString() : ''} 
                    onChange={val => setEditingPlant({...editingPlant, locationId: val})} 
                    options={locationsData.map(l => ({ value: l.id.toString(), label: l.name }))}
                    placeholder="-- Pilih Lahan --"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase mb-1 block">Populasi (Jml Pohon)</label>
                  <input type="number" min="1" value={editingPlant.plantCount} onChange={e => setEditingPlant({...editingPlant, plantCount: e.target.value})} className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none font-mono" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase mb-1 block">Tanggal Semai</label>
                  <input type="date" value={editingPlant.sownDate} onChange={e => setEditingPlant({...editingPlant, sownDate: e.target.value})} className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase mb-1 block">Tanggal Tanam</label>
                  <input type="date" value={editingPlant.plantedDate} onChange={e => setEditingPlant({...editingPlant, plantedDate: e.target.value})} className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none" />
                </div>
              </div>

              <div className="mt-2">
                <ImageUploader 
                  label="Foto Tanaman (Opsional)" 
                  value={editingPlant.photoUrl} 
                  onChange={(base64) => setEditingPlant({...editingPlant, photoUrl: base64})} 
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingPlant(null)} 
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-forest-surface text-gray-300 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/80 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
