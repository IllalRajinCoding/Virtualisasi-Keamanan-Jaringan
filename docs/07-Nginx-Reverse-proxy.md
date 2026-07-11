# BAB 9
# Implementasi Nginx Reverse Proxy

## 9.1 Pendahuluan

Pada tahap ini dilakukan implementasi **Nginx** sebagai **Reverse Proxy** pada Ubuntu Server yang berada di segmen **DMZ**. Nginx bertugas menerima seluruh permintaan HTTP dari client, kemudian meneruskannya ke aplikasi yang berjalan di dalam Docker Container.

Implementasi ini menggunakan dua aplikasi:

- **APP1** : Node.js Express (Port 3000)
- **APP2** : Python Flask (Port 3001)

Berbeda dengan implementasi produksi, lingkungan praktikum menggunakan **VirtualBox NAT** dengan **Port Forwarding**. Oleh karena itu Windows Host **tidak dapat mengakses alamat IP internal 7.7.7.2 secara langsung**.

Seluruh akses dari Windows dilakukan melalui:

- http://localhost:8080/
- http://localhost:8080/employee/

VirtualBox meneruskan koneksi:

Host `localhost:8080` → Guest `Port 80 (Nginx)`.

---

# 9.2 Tujuan

- Menyediakan satu pintu akses ke seluruh aplikasi.
- Menyembunyikan port internal aplikasi.
- Mempermudah pengelolaan layanan.
- Menambahkan HTTP Security Headers.
- Menyediakan Access Log dan Error Log.

---

# 9.3 Arsitektur

```text
Windows Host
      │
http://localhost:8080
      │
VirtualBox NAT Port Forwarding
Host 8080 → Guest 80
      │
Ubuntu Server DMZ
      │
Nginx :80
├───────────────┐
│               │
▼               ▼
APP1            APP2
Node.js         Flask
3000            3001
```

Semua request dari Windows diterima oleh Nginx, kemudian diteruskan berdasarkan URL.

---

# 9.4 Instalasi Nginx

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

Status yang diharapkan:

```text
Active: active (running)
```

---

# 9.5 Konfigurasi VirtualBox Port Forwarding

Karena Ubuntu menggunakan Adapter NAT, dibuat aturan Port Forwarding:

| Protocol | Host IP | Host Port | Guest IP | Guest Port |
|-----------|---------|----------:|----------|-----------:|
| TCP | 127.0.0.1 | 8080 | - | 80 |

Dengan konfigurasi tersebut:

- `http://localhost:8080/` → Nginx → APP1
- `http://localhost:8080/employee/` → Nginx → APP2

Catatan: IP `7.7.7.2` tidak dapat diakses langsung dari Windows karena merupakan alamat internal VM.

---

# 9.6 Konfigurasi Reverse Proxy

File:

```text
/etc/nginx/sites-available/vdkj
```

```nginx
server {

    listen 80;
    server_name _;

    access_log /var/log/nginx/vdkj_access.log;
    error_log /var/log/nginx/vdkj_error.log;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /employee/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/vdkj /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

# 9.7 Pengujian

APP1:

```text
http://localhost:8080/
```

Expected:

- Halaman APP1 tampil.
- Database Connected.

APP2:

```text
http://localhost:8080/employee/
```

Expected:

- Halaman Employee Portal tampil.
- Database Connected.

---

# 9.8 Monitoring

Access Log

```bash
sudo tail -f /var/log/nginx/vdkj_access.log
```

Error Log

```bash
sudo tail -f /var/log/nginx/vdkj_error.log
```

---

# 9.9 Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

Fungsi:

| Header | Fungsi |
|--------|--------|
| X-Frame-Options | Mencegah Clickjacking |
| X-Content-Type-Options | Mencegah MIME Sniffing |
| Referrer-Policy | Membatasi informasi Referrer |

---

# 9.10 Hasil Implementasi

| Komponen | Status |
|----------|--------|
| Install Nginx | ✅ |
| Reverse Proxy APP1 | ✅ |
| Reverse Proxy APP2 | ✅ |
| Access Log | ✅ |
| Error Log | ✅ |
| Security Headers | ✅ |
| Port Forwarding | ✅ |

---

# 9.11 Troubleshooting

## localhost:8080 tidak bisa diakses

**Penyebab:**
- Port Forwarding belum dibuat.
- Nginx belum berjalan.

**Solusi:**

```bash
sudo systemctl status nginx
sudo systemctl restart nginx
```

Periksa aturan Port Forwarding VirtualBox.

---

## 7.7.7.2 tidak dapat diakses dari Windows

Normal. VM menggunakan NAT sehingga alamat internal tidak dapat diakses langsung.

Gunakan:

```text
http://localhost:8080/
```

---

## 502 Bad Gateway

Penyebab:

- APP1/APP2 belum berjalan.
- Container berhenti.

Cek:

```bash
docker ps
docker compose logs
```

---

## nginx -t gagal

Periksa syntax konfigurasi:

```bash
sudo nginx -t
```

---

## APP1 dapat diakses tetapi APP2 gagal

Pastikan:

```bash
docker ps
curl http://127.0.0.1:3001
```

Jika gagal, periksa container Flask.

---

## Access Log kosong

Pastikan file:

```text
/var/log/nginx/vdkj_access.log
```

memiliki permission yang benar dan request benar-benar melewati Nginx.

---

# 9.12 Screenshot

## Status Nginx

![Status Nginx](../img/nginx/status.png)

## Hasil nginx -t

![Hasil nginx -t](../img/nginx/nginx-t.png)

## VirtualBox Port Forwarding

![VirtualBox Port Forwarding](../img/nginx/port-forwarding.png)

## APP1 melalui localhost:8080

![APP1](../img/nginx/web-app1.png)

## APP2 melalui localhost:8080/employee/

![APP2](../img/nginx/web-app2.png)

## Access Log

![Access Log](../img/nginx/acces-log.png)

## Error Log

![Error Log](../img/nginx/error-log.png)

---

# 9.13 Kesimpulan

Implementasi Nginx Reverse Proxy berhasil dilakukan pada Ubuntu Server DMZ. Seluruh request dari Windows Host diterima melalui mekanisme VirtualBox NAT Port Forwarding pada `localhost:8080`, kemudian diteruskan ke Nginx yang berjalan pada port 80. Nginx berhasil mengarahkan request ke APP1 maupun APP2 sesuai URL yang diakses, menyediakan Access Log dan Error Log, serta menambahkan HTTP Security Headers untuk meningkatkan keamanan layanan.
