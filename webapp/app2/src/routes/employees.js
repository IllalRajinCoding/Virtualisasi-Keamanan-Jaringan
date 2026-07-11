'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ─── GET / — Daftar karyawan ──────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [employees] = await db.query('SELECT * FROM employees ORDER BY id DESC');

    // Hitung jumlah per departemen
    const deptCount = employees.reduce((acc, e) => {
      acc[e.department] = (acc[e.department] || 0) + 1;
      return acc;
    }, {});

    res.render('employees/list', {
      employees,
      totalEmployees: employees.length,
      totalDepts:     Object.keys(deptCount).length,
      flash:          req.query.flash || null,
    });
  } catch (err) {
    console.error('[Employees] List error:', err.message);
    res.status(500).render('error', { message: 'Gagal memuat data karyawan: ' + err.message });
  }
});

// ─── GET /add — Form tambah karyawan ─────────────────────────────────────────
router.get('/add', (req, res) => {
  res.render('employees/form', {
    employee:   null,
    formAction: '/employees',
    pageTitle:  'Tambah Karyawan',
    error:      null,
  });
});

// ─── POST / — Buat karyawan baru ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { fullname, department } = req.body;
  if (!fullname || !department) {
    return res.render('employees/form', {
      employee:   { fullname, department },
      formAction: '/employees',
      pageTitle:  'Tambah Karyawan',
      error:      'Nama lengkap dan departemen wajib diisi.',
    });
  }
  try {
    await db.query(
      'INSERT INTO employees (fullname, department) VALUES (?, ?)',
      [fullname.trim(), department.trim()]
    );
    res.redirect('/employees?flash=added');
  } catch (err) {
    console.error('[Employees] Create error:', err.message);
    res.status(500).render('error', { message: 'Gagal menambah karyawan: ' + err.message });
  }
});

// ─── GET /:id/edit — Form edit karyawan ──────────────────────────────────────
router.get('/:id/edit', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.redirect('/employees');
    res.render('employees/form', {
      employee:   rows[0],
      formAction: `/employees/${req.params.id}?_method=PUT`,
      pageTitle:  'Edit Karyawan',
      error:      null,
    });
  } catch (err) {
    console.error('[Employees] Edit error:', err.message);
    res.status(500).render('error', { message: 'Gagal memuat karyawan: ' + err.message });
  }
});

// ─── PUT /:id — Update karyawan ───────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { fullname, department } = req.body;
  try {
    await db.query(
      'UPDATE employees SET fullname = ?, department = ? WHERE id = ?',
      [fullname.trim(), department.trim(), req.params.id]
    );
    res.redirect('/employees?flash=updated');
  } catch (err) {
    console.error('[Employees] Update error:', err.message);
    res.status(500).render('error', { message: 'Gagal update karyawan: ' + err.message });
  }
});

// ─── DELETE /:id — Hapus karyawan ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.redirect('/employees?flash=deleted');
  } catch (err) {
    console.error('[Employees] Delete error:', err.message);
    res.status(500).render('error', { message: 'Gagal hapus karyawan: ' + err.message });
  }
});

module.exports = router;
