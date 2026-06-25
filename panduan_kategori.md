# Panduan Mengaktifkan Kategori Kustom, Golongan & Sifat Tambahan di Supabase

Fitur **Kelola Kategori** pada FloraSync memungkinkan Anda untuk menambah, menghapus, serta mengatur apakah kategori tersebut membutuhkan **Golongan/Tingkat** (Zat Aktif) dan **Sifat/Tipe Tambahan** (Multi-Select, misal: Kontak & Sistemik).

Agar fitur ini dapat menyimpan seluruh data secara permanen di database Supabase Anda, silakan ikuti langkah-langkah berikut:

## Langkah-langkah:

1. Buka **Supabase Dashboard** di browser Anda dan masuk ke proyek FloraSync Anda:
   [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. Di sidebar sebelah kiri, klik menu **SQL Editor** (ikon lembar kerja dengan teks `SQL`).

3. Klik tombol **New Query** (atau tanda `+`) untuk membuka lembar kerja SQL baru.

4. Pilih opsi di bawah ini yang sesuai dengan kondisi database Anda saat ini:

### OPSI A: Jika Anda BELUM PERNAH membuat tabel `categories`
Salin (copy) dan tempel (paste) kode SQL berikut ke dalam editor:

```sql
-- =========================================================
-- 1. BUAT TABEL CATEGORIES DENGAN KONFIGURASI LENGKAP
-- =========================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "needsGolongan" BOOLEAN DEFAULT FALSE,
  "golonganOptions" TEXT DEFAULT '',
  "needsSifat" BOOLEAN DEFAULT FALSE,
  "sifatOptions" TEXT DEFAULT ''
);

-- =========================================================
-- 2. TAMBAH KOLOM SIFAT DI TABEL INVENTORY
-- =========================================================
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS "sifat" TEXT DEFAULT '';

-- =========================================================
-- 3. NONAKTIFKAN RLS (ROW LEVEL SECURITY)
-- =========================================================
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
```

### OPSI B: Jika Anda SUDAH MEMILIKI tabel `categories` sebelumnya
Jalankan migrasi berikut untuk menambahkan kolom konfigurasi baru pada tabel `categories` dan `inventory` tanpa menghapus data yang sudah ada:

```sql
-- =========================================================
-- MIGRASI: TAMBAHKAN KOLOM KONFIGURASI BARU
-- =========================================================
-- Tambahkan kolom kebutuhan Golongan dan Sifat di tabel categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "needsGolongan" BOOLEAN DEFAULT FALSE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "golonganOptions" TEXT DEFAULT '';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "needsSifat" BOOLEAN DEFAULT FALSE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "sifatOptions" TEXT DEFAULT '';

-- Tambahkan juga kolom sifat di tabel inventory
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS "sifat" TEXT DEFAULT '';

-- Update kategori bawaan jika sudah ada agar memiliki konfigurasi awal yang sesuai
UPDATE categories SET "needsGolongan" = TRUE, "golonganOptions" = 'Ringan, Menengah, Berat' 
WHERE name IN ('Insektisida', 'Fungisida', 'Herbisida', 'Pestisida');

-- Update khusus untuk Herbisida agar mendukung sifat tambahan Kontak dan Sistemik
UPDATE categories SET "needsSifat" = TRUE, "sifatOptions" = 'Kontak, Sistemik' 
WHERE name = 'Herbisida';
```

5. Klik tombol **Run** di sudut kanan bawah editor (atau tekan tombol `Ctrl + Enter` / `Cmd + Enter`).

6. Pastikan muncul pesan sukses **"Success. No rows returned"** di bagian bawah editor.

7. **Selesai!** Muat ulang (refresh) halaman FloraSync Anda. Sekarang Anda dapat menggunakan fitur Kelola Kategori lengkap dengan sifat tambahan kustom.

---

*Catatan: Jika Anda belum menjalankan SQL di atas, FloraSync akan menggunakan kategori bawaan sebagai fallback dengan aturan standar (Insektisida, Fungisida, Herbisida, Pestisida membutuhkan golongan 'Ringan, Menengah, Berat', sedangkan kategori lainnya tidak) sehingga aplikasi tetap dapat berjalan secara normal tanpa kendala.*
