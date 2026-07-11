# BAB 7 -- Firewall Database (UFW)

## Tujuan

Mengamankan server database sehingga hanya VM Ubuntu DMZ yang dapat
mengakses layanan MySQL pada port 3306.

## Topologi

-   Database Server: 192.168.56.10
-   Ubuntu DMZ: 7.7.7.2
-   MikroTik: Firewall antar segmen

## Instalasi UFW

``` bash
sudo apt update
sudo apt install ufw -y
```

## Konfigurasi

``` bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 7.7.7.2 to any port 3306 proto tcp
sudo ufw allow ssh
sudo ufw enable
```

## Verifikasi

``` bash
sudo ufw status verbose
```

Hasil yang diharapkan: - Port 3306 hanya dapat diakses dari IP
7.7.7.2. - Host lain ditolak.

## Pengujian

-   Dari Ubuntu DMZ: koneksi MySQL berhasil.
-   Dari host lain: koneksi gagal.

## Screenshot

> Tambahkan screenshot konfigurasi UFW dan hasil `ufw status`.
