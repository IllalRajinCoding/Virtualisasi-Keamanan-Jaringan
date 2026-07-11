'use strict';

const express        = require('express');
const path           = require('path');
const methodOverride = require('method-override');
const db             = require('./db');
const productsRouter = require('./routes/products');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── View Engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '../public')));

// ─── Pass locals ke semua views ───────────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.appName    = 'Product Store';
  res.locals.currentPath = req.path;
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/products'));

app.use('/products', productsRouter);

// Health check — wajib untuk Nginx upstream check
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({
      status:    'OK',
      app:       'app1-product-store',
      db:        'connected',
      dbHost:    process.env.DB_HOST,
      dbName:    process.env.DB_NAME,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status:    'ERROR',
      app:       'app1-product-store',
      db:        'disconnected',
      error:     err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// 404
app.use((req, res) => res.status(404).render('404'));

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).render('error', { message: err.message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n[App1] ✓ Product Store → http://0.0.0.0:${PORT}`);
  console.log(`[App1]   DB  : ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`);
  console.log(`[App1]   ENV : ${process.env.NODE_ENV || 'development'}\n`);
});
