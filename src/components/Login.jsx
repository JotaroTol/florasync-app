import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Leaf, Lock, User, AlertTriangle, Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password || (isRegistering && !name)) {
      setError('Mohon lengkapi semua kolom.');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        // --- Register flow ---
        // Check if username already taken
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .limit(1)
          .maybeSingle();

        if (existingUser) {
          setError('Username sudah terpakai. Pilih username lain.');
          setLoading(false);
          return;
        }

        // Insert new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            username,
            password,
            role: 'user',
            name,
            permissions: ['dashboard', 'locations', 'plants', 'calendar', 'inventory', 'pests', 'alerts']
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Create default profile for new user
        await supabase.from('userProfile').insert({
          userId: newUser.id,
          ownerName: name,
          farmName: `Kebun ${name}`,
          avatarUrl: ''
        });

        const userInfo = {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          name: newUser.name,
          permissions: newUser.permissions || []
        };
        localStorage.setItem('florasync_user', JSON.stringify(userInfo));
        onLogin(userInfo);

      } else {
        // --- Login flow ---
        const { data: user, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .limit(1)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (user && user.password === password) {
          const userInfo = {
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
            permissions: user.permissions || []
          };
          localStorage.setItem('florasync_user', JSON.stringify(userInfo));
          onLogin(userInfo);
        } else {
          setError('Username atau password salah.');
        }
      }
    } catch (err) {
      console.error('Login/Register error:', err);
      setError(`Terjadi kesalahan: ${err.message || 'Coba lagi.'}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-forest-bg flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/30">
            <Leaf size={32} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent pb-1">FloraSync</h1>
          <p className="text-gray-400 mt-2">Manajemen Kebun Pintar</p>
        </div>

        <div className="card-glass p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isRegistering ? 'Buat Akun Baru' : 'Login ke Akun Anda'}
          </h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-forest-surface border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors outline-none"
                    placeholder="Masukkan nama Anda"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-forest-surface border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors outline-none"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-forest-surface border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors outline-none"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors mt-6 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : isRegistering ? (
                <><UserPlus size={18} /> Daftar</>
              ) : (
                <><ArrowRight size={18} /> Masuk</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {isRegistering ? (
              <p>
                Sudah punya akun?{' '}
                <button onClick={() => { setIsRegistering(false); setError(''); }} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                  Login di sini
                </button>
              </p>
            ) : (
              <p>
                Belum punya akun?{' '}
                <button onClick={() => { setIsRegistering(true); setError(''); }} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                  Buat akun baru
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
