#!/bin/bash

set -e

echo "[+] Installing Suricata..."

sudo add-apt-repository ppa:oisf/suricata-stable -y

sudo apt update

sudo apt install suricata -y

sudo systemctl enable suricata
sudo systemctl start suricata

echo "[✓] Suricata Installed"
