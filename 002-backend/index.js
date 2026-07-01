import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { startScheduler } from './services/scheduler.js';
import { initSocket } from './services/socketService.js';
import monitorRoutes from './routes/monitorRoutes.js';
import logRoutes from './routes/logRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import telegramRoutes from './routes/telegramRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For dev purposes; tighten in prod
  }
});

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/monitors', monitorRoutes);
app.use('/api', logRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/settings/telegram', telegramRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  initSocket(io);
  startScheduler(io);
  console.log('⏰ Monitor scheduler started');
});
