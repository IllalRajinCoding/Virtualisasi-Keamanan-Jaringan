'use strict';

const express          = require('express');
const path             = require('path');
const methodOverride   = require('method-override');
const db               = require('./db');
const employeesRouter  = require('./routes/employees');

const app  = express();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
  res.locals.appName     = 'Employee Portal';
  res.locals.currentPath = req.path;
  next();
});

app.get('/', (req, res) => res.redirect('/employees'));

app.use('/employees', employeesRouter);

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({
      status:    'OK',
      app:       'app2-employee-portal',
      db:        'connected',
      dbHost:    process.env.DB_HOST,
      dbName:    process.env.DB_NAME,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status:    'ERROR',
      app:       'app2-employee-portal',
      db:        'disconnected',
      error:     err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.use((req, res) => res.status(404).render('404'));

app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).render('error', { message: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n[App2] ✓ Employee Portal → http://0.0.0.0:${PORT}`);
  console.log(`[App2]   DB  : ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`);
  console.log(`[App2]   ENV : ${process.env.NODE_ENV || 'development'}\n`);
});
