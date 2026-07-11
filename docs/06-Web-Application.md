# BAB 8 -- Web Application

## Arsitektur

-   App1: Node.js + Express (Port 3000)
-   App2: Python Flask (Port 3001)
-   Database: MySQL di 192.168.56.10

## App1

-   Mengambil data tabel `products`.
-   Endpoint:
    -   `/`
    -   `/health`

## App2

-   Mengambil data tabel `employees`.
-   Endpoint:
    -   `/`
    -   `/health`

## Docker

Masing-masing aplikasi memiliki Dockerfile sendiri dan dijalankan
menggunakan Docker Compose.

``` bash
docker compose up -d --build
```

## Docker Compose

Menjalankan: - app1 - app2

## Pengujian

``` bash
curl http://localhost:3000
curl http://localhost:3001
docker ps
docker compose ps
```

## Hasil

-   App1 terkoneksi ke MySQL.
-   App2 terkoneksi ke MySQL.
-   Healthcheck berjalan.

## Screenshot

> Tambahkan screenshot Docker Compose, App1, dan App2.
