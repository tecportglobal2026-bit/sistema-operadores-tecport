const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorMiddleware);

module.exports = app;
