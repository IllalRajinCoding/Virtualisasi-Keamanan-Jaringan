# Lampiran A - Panduan Restore Konfigurasi MikroTik CHR

## Tujuan

Dokumen ini menjelaskan cara menggunakan file konfigurasi `mikrotik-final.rsc` pada perangkat MikroTik CHR sehingga konfigurasi dapat direplikasi oleh dosen, asisten praktikum, maupun anggota kelompok lain.

---

# Persyaratan Sistem

Sebelum melakukan import konfigurasi, pastikan lingkungan yang digunakan memenuhi persyaratan berikut.

## RouterOS

- MikroTik CHR RouterOS v7.x
- Disarankan menggunakan versi yang sama dengan saat proyek dibuat.

Contoh:

```
RouterOS 7.18.x
```

---

## Hypervisor

Konfigurasi ini diuji menggunakan:

- VirtualBox 7.x

Konfigurasi juga dapat digunakan pada VMware dengan penyesuaian interface.

---

## Jumlah Interface

Router wajib memiliki **4 buah interface Ethernet**.

| Interface | Fungsi |
|------------|---------|
| ether1 | WAN |
| ether2 | DMZ |
| ether3 | LAN |
| ether4 | Management |

Jika jumlah interface kurang dari empat, beberapa konfigurasi tidak akan bekerja.

---

# Topologi

```
                    INTERNET
                        │
                 VirtualBox NAT
                        │
                    ether1 (WAN)
                   MikroTik CHR
         ┌──────────────┴──────────────┐
         │                             │
      ether2                      ether3
        DMZ                         LAN
   7.7.7.1/30                 192.168.56.1/24
         │                             │
 Ubuntu Server DMZ             Ubuntu Database
      7.7.7.2                 192.168.56.10

                ether4
              Management
          192.168.100.1/24
```

---

# Struktur Interface

File konfigurasi mengasumsikan urutan interface sebagai berikut.

| Interface | Nama |
|------------|------|
| ether1 | WAN |
| ether2 | DMZ |
| ether3 | LAN |
| ether4 | MGMT |

Jika urutan interface berbeda, ubah terlebih dahulu sebelum melakukan import.

---

# Cara Import Konfigurasi

## Menggunakan Winbox

Masuk ke menu

```
Files
```

Upload

```
mikrotik-final.rsc
```

Setelah file berhasil diupload, buka Terminal kemudian jalankan:

```rsc
/import file-name=mikrotik-final.rsc
```

---

## Menggunakan Terminal

Copy file ke router menggunakan SCP atau Winbox kemudian jalankan

```rsc
/import file-name=mikrotik-final.rsc
```

---

# Verifikasi Konfigurasi

Setelah import selesai lakukan pengecekan berikut.

## Interface

```rsc
/interface print
```

Output yang diharapkan

```
WAN
DMZ
LAN
MGMT
```

---

## IP Address

```rsc
/ip address print
```

Output

```
WAN     DHCP
DMZ     7.7.7.1/30
LAN     192.168.56.1/24
MGMT    192.168.100.1/24
```

---

## Routing

```rsc
/ip route print
```

Harus terdapat default route

```
0.0.0.0/0
```

---

## NAT

```rsc
/ip firewall nat print
```

Minimal terdapat

```
Masquerade

HTTP DNAT

HTTPS DNAT
```

---

## Firewall

```rsc
/ip firewall filter print
```

Pastikan seluruh rule berhasil diimport tanpa status **invalid**.

---

# Pengujian

Setelah import konfigurasi lakukan pengujian berikut.

| Pengujian | Hasil |
|-----------|-------|
| Ping Internet | Berhasil |
| DNS Resolve | Berhasil |
| NAT Masquerade | Berhasil |
| HTTP Forward | Berhasil |
| HTTPS Forward | Berhasil |
| Winbox MGMT | Berhasil |
| SSH LAN | Berhasil |
| WAN → LAN | Ditolak |
| DMZ → LAN selain MySQL | Ditolak |

---

# Restore Konfigurasi

Jika konfigurasi ingin digunakan pada router baru, disarankan melakukan reset konfigurasi terlebih dahulu.

```rsc
/system reset-configuration \
no-defaults=yes \
skip-backup=yes
```

Setelah router reboot, lakukan proses import kembali.

---

# Export Konfigurasi

Untuk menghasilkan file konfigurasi baru gunakan

```rsc
/export file=mikrotik-final
```

File akan tersimpan pada menu

```
Files
```

dengan nama

```
mikrotik-final.rsc
```

---

# Backup Binary

Selain export konfigurasi, disarankan membuat backup binary.

```rsc
/system backup save name=mikrotik-final
```

Backup akan menghasilkan

```
mikrotik-final.backup
```

Perbedaan kedua file:

| File | Fungsi |
|------|--------|
| .rsc | Script konfigurasi yang dapat dibaca dan diedit |
| .backup | Backup penuh RouterOS, hanya cocok untuk restore pada perangkat dengan versi RouterOS yang kompatibel |

---

# Syarat dan Ketentuan Penggunaan

File konfigurasi ini disusun sebagai bagian dari Proyek Mata Kuliah **Virtualisasi dan Keamanan Jaringan**.

## Ketentuan

1. Konfigurasi ditujukan untuk keperluan pembelajaran dan praktikum.
2. Pengguna wajib menyesuaikan alamat IP apabila topologi berbeda.
3. Pengguna wajib menyesuaikan nama interface apabila urutan interface berubah.
4. File ini tidak menyertakan konfigurasi Docker, Nginx, Suricata, maupun Database.
5. Setelah proses import selesai, lakukan verifikasi seluruh interface sebelum digunakan.
6. Pengguna bertanggung jawab terhadap perubahan konfigurasi yang dilakukan setelah proses import.

---

# Keterbatasan

Konfigurasi ini dibuat berdasarkan lingkungan berikut:

- VirtualBox
- MikroTik CHR
- RouterOS v7.x
- Ubuntu Server 24.04 LTS
- Topologi 1 WAN, 1 DMZ, 1 LAN, 1 Management

Apabila digunakan pada lingkungan yang berbeda, penyesuaian konfigurasi mungkin diperlukan.
