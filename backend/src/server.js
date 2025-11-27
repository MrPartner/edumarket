// backend/src/server.js
const app = require('./app');          // Express ya configurado (rutas, middlewares)
const pool = require('./config/db');   // Pool de Postgres

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 8080;

console.log(`Starting EduMarket backend in ${NODE_ENV} mode...`);

// Healthcheck de la DB (NO tira el servidor abajo si falla)
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('DB healthcheck error:', err);
  } else {
    console.log('DB time:', res.rows[0]);
  }
});

// Ruta raíz para probar rápido en el navegador
app.get('/', (req, res) => {
  res.send(`EduMarket API running in ${NODE_ENV} mode 🚀`);
});

// Importante: usar PORT que inyecta Railway
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
