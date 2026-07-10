#!/bin/bash

set -e

echo "========================================"
echo " Ubuntu Server DMZ Setup"
echo "========================================"

chmod +x *.sh

bash install-tools.sh
bash install-docker.sh
bash install-nginx.sh
bash install-suricata.sh
bash install-fail2ban.sh

echo
echo "========================================"
echo " Setup selesai."
echo "========================================"

echo
echo "Silakan jalankan:"
echo "bash docker-compose.sh"
