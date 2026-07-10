# BAB 6 - Implementasi Docker Engine & Docker Compose

> Mata Kuliah : Virtualisasi dan Keamanan Jaringan  
> Proyek : Implementasi Arsitektur Jaringan Tersegmentasi

---

# Daftar Isi

- Tujuan
- Arsitektur Docker
- Spesifikasi Server
- Persiapan Sistem
- Instalasi Docker Repository
- Instalasi Docker Engine
- Instalasi Docker Compose
- Konfigurasi Docker
- Struktur Direktori Proyek
- Pengujian
- Troubleshooting
- Kesimpulan

---

# 6.1 Tujuan

Docker digunakan sebagai platform containerization untuk menjalankan dua aplikasi web secara terisolasi pada satu Ubuntu Server di zona DMZ.

Dengan Docker, setiap aplikasi memiliki lingkungan runtime yang independen sehingga lebih mudah dalam proses deployment, pemeliharaan, dan pengembangan.

Pada proyek ini Docker akan digunakan untuk menjalankan:

- App1 (Node.js + Express)
- App2 (Python + Flask)

Kedua aplikasi nantinya akan diakses melalui Nginx Reverse Proxy dan menggunakan Database Server pada jaringan LAN.

---

# 6.2 Arsitektur Docker

```
                    Ubuntu Server (DMZ)
                           │
                    Docker Engine
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
     Container App1                     Container App2
     Node.js Express                     Python Flask
         Port 3000                        Port 5000
         │                                   │
         └─────────────────┬─────────────────┘
                           │
                  Docker Bridge Network
                           │
                    Nginx Reverse Proxy
                           │
                      MikroTik CHR
                           │
                        Internet
```

---

# 6.3 Spesifikasi Server

| Parameter | Nilai |
|-----------|--------|
| Operating System | Ubuntu Server 24.04 LTS |
| CPU | 2 vCPU |
| RAM | 4 GB |
| Storage | 30 GB |
| IP Address | 7.7.7.2 |
| Gateway | 7.7.7.1 |
| Docker Version | Docker CE |
| Compose | Docker Compose Plugin |

---

# 6.4 Persiapan Sistem

Perbarui repository Ubuntu.

```bash
sudo apt update
sudo apt full-upgrade -y
```

Install package pendukung.

```bash
sudo apt install -y \
ca-certificates \
curl \
gnupg \
lsb-release
```

---

# 6.5 Menambahkan Docker Repository

Buat direktori keyring.

```bash
sudo install -m 0755 -d /etc/apt/keyrings
```

Import Docker GPG Key.

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

Atur permission.

```bash
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

Tambahkan repository resmi Docker.

```bash
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Update repository.

```bash
sudo apt update
```

Verifikasi repository.

```bash
apt policy docker-ce
```

---

# 6.6 Instalasi Docker Engine

Install Docker Engine beserta plugin yang dibutuhkan.

```bash
sudo apt install -y \
docker-ce \
docker-ce-cli \
containerd.io \
docker-buildx-plugin \
docker-compose-plugin
```

---

# 6.7 Mengaktifkan Docker Service

Aktifkan Docker agar berjalan otomatis saat sistem boot.

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

Verifikasi status service.

```bash
sudo systemctl status docker
```

Output yang diharapkan.

```
Active: active (running)
```

---

# 6.8 Konfigurasi Docker

Tambahkan user ke grup Docker agar tidak perlu menggunakan `sudo`.

```bash
sudo usermod -aG docker $USER
```

Reload group.

```bash
newgrp docker
```

Atau logout kemudian login kembali.

---

# 6.9 Verifikasi Instalasi

Versi Docker.

```bash
docker --version
```

Contoh.

```
Docker version 28.x.x
```

Versi Docker Compose.

```bash
docker compose version
```

Contoh.

```
Docker Compose version v2.x.x
```

---

# 6.10 Pengujian Docker

Jalankan container bawaan Docker.

```bash
docker run hello-world
```

Output.

```
Hello from Docker!

This message shows that your installation appears to be working correctly.
```

Pengujian ini memastikan bahwa Docker Engine telah berhasil diinstal dan dapat menjalankan container.

---

# 6.11 Struktur Direktori Proyek

Seluruh source code dan konfigurasi proyek ditempatkan pada direktori `/opt/project`.

Membuat direktori.

```bash
sudo mkdir -p /opt/project
sudo chown -R $USER:$USER /opt/project
```

Masuk ke direktori.

```bash
cd /opt/project
```

Membuat struktur direktori.

```bash
mkdir \
app1 \
app2 \
database \
docker \
docs \
logs \
nginx \
scripts \
suricata
```

Struktur direktori.

```text
/opt/project
├── app1
├── app2
├── database
├── docker
├── docs
├── logs
├── nginx
├── scripts
└── suricata
```

Direktori tersebut digunakan untuk memisahkan setiap komponen proyek sehingga lebih mudah dikelola.

---

# 6.12 Hardening Docker

Beberapa konfigurasi keamanan yang diterapkan:

- Menggunakan repository resmi Docker.
- Menambahkan user ke grup Docker agar tidak menggunakan akun root secara langsung.
- Seluruh container nantinya dijalankan menggunakan user non-root pada Dockerfile.
- Docker Compose menggunakan kebijakan restart:

```yaml
restart: unless-stopped
```

- Seluruh source code ditempatkan pada direktori `/opt/project`.

---

# 6.13 Pengujian

| Pengujian | Status |
|------------|--------|
| Docker Repository | ✅ |
| Docker Engine | ✅ |
| Docker Compose | ✅ |
| Docker Service | ✅ |
| Docker Group | ✅ |
| Hello World Container | ✅ |

---

# 6.14 Troubleshooting

## Docker Service Tidak Berjalan

Periksa status service.

```bash
sudo systemctl status docker
```

Restart service.

```bash
sudo systemctl restart docker
```

---

## Permission Denied

Penyebab:

User belum masuk ke grup Docker.

Solusi.

```bash
sudo usermod -aG docker $USER

newgrp docker
```

---

## Docker Compose Tidak Ditemukan

Periksa.

```bash
docker compose version
```

Jika belum tersedia, install plugin.

```bash
sudo apt install docker-compose-plugin
```

---

## Repository Docker Tidak Terbaca

Periksa repository.

```bash
apt policy docker-ce
```

Jika kosong, ulangi proses penambahan repository dan GPG Key.

---

# 6.15 Screenshot

Dokumentasi yang perlu dilampirkan:

- docker --version
- docker compose version
- docker run hello-world
- systemctl status docker
- apt policy docker-ce
- Struktur direktori `/opt/project`

---

# 6.16 Hasil Pengujian

Docker Engine berhasil diinstal menggunakan repository resmi Docker.

Service Docker berjalan dengan status aktif, Docker Compose Plugin berhasil terpasang, dan container `hello-world` dapat dijalankan tanpa kendala.

Seluruh struktur direktori proyek telah dipersiapkan sehingga siap digunakan untuk proses deployment aplikasi pada tahap berikutnya.

---

# 6.17 Kesimpulan

Implementasi Docker Engine dan Docker Compose pada Ubuntu Server DMZ berhasil dilakukan sesuai dengan kebutuhan proyek.

Docker digunakan sebagai platform containerization untuk menjalankan dua aplikasi web secara terisolasi dalam satu server, sehingga memudahkan proses deployment, pemeliharaan, dan pengembangan aplikasi.

Dengan menggunakan repository resmi Docker, konfigurasi user non-root, serta struktur direktori proyek yang terorganisasi, lingkungan Docker telah siap digunakan untuk proses deployment App1 dan App2 pada tahap implementasi berikutnya.
