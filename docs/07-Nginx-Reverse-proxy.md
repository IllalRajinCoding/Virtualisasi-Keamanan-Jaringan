# BAB 9
# Implementasi Nginx Reverse Proxy

## 9.1 Pendahuluan

Pada implementasi ini digunakan **Nginx** sebagai **Reverse Proxy** untuk mengarahkan seluruh request HTTP yang masuk ke aplikasi yang berjalan di dalam Docker Container.

Arsitektur yang digunakan terdiri dari dua aplikasi berbeda:

- **APP1** menggunakan **Node.js Express**
- **APP2** menggunakan **Python Flask**

Dengan menggunakan Reverse Proxy, pengguna hanya mengakses satu web server (Nginx), sedangkan Nginx meneruskan request ke container yang sesuai.

---

# 9.2 Tujuan

Implementasi Reverse Proxy bertujuan untuk:

- Menyediakan satu pintu akses menuju seluruh aplikasi.
- Menyembunyikan port internal container.
- Mempermudah pengelolaan layanan.
- Menambahkan security headers.
- Mencatat seluruh request melalui access log.

---

# 9.3 Arsitektur Reverse Proxy

```
                 Internet
                     │
              MikroTik Router
                     │
              Ubuntu Server (DMZ)
                     │
                 Nginx :80
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
   APP1 (Node.js)        APP2 (Flask)
      Port 3000             Port 3001
```

Semua request HTTP akan diterima oleh Nginx terlebih dahulu sebelum diteruskan ke aplikasi.

---

# 9.4 Instalasi Nginx

Update repository.

```bash
sudo apt update
```

Install Nginx.

```bash
sudo apt install nginx -y
```

Menjalankan service.

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

Verifikasi.

```bash
sudo systemctl status nginx
```

Status yang diharapkan:

```
Active: active (running)
```

---

# 9.5 Konfigurasi Reverse Proxy

Membuat virtual host baru.

```bash
sudo nano /etc/nginx/sites-available/vdkj
```

Isi konfigurasi:

```nginx
server {

    listen 80;
    server_name _;

    access_log /var/log/nginx/vdkj_access.log;
    error_log  /var/log/nginx/vdkj_error.log;

    ####################################################
    ## APP1
    ## http://7.7.7.2/
    ####################################################

    location / {

        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

    }

    ####################################################
    ## APP2
    ## http://7.7.7.2/employee/
    ####################################################

    location /employee/ {

        proxy_pass http://127.0.0.1:3001/;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

    }

    ####################################################
    ## Security Headers
    ####################################################

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

}
```

---

# 9.6 Mengaktifkan Virtual Host

Membuat symbolic link.

```bash
sudo ln -s /etc/nginx/sites-available/vdkj /etc/nginx/sites-enabled/
```

Menghapus konfigurasi default.

```bash
sudo rm /etc/nginx/sites-enabled/default
```

---

# 9.7 Validasi Konfigurasi

Memastikan konfigurasi tidak memiliki kesalahan.

```bash
sudo nginx -t
```

Hasil yang diharapkan:

```
syntax is ok
test is successful
```

---

# 9.8 Restart Service

```bash
sudo systemctl restart nginx
```

Verifikasi.

```bash
sudo systemctl status nginx
```

---

# 9.9 Pengujian Reverse Proxy

## APP1

Mengakses halaman utama.

```bash
curl http://localhost
```

Hasil:

```json
{
    "application":"APP1",
    "framework":"Node.js Express",
    "status":"Running",
    "database":"Connected"
}
```

---

## APP2

Mengakses Employee Portal.

```bash
curl http://localhost/employee/
```

Halaman Flask berhasil ditampilkan.

---

# 9.10 Access Log

Melihat seluruh request.

```bash
sudo tail -f /var/log/nginx/vdkj_access.log
```

Contoh:

```
GET /
GET /employee/
```

---

# 9.11 Error Log

Melihat error.

```bash
sudo tail -f /var/log/nginx/vdkj_error.log
```

Digunakan untuk troubleshooting apabila Reverse Proxy gagal menghubungkan aplikasi.

---

# 9.12 Security Headers

Untuk meningkatkan keamanan web server ditambahkan beberapa HTTP Security Header.

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

Fungsi masing-masing:

| Header | Fungsi |
|---------|--------|
| X-Frame-Options | Mencegah Clickjacking |
| X-Content-Type-Options | Mencegah MIME Sniffing |
| Referrer-Policy | Membatasi informasi Referrer |

---

# 9.13 Hasil Implementasi

| Komponen | Status |
|----------|--------|
| Install Nginx | ✅ |
| Reverse Proxy APP1 | ✅ |
| Reverse Proxy APP2 | ✅ |
| Access Log | ✅ |
| Error Log | ✅ |
| Security Headers | ✅ |

---

# 9.14 Dokumentasi Screenshot

Tambahkan screenshot berikut:

- Instalasi Nginx
- Status service Nginx
- File konfigurasi `vdkj`
- Hasil `nginx -t`
- APP1 melalui Reverse Proxy
- APP2 melalui Reverse Proxy
- Access Log
- Error Log

---

# Kesimpulan

Implementasi Nginx Reverse Proxy berhasil dilakukan pada Ubuntu Server DMZ. Seluruh request HTTP diteruskan ke aplikasi yang sesuai berdasarkan URL yang diakses. APP1 (Node.js) dapat diakses melalui root path (`/`), sedangkan APP2 (Flask) dapat diakses melalui path `/employee/`. Selain itu, Nginx juga berhasil menerapkan security headers serta melakukan pencatatan aktivitas pengguna melalui access log dan error log sehingga memudahkan proses monitoring dan troubleshooting.
