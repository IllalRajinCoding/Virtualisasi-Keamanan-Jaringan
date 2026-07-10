'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Helper: format harga ke Rupiah
const formatRupiah = (price) =>
  new Intl.NumberFormat('id-ID', {
    style:                 'currency',
    currency:              'IDR',
    minimumFractionDigits: 0,
  }).format(price);

// ─── GET / — Daftar semua produk ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products ORDER BY id DESC');
    const totalValue = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
    res.render('products/list', {
      products,
      totalProducts: products.length,
      totalValue:    formatRupiah(totalValue),
      formatRupiah,
      flash:         req.query.flash || null,
    });
  } catch (err) {
    console.error('[Products] List error:', err.message);
    res.status(500).render('error', { message: 'Gagal memuat data produk: ' + err.message });
  }
});

// ─── GET /add — Form tambah produk ───────────────────────────────────────────
router.get('/add', (req, res) => {
  res.render('products/form', {
    product:    null,
    formAction: '/products',
    pageTitle:  'Tambah Produk',
    error:      null,
  });
});

// ─── POST / — Buat produk baru ────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.render('products/form', {
      product:    { name, price },
      formAction: '/products',
      pageTitle:  'Tambah Produk',
      error:      'Nama produk dan harga wajib diisi.',
    });
  }
  try {
    await db.query('INSERT INTO products (name, price) VALUES (?, ?)', [name.trim(), parseFloat(price)]);
    res.redirect('/products?flash=added');
  } catch (err) {
    console.error('[Products] Create error:', err.message);
    res.status(500).render('error', { message: 'Gagal menambah produk: ' + err.message });
  }
});

// ─── GET /:id/edit — Form edit produk ────────────────────────────────────────
router.get('/:id/edit', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.redirect('/products');
    res.render('products/form', {
      product:    rows[0],
      formAction: `/products/${req.params.id}?_method=PUT`,
      pageTitle:  'Edit Produk',
      error:      null,
    });
  } catch (err) {
    console.error('[Products] Edit error:', err.message);
    res.status(500).render('error', { message: 'Gagal memuat produk: ' + err.message });
  }
});

// ─── PUT /:id — Update produk ─────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { name, price } = req.body;
  try {
    await db.query(
      'UPDATE products SET name = ?, price = ? WHERE id = ?',
      [name.trim(), parseFloat(price), req.params.id]
    );
    res.redirect('/products?flash=updated');
  } catch (err) {
    console.error('[Products] Update error:', err.message);
    res.status(500).render('error', { message: 'Gagal update produk: ' + err.message });
  }
});

// ─── DELETE /:id — Hapus produk ───────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.redirect('/products?flash=deleted');
  } catch (err) {
    console.error('[Products] Delete error:', err.message);
    res.status(500).render('error', { message: 'Gagal hapus produk: ' + err.message });
  }
});

module.exports = router;
