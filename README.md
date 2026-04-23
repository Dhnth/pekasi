
# 📚 Literasi KRP - Website Acara Literasi

Website interaktif untuk acara literasi dengan fitur input data peserta, dashboard admin, dan sistem Gacha untuk memilih pemenang secara acak.

---

## ✨ Fitur Utama

- **Form Input Peserta**
  Peserta dapat mengisi data literasi (nama, kelas, judul buku, kesan)

- **Dashboard Admin**
  Melihat seluruh data peserta dengan fitur filter, search, dan lazy loading

- **Export Excel Profesional**
  Export data per kelas dengan styling tabel yang rapi (format WPS)

- **Sistem Gacha**
  Memilih peserta secara acak dengan filter rentang waktu (WIB)

- **Login Admin Sederhana**
  Proteksi halaman admin dengan password

- **Responsive Design**
  Tampilan optimal di desktop maupun mobile

- **Kontrol Formulir**
  Buka/tutup formulir input kapan saja via halaman pengaturan

- **Halaman Tunggu**
  Menampilkan countdown jika formulir sedang ditutup

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (password-based)
- **Excel Export**: xlsx-js-style
- **Deployment**: Vercel

---

## 📋 Prasyarat

- Node.js (versi 18 atau lebih baru)
- npm / yarn / pnpm
- Akun Supabase (gratis)
- Akun Vercel (gratis)

---

## 🚀 Instalasi

### 1. Clone Repository

    git clone https://github.com/username/literasi-krp.git
    cd literasi-krp


### 2\. Install Dependencies

    npm install
    # atau
    yarn install
    # atau
    pnpm install


### 3\. Setup Environment Variables

Buat file `.env.local`:

    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key


* * * * *

🗄️ Setup Supabase
------------------

1.  Buat project baru di Supabase

2.  Buat user admin di **Authentication → Users**

    -   Email: `fathangunawan19@gmail.com`

    -   Password: bebas

### Jalankan SQL berikut:

    -- Tabel peserta
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

    -- Tabel settings
    CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    INSERT INTO settings (key, value)
    VALUES ('form_status', 'closed') ON CONFLICT (key) DO NOTHING;

    INSERT INTO settings (key, value)
    VALUES ('open_time', '2026-04-24 08:00:00+07') ON CONFLICT (key) DO NOTHING;

    ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow update for authenticated" ON settings
    FOR UPDATE USING (true);

    CREATE POLICY "Allow read for everyone" ON settings
    FOR SELECT USING (true);


* * * * *

▶️ Menjalankan Project
----------------------

    npm run dev


Buka di browser:

    http://localhost:3000


* * * * *

📁 Struktur Project
-------------------

    literasi-krp/
    ├── app/
    │   ├── page.tsx
    │   ├── tunggu/
    │   ├── kesan-buku/
    │   ├── login/
    │   ├── admin/
    │   ├── gacha/
    │   └── layout.tsx
    ├── lib/
    ├── components/
    ├── public/
    └── package.json


* * * * *

🔐 Login Admin
--------------

-   Email: `fathangunawan19@gmail.com`

-   Password: (sesuai yang dibuat di Supabase)

Akses:

    https://your-domain.com/login


* * * * *

⚙️ Pengaturan Formulir
----------------------

-   Buka Dashboard Admin

-   Klik ikon ⚙️

-   Pilih:

    -   **Buka** → Form bisa diisi

    -   **Tutup** → Redirect ke halaman tunggu

-   Atur waktu buka

-   Klik **Simpan**

* * * * *

📤 Export Excel
---------------

Langkah:

1.  Buka halaman admin

2.  Pilih kelas

3.  Klik **Export ke Excel**

Nama file:

    Laporan_Literasi_NamaKelas_Tanggal.xlsx



### Styling Excel:

-   Header: hijau tua + putih + bold

-   Data: zebra stripe

-   Border: tebal luar, tipis dalam

-   Freeze header

* * * * *

🎰 Fitur Gacha
--------------

-   Filter berdasarkan tanggal & jam (WIB)

-   Pilih peserta random

-   Tampilkan:

    -   Nama

    -   Kelas

    -   Judul buku

    -   Kesan

* * * * *

👁️ Halaman Publik
------------------

### 📖 Kesan Buku

    https://your-domain.com/kesan-buku


Fitur:

-   Search (nama, kelas, buku)

-   Tampilan card

-   Urutan terbaru

* * * * *

🚢 Deployment ke Vercel
-----------------------

### CLI

    npm install -g vercel
    vercel login
    vercel --prod


### Manual

1.  Push ke GitHub

2.  Buka Vercel

3.  Import repo

4.  Tambahkan env:


    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY



* * * * *

📊 Database Schema
------------------

### Tabel: peserta

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | SERIAL | Primary key |
| nama_lengkap | TEXT | Nama peserta |
| kelas | TEXT | Kelas |
| judul_buku | TEXT | Judul buku |
| isi_kesan | TEXT | Kesan |
| created_at | TIMESTAMP | Waktu input |

### Tabel: settings

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | SERIAL | Primary key |
| key | TEXT | Identifier |
| value | TEXT | Nilai |
| updated_at | TIMESTAMP | Update terakhir |

* * * * *

🎨 Customisasi
--------------

### Ubah Kelas


    const KELAS_X = [
    'X AKL 1',
    'X AKL 2',
    ]



### Ubah Email Admin


    await supabase.auth.signInWithPassword({
    email: 'emailbaru@gmail.com',
    password: password,
    })



* * * * *

📝 Catatan Penting
------------------

-   Timezone: WIB

-   Excel escape otomatis `"` → `""`

-   Lazy loading: 10 data per load

-   RLS sudah aktif

* * * * *

🐛 Troubleshooting
------------------

### Build Error

Cek env di Vercel

### Data Tidak Muncul

Cek Supabase & RLS

### Export Excel Gagal


npm install xlsx-js-style



### Login Gagal

-   Pastikan user ada

-   Cek email/password

-   Aktifkan provider

* * * * *

📄 Lisensi
----------

MIT

* * * * *

👨‍💻 Author
------------

Dibuat untuk kegiatan **Literasi KRP**
