#!/bin/bash

set -e

echo "======================================="
echo " VDKJ - Generate Self Signed SSL"
echo "======================================="

SSL_DIR="/etc/nginx/ssl"

echo "[+] Membuat direktori SSL..."
sudo mkdir -p "$SSL_DIR"

echo "[+] Membuat Self-Signed Certificate..."

sudo openssl req \
-x509 \
-nodes \
-days 365 \
-newkey rsa:4096 \
-keyout "$SSL_DIR/vdkj.key" \
-out "$SSL_DIR/vdkj.crt" \
-subj "/C=ID/ST=West Java/L=Depok/O=STT Terpadu Nurul Fikri/OU=Teknik Informatika/CN=localhost"

echo
echo "[✓] SSL Certificate berhasil dibuat"
echo
echo "Certificate : $SSL_DIR/vdkj.crt"
echo "Private Key : $SSL_DIR/vdkj.key"
echo
echo "Masa berlaku : 365 hari"
echo
