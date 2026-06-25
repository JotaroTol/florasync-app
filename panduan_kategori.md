# Panduan Mengaktifkan Kategori Kustom di Supabase

Fitur **Kelola Kategori** pada FloraSync memungkinkan Anda untuk menambah dan menghapus kategori produk secara dinamis. Agar fitur ini dapat menyimpan data secara permanen di database Supabase Anda, silakan ikuti langkah-langkah mudah berikut untuk membuat tabel baru:

## Langkah-langkah:

1. Buka **Supabase Dashboard** di browser Anda dan masuk ke proyek FloraSync Anda:
   [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. Di sidebar sebelah kiri, klik menu **SQL Editor** (ikon lembar kertas dengan teks `SQL`).

3. Klik tombol **New Query** (atau tanda `+`) untuk membuka lembar kerja SQL baru.

4. Salin (copy) dan tempel (paste) kode SQL berikut ke dalam editor tersebut:

```sql
-- =========================================================
-- 1. BUAT TABEL CATEGORIES
-- =========================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- 2. NONAKTIFKAN RLS (ROW LEVEL SECURITY)
-- =========================================================
-- FloraSync menggunakan otentikasi kustom berbasis tabel,
-- sehingga keamanan diatur secara langsung dari aplikasi.
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
```

5. Klik tombol **Run** di sudut kanan bawah editor (atau tekan tombol `Ctrl + Enter` / `Cmd + Enter`).

6. Pastikan muncul pesan sukses **"Success. No rows returned"** di bagian bawah editor.

7. **Selesai!** Muat ulang (refresh) halaman FloraSync Anda. Sekarang Anda dapat menggunakan fitur Kelola Kategori secara dinamis dan permanen.

---

*Catatan: Jika Anda belum menjalankan SQL di atas, FloraSync akan secara otomatis menggunakan kategori bawaan sebagai fallback (Pupuk, Insektisida, Fungisida, Herbisida, ZPT, Lainnya) sehingga aplikasi tetap dapat berjalan secara normal tanpa kendala.*
