# BAB 4 - Implementasi MikroTik CHR

## 4.1 Tujuan

Pada tahap ini dilakukan implementasi router virtual menggunakan MikroTik Cloud Hosted Router (CHR) sebagai gateway utama yang menghubungkan tiga segmen jaringan, yaitu:

- External Network (WAN)
- DMZ (Demilitarized Zone)
- LAN (Internal Network)

Router juga dikonfigurasi sebagai firewall, NAT Gateway, dan pengendali komunikasi antar segmen jaringan.

---

# 4.2 Topologi Jaringan

```text
                    INTERNET
                        │
                VirtualBox NAT
                        │
                  WAN (DHCP)
                  MikroTik CHR
         ┌──────────────┴──────────────┐
         │                             │
      DMZ                           LAN
   7.7.7.1/30                192.168.56.1/24
         │                             │
 Ubuntu Server DMZ             Ubuntu Database
    7.7.7.2                    192.168.56.10
         │
         ├── Nginx
         ├── Docker App1
         ├── Docker App2
         └── Suricata
```

---
# Persiapan Virtual Machine

Sebelum melakukan import konfigurasi MikroTik, pastikan topologi virtual telah dikonfigurasi sesuai dengan implementasi proyek.

Konfigurasi ini dibuat menggunakan **Oracle VirtualBox 7.x**.

---

# Konfigurasi Network Adapter MikroTik CHR

Router MikroTik CHR menggunakan **4 Network Adapter**.

| Adapter | Mode | Nama Network | Interface MikroTik | Fungsi |
|----------|------|--------------|--------------------|--------|
| Adapter 1 | NAT | - | WAN | Koneksi Internet |
| Adapter 2 | Internal Network | DMZ | DMZ | Jaringan Server Publik |
| Adapter 3 | Internal Network | LAN | LAN | Jaringan Internal |
| Adapter 4 | Host-Only Adapter | VirtualBox Host-Only Ethernet Adapter | MGMT | Jaringan Management (Winbox) |

---

# 4.3 Konfigurasi Interface

| Interface | Nama | Fungsi |
|------------|------|---------|
| ether1 | WAN | Internet |
| ether2 | DMZ | Server Publik |
| ether3 | LAN | Database Internal |
| ether4 | MGMT | Management Winbox |

Konfigurasi:

```rsc
/interface
set ether1 name=WAN
set ether2 name=DMZ
set ether3 name=LAN
set ether4 name=MGMT
```

---

# 4.4 Konfigurasi IP Address

| Interface | Address |
|------------|---------------|
| WAN | DHCP Client |
| DMZ | 7.7.7.1/30 |
| LAN | 192.168.56.1/24 |
| MGMT | 192.168.100.1/24 |

Konfigurasi:

```rsc
/ip address

add address=7.7.7.1/30 interface=DMZ
add address=192.168.56.1/24 interface=LAN
add address=192.168.100.1/24 interface=MGMT
```

---

# 4.5 DHCP Client

Interface WAN memperoleh alamat IP secara otomatis dari VirtualBox NAT.

```rsc
/ip dhcp-client
add interface=WAN
```

Status:

```
WAN
Status : Bound
IP : 10.0.2.15
Gateway : 10.0.2.2
```

---

# 4.6 Konfigurasi DNS

Router menggunakan DNS publik Google dan Cloudflare.

```rsc
/ip dns

set servers=8.8.8.8,1.1.1.1 allow-remote-requests=yes
```

---

# 4.7 Routing

Default Route diperoleh secara otomatis dari DHCP Client.

```
0.0.0.0/0
Gateway : 10.0.2.2
```

---

# 4.8 NAT

## Source NAT (Masquerade)

Seluruh trafik dari LAN dan DMZ diterjemahkan ke alamat IP WAN agar dapat mengakses Internet.

```rsc
/ip firewall nat

add chain=srcnat \
out-interface=WAN \
action=masquerade \
comment="Internet NAT"
```

---

## Destination NAT

HTTP

```rsc
add chain=dstnat \
protocol=tcp \
dst-port=80 \
in-interface=WAN \
action=dst-nat \
to-addresses=7.7.7.2 \
to-ports=80 \
comment="HTTP to Nginx"
```

HTTPS

```rsc
add chain=dstnat \
protocol=tcp \
dst-port=443 \
in-interface=WAN \
action=dst-nat \
to-addresses=7.7.7.2 \
to-ports=443 \
comment="HTTPS to Nginx"
```

---

# 4.9 Firewall INPUT

Firewall INPUT digunakan untuk melindungi Router MikroTik dari akses yang tidak sah.

Rule yang diterapkan:

| Rule | Fungsi |
|------|---------|
| Drop Blacklist | Memblokir IP berbahaya |
| Detect Excessive Connection | Anti brute-force sederhana |
| Detect Port Scanner | Deteksi Nmap Scan |
| Established Related | Mengizinkan koneksi yang sah |
| Drop Invalid | Menghapus paket invalid |
| ICMP | Mengizinkan Ping |
| Winbox | Hanya MGMT |
| SSH | Hanya LAN |
| Drop All | Menolak seluruh akses lainnya |

---

# 4.10 Firewall FORWARD

Firewall FORWARD mengatur komunikasi antar segmen jaringan.

## WAN → DMZ

Mengizinkan:

- HTTP (80)
- HTTPS (443)

## DMZ → LAN

Mengizinkan:

- MySQL (3306)

## LAN → Internet

Mengizinkan seluruh koneksi keluar.

## DMZ → Internet

Mengizinkan update paket dan Docker Pull.

## WAN → LAN

Ditolak.

## DMZ → LAN

Selain port MySQL ditolak.

## Docker

Port 3000 dan 5000 tidak dapat diakses langsung dari Internet.

---

# 4.11 Address List

Address List digunakan untuk menyimpan IP yang dianggap berbahaya.

Contoh:

```rsc
/ip firewall address-list

add list=blacklist address=192.168.100.20
```

Firewall:

```rsc
add chain=input \
src-address-list=blacklist \
action=drop
```

---

# 4.12 Anti Port Scan

Port Scan dideteksi menggunakan fitur PSD.

```rsc
add chain=input \
protocol=tcp \
psd=21,3s,3,1 \
action=add-src-to-address-list \
address-list=port_scanner
```

Kemudian:

```rsc
add chain=input \
src-address-list=port_scanner \
action=drop
```

---

# 4.13 HTTP Flood Protection

Firewall membatasi jumlah koneksi HTTP menuju Web Server.

```rsc
connection-limit=100,32
```

Rule ini bertujuan mengurangi serangan HTTP Flood sederhana.

---

# 4.14 Logging

Firewall mencatat aktivitas penting.

Blacklist

```
BLACKLIST:
```

Port Scanner

```
PORTSCAN:
```

Log dapat dilihat menggunakan:

```rsc
/log print
```

---

# 4.15 Pengujian

| Pengujian | Hasil |
|-----------|-------|
| Ping Internet | Berhasil |
| DNS Resolve | Berhasil |
| NAT | Berhasil |
| HTTP Forward | Berhasil |
| HTTPS Forward | Berhasil |
| Winbox MGMT | Berhasil |
| SSH LAN | Berhasil |
| WAN → LAN | Ditolak |
| DMZ → LAN selain 3306 | Ditolak |
| Port Scan Detection | Berhasil |
| Blacklist | Berhasil |

---

# 4.16 Kesimpulan

Implementasi Router MikroTik CHR berhasil dilakukan sebagai gateway utama pada arsitektur jaringan tersegmentasi.

Router berhasil menjalankan fungsi routing, NAT, firewall, segmentasi jaringan, port forwarding, address list, serta mekanisme perlindungan terhadap port scanning dan koneksi berlebihan.

Konfigurasi yang diterapkan mengikuti prinsip **least privilege**, yaitu hanya mengizinkan trafik yang benar-benar diperlukan dan menolak seluruh akses lainnya (default deny). Pendekatan ini meningkatkan keamanan jaringan sekaligus memenuhi seluruh kebutuhan implementasi yang ditetapkan pada proyek Virtualisasi dan Keamanan Jaringan.
