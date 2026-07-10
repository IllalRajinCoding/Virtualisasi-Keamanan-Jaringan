# BAB 5 - Implementasi Ubuntu Server DMZ

> Mata Kuliah : Virtualisasi dan Keamanan Jaringan  
> Proyek : Implementasi Arsitektur Jaringan Tersegmentasi  
> Server : Ubuntu Server DMZ

---

# Daftar Isi

- Tujuan
- Arsitektur Server
- Spesifikasi VM
- Konfigurasi VirtualBox
- Konfigurasi Network Ubuntu
- Verifikasi Network
- Upgrade Storage
- Resize Filesystem
- Update Sistem
- Instalasi Basic Tools
- Pengujian
- Troubleshooting
- Kesimpulan

---

# 5.1 Tujuan

Ubuntu Server pada segmen **DMZ (Demilitarized Zone)** berfungsi sebagai server publik yang menerima trafik dari jaringan eksternal melalui Router MikroTik CHR.

Server ini akan digunakan untuk menjalankan beberapa layanan utama, yaitu:

- Docker Engine
- Docker Compose
- Nginx Reverse Proxy
- Suricata IDS
- Web Application 1
- Web Application 2

Server DMZ hanya diperbolehkan mengakses Database Server melalui port MySQL (3306) sesuai kebijakan firewall pada Router MikroTik.

---

# 5.2 Arsitektur Ubuntu DMZ

```
                 INTERNET
                     │
             MikroTik CHR
               7.7.7.1/30
                     │
              Internal Network
                  (DMZ)
                     │
              Ubuntu Server
                7.7.7.2
                     │
      ┌──────────────┼──────────────┐
      │              │              │
 Docker Engine   Nginx Proxy   Suricata IDS
      │
 ┌────┴────┐
 │         │
App1     App2
      │
      │
MySQL Database
192.168.56.10
```

---

# 5.3 Spesifikasi Virtual Machine

| Parameter | Nilai |
|------------|--------|
| Operating System | Ubuntu Server 24.04 LTS |
| CPU | 2 vCPU |
| Memory | 4 GB |
| Storage | 30 GB |
| Adapter | 1 |
| Network | Internal Network (DMZ) |

---

# 5.4 Konfigurasi VirtualBox

Ubuntu DMZ menggunakan satu buah Network Adapter.

| Adapter | Konfigurasi |
|----------|-------------|
| Adapter 1 | Enable |
| Attached To | Internal Network |
| Name | DMZ |
| Adapter Type | Intel PRO/1000 MT Desktop |

> **Catatan**
>
> Ubuntu Server DMZ tidak menggunakan NAT secara langsung.
> Seluruh akses Internet dilakukan melalui Router MikroTik menggunakan mekanisme NAT Masquerade.

---

# 5.5 Konfigurasi IP Address

Konfigurasi jaringan dilakukan menggunakan **Netplan**.

Lokasi file konfigurasi:

```bash
/etc/netplan/50-cloud-init.yaml
```

Konfigurasi:

```yaml
network:
  version: 2

  ethernets:
    enp0s3:
      dhcp4: false

      addresses:
        - 7.7.7.2/30

      routes:
        - to: default
          via: 7.7.7.1

      nameservers:
        addresses:
          - 8.8.8.8
          - 1.1.1.1
```

Kemudian menerapkan konfigurasi:

```bash
sudo netplan apply
```

---

# 5.6 Informasi Network

| Parameter | Nilai |
|-----------|--------|
| Interface | enp0s3 |
| IP Address | 7.7.7.2/30 |
| Gateway | 7.7.7.1 |
| DNS | 8.8.8.8, 1.1.1.1 |

---

# 5.7 Verifikasi Konfigurasi

## Informasi Interface

```bash
ip a
```

Output:

```
enp0s3
UP

7.7.7.2/30
```

---

## Routing

```bash
ip route
```

Output:

```
default via 7.7.7.1
```

---

## Pengujian Gateway

```bash
ping 7.7.7.1
```

Status:

✅ Berhasil

---

## Pengujian Internet

```bash
ping 8.8.8.8
```

Status:

✅ Berhasil

---

## Pengujian DNS

```bash
ping google.com
```

Status:

✅ Berhasil

---

# 5.8 Upgrade Storage Virtual Machine

Saat proses pembaruan sistem ditemukan bahwa kapasitas disk bawaan sebesar **5 GB** tidak mencukupi.

Pesan yang muncul:

```
You don't have enough free space in /var/cache/apt/archives/
```

Untuk mengatasi permasalahan tersebut dilakukan peningkatan kapasitas Virtual Hard Disk.

---

## Sebelum Upgrade

| Parameter | Nilai |
|-----------|--------|
| Storage | 5 GB |

---

## Upgrade VDI

Dilakukan menggunakan VBoxManage.

```powershell
VBoxManage modifymedium "Ubuntu server.vdi" --resize 30720
```

30720 MB = 30 GB

---

# 5.9 Resize Partisi

Setelah ukuran Virtual Disk bertambah, partisi Linux diperbesar.

Install utilitas:

```bash
sudo apt install cloud-guest-utils
```

Resize partisi:

```bash
sudo growpart /dev/sda 2
```

Resize filesystem:

```bash
sudo resize2fs /dev/sda2
```

---

# 5.10 Verifikasi Storage

```bash
lsblk
```

Output:

```
sda
30G

└── sda2
30G
```

---

Filesystem:

```bash
df -h
```

Output:

```
Filesystem

/dev/sda2

Size 30G

Available 24G
```

Storage berhasil diperbesar sehingga cukup untuk instalasi Docker, Nginx, Suricata, dan aplikasi web.

---

# 5.11 Update Sistem

Memperbarui seluruh package Ubuntu.

```bash
sudo apt update

sudo apt full-upgrade -y
```

Melakukan reboot.

```bash
sudo reboot
```

---

# 5.12 Instalasi Basic Utilities

Instalasi utilitas dasar yang akan digunakan selama implementasi.

```bash
sudo apt install -y \
curl \
wget \
git \
nano \
vim \
tree \
htop \
net-tools \
unzip
```

---

# 5.13 Struktur Direktori

Rencana direktori implementasi.

```
/opt/project

├── app1
├── app2
├── docker
├── nginx
├── logs
└── suricata
```

---

# 5.14 Pengujian

| Pengujian | Hasil |
|-----------|--------|
| Interface Aktif | ✅ |
| IP Address | ✅ |
| Gateway | ✅ |
| Internet | ✅ |
| DNS Resolve | ✅ |
| Resize Disk | ✅ |
| Resize Filesystem | ✅ |
| Update Ubuntu | ✅ |

---

# 5.15 Troubleshooting

## Masalah

```
You don't have enough free space
```

Penyebab:

Virtual Hard Disk hanya berkapasitas 5 GB.

Solusi:

- Resize Virtual Disk menjadi 30 GB.
- Perbesar partisi menggunakan `growpart`.
- Perbesar filesystem menggunakan `resize2fs`.

---

## Masalah

```
Couldn't find valid filesystem superblock
```

Penyebab:

Perintah dijalankan pada `/dev/sda`.

Solusi:

Filesystem Ubuntu berada pada:

```
/dev/sda2
```

Perintah yang benar:

```bash
sudo resize2fs /dev/sda2
```

---

# 5.16 Dokumentasi Screenshot

Dokumentasi yang disarankan untuk dilampirkan pada laporan:

- Konfigurasi Adapter VirtualBox
- File Netplan
- Output `ip a`
- Output `ip route`
- Output `lsblk`
- Output `df -h`
- Output `growpart`
- Output `resize2fs`
- Output `ping 7.7.7.1`
- Output `ping google.com`

---

# 5.17 Kesimpulan

Implementasi Ubuntu Server DMZ berhasil dilakukan dengan konfigurasi jaringan statis menggunakan Netplan.

Server telah terhubung ke Router MikroTik melalui jaringan DMZ dengan alamat IP **7.7.7.2/30**, menggunakan gateway **7.7.7.1**, dan mampu mengakses Internet melalui mekanisme NAT pada Router MikroTik.

Selain itu, kapasitas penyimpanan virtual berhasil ditingkatkan dari **5 GB menjadi 30 GB**, diikuti dengan proses resize partisi dan filesystem tanpa kehilangan data. Kapasitas penyimpanan yang lebih besar memastikan server siap digunakan untuk menjalankan Docker Engine, Nginx Reverse Proxy, Suricata IDS, serta dua aplikasi web yang akan diimplementasikan pada tahap berikutnya.

Konfigurasi yang diterapkan menjadi fondasi utama bagi implementasi layanan pada zona DMZ sesuai dengan prinsip segmentasi jaringan dan keamanan yang ditetapkan dalam proyek Virtualisasi dan Keamanan Jaringan.
