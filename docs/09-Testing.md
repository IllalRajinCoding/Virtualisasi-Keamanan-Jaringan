# BAB 11
# PENGUJIAN SISTEM

## 11.1 Tujuan

Tahap ini bertujuan untuk memastikan seluruh komponen yang telah diimplementasikan berjalan sesuai rancangan.

Pengujian dilakukan terhadap:

- Koneksi antar jaringan
- Reverse Proxy Nginx
- Web Application
- Database Server
- Suricata IDS

---

# 11.2 Pengujian Koneksi Jaringan

## Pengujian Ubuntu DMZ ke Database Server

```bash
ping 192.168.56.10
```

Hasil:

```
Reply from 192.168.56.10
```

Status:

✅ Berhasil

---

# 11.3 Pengujian Database

Pengujian dilakukan menggunakan aplikasi App1 dan App2.

Hasil:

- Koneksi MySQL berhasil.
- Data berhasil ditampilkan.
- Tidak ditemukan error koneksi.

Status:

✅ Berhasil

---

# 11.4 Pengujian App1

Mengakses aplikasi.

```
http://localhost:8080/
```

Hasil:

- Node.js Express berjalan.
- Data produk berhasil ditampilkan.
- Database Connected.

Status:

✅ Berhasil

---

# 11.5 Pengujian App2

Mengakses aplikasi.

```
http://localhost:8080/employee/
```

Hasil:

- Flask berjalan.
- Data employee berhasil ditampilkan.
- Database Connected.

Status:

✅ Berhasil

---

# 11.6 Pengujian Reverse Proxy

Nginx berhasil meneruskan request.

```
/
```

→ App1

```
/employee/
```

→ App2

Status:

✅ Berhasil

---

# 11.7 Pengujian SQL Injection Detection

Rule:

```
VDKJ SQL Injection Attempt
```

Pengujian:

```bash
curl "http://localhost:8080/?id=1%20union%20select"
```

Hasil:

Suricata berhasil mendeteksi request dan menghasilkan alert pada file `eve.json`.

Status:

✅ Berhasil

---

# 11.8 Pengujian Cross Site Scripting (XSS)

Rule:

```
VDKJ XSS Attempt
```

Pengujian:

```bash
curl "http://localhost:8080/?q=<script>alert(1)</script>"
```

Hasil:

Alert berhasil muncul pada `eve.json`.

Contoh:

```
event_type : alert

signature : VDKJ XSS Attempt
```

Status:

✅ Berhasil

---

# 11.9 Monitoring Log IDS

Melihat log secara realtime.

```bash
sudo tail -f /var/log/suricata/eve.json
```

Suricata berhasil mencatat:

- HTTP Request
- HTTP Response
- Alert SQL Injection
- Alert XSS

Status:

✅ Berhasil

---

# 11.10 Ringkasan Pengujian

| Komponen | Status |
|----------|--------|
| MikroTik Routing | ✅ |
| NAT | ✅ |
| Firewall | ✅ |
| Ubuntu DMZ | ✅ |
| Ubuntu Database | ✅ |
| Docker | ✅ |
| App1 Node.js | ✅ |
| App2 Flask | ✅ |
| MySQL | ✅ |
| Reverse Proxy | ✅ |
| SQL Injection Detection | ✅ |
| XSS Detection | ✅ |
| Logging IDS | ✅ |

---

# 11.11 Kendala

Pada pengujian Port Scan menggunakan Nmap dari host Windows melalui VirtualBox NAT dan Port Forwarding, Suricata tidak menghasilkan alert karena paket SYN yang diterima oleh Ubuntu Server tidak merepresentasikan pola SYN Scan secara langsung.

Oleh karena itu, pengujian Port Scan tidak dijadikan bagian utama dari hasil implementasi. Implementasi IDS tetap berhasil dibuktikan melalui deteksi SQL Injection dan Cross Site Scripting yang tercatat pada file `eve.json`.

---

# 11.12 Kesimpulan

Berdasarkan seluruh pengujian yang dilakukan, sistem berhasil diimplementasikan sesuai dengan rancangan.

Komunikasi antar server berjalan dengan baik, aplikasi berhasil terhubung ke database, Nginx berhasil melakukan reverse proxy, dan Suricata berhasil mendeteksi serangan berbasis HTTP menggunakan custom rules.

Hasil ini menunjukkan bahwa implementasi arsitektur jaringan tersegmentasi menggunakan MikroTik CHR, Ubuntu Server, Docker, Nginx, MySQL, dan Suricata telah berjalan dengan baik.
