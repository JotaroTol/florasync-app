import React, { useState, useEffect, useContext, useRef } from 'react';
import { Package, Plus, Search, Edit2, Trash2, ShieldCheck, ShieldAlert, X, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { db } from '../db';
import { supabase } from '../supabaseClient';
import ImageUploader from './ImageUploader';
import { UserContext } from '../App';

export default function Inventory() {
  const { user } = useContext(UserContext);
  const isGuest = user?.role === 'guest';
  const navigate = useNavigate();
  const location = useLocation();
  const rawInventoryData = useSupabaseQuery('inventory', { eq: { userId: user.id } }, [user.id]) || [];
  
  const inventoryData = [...rawInventoryData].sort((a, b) => {
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    return a.name.localeCompare(b.name);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (previewImage) {
      setActivePreviewImage(previewImage);
    }
  }, [previewImage]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null means adding new
  const [editMode, setEditMode] = useState('set'); // 'set', 'add', 'waste'
  const [formData, setFormData] = useState({
    name: '',
    category: 'Pupuk',
    stock: '',
    unit: 'gram',
    photoUrl: '',
    zatAktif: '',
    golongan: 'Menengah'
  });

  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const units = ['gram', 'kg', 'ml', 'Liter', 'pcs'];

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').eq('userId', user.id);
      if (error) {
        setCategoriesError(true);
        setCategories(['Pupuk', 'Insektisida', 'Fungisida', 'Herbisida', 'ZPT', 'Lainnya'].map((name, i) => ({ id: -i, name })));
        return;
      }
      
      if (data.length === 0) {
        const defaults = ['Pupuk', 'Insektisida', 'Fungisida', 'Herbisida', 'ZPT', 'Lainnya'];
        const toInsert = defaults.map(name => ({ name, userId: user.id }));
        const { data: inserted, error: insertError } = await supabase.from('categories').insert(toInsert).select();
        if (!insertError && inserted) {
          setCategories(inserted.sort((a, b) => a.name.localeCompare(b.name)));
        } else {
          setCategories(defaults.map((name, index) => ({ id: -index, name })));
        }
      } else {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setCategories(sorted);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      setCategories(['Pupuk', 'Insektisida', 'Fungisida', 'Herbisida', 'ZPT', 'Lainnya'].map((name, i) => ({ id: -i, name })));
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user.id]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const nameTrimmed = newCategoryName.trim();
    if (!nameTrimmed) return;
    
    if (categories.some(c => c.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      alert("Kategori dengan nama tersebut sudah ada.");
      return;
    }
    
    setIsSavingCategory(true);
    try {
      const { error } = await supabase.from('categories').insert({
        name: nameTrimmed,
        userId: user.id
      });
      if (error) throw error;
      setNewCategoryName('');
      await fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Gagal menambahkan kategori. Silakan coba lagi.");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const isCategoryUsed = (categoryName) => inventoryData.some(item => item.category === categoryName);
    if (isCategoryUsed(cat.name)) {
      alert("Kategori ini tidak dapat dihapus karena masih digunakan oleh produk lain.");
      return;
    }
    
    if (!window.confirm(`Yakin ingin menghapus kategori "${cat.name}"?`)) {
      return;
    }
    
    try {
      const { error } = await supabase.from('categories').delete().eq('id', cat.id);
      if (error) throw error;
      await fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Gagal menghapus kategori. Silakan coba lagi.");
    }
  };

  // Filter
  const filteredInventory = inventoryData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId && inventoryData.length > 0) {
      const itemToEdit = inventoryData.find(i => i.id === parseInt(editId));
      if (itemToEdit) {
        // Delay opening modal to prevent immediate state conflicts if it just mounted
        setTimeout(() => handleOpenModal(itemToEdit), 100);
        // Clear param so it doesn't reopen if closed
        navigate('/inventory', { replace: true });
      }
    }
  }, [location.search, inventoryData, navigate]);

  const handleOpenModal = (item = null) => {
    setEditMode('set'); // default for new
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        stock: '', // We leave stock empty in edit mode so they input the modifier amount
        unit: item.unit || 'gram',
        photoUrl: item.photoUrl || '',
        zatAktif: item.zatAktif || '',
        golongan: item.golongan || 'Menengah'
      });
      setEditMode(null); // default for edit is not changing stock
    } else {
      setEditingItem(null);
      setFormData({ name: '', category: categories[0]?.name || 'Pupuk', stock: '', unit: 'gram', photoUrl: '', zatAktif: '', golongan: 'Menengah' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    try {
      const inputAmount = parseFloat(formData.stock) || 0;
      
      let finalStock = inputAmount;
      
      if (editingItem) {
        if (!editMode) {
          finalStock = editingItem.stock;
        } else if (editMode === 'add') {
          finalStock = editingItem.stock + inputAmount;
        } else if (editMode === 'waste') {
          finalStock = Math.max(0, editingItem.stock - inputAmount);
        } else {
          finalStock = inputAmount;
        }
      }

      const dataToSave = {
        userId: user.id,
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        photoUrl: formData.photoUrl,
        stock: finalStock,
        zatAktif: ['Insektisida', 'Fungisida', 'Herbisida', 'Pestisida'].includes(formData.category) ? formData.zatAktif : '',
        golongan: ['Insektisida', 'Fungisida', 'Herbisida', 'Pestisida'].includes(formData.category) ? formData.golongan : 'Menengah'
      };

      if (editingItem) {
        await db.inventory.update(editingItem.id, dataToSave);
      } else {
        await db.inventory.add(dataToSave);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Gagal menyimpan produk. Silakan coba lagi.");
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus produk ini dari gudang?")) {
      await db.inventory.delete(id);
    }
  };

  const getStatusBadge = (stock) => {
    if (stock <= 0) return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/15 text-gray-400"><AlertCircle size={14} /> Habis</span>;
    if (stock < 100) return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400"><ShieldAlert size={14} /> Kritis</span>;
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400"><ShieldCheck size={14} /> Aman</span>;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10 relative">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent pb-2 flex items-center gap-3">
            <Package size={32} className="text-amber-400" /> Gudang & Inventaris
          </h1>
          <p className="text-gray-400">Kelola stok produk pertanian Anda (Pupuk, Pestisida, dll).</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-forest-surface border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-amber-500 outline-none w-64"
            />
          </div>
          {!isGuest && (
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => setIsCategoryModalOpen(true)} 
                className="bg-forest-surface hover:bg-white/5 text-emerald-400 border border-emerald-500/20 py-2 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Kelola Kategori
              </button>
              <button 
                onClick={() => handleOpenModal()} 
                className="bg-amber-600 hover:bg-amber-500 text-white border-none py-2 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <Plus size={18} /> Tambah Produk
              </button>
            </div>
          )}
        </div>
      </header>
      {/* Table Section */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Nama Produk</th>
                <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Kategori</th>
                <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Sisa Stok</th>
                <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Status</th>
                {!isGuest && <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-500">Tidak ada produk yang sesuai.</td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-gray-100 flex items-center gap-3">
                      {item.photoUrl ? (
                        <div 
                          className="w-10 h-10 rounded overflow-hidden shrink-0 border border-white/10 cursor-pointer relative group"
                          onClick={() => setPreviewImage(item.photoUrl)}
                        >
                          <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Search size={14} className="text-white drop-shadow" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-gray-500">
                          <Package size={20} />
                        </div>
                      )}
                      <span>{item.name}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {item.category}
                      {item.golongan && ['Insektisida', 'Fungisida', 'Herbisida', 'Pestisida'].includes(item.category) && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-white/5 text-xs text-emerald-400/80 border border-emerald-500/20">
                          {item.golongan}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-amber-400 font-semibold">{item.stock} <span className="text-xs text-gray-500">{item.unit || 'gram'}</span></td>
                    <td className="p-4">{getStatusBadge(item.stock)}</td>
                    {!isGuest && (
                      <td className="p-4">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleOpenModal(item)} className="text-gray-400 hover:text-amber-400 hover:scale-110 transition-all" title="Edit/Restock"><Edit2 size={18} /></button>
                          <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-400 hover:scale-110 transition-all" title="Hapus"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm px-4 py-10 overflow-y-auto">
          <div className="bg-forest-bg border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative m-auto">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
                <Package size={20} /> {editingItem ? 'Edit Produk / Restock' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => !isSaving && setIsModalOpen(false)} disabled={isSaving} className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Nama Produk</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Contoh: NPK Mutiara 16-16-16"
                  className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" 
                  required 
                />
              </div>
              
              {editingItem && (
                <div className="flex bg-forest-surface p-1 rounded-lg border border-white/5 mt-2">
                  <button type="button" onClick={() => setEditMode(editMode === 'add' ? null : 'add')} className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors ${editMode === 'add' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'}`}>+ Tambah Stok</button>
                  <button type="button" onClick={() => setEditMode(editMode === 'waste' ? null : 'waste')} className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors ${editMode === 'waste' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'}`}>- Stok Terbuang</button>
                  <button type="button" onClick={() => setEditMode(editMode === 'set' ? null : 'set')} className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors ${editMode === 'set' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}>= Ubah Total</button>
                </div>
              )}


              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Kategori</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-amber-500 outline-none appearance-none"
                  >
                    {categories.map(cat => <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Satuan (Unit)</label>
                  <select 
                    value={formData.unit} 
                    onChange={e => setFormData({...formData, unit: e.target.value})} 
                    className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-amber-500 outline-none appearance-none"
                    disabled={!!editingItem} // Disable changing unit if editing
                  >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {['Insektisida', 'Fungisida', 'Herbisida', 'Pestisida'].includes(formData.category) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Zat Aktif</label>
                    <input 
                      type="text" 
                      value={formData.zatAktif} 
                      onChange={e => setFormData({...formData, zatAktif: e.target.value})} 
                      placeholder="Contoh: Abamektin"
                      className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-amber-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Tingkat / Golongan</label>
                    <select 
                      value={formData.golongan} 
                      onChange={e => setFormData({...formData, golongan: e.target.value})} 
                      className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2.5 text-white focus:border-amber-500 outline-none appearance-none"
                    >
                      <option value="Ringan">Ringan</option>
                      <option value="Menengah">Menengah</option>
                      <option value="Berat">Berat</option>
                    </select>
                  </div>
                </div>
              )}

              {editingItem && (
                <div className="bg-amber-900/10 border border-amber-500/20 p-3 rounded-lg flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-400">Stok tercatat saat ini:</span>
                  <span className="font-bold text-amber-400 text-lg">{editingItem.stock} <span className="text-sm text-amber-500/70">{editingItem.unit}</span></span>
                </div>
              )}

              {(!editingItem || editMode) && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">
                    {editingItem ? (
                      editMode === 'add' ? 'Jumlah Ditambahkan' : editMode === 'waste' ? 'Jumlah Terbuang/Rusak' : 'Set Total Sisa Saat Ini'
                    ) : 'Stok Awal'}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1"
                      value={formData.stock} 
                      onChange={e => setFormData({...formData, stock: e.target.value})} 
                      placeholder={editingItem ? "Masukkan angka perubahannya..." : "0"}
                      className={`w-full bg-forest-surface border border-white/10 rounded-lg pl-3 pr-16 py-2.5 text-white focus:outline-none focus:ring-1 transition-all font-mono ${
                        editMode === 'add' ? 'focus:border-emerald-500 focus:ring-emerald-500' : editMode === 'waste' ? 'focus:border-red-500 focus:ring-red-500' : 'focus:border-amber-500 focus:ring-amber-500'
                      }`} 
                      required 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">{formData.unit}</span>
                  </div>
                </div>
              )}

              <div className="mt-2">
                <ImageUploader 
                  label="Foto Produk (Kamera/Galeri)" 
                  value={formData.photoUrl} 
                  onChange={(base64) => setFormData({...formData, photoUrl: base64})} 
                />
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-forest-surface text-gray-300 font-semibold rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800/80 text-white font-bold rounded-lg transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    "Simpan Produk"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal - Smooth macOS/iOS-style spring zoom transition */}
      <div 
        className={`fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)] ${
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

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm px-4 py-10 overflow-y-auto">
          <div className="bg-[#0a1a12] border border-emerald-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative m-auto">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
                Kelola Kategori Produk
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>

            {categoriesError ? (
              <div className="flex flex-col gap-4">
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-sm flex flex-col gap-2">
                  <span className="font-semibold flex items-center gap-1.5"><AlertCircle size={16} /> Fitur Terbatas</span>
                  <span>Tabel database `categories` belum dibuat di Supabase Anda. Anda tetap dapat menggunakan kategori bawaan, tetapi untuk menambah/menghapus kategori kustom secara permanen, silakan jalankan SQL berikut di dasbor Supabase Anda:</span>
                </div>
                <div className="bg-black/40 border border-white/10 p-3 rounded-lg font-mono text-[10px] text-gray-300 select-all overflow-x-auto whitespace-pre">
{`CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE categories DISABLE ROW LEVEL SECURITY;`}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Buka <strong>Supabase Dashboard → SQL Editor</strong>, tempel (paste) kode di atas, lalu klik <strong>Run</strong>. Setelah itu, muat ulang (refresh) halaman ini.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Add Category Form */}
                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nama kategori baru..."
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    disabled={isSavingCategory}
                    className="flex-1 bg-forest-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSavingCategory}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0"
                  >
                    {isSavingCategory ? '...' : 'Tambah'}
                  </button>
                </form>

                {/* Categories List */}
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {categories.map(cat => {
                    const used = inventoryData.some(item => item.category === cat.name);
                    return (
                      <div key={cat.id || cat.name} className="flex justify-between items-center bg-forest-surface/50 border border-white/5 p-3 rounded-lg hover:bg-forest-surface transition-all">
                        <span className="text-sm text-gray-200 font-medium">{cat.name}</span>
                        {used ? (
                          <span className="text-[10px] text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded" title="Kategori ini sedang digunakan oleh produk gudang">
                            Digunakan
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                            title="Hapus Kategori"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 bg-forest-surface text-gray-300 font-semibold rounded-lg hover:bg-white/5 transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
