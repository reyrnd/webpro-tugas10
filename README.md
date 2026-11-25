# Lab Robotik Storage — Sistem Penyimpanan Barang Lab (AUV · ROV · KRSTI · KKI)

## Deskripsi Proyek
Aplikasi web fullstack untuk mencatat dan melacak penyimpanan barang di **Laboratorium Robotik** yang memiliki 4 divisi (**AUV**, **ROV**, **KRSTI**, dan **KKI**). Setiap kali anggota lab menyimpan barang, sistem mencatat:
- **Nama Barang** dan **Tempat Penyimpanan** (misalnya: `Lemari A`, `Rak B2`) agar anggota lain mudah menemukannya.
- **Identitas Anggota Lab** (Nama & Divisi: `AUV`, `ROV`, `KRSTI`, atau `KKI`).
- **Catatan (*Note*)** kondisi atau posisi detail barang.
- **Evidence Foto** yang otomatis ditempeli stempel **Jam (`storedAt`)** dan **Lokasi/GPS (`location`)**.

Proyek ini terpisah menjadi dua folder utama:
- `backend/` — REST API menggunakan **NestJS**, **Prisma ORM**, dan **PostgreSQL** (`tugas_9_db`).
- `frontend/` — Antarmuka web responsif (Desktop & Mobile) menggunakan **React**, **Vite**, dan **Tailwind CSS**.

## Daftar Endpoint API (`http://localhost:3000`)

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/items` | Menyimpan data barang baru beserta note, tempat, lokasi, dan foto evidence |
| `GET` | `/items` | Mengambil semua data barang (mendukung filter `?division=AUV` dan `?search=...`) |
| `GET` | `/items/stats` | Query lanjutan: statistik total barang dan jumlah barang per divisi (`count` & `groupBy`) |
| `GET` | `/items/:id` | Mengambil detail satu barang berdasarkan `id` |
| `PATCH` | `/items/:id` | Memperbarui data barang (misal pindah lemari atau ubah catatan) |
| `DELETE` | `/items/:id` | Menghapus barang dari daftar penyimpanan |

## Cara Menjalankan Proyek

### 1. Menjalankan Backend (NestJS + Prisma + PostgreSQL)
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```
Backend berjalan di `http://localhost:3000`.

### 2. Menjalankan Frontend (React + Vite + Tailwind)
```bash
cd frontend
npm install
npm run dev
```
Frontend berjalan di `http://localhost:5173`.

## Dokumentasi Screenshot
Simpan screenshot setiap tahapan (migrasi Prisma, tabel `lab_items` di pgAdmin, pengujian CRUD & `/items/stats` di Postman, serta tampilan Frontend **Desktop** & **Mobile**) di dalam folder `docs/screenshots/` lalu tautkan pada bagian ini.
