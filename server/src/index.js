import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import router from './routes.js';
import 'dotenv/config';

const PORT = process.env.PORT || 8080;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in environment variables');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: CORS_ORIGIN } });

app.set('io', io);
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use('/api', router);

io.on('connection', (socket) => {
  console.log(`📡 Client connected: ${socket.id}`);
  socket.on('join', (wa_id) => {
    console.log(`👥 User joined room: ${wa_id}`);
    socket.join(String(wa_id));
  });
});

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected to Atlas');
    server.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
})();
