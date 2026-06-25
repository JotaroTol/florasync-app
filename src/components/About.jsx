import React from 'react';
import { Leaf, Info, Globe, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-emerald-200 to-emerald-500 bg-clip-text text-transparent pb-2 flex items-center gap-3">
          <Info size={32} className="text-emerald-400" /> Tentang Web FloraSync
        </h1>
        <p className="text-gray-400">Informasi sistem, visi misi, riwayat pembaruan, dan panduan penggunaan web.</p>
      </header>

      <div className="max-w-3xl flex flex-col gap-8">
        <div className="card-glass p-8 border-t-4 border-t-emerald-500 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/30">
              <Leaf size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">FloraSync</h2>
              <p className="text-emerald-400 font-medium">Manajemen Kebun Pintar (Versi 1.1.0) • By JotaroTol</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-gray-300">
            <p className="mb-4 leading-relaxed">
              <strong>FloraSync</strong> adalah web manajemen pertanian pintar dan modern yang didesain secara khusus untuk memenuhi kebutuhan pengelola kebun, <em>greenhouse</em>, maupun petani rumahan. Terintegrasi dengan database <strong>Supabase Cloud</strong>, FloraSync menyinkronkan seluruh data kebun Anda secara <em>real-time</em> dan aman sehingga dapat diakses kapan saja, di mana saja, dari perangkat HP maupun komputer Anda.
            </p>
            
            <h3 className="text-lg font-semibold text-white mt-8 mb-3">Misi Kami</h3>
            <p className="mb-4 leading-relaxed">
              Visi kami adalah membawa teknologi ke tangan setiap petani. Kami percaya bahwa dengan pendataan yang rapi (mulai dari siklus penanaman, jadwal irigasi dan pemupukan, pendataan hama, hingga manajemen stok gudang), setiap petani dapat mengoptimalkan hasil panen dan meminimalisir risiko kegagalan.
            </p>

            <h3 className="text-lg font-semibold text-white mt-8 mb-3">Fitur Utama</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Manajemen Multi-Lahan:</strong> Kelola berbagai petak kebun dan <em>greenhouse</em> di satu tempat.</li>
              <li><strong>Siklus Hidup Tanaman:</strong> Lacak status pertumbuhan setiap komoditas mulai dari semai hingga panen.</li>
              <li><strong>Sistem Penjadwalan:</strong> Buat rutinitas (penyiraman, pemupukan) dan pantau evaluasi tugas secara <em>real-time</em>.</li>
              <li><strong>Database Hama & Penyakit:</strong> Rekam insiden hama dan dapatkan saran obat serta mitigasi.</li>
              <li><strong>Sistem Inventaris:</strong> Jangan kehabisan stok pupuk atau pestisida berkat sistem peringatan stok kritis.</li>
              <li><strong>Manajemen Pengguna (RBAC):</strong> Bagi hak akses kepada pekerja atau tamu kebun secara aman.</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-8 mb-3">Riwayat Pembaruan (Changelog)</h3>
            <div className="space-y-4">
              <div className="border-l-2 border-emerald-500 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400">v1.1.0</span>
                  <span className="text-xs text-gray-500">25 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Migrasi penuh sistem database dari penyimpanan lokal IndexedDB ke <strong>Supabase Cloud Database</strong>.</li>
                  <li>Implementasi sinkronisasi data secara <em>real-time</em> lintas perangkat bagi seluruh pengguna.</li>
                  <li>Penyediaan variabel lingkungan terenkripsi dan konfigurasi routing SPA untuk deployment di <strong>Vercel</strong>.</li>
                  <li>Peningkatan keamanan akun dengan pembagian peran (RBAC) yang terintegrasi di cloud.</li>
                  <li>Pengembangan dan publikasi web diselesaikan oleh <strong>JotaroTol</strong>.</li>
                </ul>
              </div>
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400">v1.0.2-beta</span>
                  <span className="text-xs text-gray-500">25 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Penggantian fitur Template Jadwal dengan tab <strong>Riwayat</strong> pada halaman Jadwal Global.</li>
                  <li>Perbaikan sinkronisasi versi dan tata letak UI aplikasi.</li>
                </ul>
              </div>
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.0.1-beta</span>
                  <span className="text-xs text-gray-500">25 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Penambahan fitur manajemen pengguna dan <em>Role-Based Access Control</em> (RBAC).</li>
                  <li>Perbaikan <em>layout</em> <em>Sidebar</em>.</li>
                  <li>Penambahan halaman Tentang Web (<em>About</em>).</li>
                </ul>
              </div>
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.0.0-beta</span>
                  <span className="text-xs text-gray-500">23 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-500">
                  <li>Rilis perdana FloraSync dengan fitur dasar manajemen lahan, tanaman, jadwal, gudang, dan hama.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-glass p-6 text-center flex flex-col items-center">
            <Heart size={32} className="text-rose-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Dibuat dengan Cinta</h3>
            <p className="text-sm text-gray-400">Dirancang khusus untuk menghadirkan pengalaman pengguna yang premium, cepat, dan indah.</p>
          </div>
          <div className="card-glass p-6 text-center flex flex-col items-center">
            <Globe size={32} className="text-blue-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Sinkronisasi Cloud</h3>
            <p className="text-sm text-gray-400">Semua data Anda tersimpan dengan aman di database cloud Supabase secara real-time, memastikan data selalu sinkron dan dapat diakses dari mana saja.</p>
          </div>
        </div>
        <footer className="mt-8 text-center text-xs text-gray-500">
          <p>FloraSync © 2026 • Developed with 💚 by <span className="text-emerald-400 font-medium">JotaroTol</span></p>
        </footer>
      </div>
    </div>
  );
}
