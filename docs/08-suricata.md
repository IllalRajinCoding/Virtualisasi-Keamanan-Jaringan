# BAB 10
# Implementasi Suricata IDS

## 10.1 Pendahuluan

Pada tahap ini dilakukan implementasi Intrusion Detection System (IDS) menggunakan **Suricata** pada Ubuntu Server yang berada di segmen **DMZ**.

Suricata berfungsi untuk memonitor seluruh lalu lintas jaringan yang melewati server DMZ, kemudian mendeteksi aktivitas mencurigakan berdasarkan rule bawaan maupun rule yang dibuat sendiri (Custom Rules).

Pada implementasi ini Suricata dijalankan dalam **IDS Mode**, sehingga hanya melakukan proses monitoring dan menghasilkan alert tanpa memblokir paket jaringan.

---

# 10.2 Tujuan

Implementasi Suricata bertujuan untuk:

- Mendeteksi serangan terhadap Web Server.
- Mendeteksi SQL Injection.
- Mendeteksi Cross Site Scripting (XSS).
- Mendeteksi Port Scanning.
- Menyimpan seluruh alert ke dalam file log.

---

# 10.3 Arsitektur

```
                Internet
                    │
             MikroTik Router
                    │
             Ubuntu Server (DMZ)
                    │
      ┌─────────────┴─────────────┐
      │                           │
   Suricata IDS                Nginx
                                    │
                   ┌────────────────┴───────────────┐
                   │                                │
                APP1                           APP2
              Node.js                        Flask
```

Suricata memonitor interface jaringan Ubuntu Server sehingga seluruh trafik menuju aplikasi akan dianalisis.

---

# 10.4 Instalasi Suricata

Update repository Ubuntu.

```bash
sudo apt update
```

Install Suricata.

```bash
sudo apt install suricata -y
```

Verifikasi instalasi.

```bash
suricata --version
```

Contoh hasil:

```
Suricata 8.x.x
```

---

# 10.5 Konfigurasi Interface

Menentukan interface jaringan yang akan dipantau.

Menampilkan seluruh interface.

```bash
ip -br addr
```

Hasil:

```
lo
enp0s3
docker0
br-xxxx
```

Interface yang digunakan adalah:

```
enp0s3
```

karena interface tersebut terhubung ke jaringan DMZ.

---

# 10.6 Update Community Rules

Mengunduh Emerging Threat Rules.

```bash
sudo suricata-update
```

Setelah selesai akan terbentuk file:

```
/var/lib/suricata/rules/suricata.rules
```

---

# 10.7 Konfigurasi Suricata

File konfigurasi utama berada pada:

```
/etc/suricata/suricata.yaml
```

Konfigurasi rule:

```yaml
default-rule-path: /var/lib/suricata/rules

rule-files:
  - suricata.rules
  - custom.rules
```

---

# 10.8 Custom Rules

Custom Rule disimpan pada:

```
/var/lib/suricata/rules/custom.rules
```

Isi file:

```rules
alert http any any -> any any (msg:"VDKJ SQL Injection Attempt"; content:"union select"; nocase; sid:1000001; rev:1;)

alert http any any -> any any (msg:"VDKJ XSS Attempt"; content:"<script>"; nocase; sid:1000002; rev:1;)

alert tcp any any -> any any (msg:"VDKJ Port Scan"; flags:S; threshold:type both,track by_src,count 20,seconds 10; sid:1000003; rev:1;)
```

Rule tersebut digunakan untuk mendeteksi:

- SQL Injection
- Cross Site Scripting (XSS)
- Port Scanning

---

# 10.9 Validasi Konfigurasi

Melakukan pengecekan konfigurasi sebelum service dijalankan.

```bash
sudo suricata -T -c /etc/suricata/suricata.yaml
```

Hasil:

```
Configuration provided was successfully loaded.
```

Hal tersebut menunjukkan bahwa konfigurasi Suricata telah valid.

---

# 10.10 Menjalankan Service

Enable service.

```bash
sudo systemctl enable suricata
```

Restart service.

```bash
sudo systemctl restart suricata
```

Melihat status.

```bash
sudo systemctl status suricata
```

Status yang diharapkan:

```
Active: active (running)
```

---

# 10.11 Lokasi Log

Log Suricata tersimpan pada:

```
/var/log/suricata/
```

Berisi:

```
eve.json
fast.log
stats.log
suricata.log
```

Melihat alert secara realtime.

```bash
sudo tail -f /var/log/suricata/eve.json
```

---

# 10.12 Pengujian

## SQL Injection

Melakukan request:

```
http://7.7.7.2/?id=1 UNION SELECT
```

Expected Result

```
VDKJ SQL Injection Attempt
```

---

## Cross Site Scripting (XSS)

Melakukan request:

```
http://7.7.7.2/?name=<script>alert(1)</script>
```

Expected Result

```
VDKJ XSS Attempt
```

---

## Port Scanning

Melakukan scanning.

```bash
nmap -sS 7.7.7.2
```

Expected Result

```
VDKJ Port Scan
```

---

# 10.13 Verifikasi Alert

Alert dapat dilihat melalui:

```bash
sudo tail -f /var/log/suricata/eve.json
```

Contoh:

```json
{
  "event_type":"alert",
  "alert":{
      "signature":"VDKJ SQL Injection Attempt"
  }
}
```

---

# 10.14 Hasil Implementasi

Implementasi Suricata berhasil dilakukan dengan hasil:

| Komponen | Status |
|----------|--------|
| Install Suricata | ✅ |
| Community Rules | ✅ |
| Custom Rules | ✅ |
| IDS Mode | ✅ |
| Logging | ✅ |
| SQL Injection Detection | ✅ |
| XSS Detection | ✅ |
| Port Scan Detection | ✅ |

---

# 10.15 Dokumentasi Screenshot

Tambahkan screenshot berikut:

- Instalasi Suricata
- Hasil `suricata --version`
- Konfigurasi `suricata.yaml`
- Isi `custom.rules`
- Hasil `suricata -T`
- Status service Suricata
- Folder `/var/log/suricata`
- Isi `eve.json`
- Pengujian SQL Injection
- Pengujian XSS
- Pengujian Port Scan

---

# Kesimpulan

Suricata berhasil diimplementasikan sebagai Intrusion Detection System (IDS) pada Ubuntu Server DMZ. Sistem mampu mendeteksi berbagai aktivitas mencurigakan melalui Community Rules maupun Custom Rules. Seluruh alert berhasil dicatat pada log `eve.json` sehingga administrator dapat melakukan monitoring dan analisis terhadap potensi serangan pada layanan web yang berjalan di lingkungan DMZ.
