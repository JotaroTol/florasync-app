import React, { useState, useContext } from 'react';
import { Bug, Search, AlertCircle, ShieldAlert, CheckCircle, Plus, X, Trash2, Edit2, Activity, Droplets, Leaf } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { db } from '../db';
import CustomSelect from './CustomSelect';
import ImageUploader from './ImageUploader';
import { UserContext } from '../App';

export default function PestDatabase() {
  const { user } = useContext(UserContext);
  const isGuest = user?.role === 'guest';
  const pests = useSupabaseQuery('pests', { eq: { userId: user.id } }, [user.id]) || [];
  const inventoryItems = useSupabaseQuery('inventory', { eq: { userId: user.id } }, [user.id]) || [];
  const categories = useSupabaseQuery('categories', { eq: { userId: user.id } }, [user.id]) || [];
  const [searchTerm, setSearchTerm] = useState('');

  const getCategoryGolonganConfig = (catName) => {
    const catObj = categories.find(c => c.name === catName);
    if (catObj) {
      const needsGolonganDefault = ['Insektisida', 'Fungisida', 'Herbisida', 'Pestisida'].includes(catObj.name);
      const needsGolongan = catObj.needsGolongan !== undefined && catObj.needsGolongan !== null ? catObj.needsGolongan : needsGolonganDefault;
      
      const optionsDefault = needsGolongan ? 'Ringan, Menengah, Berat' : '';
      const optionsStr = catObj.golonganOptions !== undefined && catObj.golonganOptions !== null ? catObj.golonganOptions : optionsDefault;
      
      const options = optionsStr ? optionsStr.split(',').map(s => s.trim()).filter(s => s) : [];
      return { needsGolongan, options };
    }
    
    const needsGolongan = ['Insektisida', 'Fungisida', 'Herbisida', 'Pestisida'].includes(catName);
    const options = needsGolongan ? ['Ringan', 'Menengah', 'Berat'] : [];
    return { needsGolongan, options };
  };
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = React.useRef(false);

  React.useEffect(() => {
    if (previewImage) {
      setActivePreviewImage(previewImage);
    }
  }, [previewImage]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    symptoms: [''],
    kategoriTanaman: [''],
    penyebab: 'Hama',
    preventif: '',
    photoUrl: '',
    obat: []
  });

  // Collect all unique symptoms from the DB
  const allSymptoms = Array.from(new Set(pests.flatMap(p => p.symptoms || [])));
  const allCategories = Array.from(new Set(pests.flatMap(p => p.kategoriTanaman || [])));

  const handleSymptomToggle = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const filteredPests = pests.filter(pest => {
    const matchesSearch = pest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSymptoms = selectedSymptoms.length === 0 || selectedSymptoms.some(s => (pest.symptoms || []).includes(s));
    return matchesSearch && matchesSymptoms;
  });

  const openModal = (pest = null) => {
    if (pest) {
      setEditingId(pest.id);
      setFormData({
        name: pest.name || '',
        symptoms: pest.symptoms && pest.symptoms.length > 0 ? [...pest.symptoms] : [''],
        kategoriTanaman: pest.kategoriTanaman && pest.kategoriTanaman.length > 0 ? [...pest.kategoriTanaman] : [''],
        penyebab: pest.penyebab || 'Hama',
        preventif: pest.preventif || '',
        photoUrl: pest.photoUrl || '',
        obat: pest.obat ? JSON.parse(JSON.stringify(pest.obat)) : []
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', symptoms: [''], kategoriTanaman: [''], penyebab: 'Hama', preventif: '', photoUrl: '', obat: []
      });
    }
    setIsModalOpen(true);
  };

  const handleArrayChange = (field, index, value) => {
    const newArr = [...formData[field]];
    newArr[index] = value;
    setFormData({ ...formData, [field]: newArr });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArr = [...formData[field]];
    newArr.splice(index, 1);
    setFormData({ ...formData, [field]: newArr });
  };

  const addObat = () => {
    setFormData({
      ...formData,
      obat: [...formData.obat, { merk: '', zatAktif: '', golongan: 'Ringan' }]
    });
  };

  const updateObat = (index, field, value) => {
    const newObat = [...formData.obat];
    newObat[index][field] = value;
    
    // Auto-fill logic when merk is updated
    if (field === 'merk') {
       const matchedItem = inventoryItems.find(item => item.name === value);
       if (matchedItem) {
         if (matchedItem.zatAktif) newObat[index].zatAktif = matchedItem.zatAktif;
         
         const config = getCategoryGolonganConfig(matchedItem.category);
         if (config.needsGolongan) {
           newObat[index].golongan = matchedItem.golongan || config.options[0] || '';
         } else {
           newObat[index].golongan = '';
         }
       }
    }
    
    setFormData({ ...formData, obat: newObat });
  };

  const removeObat = (index) => {
    const newObat = [...formData.obat];
    newObat.splice(index, 1);
    setFormData({ ...formData, obat: newObat });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    try {
      const payload = {
        userId: user.id,
        name: formData.name,
        symptoms: formData.symptoms.map(s => s.trim()).filter(s => s),
        kategoriTanaman: formData.kategoriTanaman.map(s => s.trim()).filter(s => s),
        penyebab: formData.penyebab,
        preventif: formData.preventif,
        photoUrl: formData.photoUrl,
        obat: formData.obat.filter(o => o.merk || o.zatAktif)
      };

      if (editingId) {
        await db.pests.update(editingId, payload);
      } else {
        await db.pests.add(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving pest:", error);
      alert("Gagal menyimpan data hama/penyakit. Silakan coba lagi.");
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus data hama/penyakit ini?")) {
      await db.pests.delete(id);
    }
  };

  const getObatSuggestions = () => {
    let filterCat = [];
    if (formData.penyebab === 'Hama') filterCat = ['Insektisida', 'Pestisida'];
    else if (formData.penyebab === 'Jamur') filterCat = ['Fungisida', 'Pestisida'];
    else if (formData.penyebab === 'Bakteri') filterCat = ['Pestisida'];
    else if (formData.penyebab === 'Virus') filterCat = ['Pestisida', 'ZPT'];
    else filterCat = ['Pestisida', 'Insektisida', 'Fungisida', 'Herbisida', 'ZPT'];
    
    return inventoryItems.filter(item => filterCat.includes(item.category)).map(item => item.name);
  };

  const getPenyebabColor = (penyebab) => {
    switch(penyebab) {
      case 'Virus': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Jamur': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Bakteri': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-red-500/20 text-red-400 border-red-500/30'; // Hama
    }
  };

  const getGolonganColor = (gol) => {
    if (gol === 'Berat') return 'text-red-400';
    if (gol === 'Menengah') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10 relative">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-red-400 to-amber-200 bg-clip-text text-transparent pb-2 flex items-center gap-3">
            <ShieldAlert size={32} className="text-red-400" /> Database Hama & Penyakit
          </h1>
          <p className="text-gray-400">Identifikasi masalah pada tanaman Anda dan temukan solusinya.</p>
        </div>
        {!isGuest && (
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shrink-0">
            <Plus size={20} /> Tambah Data
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Diagnostic Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-glass p-6 sticky top-8">
            <h2 className="text-lg font-semibold mb-4 text-emerald-400 border-b border-white/10 pb-2">Alat Diagnostik</h2>
            <p className="text-sm text-gray-400 mb-4">Pilih gejala yang dialami tanaman Anda:</p>
            
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {allSymptoms.map(symptom => (
                <label key={symptom} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => handleSymptomToggle(symptom)}
                    className="mt-1 accent-emerald-500"
                  />
                  <span className="text-sm text-gray-300">{symptom}</span>
                </label>
              ))}
            </div>
            
            {selectedSymptoms.length > 0 && (
              <button 
                onClick={() => setSelectedSymptoms([])}
                className="w-full mt-4 bg-red-500/20 text-red-400 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                Reset Gejala
              </button>
            )}
          </div>
        </div>

        {/* Pest List */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex items-center bg-forest-surface border border-white/10 rounded-xl px-4 py-3 focus-within:border-emerald-500 transition-all">
            <Search size={20} className="text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Cari nama hama atau penyakit..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-100 w-full" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPests.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-500">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p>Tidak ada data yang cocok dengan pencarian atau gejala.</p>
              </div>
            ) : (
              filteredPests.map(pest => (
                <div key={pest.id} className="card-glass p-6 border-red-500/10 bg-gradient-to-br from-forest-surface to-red-900/10 flex flex-col h-full relative group">
                  {!isGuest && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(pest)} className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/40 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(pest.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4 pr-16">
                    {pest.photoUrl ? (
                      <div 
                        className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-emerald-500/30 cursor-pointer relative group"
                        onClick={() => setPreviewImage(pest.photoUrl)}
                      >
                        <img src={pest.photoUrl} alt={pest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Search size={16} className="text-white drop-shadow" />
                        </div>
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${getPenyebabColor(pest.penyebab)}`}>
                        {pest.penyebab === 'Jamur' ? <Droplets size={24} /> : pest.penyebab === 'Virus' ? <Activity size={24} /> : <Bug size={24} />}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-100">{pest.name}</h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getPenyebabColor(pest.penyebab)}`}>
                          {pest.penyebab || 'Hama'}
                        </span>
                        {pest.kategoriTanaman && pest.kategoriTanaman.map((kat, idx) => (
                          <span key={idx} className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                            {kat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-xs uppercase text-gray-400 font-bold mb-2">Gejala:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(pest.symptoms || []).map((s, i) => (
                        <span key={i} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-xs text-gray-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-xl mt-auto flex flex-col gap-3">
                    <div>
                      <h4 className="text-xs uppercase text-emerald-400 font-bold mb-1 flex items-center gap-1">
                        <ShieldAlert size={14} /> Pencegahan / Preventif
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">{pest.preventif || pest.treatment || '-'}</p>
                    </div>
                    
                    {pest.obat && pest.obat.length > 0 && (
                      <div className="pt-3 border-t border-emerald-500/20">
                        <h4 className="text-xs uppercase text-emerald-400 font-bold mb-2 flex items-center gap-1">
                          <Droplets size={14} /> Obat / Zat Aktif
                        </h4>
                        <div className="space-y-2">
                          {pest.obat.map((o, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm bg-black/20 p-2 rounded border border-white/5">
                              <div>
                                <span className="font-semibold text-gray-200">{o.merk}</span>
                                <span className="text-gray-400 text-xs ml-2">({o.zatAktif})</span>
                              </div>
                              {o.golongan && (
                                <span className={`text-xs font-bold px-2 py-1 rounded bg-white/5 ${getGolonganColor(o.golongan)}`}>
                                  {o.golongan}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex p-4 bg-black/60 backdrop-blur-sm overflow-y-auto py-10">
          <div className="bg-[#0a1a12] border border-emerald-500/30 p-6 rounded-2xl w-full max-w-2xl shadow-2xl relative m-auto">
            <button onClick={() => !isSaving && setIsModalOpen(false)} disabled={isSaving} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <ShieldAlert className="text-emerald-500" /> {editingId ? 'Edit Data Hama/Penyakit' : 'Tambah Data Hama/Penyakit'}
            </h2>

            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <datalist id="kategori-suggestions">
                {allCategories.filter(c => !formData.kategoriTanaman.includes(c)).map(cat => <option key={cat} value={cat} />)}
              </datalist>
              <datalist id="symptoms-suggestions">
                {allSymptoms.filter(s => !formData.symptoms.includes(s)).map(sym => <option key={sym} value={sym} />)}
              </datalist>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-1">Nama Hama/Penyakit</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-forest-surface border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Misal: Kutu Putih" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-1">Penyebab</label>
                  <CustomSelect 
                    value={formData.penyebab} 
                    onChange={val => setFormData({...formData, penyebab: val})} 
                    options={[
                      { value: 'Hama', label: 'Hama' },
                      { value: 'Jamur', label: 'Jamur' },
                      { value: 'Bakteri', label: 'Bakteri' },
                      { value: 'Virus', label: 'Virus' }
                    ]}
                    className="w-full"
                  />
                </div>
              </div>

              <ImageUploader 
                value={formData.photoUrl} 
                onChange={(val) => setFormData({...formData, photoUrl: val})} 
                label="Foto Referensi (Opsional)"
              />

              <div>
                <label className="block text-sm font-semibold text-emerald-400 mb-1">Kategori Tanaman</label>
                <div className="flex flex-col gap-2">
                  {formData.kategoriTanaman.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="text" list="kategori-suggestions" value={item} onChange={e => handleArrayChange('kategoriTanaman', idx, e.target.value)} className="w-full bg-forest-surface border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Misal: Cabai" />
                      {formData.kategoriTanaman.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem('kategoriTanaman', idx)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors shrink-0">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('kategoriTanaman')} className="w-fit text-xs bg-emerald-600/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors mt-1 border border-emerald-500/30">
                    <Plus size={14} /> Tambah Kategori
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-emerald-400 mb-1">Gejala</label>
                <div className="flex flex-col gap-2">
                  {formData.symptoms.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="text" list="symptoms-suggestions" value={item} onChange={e => handleArrayChange('symptoms', idx, e.target.value)} className="w-full bg-forest-surface border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Misal: Daun keriting" />
                      {formData.symptoms.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem('symptoms', idx)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors shrink-0">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('symptoms')} className="w-fit text-xs bg-emerald-600/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors mt-1 border border-emerald-500/30">
                    <Plus size={14} /> Tambah Gejala
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-emerald-400 mb-1">Langkah Pencegahan / Preventif</label>
                <textarea rows="2" value={formData.preventif} onChange={e => setFormData({...formData, preventif: e.target.value})} className="w-full bg-forest-surface border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Sanitasi lahan, dll..." />
              </div>

              <div className="border border-white/10 rounded-xl p-4 bg-black/20">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-emerald-400">Daftar Obat / Treatment</label>
                  <button type="button" onClick={addObat} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                    <Plus size={14} /> Tambah Obat
                  </button>
                </div>
                
                <datalist id="obat-suggestions">
                  {getObatSuggestions().map(s => <option key={s} value={s} />)}
                </datalist>

                {formData.obat.length > 0 && (
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_32px] gap-2 px-2 mb-2">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Nama Produk / Merk</span>
                    <span className="text-xs text-gray-400 font-semibold uppercase">Zat Aktif</span>
                    <span className="text-xs text-gray-400 font-semibold uppercase">Tingkat / Golongan</span>
                    <span></span>
                  </div>
                )}
                
                <div className="flex flex-col gap-3">
                  {formData.obat.map((o, idx) => {
                    const matchedItem = inventoryItems.find(item => item.name === o.merk);
                    const config = matchedItem 
                      ? getCategoryGolonganConfig(matchedItem.category)
                      : { 
                          needsGolongan: true, 
                          options: ['Ringan', 'Menengah', 'Berat'] 
                        };
                    
                    return (
                      <div key={idx} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_32px] gap-2 items-center bg-forest-surface p-2 rounded-lg border border-white/5">
                        <input type="text" list="obat-suggestions" placeholder="Pilih/Ketik Merk..." value={o.merk} onChange={e => updateObat(idx, 'merk', e.target.value)} className="w-full min-w-0 bg-transparent border-b border-white/10 px-2 py-1 text-sm text-white outline-none focus:border-emerald-500" />
                        <input type="text" placeholder="Zat Aktif" value={o.zatAktif} onChange={e => updateObat(idx, 'zatAktif', e.target.value)} className="w-full min-w-0 bg-transparent border-b border-white/10 px-2 py-1 text-sm text-white outline-none focus:border-emerald-500" />
                        
                        {config.needsGolongan ? (
                          <CustomSelect 
                            value={o.golongan || config.options[0] || ''} 
                            onChange={val => updateObat(idx, 'golongan', val)} 
                            options={config.options.map(opt => ({ value: opt, label: opt }))}
                            className="w-full shrink-0"
                          />
                        ) : (
                          <div className="text-xs text-gray-500 text-center py-2 bg-black/15 rounded border border-white/5 font-medium shrink-0 w-[120px] select-none">
                            Tidak Butuh
                          </div>
                        )}
                        
                        <button type="button" onClick={() => removeObat(idx)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded shrink-0 flex items-center justify-center">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                  {formData.obat.length === 0 && <p className="text-xs text-gray-500 text-center italic">Belum ada obat ditambahkan</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/80 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    "Simpan Data"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal - Smooth macOS/iOS-style spring zoom transition */}
      <div 
        className={`fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)] ${
          previewImage ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
        onClick={() => setPreviewImage(null)}
      >
        <div 
          className={`relative max-w-full max-h-full transition-all duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)] transform ${
            previewImage ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-4 opacity-0'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {activePreviewImage && (
            <img 
              src={activePreviewImage} 
              alt="Preview" 
              className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] object-contain border border-white/10" 
            />
          )}
          <button 
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-all duration-300 bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-full backdrop-blur-md hover:scale-110 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
