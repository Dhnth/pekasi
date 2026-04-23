# 📚 Literasi KRP - Website Acara Literasi

Website interaktif untuk acara literasi dengan fitur input data peserta, dashboard admin, dan sistem Gacha untuk memilih pemenang secara acak.

## ✨ Fitur Utama

- **Form Input Peserta** - Peserta dapat mengisi data literasi (nama, kelas, judul buku, kesan)
- **Dashboard Admin** - Melihat seluruh data peserta dengan fitur filter, search, dan lazy loading
- **Export Excel Profesional** - Export data per kelas dengan styling tabel yang rapi (format WPS)
- **Sistem Gacha** - Memilih peserta secara acak dengan filter rentang waktu (WIB)
- **Login Admin Sederhana** - Proteksi halaman admin dengan password
- **Responsive Design** - Tampilan optimal di desktop maupun mobile

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Excel Export**: xlsx-js-style
- **Deployment**: Vercel

## 📋 Prasyarat

- Node.js (versi 18 atau lebih baru)
- npm atau yarn atau pnpm
- Akun Supabase (gratis)
- Akun Vercel (gratis)

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/username/literasi-krp.git
   cd literasi-krp

1.  Install dependencies

    ```bash

    npm install
    # atau
    yarn install
    # atau
    pnpm install

2.  Setup environment variables

    Buat file `.env.local` di root project:

    ```env

    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key


3.  Setup Supabase

    -   Buat project baru di [Supabase](https://supabase.com/)

    -   Jalankan SQL berikut di SQL Editor:

    ```sql

    CREATE TABLE peserta (
      id SERIAL PRIMARY KEY,
      nama_lengkap TEXT NOT NULL,
      kelas TEXT NOT NULL,
      judul_buku TEXT NOT NULL,
      isi_kesan TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE peserta ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow insert for everyone" ON peserta
      FOR INSERT WITH CHECK (true);

    CREATE POLICY "Allow select for everyone" ON peserta
      FOR SELECT USING (true);

4.  Jalankan development server

    ```bash

    npm run dev
    # atau
    yarn dev

5.  Buka browser di `http://localhost:3000`

📁 Struktur Project
-------------------

bash

literasi-krp/
├── app/
│   ├── page.tsx              # Form input peserta
│   ├── login/
│   │   └── page.tsx          # Halaman login admin
│   ├── admin/
│   │   └── page.tsx          # Dashboard admin
│   ├── gacha/
│   │   └── page.tsx          # Halaman Gacha
│   └── layout.tsx            # Root layout
├── lib/
│   ├── supabase/
│   │   └── client.ts         # Supabase client
│   └── utils.ts              # Helper functions
├── components/
│   └── ui/                   # shadcn/ui components
├── public/                   # Static assets
└── package.json

🔐 Login Admin
--------------

-   Akses halaman: `https://your-domain.com/login`

-   Masukkan password yang sudah diatur di `const adminPassword = 'password-baru-anda' `

📤 Export Excel
---------------

1.  Buka halaman admin

2.  Pilih kelas dari dropdown "Pilih Kelas untuk Export"

3.  Klik tombol "Export ke Excel"

4.  File akan otomatis download dengan format:

    -   `Laporan_Literasi_NamaKelas_Tanggal.xlsx`

Styling Excel yang dihasilkan:

-   Header: Background hijau tua (#006633), text putih, bold

-   Data: Zebra stripe (putih dan hijau muda)

-   Border: Tebal di luar, tipis di dalam

-   Freeze pane: Baris header tetap terlihat saat scroll

🎰 Fitur Gacha
--------------

-   Filter peserta berdasarkan rentang tanggal dan jam (WIB)

-   Pilih peserta secara acak

-   Tampilkan detail peserta yang terpilih (nama, kelas, judul buku, kesan)

🚢 Deployment ke Vercel
-----------------------

### Menggunakan Vercel CLI

    

    # Install Vercel CLI
    npm install -g vercel

    # Login ke Vercel
    vercel login

    # Deploy
    vercel --prod

### Manual via Dashboard

1.  Push kode ke GitHub

2.  Buka [vercel.com](https://vercel.com/)

3.  Import repository GitHub

4.  Tambahkan environment variables:

    -   `NEXT_PUBLIC_SUPABASE_URL`

    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`



5.  Klik Deploy

📊 Database Schema
------------------

### Tabel: `peserta`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | SERIAL | Primary key |
| nama_lengkap | TEXT | Nama lengkap peserta |
| kelas | TEXT | Kelas peserta |
| judul_buku | TEXT | Judul buku yang dibaca |
| isi_kesan | TEXT | Kesan/pesan dari buku |
| created_at | TIMESTAMP | Waktu input (default NOW()) |

🎨 Customisasi
--------------

### Mengubah Daftar Kelas

Edit array `KELAS_X` di `app/page.tsx`:

typescript

const KELAS_X = [
  'X AKL 1',
  'X AKL 2',
  // tambahkan kelas lainnya
]

### Mengubah Password Admin

Ubah di kode:


    const adminPassword = 'password-baru-anda'



📝 Catatan Penting
------------------

-   Timezone: Semua waktu menggunakan WIB (Asia/Jakarta)

-   Karakter khusus: Tanda kutip (`"`) di Excel akan otomatis di-escape menjadi (`""`)

-   Lazy loading: Data admin di-load per 10 item untuk performa optimal

-   RLS Policy: Supabase RLS sudah dikonfigurasi untuk allow insert dan select dari public

🐛 Troubleshooting
------------------

### Build Error di Vercel

Pastikan semua environment variables sudah di-set di dashboard Vercel.

### Data Tidak Muncul

Cek koneksi Supabase dan pastikan RLS policy sudah benar.

### Export Excel Gagal

Pastikan sudah install `xlsx-js-style`:

bash

npm install xlsx-js-style

📄 Lisensi
----------

MIT

👨‍💻 Author
------------

Dibuat untuk kegiatan Literasi KRP