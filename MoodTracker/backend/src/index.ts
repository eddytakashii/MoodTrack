import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import moodRoutes from './routes/mood';
import environmentRoutes from './routes/environment';
import alertsRoutes from './routes/alerts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/mood', moodRoutes);
app.use('/environment', environmentRoutes);
app.use('/alerts', alertsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.info(`Servidor rodando em http://localhost:${PORT} (health: /health)`);
});
