// backend/src/server.js
const express = require('express');
const pool = require('./config/db'); // <-- ahora sí existe ./db.js

const app = express();
const PORT = process.env.PORT || 8080;

// Comprobación rápida de conexión a DB (puedes dejarla o quitarla luego)
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('DB healthcheck error:', err);
  } else {
    console.log('DB time:', res.rows[0]);
  }
});
