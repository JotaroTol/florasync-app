import React, { useState } from 'react';
import { Leaf, Info, Globe, Heart } from 'lucide-react';

export default function About() {
  const [showAllChangelog, setShowAllChangelog] = useState(false);

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
              <p className="text-emerald-400 font-medium">Manajemen Kebun Pintar (Versi 1.1.30) • By JotaroTol</p>
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
              {/* v1.1.30 - Bright Emerald (Latest) */}
              <div className="border-l-2 border-emerald-500 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400">v1.1.30 (Togle Multi-Select pada Atribut Kustom)</span>
                  <span className="text-xs text-gray-500">2 Juli 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Menambahkan opsi centang 'Multi' di pengaturan kategori untuk menentukan apakah sebuah atribut menggunakan dropdown (pilih satu) atau checkbox (pilih banyak)</li>
                </ul>
              </div>
              {/* v1.1.29 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.29 (Sembunyikan Properti Usang di Daftar Stok)</span>
                  <span className="text-xs text-gray-500">1 Juli 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Menerapkan filter pada daftar inventaris agar hanya menampilkan atribut yang masih aktif di pengaturan kategori</li>
                </ul>
              </div>
              {/* v1.1.28 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.28 (Fitur Hapus Golongan secara Dinamis)</span>
                  <span className="text-xs text-gray-500">1 Juli 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Membuat field Golongan menjadi dinamis. Jika dihapus dari pengaturan kategori, maka field tersebut juga akan hilang dari form Edit Produk</li>
                </ul>
              </div>
              {/* v1.1.27 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.27 (Tampilkan Opsi Golongan Untuk Semua Kategori)</span>
                  <span className="text-xs text-gray-500">1 Juli 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Menambahkan field Golongan secara default di modal Edit Produk untuk semua kategori termasuk Lainnya dan Pupuk</li>
                </ul>
              </div>
              {/* v1.1.26 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.26 (Perbaikan Logika To-Do List dan Salin Jadwal)</span>
                  <span className="text-xs text-gray-500">1 Juli 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Memperbaiki masalah double negation pada centang to-do dan memastikan salinan jadwal di masa lalu menjadi riwayat serta mengurangi stok</li>
                </ul>
              </div>
              {/* v1.1.25 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.25 (Perbaikan Label Opsi Salin Jadwal)</span>
                  <span className="text-xs text-gray-500">1 Juli 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Memperbaiki undefined pada varietas dan melengkapi info lahan serta populasi di dropdown salin jadwal</li>
                </ul>
              </div>
              {/* v1.1.24 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.24 (Tombol Copy pada Riwayat)</span>
                  <span className="text-xs text-gray-500">1 Juli 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Menambahkan tombol salin jadwal (copy) pada aktivitas yang sudah tersimpan sebagai riwayat</li>
                </ul>
              </div>
              {/* v1.1.23 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.23 (Perbaikan Reference Error (db is not defined))</span>
                  <span className="text-xs text-gray-500">1 Juli 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Menambahkan import db yang tertinggal sehingga penyimpanan kalender kembali berfungsi</li>
                </ul>
              </div>
              {/* v1.1.22 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.22 (Tambahan Pesan Error Kalender)</span>
                  <span className="text-xs text-gray-500">1 Juli 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Menambahkan pesan error detail pada alert jika gagal simpan agar penyebab lebih jelas</li>
                </ul>
              </div>
              {/* v1.1.21 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.21 (Perbaikan Bug Penyimpanan Produk)</span>
                  <span className="text-xs text-gray-500">1 Juli 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Memperbaiki masalah payload schema Supabase yang kembali menyebabkan error simpan</li>
                </ul>
              </div>
              {/* v1.1.20 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.20 (Perbaikan Bug Penyimpanan Kalender)</span>
                  <span className="text-xs text-gray-500">1 Juli 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Memperbaiki masalah penyebutan field dari notes ke generalNote yang menyebabkan Supabase gagal insert data events</li>
                </ul>
              </div>
              {/* v1.1.19 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.19 (Penyempurnaan tata letak dan warna antarmuka Kategori)</span>
                  <span className="text-xs text-gray-500">30 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Tata letak input properti kustom pada edit kategori sekarang menggunakan format tabel kolom yang rapi</li>
                  <li>Ikon hapus properti kustom sekarang disejajarkan di kolom sebelah kanan</li>
                  <li>Warna kategori (pill) sekarang diterapkan pada border, teks, dan background</li>
                </ul>
              </div>
              {/* v1.1.18 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.18 (Perbaikan UI Kategori)</span>
                  <span className="text-xs text-gray-500">30 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Menambahkan warna kategori</li>
                  <li>Memperbaiki tampilan badge atribut dan opsi</li>
                  <li>Menambahkan judul pada tabel form tambah atribut kustom</li>
                </ul>
              </div>
              {/* v1.1.17 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.17 (Perbaikan UI & Fitur Kalender-Gudang)</span>
                  <span className="text-xs text-gray-500">30 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Kategori dinamis multi-atribut di Gudang</li>
                  <li>Fitur Salin Jadwal Antar Tanaman</li>
                  <li>Validasi Tanggal (Failsafe) Kalender & Tanaman</li>
                  <li>Penyelarasan antarmuka dan animasi loading</li>
                </ul>
              </div>
              {/* v1.1.16 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.16 (Penyelarasan Dimensi Input Form)</span>
                  <span className="text-xs text-gray-500">27 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Menyelaraskan tinggi dan warna latar belakang dropdown, pemilih tanggal kustom, dan kolom input teks agar seragam di form</li>
                </ul>
              </div>
              {/* v1.1.15 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.15 (Kustomisasi Scrollbar dan Kalender Dropdown)</span>
                  <span className="text-xs text-gray-500">27 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Mengganti scrollbar browser default dengan scrollbar bertema hijau gelap hutan</li>
                  <li>Mengganti picker tanggal native HTML dengan CustomDatePicker kustom bertema gelap</li>
                </ul>
              </div>
              {/* v1.1.14 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.14 (Penyatuan Desain Dropdown dan Failsafe Tanggal)</span>
                  <span className="text-xs text-gray-500">27 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Menyatukan desain dropdown di semua form menggunakan komponen CustomSelect</li>
                  <li>Menambahkan failsafe validasi urutan tanggal semai/tanam dan log aktivitas</li>
                  <li>Menambahkan animasi loading Users di modul manajemen pengguna</li>
                </ul>
              </div>
              {/* v1.1.13 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.13 (Perbaikan Otomatis Fase Tanaman)</span>
                  <span className="text-xs text-gray-500">27 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Menyelaraskan fase tanaman secara otomatis dari Semai ke Vegetatif jika tanggal tanam telah terlewati</li>
                </ul>
              </div>
              {/* v1.1.12 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.12 (Perbaikan Perhitungan HST Kalender)</span>
                  <span className="text-xs text-gray-500">27 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Memperbaiki kalkulasi HST dan HSS agar dihitung tepat per 24 jam (hari kalender) tanpa kesalahan pembulatan timezone</li>
                </ul>
              </div>
              {/* v1.1.11 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.11 (Pembaruan Animasi Loading Dinamis)</span>
                  <span className="text-xs text-gray-500">26 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Menambahkan indikator pemuatan (loading) dinamis di modul Tanaman, Gudang, Lahan, dan Database Hama</li>
                  <li>Mengimplementasikan properti loading non-enumerable pada useSupabaseQuery untuk backwards compatibility</li>
                </ul>
              </div>
              {/* v1.1.10 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.10 (Perhitungan Umur HST Otomatis)</span>
                  <span className="text-xs text-gray-500">26 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Mengubah perhitungan umur tanaman otomatis ke HST jika sudah melewati tanggal pindah tanam</li>
                  <li>Menampilkan Total Umur (HSS) dan masa tanam dalam HST di halaman Riwayat Lengkap</li>
                </ul>
              </div>
              {/* v1.1.9 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.9 (Perbaikan Eror Rincian Tanaman)</span>
                  <span className="text-xs text-gray-500">26 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Memperbaiki runtime crash (React Error #310) saat membuka detail tanaman yang memiliki kalender</li>
                  <li>Memindahkan hook productCategories dan useEffect ke bagian teratas komponen PlantDetail.jsx</li>
                </ul>
              </div>
              {/* v1.1.8 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.8 (Customizable Category Groups & Form Sync)</span>
                  <span className="text-xs text-gray-500">25 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Konfigurasi dinamis kategori produk: pengguna dapat mengatur apakah suatu kategori membutuhkan golongan (tingkat bahaya/kemurnian) dan zat aktif.</li>
                  <li>Pengaturan opsi pilihan golongan kustom yang dipisahkan dengan tanda koma (misalnya 'Organik, Kimia' atau 'Ringan, Menengah, Berat') pada masing-masing kategori.</li>
                  <li>Sinkronisasi otomatis form produk: otomatis mengosongkan nilai golongan untuk kategori yang tidak membutuhkan golongan, dan memilih opsi pertama untuk kategori yang membutuhkannya.</li>
                  <li>Integrasi pada database hama: mendeteksi jenis golongan dan zat aktif secara dinamis dari produk obat yang dipilih di inventaris, serta menyembunyikan input golongan dengan penanda "Tidak Butuh" yang elegan jika kategori obat tersebut tidak memerlukannya.</li>
                  <li>Penyelarasan tampilan kartu hama dan badge produk di gudang agar menyembunyikan informasi golongan jika tidak diperlukan.</li>
                  <li>Pembaruan panduan instalasi database Supabase (`panduan_kategori.md`) lengkap dengan instruksi migrasi `ALTER TABLE` tanpa merusak data yang ada.</li>
                </ul>
              </div>

              {/* v1.1.7 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.7 (Thread-Safe Forms & Dynamic Categories)</span>
                  <span className="text-xs text-gray-500">25 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Pencegahan duplikasi data akibat klik ganda (*double-click*) menggunakan mekanisme penguncian sinkron (<code>useRef</code>) pada seluruh formulir simpan aplikasi.</li>
                  <li>Implementasi indikator pemuatan (*loading spinner*) dan penonaktifan tombol secara responsif selama proses komunikasi dengan Supabase Cloud.</li>
                  <li>Pengembangan fitur <strong>Kelola Kategori</strong> mandiri di halaman Gudang untuk menambahkan dan menghapus kategori produk secara dinamis.</li>
                  <li>Penambahan validasi penghapusan kategori (kunci pengaman) jika kategori tersebut masih digunakan oleh produk lain di inventaris.</li>
                  <li>Sinkronisasi otomatis daftar kategori kustom ke halaman log aktivitas dan penyaringan produk di profil detail tanaman.</li>
                  <li>Penyediaan sistem deteksi dan penanganan galat (*fallback*) otomatis jika tabel kategori belum terpasang di Supabase, lengkap dengan petunjuk SQL editor interaktif.</li>
                </ul>
              </div>

              {/* v1.1.6 - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">v1.1.6 (Perfect Transitions & Z-Index Fix)</span>
                  <span className="text-xs text-gray-500">25 Juni 2026</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                  <li>Penyempurnaan animasi transisi tutup-buka bilah samping agar berjalan mulus tanpa adanya hentakan tata letak.</li>
                  <li>Penyelarasan posisi logo agar berada tepat di tengah-tengah saat bilah samping dikecilkan.</li>
                  <li>Penghapusan bilah gulir (scroll) pada bilah samping demi tampilan yang lebih minimalis dan bersih.</li>
                  <li>Perbaikan penumpukan z-index layout sehingga tombol kendali tidak tertutup atau terpotong oleh header utama.</li>
                  <li>Penataan ulang daftar riwayat pembaruan agar hanya menampilkan 2 rilis terbaru secara bawaan.</li>
                </ul>
              </div>

              {showAllChangelog && (
                <>
                  {/* v1.1.5 - Faded Emerald border and text (Moved to collapsible) */}
                  <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-emerald-400/30">v1.1.5 (ZPT Form & Collapsible Log)</span>
                      <span className="text-xs text-gray-500">25 Juni 2026</span>
                    </div>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                      <li>Penyesuaian kategori <strong>ZPT (Zat Pengatur Tumbuh)</strong> agar tidak menampilkan input zat aktif dan tingkat golongan, sama seperti kategori Pupuk.</li>
                      <li>Implementasi fitur daftar riwayat pembaruan yang dapat dilipat (<em>collapsible changelog</em>) dengan tombol "Tampilkan Versi Terdahulu" untuk menjaga kerapian halaman.</li>
                    </ul>
                  </div>
                  <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-emerald-400/30">v1.1.4 (Collapsible Sidebar & Logo Fix)</span>
                      <span className="text-xs text-gray-500">25 Juni 2026</span>
                    </div>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                      <li>Pengembangan fitur <strong>Bilah Samping Lipat (Collapsible Sidebar)</strong> yang dapat dikecilkan secara dinamis untuk menyisakan logo dan ikon navigasi saja, dengan penyimpanan preferensi di localStorage.</li>
                      <li>Perbaikan rujukan ikon web (favicon) pada berkas <code>index.html</code> dari <code>/vite.svg</code> ke <code>/favicon.svg</code> sehingga logo web resmi langsung muncul di tab browser.</li>
                    </ul>
                  </div>
                  <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-emerald-400/30">v1.1.3 (ZPT Form & Collapsible Log)</span>
                      <span className="text-xs text-gray-500">25 Juni 2026</span>
                    </div>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                      <li>Penyesuaian kategori <strong>ZPT (Zat Pengatur Tumbuh)</strong> agar tidak menampilkan input zat aktif dan tingkat golongan, sama seperti kategori Pupuk.</li>
                      <li>Implementasi fitur daftar riwayat pembaruan yang dapat dilipat (<em>collapsible changelog</em>) dengan tombol "Tampilkan Versi Terdahulu" untuk menjaga kerapian halaman.</li>
                    </ul>
                  </div>
                  <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-emerald-400/30">v1.1.2 (Instant Updates)</span>
                      <span className="text-xs text-gray-500">25 Juni 2026</span>
                    </div>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                      <li>Implementasi mekanisme <em>local pub-sub</em> pada basis data proxy (<code>db.js</code>) untuk mendeteksi operasi tulis (<em>insert, update, delete</em>) secara instan.</li>
                      <li>Integrasi sistem pembaruan instan pada <em>query hook</em> agar data yang baru ditambahkan langsung muncul di layar tanpa perlu menyegarkan (<em>refresh</em>) browser.</li>
                      <li>Penyediaan sistem re-fetch cadangan otomatis (*zero-latency fallback*) yang aktif meskipun fitur Realtime di Supabase belum diaktifkan.</li>
                    </ul>
                  </div>
                  <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-emerald-400/30">v1.1.1 (Security & Stability)</span>
                      <span className="text-xs text-gray-500">25 Juni 2026</span>
                    </div>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                      <li>Penghapusan teks bantuan kredensial bawaan pada halaman masuk demi keamanan produksi.</li>
                      <li>Perbaikan bug <em>real-time query hook</em> agar tidak mengosongkan data secara tiba-tiba saat terjadi kendala jaringan internet sementara.</li>
                      <li>Pembaruan tata letak halaman Tentang Aplikasi dengan memfokuskan visual pada sistem Sinkronisasi Cloud.</li>
                      <li>Peningkatan peran akun admin lama menjadi peran pemilik utama (*owner*) penuh langsung di database.</li>
                    </ul>
                  </div>
                  <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-emerald-400/30">v1.1.0 (Cloud & Deploy)</span>
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
                      <span className="font-bold text-emerald-400/30">v1.0.2-beta</span>
                      <span className="text-xs text-gray-500">25 Juni 2026</span>
                    </div>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                      <li>Penggantian fitur Template Jadwal dengan tab <strong>Riwayat</strong> pada halaman Jadwal Global.</li>
                      <li>Perbaikan sinkronisasi versi dan tata letak UI aplikasi.</li>
                    </ul>
                  </div>
                  <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-emerald-400/30">v1.0.1-beta</span>
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
                      <span className="font-bold text-emerald-400/30">v1.0.0-beta</span>
                      <span className="text-xs text-gray-500">23 Juni 2026</span>
                    </div>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-500">
                      <li>Rilis perdana FloraSync dengan fitur dasar manajemen lahan, tanaman, jadwal, gudang, dan hama.</li>
                    </ul>
                  </div>
                </>
              )}

              <button 
                type="button"
                onClick={() => setShowAllChangelog(!showAllChangelog)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-all mt-2 inline-flex items-center gap-1.5 outline-none border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-500/10 active:scale-95 w-fit"
              >
                {showAllChangelog ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Versi Terdahulu (Beta & Cloud)'}
              </button>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 text-center flex flex-col items-center">
          <Globe size={32} className="text-blue-400 mb-3" />
          <h3 className="text-white font-semibold mb-2">Sinkronisasi Cloud</h3>
          <p className="text-sm text-gray-400">Semua data Anda tersimpan dengan aman di database cloud Supabase secara real-time, memastikan data selalu sinkron dan dapat diakses dari mana saja.</p>
        </div>
        <footer className="mt-8 text-center text-xs text-gray-500">
          <p>FloraSync © 2026 • Developed with 💚 by <span className="text-emerald-400 font-medium">JotaroTol</span></p>
        </footer>
      </div>
    </div>
  );
}
