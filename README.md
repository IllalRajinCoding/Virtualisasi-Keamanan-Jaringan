# PANDUAN TUGAS PROYEK
## Virtualisasi dan Keamanan Jaringan
### Implementasi Arsitektur Jaringan Tersegmentasi

| | |
|---|---|
| **Mata Kuliah** | Virtualisasi dan Keamanan Jaringan |
| **Jenis Tugas** | Proyek Kelompok |
| **Sifat** | Implementasi & Dokumentasi |
| **Periode** | Semester Genap 2025/2026 |
| **Revisi Dokumen** | v1.0 — 2026 |

---

## 1. Deskripsi Umum Proyek

Tugas proyek ini merupakan komponen utama penilaian mata kuliah Virtualisasi dan Keamanan Jaringan. Mahasiswa secara berkelompok akan merancang, membangun, mengonfigurasi, dan mendokumentasikan sebuah infrastruktur jaringan virtual yang mencerminkan praktik industri nyata dalam membangun lingkungan jaringan yang aman dan terkelola.

Proyek ini mengintegrasikan konsep virtualisasi mesin, containerisasi aplikasi, keamanan jaringan berlapis, serta monitoring intrusi. Arsitektur yang dibangun terdiri dari tiga segmen jaringan yang terpisah: External Network, DMZ (Demilitarized Zone), dan LAN internal, yang dihubungkan dan diproteksi melalui router virtual berbasis MikroTik CHR.

### Tujuan Pembelajaran (Learning Outcomes)

- **LO1** — Mahasiswa mampu mengimplementasikan virtualisasi mesin menggunakan hypervisor dan teknologi container.
- **LO2** — Mahasiswa mampu merancang dan mengonfigurasi segmentasi jaringan yang aman (DMZ, LAN, External).
- **LO3** — Mahasiswa mampu menerapkan kebijakan firewall dan routing pada perangkat jaringan virtual MikroTik.
- **LO4** — Mahasiswa mampu men-deploy aplikasi web dalam container Docker dan mengintegrasikannya dengan database.
- **LO5** — Mahasiswa mampu menginstalasi dan mengonfigurasi sistem IDS/IPS berbasis Suricata.
- **LO6** — Mahasiswa mampu mendokumentasikan infrastruktur jaringan secara teknis dan profesional.

---

## 2. Arsitektur Sistem Target

### 2.1 Gambaran Umum

```text
[ External Network ]
          |
    [ Router MikroTik CHR ]
     /              \
7.7.7.7/30 (DMZ)    192.168.56.0/24 (LAN)
|                    |
[ VM Ubuntu ]        [ DB Server ]
  Nginx + Suricata    MySQL Database
  Docker: App1, App2
```

### 2.2 Spesifikasi Komponen Jaringan

| Komponen | Segmen/Subnet | Teknologi | Keterangan |
|----------|---------------|-----------|------------|
| Router Virtual | External / DMZ / LAN | MikroTik CHR | Gateway utama |
| VM Aplikasi (DMZ) | 7.7.7.7/30 | Ubuntu Linux | Web server & IDS |
| Container Web App 1 | Docker Network (DMZ) | Docker + App Stack | Aplikasi web 1 |
| Container Web App 2 | Docker Network (DMZ) | Docker + App Stack | Aplikasi web 2 |
| Reverse Proxy | VM DMZ | Nginx | Routing traffic ke container |
| IDS/IPS | VM DMZ | Suricata | Monitoring & blocking |
| Database Server | 192.168.56.0/24 | Ubuntu + MySQL | Backend database LAN |

---

## 3. Spesifikasi Teknis dan Tugas Implementasi

### 3.1 Router Virtual MikroTik CHR

#### 3.1.1 Konfigurasi Interface dan IP Address

- Buat minimal 3 (tiga) interface virtual: `ether1` (External/WAN), `ether2` (DMZ), `ether3` (LAN)
- Konfigurasi IP Address sesuai skema: External (DHCP/static dari hypervisor), DMZ: `7.7.7.x/30`, LAN: `192.168.56.1/24`
- Aktifkan DNS client pada router
- Konfigurasi routing default dan static route yang diperlukan

#### 3.1.2 Firewall Rules MikroTik

1. **Filter Chain INPUT**: Drop semua koneksi masuk ke router kecuali dari IP management yang diizinkan; Izinkan ICMP (ping) dari dalam untuk troubleshooting; Izinkan SSH hanya dari subnet LAN; Drop port scanning dengan connection-limit.
2. **Filter Chain FORWARD — DMZ ke LAN**: Izinkan HANYA traffic port MySQL (3306) dari IP VM DMZ menuju IP Database Server di LAN; Blokir semua traffic lain dari DMZ ke LAN secara eksplisit.
3. **Filter Chain FORWARD — External ke DMZ**: Izinkan traffic ke port 80 (HTTP) dan 443 (HTTPS) menuju IP Nginx di DMZ; Blokir direct access ke port aplikasi container dari external; Implementasikan rate limiting untuk mencegah DDoS sederhana.
4. **NAT Masquerade**: Aktifkan NAT srcnat masquerade pada interface external untuk traffic dari LAN dan DMZ.
5. **Port Forwarding (DNAT)**: Forward traffic dari IP external port 80/443 ke IP VM Ubuntu di DMZ.
6. **Connection Tracking**: Aktifkan connection state tracking; Drop packet dengan state invalid; Accept packet established dan related.
7. **Firewall Address List**: Buat address list untuk blokir IP mencurigakan dan implementasikan drop rule-nya.

### 3.2 VM Ubuntu di DMZ

#### 3.2.1 Nginx sebagai Reverse Proxy

- Install dan konfigurasi Nginx
- Buat konfigurasi virtual host (server block) untuk masing-masing aplikasi web
- Nginx harus mem-forward request dari external ke container yang berjalan di Docker
- Aktifkan access log dan error log dengan format yang informatif
- Tambahkan security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`

#### 3.2.2 Docker Container — Dua Aplikasi Web

- Container App 1 dan Container App 2 harus berupa aplikasi web yang berbeda
- Kedua aplikasi HARUS terhubung ke database MySQL yang ada di server LAN (`192.168.56.0/24`)
- Gunakan Docker Compose untuk mendefinisikan dan menjalankan kedua container
- Setiap container harus memiliki environment variable untuk konfigurasi koneksi database
- Pastikan container tidak berjalan sebagai root user
- Buat Dockerfile custom untuk setidaknya satu dari kedua aplikasi

#### 3.2.3 Suricata IDS/IPS

- Install Suricata pada VM Ubuntu
- Konfigurasi Suricata untuk memonitor interface network yang mengarah ke traffic DMZ
- Aktifkan rule set standar (Emerging Threats atau Suricata rules bawaan)
- Tambahkan minimal 3 (tiga) custom rule yang relevan untuk mendeteksi serangan pada aplikasi web
- Konfigurasi Suricata dalam mode IDS (passive) dengan EVE JSON logging
- Pastikan log Suricata tersimpan dan dapat dianalisis

### 3.3 Database Server (LAN)

- Install MySQL Server atau MariaDB pada VM/host di segmen LAN
- Buat database dan user khusus untuk masing-masing aplikasi web
- Konfigurasi `bind-address` MySQL agar hanya menerima koneksi dari subnet yang diizinkan
- Buat skema database minimal dengan beberapa tabel dan isi dengan data dummy
- Aktifkan firewall di level OS: hanya izinkan port 3306 dari IP VM DMZ

---

## 4. Pengujian dan Verifikasi Sistem

### 4.1 Pengujian Konektivitas Dasar

- [ ] Ping dari External ke Router (harus berhasil sesuai rule firewall)
- [ ] Ping dari DMZ ke LAN (harus berhasil)
- [ ] Ping dari External ke LAN langsung (harus GAGAL — diblokir firewall)
- [ ] Akses HTTP/HTTPS ke Nginx dari external (harus berhasil)
- [ ] Akses langsung ke port container dari external (harus GAGAL)
- [ ] Koneksi MySQL dari VM DMZ ke Database Server (harus berhasil)
- [ ] Koneksi MySQL dari external langsung (harus GAGAL)

### 4.2 Pengujian Aplikasi Web

- [ ] Aplikasi Web 1 dapat diakses melalui Nginx reverse proxy
- [ ] Aplikasi Web 2 dapat diakses melalui Nginx reverse proxy
- [ ] Kedua aplikasi berhasil membaca/menulis data ke database MySQL di LAN
- [ ] Nginx access log mencatat request dengan benar
- [ ] Response header keamanan ada di response HTTP

### 4.3 Pengujian Firewall MikroTik

- [ ] Rule DROP untuk koneksi dari External ke LAN langsung berfungsi
- [ ] Rate limiting aktif dan membatasi traffic berlebihan
- [ ] Address list blocking berfungsi untuk IP yang ditambahkan manual
- [ ] Connection state tracking: packet INVALID di-drop
- [ ] Hanya port 80/443 yang dapat diakses dari External ke DMZ
- [ ] SSH ke router hanya bisa dari LAN, tidak dari External

### 4.4 Pengujian Suricata IDS/IPS

- [ ] Suricata berjalan aktif dan memproses traffic
- [ ] Alert muncul di log saat dilakukan simulasi serangan
- [ ] Custom rule yang dibuat memicu alert saat ada traffic yang cocok
- [ ] Log Suricata (EVE JSON) dapat dibaca dan dianalisis

---

## 5. Deliverables (Luaran yang Dikumpulkan)

### 5.1 Laporan Teknis (Bobot: 40%)

Laporan tertulis dalam format PDF/Word dengan struktur minimal:

1. Halaman Judul
2. Pendahuluan: Latar belakang, tujuan, dan ruang lingkup implementasi
3. Desain Arsitektur: Diagram jaringan lengkap dengan IP address
4. Implementasi: Langkah-langkah konfigurasi detail untuk setiap komponen
5. Konfigurasi Keamanan: Firewall rules MikroTik dan Suricata custom rules
6. Hasil Pengujian: Screenshot dan analisis hasil pengujian
7. Kendala dan Solusi
8. Kesimpulan dan Saran
9. Lampiran: File konfigurasi lengkap

### 5.2 File Konfigurasi dan Source Code (Bobot: 30%)

- Export konfigurasi MikroTik (file `.rsc`)
- `docker-compose.yml` untuk kedua container
- Dockerfile untuk aplikasi custom
- Konfigurasi Nginx (file `.conf`)
- File konfigurasi Suricata (`suricata.yaml`) dan custom rules (`.rules`)
- Source code aplikasi web
- Script SQL untuk database dan data dummy
- `README.md` cara menjalankan/mereplikasi setup

### 5.3 Presentasi dan Demonstrasi Rekaman (Bobot: 30%)

- Durasi presentasi: 20-30 menit per kelompok
- Demonstrasi sistem secara langsung dalam rekaman video
- Setiap anggota harus siap menjawab pertanyaan teknis
- Slide presentasi (PowerPoint/PDF) dikumpulkan

---

## 6. Rubrik dan Komponen Penilaian

| No | Komponen Penilaian | Sub-Komponen | Bobot (%) |
|----|---------------------|--------------|-----------|
| 1 | Konfigurasi Router MikroTik CHR | Interface & IP Address benar | 5 |
| | | Routing antar segmen berfungsi | 5 |
| | | Firewall rules lengkap & tepat | 15 |
| | | NAT & Port Forwarding | 5 |
| 2 | VM Ubuntu & Docker | VM terkonfigurasi di DMZ | 5 |
| | | Docker Compose dengan 2 container | 10 |
| | | Aplikasi web fungsional & terkoneksi DB | 10 |
| 3 | Nginx Reverse Proxy | Konfigurasi upstream & proxy pass | 5 |
| | | Security headers | 3 |
| | | Logging aktif | 2 |
| 4 | Suricata IDS/IPS | Instalasi & konfigurasi dasar | 5 |
| | | Custom rules relevan (min. 3) | 5 |
| | | Alert terdeteksi saat pengujian | 5 |
| 5 | Database Server (LAN) | MySQL terpasang & dikonfigurasi | 5 |
| | | Akses terbatas dari DMZ saja | 5 |
| 6 | Laporan & Dokumentasi | Kelengkapan & kejelasan laporan | 10 |
| 7 | Presentasi & Demo | Presentasi & demonstrasi | 15 |
| | | **TOTAL** | **100** |

**Catatan Penting:**
- Sistem yang tidak dapat didemonstrasikan secara live akan mendapat pengurangan nilai signifikan.
- Plagiarisme atau copy-paste konfigurasi dari kelompok lain tanpa modifikasi akan mendapat nilai 0.
- Keterlambatan pengumpulan: -5 poin per hari terlambat.
- Semua anggota kelompok harus dapat menjelaskan setiap bagian konfigurasi yang dibuat.

---

## 7. Struktur Repository

```text
docs/
  01-mikrotik.md
  02-ubuntu-dmz.md
  06-Web-Application.md
  07-Nginx-Reverse-proxy.md
  08-suricata.md
img/
  nginx/
  suricata/
  ubuntu-database/
  ubuntu-dmz/
  web-app/
mikrotik/
  config/
suricata/
  config/
  log/
scripts/
  setup-server.sh
  install-tools.sh
  install-docker.sh
  install-nginx.sh
  install-suricata.sh
  install-failban.sh
  docker-compose.sh
```

## Dokumentasi

- [Konfigurasi MikroTik](docs/01-mikrotik.md)
- [Implementasi Ubuntu Server DMZ](docs/02-ubuntu-dmz.md)
- [Web Application (Docker)](docs/06-Web-Application.md)
- [Nginx Reverse Proxy](docs/07-Nginx-Reverse-proxy.md)
- [Suricata IDS](docs/08-suricata.md)

## Script Ubuntu Server DMZ

Script berada di folder `scripts/` dan ditujukan untuk Ubuntu Server.

Jalankan dari folder `scripts`:

```bash
cd scripts
bash setup-server.sh
```

Script utama akan menjalankan:

```text
install-tools.sh
install-docker.sh
install-nginx.sh
install-suricata.sh
install-failban.sh
```

## Catatan Script

- `setup-server.sh` harus dijalankan dari folder `scripts`.
- Nama script Fail2Ban yang tersedia adalah `install-failban.sh`.
- `docker-compose.sh` membutuhkan file `compose.yaml`, `compose.yml`, atau `docker-compose.yml` di direktori tempat command dijalankan.

## Urutan Implementasi

1. Konfigurasi jaringan MikroTik sesuai dokumentasi.
2. Konfigurasi Ubuntu Server DMZ dan pastikan gateway, DNS, serta akses internet berjalan.
3. Jalankan script instalasi server.
4. Tambahkan file Docker Compose sebelum menjalankan `docker-compose.sh`.

---

## 8. Ketentuan Kelompok dan Pembagian Tugas

### 8.1 Komposisi Kelompok

- Setiap kelompok terdiri dari mahasiswa sesuai pembagian yang telah ditetapkan oleh dosen
- Tidak diperkenankan berpindah kelompok tanpa izin dari dosen pengampu
- Jika ada anggota yang tidak aktif berkontribusi, wajib dilaporkan kepada dosen

### 8.2 Saran Pembagian Peran (Role)

| Peran | Tanggung Jawab Utama |
|-------|----------------------|
| Network Engineer | Konfigurasi MikroTik CHR, firewall rules, routing, NAT |
| System Administrator | Setup VM Ubuntu, instalasi Nginx, konfigurasi Suricata |
| DevOps / Developer | Pembuatan Dockerfile, Docker Compose, aplikasi web |
| Database Administrator | Instalasi MySQL, pembuatan skema database, security database |
| Documentation & QA | Laporan teknis, pengujian sistem, slide presentasi |

---

## 9. Jadwal Pengerjaan

| Minggu ke- | Milestone | Target Aktivitas |
|------------|-----------|------------------|
| 1 – 2 | Perencanaan & Setup | Desain arsitektur, pembagian tugas, instalasi hypervisor dan VM dasar |
| 3 – 4 | Infrastruktur Jaringan | Konfigurasi MikroTik CHR, interface, routing, firewall rules dasar |
| 5 – 6 | VM & Containerisasi | Setup VM Ubuntu DMZ, instalasi Docker, deploy kedua container web app |
| 7 | Nginx & Database | Konfigurasi Nginx reverse proxy, setup MySQL di LAN, integrasi app-DB |
| 8 | Keamanan & IDS | Instalasi Suricata, custom rules, hardening firewall MikroTik lanjutan |
| 9 | Pengujian & Debugging | Pengujian seluruh skenario, perbaikan bug dan konfigurasi |
| 10 | Laporan & Presentasi | Finalisasi laporan, slide presentasi, demo preparation |

---

## 10. Referensi

- [MikroTik Wiki](https://wiki.mikrotik.com)
- [Docker Docs](https://docs.docker.com)
- [Nginx Docs](https://nginx.org/en/docs)
- [Suricata Docs](https://suricata.io/docs)
- [MySQL Docs](https://dev.mysql.com/doc)
