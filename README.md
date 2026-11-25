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

## Daftar Endpoint API (`http://localhost:3001`)

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
Backend berjalan di `http://localhost:3001`.

### 2. Menjalankan Frontend (React + Vite + Tailwind)
```bash
cd frontend
npm install
npm run dev
```
Frontend berjalan di `http://localhost:3000`.

## Dokumentasi Screenshot
Tabel
<br>
<img width="277" height="540" alt="image" src="https://github.com/user-attachments/assets/930cebd2-32a6-4b8f-8971-52cbe2fb36cc" />
<br>

Tampilan Frontend Desktop
<br>
<img width="1280" height="617" alt="image" src="https://github.com/user-attachments/assets/0e4b7f15-2a00-4fd3-b7fd-547a753649c2" />
<br>
<img width="1280" height="618" alt="image" src="https://github.com/user-attachments/assets/2c0e42dd-10ae-4d4f-919d-0bc8231152ff" />
<br>
<img width="1280" height="616" alt="image" src="https://github.com/user-attachments/assets/2b1344e3-5140-4afd-90b2-40a74b80bfb2" />
<br>

Tampilan Frontend Mobile
<br>
<img width="260" height="523" alt="image" src="https://github.com/user-attachments/assets/abe27589-15d7-44fb-8d88-88f8ee33eb95" />
<br>
<img width="257" height="530" alt="image" src="https://github.com/user-attachments/assets/b8379af1-8c07-411f-b418-b829a4cfaf19" />
<br>
<img width="263" height="531" alt="image" src="https://github.com/user-attachments/assets/8be97860-0748-48d5-824e-aaa3a2afda6a" />




