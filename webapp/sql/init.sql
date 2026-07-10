-- ============================================================
-- VDKJ Project — Database Initialization Script
-- Jalankan script ini di MySQL Server (192.168.56.10)
-- Perintah: mysql -u root -p < sql/init.sql
-- ============================================================

-- ============================================================
-- APP 1: Product Store
-- ============================================================
CREATE DATABASE IF NOT EXISTS app1_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Buat user app1 (ganti password sesuai kebutuhan)
CREATE USER IF NOT EXISTS 'app1_user'@'%' IDENTIFIED BY 'Ucup1122#';
GRANT ALL PRIVILEGES ON app1_db.* TO 'app1_user'@'%';

USE app1_db;

CREATE TABLE IF NOT EXISTS products (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Data dummy
INSERT INTO products (name, price) VALUES
('Keyboard Mechanical', 850000),
('Mouse Wireless',      250000),
('Monitor 24 Inch',    2200000);

-- ============================================================
-- APP 2: Employee Portal
-- ============================================================
CREATE DATABASE IF NOT EXISTS app2_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Buat user app2 (ganti password sesuai kebutuhan)
CREATE USER IF NOT EXISTS 'app2_user'@'%' IDENTIFIED BY 'Ucup1122#';
GRANT ALL PRIVILEGES ON app2_db.* TO 'app2_user'@'%';

USE app2_db;

CREATE TABLE IF NOT EXISTS employees (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    fullname   VARCHAR(100),
    department VARCHAR(100)
);

-- Data dummy
INSERT INTO employees (fullname, department) VALUES
('Andi Saputra',  'IT'),
('Budi Santoso',  'Finance'),
('Citra Lestari', 'HR');

-- Terapkan privileges
FLUSH PRIVILEGES;
