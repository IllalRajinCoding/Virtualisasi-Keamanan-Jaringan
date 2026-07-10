#!/bin/bash

set -e

echo "[+] Installing basic packages..."

sudo apt update

sudo apt install -y \
curl \
wget \
git \
nano \
vim \
net-tools \
htop \
unzip \
software-properties-common \
ca-certificates \
gnupg \
lsb-release

echo "[✓] Basic packages installed."
