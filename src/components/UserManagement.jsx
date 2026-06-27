import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, Lock, X, Check } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { db } from '../db';
import CustomSelect from './CustomSelect';

export default function UserManagement() {
  const users = useSupabaseQuery('users', {}) || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = React.useRef(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'guest',
    name: '',
    permissions: ['dashboard'],
    guestViewId: 1
  });
  const [error, setError] = useState('');

  const availableFeatures = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'locations', label: 'Manajemen Lahan' },
    { id: 'plants', label: 'Tanaman Saya' },
    { id: 'calendar', label: 'Jadwal Global' },
    { id: 'inventory', label: 'Gudang / Stok' },
    { id: 'pests', label: 'Database Hama' },
    { id: 'alerts', label: 'Peringatan' }
  ];

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: user.password,
        role: user.role,
        name: user.name,
        permissions: user.permissions || ['dashboard'],
        guestViewId: user.guestViewId || 1
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        role: 'guest',
        name: '',
        permissions: ['dashboard'],
        guestViewId: 1
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleTogglePermission = (featureId) => {
    setFormData(prev => {
      const perms = prev.permissions;
      if (perms.includes(featureId)) {
        return { ...prev, permissions: perms.filter(p => p !== featureId) };
      } else {
        return { ...prev, permissions: [...perms, featureId] };
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);

    try {
      if (editingUser) {
        if (formData.username !== editingUser.username) {
          const existing = await db.users.where('username').equals(formData.username).first();
          if (existing) {
            setError('Username sudah terpakai oleh pengguna lain.');
            isSavingRef.current = false;
            setIsSaving(false);
            return;
          }
        }
        // Update existing
        await db.users.update(editingUser.id, {
          username: formData.username,
          password: formData.password,
          role: formData.role,
          name: formData.name,
          permissions: formData.role === 'owner' || formData.role === 'admin' || formData.role === 'user' ? availableFeatures.map(f => f.id) : formData.permissions,
          guestViewId: formData.role === 'guest' ? parseInt(formData.guestViewId) : null
        });
      } else {
        const existing = await db.users.where('username').equals(formData.username).first();
        if (existing) {
          setError('Username sudah terpakai.');
          isSavingRef.current = false;
          setIsSaving(false);
          return;
        }
        // Add new
        await db.users.add({
          username: formData.username,
          password: formData.password,
          role: formData.role,
          name: formData.name,
          permissions: formData.role === 'owner' || formData.role === 'admin' || formData.role === 'user' ? availableFeatures.map(f => f.id) : formData.permissions,
          guestViewId: formData.role === 'guest' ? parseInt(formData.guestViewId) : null
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      setError("Gagal menyimpan pengguna. Silakan coba lagi.");
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === 1) {
      alert("Akun Admin utama tidak bisa dihapus!");
      return;
    }
    if (window.confirm("Yakin ingin menghapus pengguna ini?")) {
      await db.users.delete(id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
            <Users size={24} /> Manajemen Pengguna
          </h2>
          <p className="text-sm text-gray-400 mt-1">Kelola akun, role, dan hak akses fitur untuk orang lain.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white border-none py-2 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg"
        >
          <Plus size={18} /> Tambah Akun
        </button>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Pengguna</th>
                <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Username & Role</th>
                <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Akses Fitur (Jika Tamu)</th>
                <th className="p-4 text-xs uppercase tracking-wider text-gray-400 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.loading ? (
                <tr>
                  <td colSpan="4" className="p-8">
                    <div className="flex flex-col items-center justify-center gap-3 py-8 text-gray-400">
                      <Users size={36} className="text-emerald-500 animate-bounce" />
                      <span className="text-sm font-medium animate-pulse text-emerald-400/80">Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-gray-500">Tidak ada pengguna terdaftar.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-100">{u.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300 font-mono">@{u.username}</span>
                        {u.role === 'owner' || u.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Shield size={12} /> Admin
                          </span>
                        ) : u.role === 'user' ? (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                            User Biasa
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Tamu
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {u.role === 'owner' || u.role === 'admin' || u.role === 'user' ? (
                        <span className="text-xs text-emerald-400/70">Akses Penuh (Semua Fitur)</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {u.permissions?.map(p => {
                            const feat = availableFeatures.find(f => f.id === p);
                            return feat ? (
                              <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-forest-surface text-gray-300 border border-white/5">
                                {feat.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleOpenModal(u)} className="text-gray-400 hover:text-emerald-400 transition-all"><Edit2 size={16} /></button>
                        {u.id !== 1 && (
                          <button onClick={() => handleDelete(u.id)} className="text-gray-400 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-forest-bg border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
              <h3 className="text-xl font-semibold text-emerald-400">
                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button onClick={() => !isSaving && setIsModalOpen(false)} disabled={isSaving} className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="userForm" onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase mb-1 block">Nama Lengkap</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none" required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase mb-1 block">Username</label>
                    <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase mb-1 block">Password</label>
                    <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-forest-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none" required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase mb-1 block">Role (Hak Akses)</label>
                    <CustomSelect 
                      value={formData.role} 
                      onChange={val => setFormData({...formData, role: val})}
                      options={[
                        { value: 'guest', label: 'Tamu (Read Only)' },
                        { value: 'user', label: 'User Biasa' },
                        { value: 'owner', label: 'Admin (Akses Penuh)' }
                      ]}
                      className="w-full"
                    />
                  </div>
                </div>

                {formData.role === 'guest' && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 uppercase mb-1 block">Tamu Melihat Kebun Milik:</label>
                      <CustomSelect 
                        value={formData.guestViewId ? formData.guestViewId.toString() : ''} 
                        onChange={val => setFormData({...formData, guestViewId: val})}
                        options={users.filter(u => u.role !== 'guest').map(ownerUser => ({
                          value: ownerUser.id.toString(),
                          label: `${ownerUser.name} (@${ownerUser.username})`
                        }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {formData.role === 'guest' && (
                  <div className="mt-2 border-t border-white/5 pt-4">
                    <label className="text-xs font-semibold text-emerald-400 uppercase mb-3 block flex items-center gap-2">
                      <Lock size={14} /> Pilih Fitur yang Diizinkan (Sidebar)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableFeatures.map(feat => {
                        const isChecked = formData.permissions.includes(feat.id);
                        const isDashboard = feat.id === 'dashboard';
                        return (
                          <label key={feat.id} className={`flex items-center gap-3 p-2 rounded-lg border ${isChecked ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/5 bg-forest-surface/50'} cursor-pointer hover:bg-white/5 transition-colors ${isDashboard ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-500'}`}>
                              {isChecked && <Check size={14} />}
                            </div>
                            <span className="text-sm text-gray-300">{feat.label}</span>
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={isChecked} 
                              onChange={() => !isDashboard && handleTogglePermission(feat.id)}
                              disabled={isDashboard}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 mt-2 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                    {error}
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-6 border-t border-white/10 shrink-0 flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                disabled={isSaving}
                className="px-5 py-2 bg-forest-surface text-gray-300 rounded-lg hover:bg-white/5 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="userForm" 
                disabled={isSaving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-850 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
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
          </div>
        </div>
      )}
    </div>
  );
}
