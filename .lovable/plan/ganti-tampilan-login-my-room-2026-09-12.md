# Ganti tampilan login My Room

## Hasil
- `/login` memakai penuh desain dari `my-room-velocity-upgraded.html`, bukan tampilan login lama.
- Logo RK dan UI tetap dirender di canvas WebGL, bisa diputar, bertransisi menjadi partikel, lalu berpindah ke atas kartu.
- Mode Masuk, Daftar, dan Lupa Password tetap terhubung ke autentikasi Supabase project.

## Implementasi
- Sinkronkan markup, gaya, dan motion engine login dengan file sumber terlampir.
- Simpan data model sebagai asset terpisah; gunakan model 3D yang disediakan tanpa menaruh base64 besar di TSX.
- Pertahankan hanya route `/login`; tidak menyentuh sidebar, route lain, dashboard, atau database.
- Gunakan Supabase client project yang sudah ada dan pertahankan redirect, konfirmasi email, serta pesan gagal.

## Verifikasi
- Uji tampilan awal, klik layar, drag logo, transisi partikel, tombol Kembali/Escape, ketiga mode formulir, dan ukuran mobile.
- Jalankan typecheck, lint, dan build lalu laporkan file yang berubah.
