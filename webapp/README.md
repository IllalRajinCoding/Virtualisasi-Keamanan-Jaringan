# 🌐 VDKJ Web Application

> Bagian Web App dari Proyek **Virtualisasi dan Keamanan Jaringan**
> Dua aplikasi web dalam Docker container, berjalan di VM Ubuntu DMZ (`7.7.7.2`)

---

## 📦 Ringkasan Aplikasi

| App | Deskripsi | Port | Database | Tabel |
|---|---|---|---|---|
| **App1** | Product Store | `3000` | `app1_db` | `products` |
| **App2** | Employee Portal | `3001` | `app2_db` | `employees` |

**Stack:** Node.js 20 + Express + EJS + mysql2 + Docker

---

## 🗂️ Struktur Folder

```
webapp/
├── docker-compose.yml      ← Orchestrate kedua container
├── .env.example            ← Template environment variable
├── sql/
│   └── init.sql            ← Script setup database (untuk DB Admin)
├── app1/                   ← Product Store
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   ├── db.js
│   │   └── routes/products.js
│   ├── views/products/
│   │   ├── list.ejs
│   │   └── form.ejs
│   └── public/style.css
└── app2/                   ← Employee Portal
    ├── Dockerfile
    ├── package.json
    ├── src/
    │   ├── index.js
    │   ├── db.js
    │   └── routes/employees.js
    ├── views/employees/
    │   ├── list.ejs
    │   └── form.ejs
    └── public/style.css
```

---

## 🚀 Cara Deploy (di VM Ubuntu DMZ)

### 1. Setup Database (Database Admin)
Jalankan di MySQL Server (`192.168.56.10`):
```bash
mysql -u root -p < sql/init.sql
```

### 2. Buat file `.env`
```bash
cp .env.example .env
nano .env
```
Isi nilai berikut:
```env
DB_HOST=192.168.56.10
DB_PORT=3306
DB_PASS_APP1=<password_app1_dari_db_admin>
DB_PASS_APP2=<password_app2_dari_db_admin>
```

### 3. Build dan jalankan container
```bash
docker compose up -d --build
```

### 4. Verifikasi
```bash
# Cek container berjalan
docker ps

# Cek log
docker logs vdkj_app1
docker logs vdkj_app2

# Test health check
curl http://localhost:3000/health
curl http://localhost:3001/health

# Pastikan tidak jalan sebagai root
docker exec vdkj_app1 whoami   # harus output: appuser
docker exec vdkj_app2 whoami   # harus output: appuser
```

---

## 🔗 Endpoint

| Endpoint | Keterangan |
|---|---|
| `GET  /products` | Daftar semua produk |
| `GET  /products/add` | Form tambah produk |
| `POST /products` | Buat produk baru |
| `GET  /products/:id/edit` | Form edit produk |
| `PUT  /products/:id` | Update produk |
| `DELETE /products/:id` | Hapus produk |
| `GET  /health` | Health check (untuk Nginx) |

---

## 🤝 Koordinasi dengan Tim

### Untuk Sysadmin (Nginx config)
```nginx
# App1
location /app1/ {
    proxy_pass http://localhost:3000/;
}

# App2
location /app2/ {
    proxy_pass http://localhost:3001/;
}
```

### Untuk Network Engineer (MikroTik)
- Port `3000` dan `3001`: **BLOKIR dari External** (hanya boleh via Nginx port 80/443)
- Port `3306` dari DMZ `7.7.7.2` ke LAN `192.168.56.10`: **IZINKAN**

---

## ⚙️ Perintah Berguna

```bash
# Stop semua container
docker compose down

# Rebuild dari awal
docker compose up -d --build --force-recreate

# Lihat log real-time
docker compose logs -f

# Masuk ke container (debug)
docker exec -it vdkj_app1 sh
```
