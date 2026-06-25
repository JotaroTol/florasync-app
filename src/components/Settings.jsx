import React, { useState, useEffect, useContext } from 'react';
import { Settings as SettingsIcon, Save, User, MapPin, Database, Search, Map, Lock, AlertTriangle, Users } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../supabaseClient';
import ImageUploader from './ImageUploader';
import UserManagement from './UserManagement';
import { UserContext } from '../App';

export default function Settings() {
  const { user, actualUser, logout } = useContext(UserContext);
  const isGuest = actualUser?.role === 'guest';
  const isAdmin = actualUser?.role === 'admin' || actualUser?.role === 'owner';
  const profile = useSupabaseQuery('userProfile', { eq: { userId: user.id } }, [user.id], true);

  const [activeTab, setActiveTab] = useState('profil');

  const [formData, setFormData] = useState({
    ownerName: '',
    farmName: '',
    avatarUrl: '',
    lat: '',
    lon: '',
    city: ''
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const [searchCityQuery, setSearchCityQuery] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  // Account Form
  const [accountForm, setAccountForm] = useState({ username: '', oldPassword: '', newPassword: '' });
  const [accountMessage, setAccountMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (actualUser) {
      setAccountForm(prev => ({ ...prev, username: actualUser.username || '' }));
    }
  }, [actualUser]);

  useEffect(() => {
    if (profile) {
      setFormData({
        ownerName: profile.ownerName || user?.name || '',
        farmName: profile.farmName || (user?.name ? `Kebun ${user.name}` : ''),
        avatarUrl: profile.avatarUrl || '',
        lat: profile.lat || '',
        lon: profile.lon || '',
        city: profile.city || ''
      });
      setSearchCityQuery(profile.city || '');
    } else if (user) {
      setFormData({
        ownerName: user.name || '',
        farmName: user.name ? `Kebun ${user.name}` : '',
        avatarUrl: '',
        lat: '',
        lon: '',
        city: ''
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchCity = async () => {
    if (!searchCityQuery.trim()) return;
    setIsSearchingCity(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCityQuery)}&count=5&language=id&format=json`);
      const data = await res.json();
      if (data.results) {
        setCityResults(data.results);
      } else {
        setCityResults([]);
        alert('Kota tidak ditemukan di database penyedia cuaca.');
      }
    } catch (e) {
      console.error(e);
      alert('Gagal mencari kota.');
    }
    setIsSearchingCity(false);
  };

  const handleSelectCity = (city) => {
    setFormData(prev => ({
      ...prev,
      city: `${city.name}, ${city.admin1 || city.country}`,
      lat: city.latitude.toString(),
      lon: city.longitude.toString()
    }));
    setSearchCityQuery(`${city.name}, ${city.admin1 || city.country}`);
    setCityResults([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isGuest) return;
    const { error } = await supabase.from('userProfile').upsert({
      ...(profile ? { id: profile.id } : {}),
      userId: user.id,
      ...formData
    });
    if (error) {
      alert('Gagal menyimpan profil: ' + error.message);
      return;
    }
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleResetData = async () => {
    if (isGuest) return;
    if (window.confirm("PERINGATAN: Ini akan menghapus seluruh data tanaman, riwayat, dan inventaris Anda. Apakah Anda yakin?")) {
      await Promise.all([
        supabase.from('plants').delete().eq('userId', user.id),
        supabase.from('locations').delete().eq('userId', user.id),
        supabase.from('events').delete().eq('userId', user.id),
        supabase.from('inventory').delete().eq('userId', user.id),
        supabase.from('pests').delete().eq('userId', user.id),
        supabase.from('userProfile').delete().eq('userId', user.id)
      ]);
      window.location.reload();
    }
  };

  const handleChangeAccount = async (e) => {
    e.preventDefault();
    setAccountMessage({ text: '', type: '' });

    // Fetch current user record from Supabase
    const { data: currentUserRecord, error: fetchErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', actualUser.id)
      .limit(1)
      .maybeSingle();

    if (fetchErr || !currentUserRecord) {
      setAccountMessage({ text: 'Gagal memuat data akun.', type: 'error' });
      return;
    }

    let updates = {};

    if (accountForm.username && accountForm.username !== currentUserRecord.username) {
      // Check username uniqueness
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', accountForm.username)
        .limit(1)
        .maybeSingle();
      if (existing) {
        setAccountMessage({ text: 'Username sudah terpakai.', type: 'error' });
        return;
      }
      updates.username = accountForm.username;
    }

    if (accountForm.oldPassword || accountForm.newPassword) {
      if (!accountForm.oldPassword || !accountForm.newPassword) {
        setAccountMessage({ text: 'Masukkan password lama dan baru untuk mengganti password.', type: 'error' });
        return;
      }
      if (currentUserRecord.password !== accountForm.oldPassword) {
        setAccountMessage({ text: 'Password lama salah.', type: 'error' });
        return;
      }
      updates.password = accountForm.newPassword;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await supabase
        .from('users')
        .update(updates)
        .eq('id', actualUser.id);

      if (updateErr) {
        setAccountMessage({ text: 'Gagal memperbarui akun: ' + updateErr.message, type: 'error' });
        return;
      }

      setAccountMessage({ text: 'Informasi akun berhasil diperbarui!', type: 'success' });
      setAccountForm(prev => ({ ...prev, oldPassword: '', newPassword: '' }));

      if (updates.username) {
        const storedUser = JSON.parse(localStorage.getItem('florasync_user'));
        storedUser.username = updates.username;
        localStorage.setItem('florasync_user', JSON.stringify(storedUser));
      }
    } else {
      setAccountMessage({ text: 'Tidak ada perubahan.', type: 'error' });
    }

    setTimeout(() => setAccountMessage({ text: '', type: '' }), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent pb-2 flex items-center gap-3">
          <SettingsIcon size={32} className="text-emerald-400" /> Pengaturan Global
        </h1>
        <p className="text-gray-400">Sesuaikan profil kebun dan atur preferensi sistem.</p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profil')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'profil' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'}`}
        >
          <User size={18} /> Profil & Lokasi
        </button>
        {!isGuest && (
          <>
            <button
              onClick={() => setActiveTab('akun')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'akun' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'}`}
            >
              <Lock size={18} /> Akun Saya
            </button>
          </>
        )}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'users' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'}`}
          >
            <Users size={18} /> Manajemen Pengguna
          </button>
        )}
        {!isGuest && (
          <button
            onClick={() => setActiveTab('database')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'database' ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'}`}
          >
            <Database size={18} /> Database
          </button>
        )}
      </div>

      {activeTab === 'profil' && (
        <div className="max-w-2xl">
          {/* Profile Settings */}
          <div className="card-glass p-6 border-t-4 border-t-emerald-500">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="text-emerald-400" /> Profil Pemilik & Kebun
            </h2>

            {isGuest && (
              <div className="mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-lg flex items-center gap-2 text-sm">
                <AlertTriangle size={18} />
                Akun Tamu hanya dapat melihat pengaturan.
              </div>
            )}

            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Nama Pemilik / Pengelola</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    disabled={isGuest}
                    className="w-full bg-forest-bg border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Nama Kebun / Farm</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    disabled={isGuest}
                    className="w-full bg-forest-bg border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <div>
                <ImageUploader
                  label="Foto Profil (Opsional)"
                  value={formData.avatarUrl}
                  isAvatar={true}
                  onChange={(base64) => !isGuest && setFormData({...formData, avatarUrl: base64})}
                />
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                  <Map size={18} /> Pengaturan Lokasi Cuaca
                </h3>
                <p className="text-xs text-gray-400 mb-3">Cari kota Anda untuk mendapatkan prakiraan cuaca yang akurat dari database satelit.</p>

                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchCityQuery}
                      onChange={(e) => setSearchCityQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchCity())}
                      disabled={isGuest}
                      placeholder="Contoh: Banyumas, Purwokerto..."
                      className="flex-1 bg-forest-bg border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleSearchCity}
                      disabled={isSearchingCity || isGuest}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSearchingCity ? 'Mencari...' : <><Search size={16} /> Cari</>}
                    </button>
                  </div>

                  {cityResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-forest-surface border border-emerald-500/50 rounded-xl shadow-2xl overflow-hidden z-20">
                      <div className="p-2 flex flex-col">
                        {cityResults.map(city => (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => handleSelectCity(city)}
                            className="text-left px-3 py-2 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-400 flex flex-col transition-colors"
                          >
                            <span className="font-semibold text-sm">{city.name}</span>
                            <span className="text-[10px] text-gray-400">{city.admin1}, {city.country} ({city.latitude}, {city.longitude})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.lat && formData.lon && (
                    <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-400 flex flex-col gap-1">
                      <span className="font-semibold">Lokasi Terpilih: {formData.city}</span>
                      <span className="opacity-70">Koordinat: {formData.lat}, {formData.lon}</span>
                    </div>
                  )}
                </div>
              </div>

              {!isGuest && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <Save size={18} /> Simpan Profil
                  </button>
                  {savedMessage && <span className="text-emerald-400 text-sm font-medium animate-pulse">Tersimpan!</span>}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {!isGuest && activeTab === 'akun' && (
        <div className="max-w-xl">
          {/* Account Settings */}
          <div className="card-glass p-6 border-t-4 border-t-blue-500">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Lock className="text-blue-400" /> Akun & Keamanan
            </h2>

            <form onSubmit={handleChangeAccount} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Username</label>
                <input
                  type="text"
                  value={accountForm.username}
                  onChange={(e) => setAccountForm(prev => ({...prev, username: e.target.value}))}
                  className="w-full bg-forest-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                  required
                />
              </div>
              <div className="border-t border-white/5 pt-4 mt-2">
                <p className="text-xs text-gray-400 mb-4">Biarkan kosong jika tidak ingin mengganti password.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Password Lama</label>
                    <input
                      type="password"
                      value={accountForm.oldPassword}
                      onChange={(e) => setAccountForm(prev => ({...prev, oldPassword: e.target.value}))}
                      className="w-full bg-forest-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Password Baru</label>
                    <input
                      type="password"
                      value={accountForm.newPassword}
                      onChange={(e) => setAccountForm(prev => ({...prev, newPassword: e.target.value}))}
                      className="w-full bg-forest-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {accountMessage.text && (
                <div className={`p-3 rounded-lg text-sm ${accountMessage.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {accountMessage.text}
                </div>
              )}

              <div className="mt-2 flex items-center gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdmin && activeTab === 'users' && (
        <UserManagement />
      )}

      {!isGuest && activeTab === 'database' && (
        <div className="max-w-xl">
          {/* System Settings */}
          <div className="card-glass p-6 border-t-4 border-t-red-500 flex flex-col">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Database className="text-red-400" /> Manajemen Database
            </h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Hapus seluruh data kebun Anda dari server Supabase. Tindakan ini tidak dapat dibatalkan.
            </p>

            {!isGuest && (
              <div className="mt-auto pt-4 border-t border-white/10">
                <button
                  onClick={handleResetData}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 px-6 py-3 rounded-lg text-sm font-bold transition-colors"
                >
                  Reset / Hapus Semua Data
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
