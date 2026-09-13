# Panorama Tim — Dashboard My Room

## Hasil yang dibangun
- Jadikan panorama tim sebagai konten pertama dashboard: tanggal lokal aktual, sapaan dari profil, peran/organisasi aktual, CTA Ruang Kerja dan Panduan.
- Gunakan foto tim asli yang dilampirkan sebagai asset statis dengan crop responsif dan transisi tepi; tidak mengubah wajah atau membuat cutout palsu.
- Susun “Mulai dari sini” dari jumlah tugas pembina aktual, Kalender, dan Request Bantuan; tambahkan strip jumlah notifikasi aktual.
- Pindahkan seluruh statistik, peringatan, kartu izin-khusus, dan informasi dashboard yang sudah ada ke bagian ringkasan di bawah tanpa menghapus data atau perilaku.
- Ubah layout dashboard menjadi header menyatu dan navigation rail ringkas di desktop, serta bar navigasi bawah di mobile.

## Navigasi dan akses
- Derive semua kandidat pintasan dari `visibleSections` setelah `allowed` dan `isSectionVisible`; metadata preferensi tidak memberi akses.
- Simpan maksimal 9 pin dan frekuensi kunjungan dalam localStorage versioned per `auth.user.id`; normalisasi ulang saat role/visibility berubah.
- Default hanya Dashboard, Ruang Kerja, Kalender, Surat, dan Anggota bila memang diizinkan; pengguna boleh menyimpan 0–9 pin.
- “Lainnya” selalu tersedia dan berisi pencarian, grup menu aktual, seluruh pin, rekomendasi berbasis riwayat nyata, serta pengaturan semat/lepas/naik/turun/reset.
- Gunakan dialog Radix existing untuk focus trap, Escape, dan focus restoration; gunakan tooltip portal existing untuk hover/focus desktop.
- Menu avatar mempertahankan profil dan logout; theme toggle dan NotificationBell tetap memakai handler existing.

## Data yang dipertahankan
- Profil, nama, nickname, peran, divisi, dan avatar: `useMyProfile` + `UserAvatar`.
- Organisasi/logo: `fetchOrgSettings` + `resolveLogoUrl`.
- Tugas pembina: `useMyAssignments` + `useMySubmissions`, termasuk loading/error tanpa memalsukan nol.
- Notifikasi: `fetchUnreadCount` dan halaman `/notifications`; popover existing tetap tersedia.
- Statistik dan kartu lama: seluruh query/hook dashboard existing, dengan permission/enabled condition yang sama.
- Menu: `navSections`, `allowed`, `isSectionVisible`, dan badge tugas existing.

## File dan struktur
- Perbarui `src/routes/_authenticated/dashboard.tsx` untuk komposisi Panorama Tim dan ringkasan lengkap.
- Perbarui `src/routes/_authenticated/route.tsx` untuk header, rail, mobile bar, avatar menu, dan integrasi preferensi.
- Tambahkan komponen fokus untuk rail, panel “Lainnya”, pengaturan pintasan, dan penyimpanan preferensi browser.
- Perbarui komponen dashboard presentasional agar tidak menampilkan grafik/tren/data buatan.
- Tambahkan gaya dashboard/layout yang scope-nya spesifik; token `.dark` existing tidak diubah.
- Upload `team-original.jpg` melalui asset workflow dan gunakan pointer JSON.
- Perbaiki mismatch hydration login yang sedang aktif tanpa mengubah auth.

## Validasi
- Jalankan typecheck/lint/test relevan melalui harness dan cek preview tanpa error baru.
- Uji desktop 1440/1774, tablet 834, mobile 390/320, light/dark, reduced motion, dan overflow.
- Uji keyboard, Escape, tooltip focus, CTA, Panduan, Lainnya/search, notifikasi, profil/logout, serta scroll Ringkasan.
- Uji preferensi 0/1/9 pin, batas pin ke-10, reorder/reset/reload, storage rusak/tidak tersedia, role filtering, dan isolasi dua account ID secara deterministik.
- Dokumentasikan screenshot yang benar-benar dapat diambil; bila auth eksternal menghalangi akun biasa/pengurus, laporkan sebagai blokir dan jangan mengklaim pengujian tersebut.
