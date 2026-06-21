# Monitoring API

Backend API untuk sistem monitoring smart farming ESP32 menggunakan Express.js dan PostgreSQL.

## Teknologi

- Node.js
- Express.js
- PostgreSQL
- pgAdmin
- JWT authentication
- bcrypt password hashing

## Struktur Folder

```txt
monitoring-api/
├─ src/
│  ├─ config/
│  │  └─ database.js
│  ├─ database/
│  │  └─ schema.sql
│  ├─ middleware/
│  │  └─ auth.js
│  ├─ routes/
│  │  ├─ auth.routes.js
│  │  ├─ index.routes.js
│  │  ├─ logs.routes.js
│  │  └─ settings.routes.js
│  └─ server.js
├─ .env.example
├─ package.json
└─ README.md
```

## Setup PostgreSQL di pgAdmin

1. Buka pgAdmin.
2. Buat database baru:
   - Nama database: `smart_farming`
3. Pastikan user PostgreSQL aktif, contoh:
   - User: `postgres`
   - Port: `5432`
4. Catat password user PostgreSQL untuk digunakan di file `.env`.

## Instalasi

Jalankan dari folder `monitoring-api`:

```bash
npm install
```

## Konfigurasi Environment

Copy file contoh environment:

```bash
copy .env.example .env
```

Isi file `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=isi_password_postgresql_kamu
DB_NAME=smart_farming
DB_POOL_SIZE=10

JWT_SECRET=smart-farming-secret-key-change-in-production
```

Alternatif, bisa pakai connection string PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:isi_password@localhost:5432/smart_farming
```

Jika `DATABASE_URL` diisi, konfigurasi `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` tidak wajib digunakan.

## Menjalankan Server

```bash
npm start
```

Server akan berjalan di:

```txt
http://localhost:3000
```

Saat server pertama kali dijalankan, API akan otomatis membuat tabel berikut di PostgreSQL jika belum ada:

- `sensor_data`
- `watering_logs`
- `settings`
- `users`

## Endpoint API

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "uptime": 12.34
}
```

## Sensor

### Kirim Data Sensor dari ESP32

```http
POST /sensor
```

Body:

```json
{
  "device_id": "esp32-001",
  "temperature": 28.5,
  "humidity": 70,
  "light_intensity": 850,
  "soil_moisture": 42,
  "pump_status": false
}
```

Response:

```json
{
  "id": 1,
  "message": "Data tersimpan"
}
```

### Ambil Data Sensor Terakhir

```http
GET /sensor/latest
```

Response:

```json
{
  "id": 1,
  "device_id": "esp32-001",
  "temperature": "28.5",
  "humidity": "70.0",
  "light_intensity": 850,
  "soil_moisture": 42,
  "pump_status": 0,
  "created_at": "2026-06-21T13:51:22.000Z"
}
```

### Ambil Riwayat Data Sensor

```http
GET /sensor?limit=50
```

Parameter:

| Parameter | Tipe | Default | Keterangan |
| --- | --- | --- | --- |
| `limit` | number | `50` | Jumlah data terbaru yang diambil |

Response:

```json
[
  {
    "id": 1,
    "device_id": "esp32-001",
    "temperature": "28.5",
    "humidity": "70.0",
    "light_intensity": 850,
    "soil_moisture": 42,
    "pump_status": 0,
    "created_at": "2026-06-21T13:51:22.000Z"
  }
]
```

## Settings

### Ambil Settings Device

```http
GET /settings
```

Response:

```json
{
  "id": 1,
  "device_id": "esp32-001",
  "soil_threshold": 30,
  "pump_max_duration": 20,
  "pump_cooldown": 20,
  "telegram_enabled": true,
  "auto_water_enabled": true,
  "updated_at": "2026-06-21T13:51:22.000Z"
}
```

### Update Settings Device

```http
PUT /settings
```

Body:

```json
{
  "soil_threshold": 35,
  "pump_max_duration": 25,
  "pump_cooldown": 30,
  "telegram_enabled": true,
  "auto_water_enabled": true
}
```

Response:

```json
{
  "id": 1,
  "message": "Settings updated"
}
```

## Logs

### Ambil Watering Logs

```http
GET /logs/logs?limit=20
```

Parameter:

| Parameter | Tipe | Default | Keterangan |
| --- | --- | --- | --- |
| `limit` | number | `20` | Jumlah log terbaru yang diambil |

Response:

```json
[
  {
    "id": 1,
    "device_id": "esp32-001",
    "action": "watering",
    "duration_seconds": 20,
    "created_at": "2026-06-21T13:51:22.000Z"
  }
]
```

## Authentication

### Register User

```http
POST /auth/register
```

Body:

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "message": "Registrasi berhasil",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "user"
  },
  "token": "jwt_token"
}
```

### Login User

```http
POST /auth/login
```

Body:

```json
{
  "username": "admin",
  "password": "123456"
}
```

Response:

```json
{
  "message": "Login berhasil",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "user"
  },
  "token": "jwt_token"
}
```

### Cek User Login

```http
GET /auth/me
```

Header:

```http
Authorization: Bearer jwt_token
```

Response:

```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "user",
    "created_at": "2026-06-21T13:51:22.000Z"
  }
}
```

## Schema Database

### `sensor_data`

Menyimpan data sensor dari ESP32.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | SERIAL PRIMARY KEY | ID data |
| `device_id` | VARCHAR(50) | ID device ESP32 |
| `temperature` | NUMERIC(4,1) | Suhu |
| `humidity` | NUMERIC(4,1) | Kelembapan udara |
| `light_intensity` | INT | Intensitas cahaya |
| `soil_moisture` | INT | Kelembapan tanah |
| `pump_status` | SMALLINT | Status pompa, `0` mati, `1` hidup |
| `created_at` | TIMESTAMPTZ | Waktu data dibuat |

### `watering_logs`

Menyimpan log aktivitas penyiraman.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | SERIAL PRIMARY KEY | ID log |
| `device_id` | VARCHAR(50) | ID device ESP32 |
| `action` | VARCHAR(20) | Aksi penyiraman |
| `duration_seconds` | INT | Durasi penyiraman dalam detik |
| `created_at` | TIMESTAMPTZ | Waktu log dibuat |

### `settings`

Menyimpan konfigurasi device.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | SERIAL PRIMARY KEY | ID settings |
| `device_id` | VARCHAR(50) | ID device ESP32 |
| `soil_threshold` | INT | Batas kelembapan tanah untuk menyiram |
| `pump_max_duration` | INT | Durasi maksimal pompa |
| `pump_cooldown` | INT | Waktu jeda antar penyiraman |
| `telegram_enabled` | BOOLEAN | Status notifikasi Telegram |
| `auto_water_enabled` | BOOLEAN | Status penyiraman otomatis |
| `updated_at` | TIMESTAMPTZ | Waktu update terakhir |

### `users`

Menyimpan data user aplikasi.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | SERIAL PRIMARY KEY | ID user |
| `username` | VARCHAR(50) | Username unik |
| `email` | VARCHAR(100) | Email unik |
| `password_hash` | VARCHAR(255) | Hash password |
| `role` | VARCHAR(20) | Role user, `admin` atau `user` |
| `is_active` | BOOLEAN | Status aktif user |
| `created_at` | TIMESTAMPTZ | Waktu user dibuat |
| `updated_at` | TIMESTAMPTZ | Waktu update terakhir |

## Troubleshooting

### Error `client password must be a string`

Pastikan `.env` sudah ada dan `DB_PASSWORD` berisi string:

```env
DB_PASSWORD=isi_password_postgresql_kamu
```

Jika ingin pakai `DATABASE_URL`, pastikan format connection string benar:

```env
DATABASE_URL=postgresql://postgres:isi_password@localhost:5432/smart_farming
```

### Database tidak terkoneksi

Pastikan PostgreSQL berjalan di port `5432` dan database `smart_farming` sudah dibuat di pgAdmin.

Cek koneksi:

```powershell
Test-NetConnection -ComputerName localhost -Port 5432
```

### Tabel tidak muncul

Saat server dijalankan, tabel dibuat otomatis. Pastikan server tidak menampilkan error:

```txt
Gagal inisialisasi database
```

Jika masih error, cek kembali isi `.env` dan password PostgreSQL.
