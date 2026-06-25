const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Ambil deskripsi dan item changelog dari argumen
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Error: Mohon masukkan deskripsi pembaruan.");
  console.log("Penggunaan: node bump-version.cjs \"Judul Fitur Utama\" \"Item Pembaruan 1\" \"Item Pembaruan 2\" ...");
  process.exit(1);
}

const updateDescription = args[0];
const changelogItems = args.slice(1);

// Lokasi file
const sidebarPath = path.join(__dirname, 'src', 'components', 'Sidebar.jsx');
const aboutPath = path.join(__dirname, 'src', 'components', 'About.jsx');

// Helper untuk memformat tanggal bahasa Indonesia (misal: 25 Juni 2026)
function formatIndonesianDate(date) {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

const todayStr = formatIndonesianDate(new Date());

try {
  // 2. Baca versi saat ini dari Sidebar.jsx
  let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  const versionMatch = sidebarContent.match(/v(\d+)\.(\d+)\.(\d+)/);
  if (!versionMatch) {
    throw new Error("Gagal mendeteksi versi saat ini di Sidebar.jsx");
  }
  
  const currentVersionStr = versionMatch[0]; // Misal: "v1.1.8"
  const major = parseInt(versionMatch[1]);
  const minor = parseInt(versionMatch[2]);
  const patch = parseInt(versionMatch[3]);
  
  // Naikkan versi patch
  const newPatch = patch + 1;
  const newVersionStr = `v${major}.${minor}.${newPatch}`;
  const newVersionPlain = `${major}.${minor}.${newPatch}`;
  
  console.log(`Menaikkan versi dari ${currentVersionStr} ke ${newVersionStr}...`);
  
  // 3. Update Sidebar.jsx
  sidebarContent = sidebarContent.replace(currentVersionStr, newVersionStr);
  fs.writeFileSync(sidebarPath, sidebarContent, 'utf8');
  console.log("- Berhasil memperbarui versi di Sidebar.jsx");
  
  // 4. Update About.jsx (Versi teks & Riwayat Pembaruan)
  let aboutContent = fs.readFileSync(aboutPath, 'utf8');
  
  // Ganti teks versi utama
  const aboutVersionRegex = new RegExp(`Versi ${major}\\.${minor}\\.${patch}`, 'g');
  aboutContent = aboutContent.replace(aboutVersionRegex, `Versi ${newVersionPlain}`);
  
  // Buat list item pembaruan HTML
  const itemsHtml = changelogItems.length > 0 
    ? changelogItems.map(item => `                  <li>${item}</li>`).join('\n')
    : `                  <li>${updateDescription}</li>`;
    
  // Definisi string target penggantian blok rilis lama ke pudar (faded)
  const oldBlockTarget = `              {/* ${currentVersionStr} - Bright Emerald (Latest) */}
              <div className="border-l-2 border-emerald-500 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400">${currentVersionStr} (`;
                  
  const oldBlockReplacement = `              {/* ${currentVersionStr} - Faded Emerald border and text (Recent) */}
              <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400/50">${currentVersionStr} (`;
                  
  // Temukan tempat penyisipan rilis baru tepat setelah `<div className="space-y-4">`
  const changelogStartText = '<div className="space-y-4">';
  const insertIndex = aboutContent.indexOf(changelogStartText) + changelogStartText.length;
  
  if (insertIndex > changelogStartText.length) {
    // 1. Ubah styling rilis lama menjadi pudar (faded)
    if (aboutContent.includes(oldBlockTarget)) {
      aboutContent = aboutContent.replace(oldBlockTarget, oldBlockReplacement);
    } else {
      console.warn(`Peringatan: Tidak dapat mengubah warna rilis lama ${currentVersionStr} ke pudar otomatis.`);
    }
    
    // 2. Sisipkan rilis terbaru di posisi paling atas daftar
    const before = aboutContent.substring(0, insertIndex);
    const after = aboutContent.substring(insertIndex);
    
    aboutContent = before + '\n' + `              {/* ${newVersionStr} - Bright Emerald (Latest) */}
              <div className="border-l-2 border-emerald-500 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400">${newVersionStr} (${updateDescription})</span>
                  <span className="text-xs text-gray-500">${todayStr}</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
${itemsHtml}
                </ul>
              </div>` + after;
              
    fs.writeFileSync(aboutPath, aboutContent, 'utf8');
    console.log("- Berhasil memperbarui versi dan changelog di About.jsx");
  } else {
    throw new Error("Gagal menemukan tag `<div className=\"space-y-4\">` di About.jsx");
  }

  // 5. Jalankan kompilasi produksi
  console.log("Menjalankan npm run build untuk memverifikasi kompilasi...");
  execSync('npm run build', { stdio: 'inherit' });
  console.log("- Verifikasi kompilasi build berhasil!");

  // 6. Jalankan git add, commit, dan push
  console.log("Mempublikasikan pembaruan ke Git...");
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "bump to ${newVersionStr}: ${updateDescription}"`, { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log(`\nSukses! Pembaruan ${newVersionStr} telah terbit secara otomatis di GitHub.`);

} catch (error) {
  console.error("\nGagal mempublikasikan versi baru:", error.message);
  process.exit(1);
}
