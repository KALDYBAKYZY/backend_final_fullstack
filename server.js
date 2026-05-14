require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { initWebSocket } = require('./src/websocket/wsServer');

const authRoutes = require('./src/routes/auth');
const roomRoutes = require('./src/routes/rooms');
const noteRoutes = require('./src/routes/notes');
const messageRoutes = require('./src/routes/messages');
const fileRoutes = require('./src/routes/files');

const app = express();
const server = http.createServer(app);

// Init WebSocket on the SAME http server
initWebSocket(server);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/studyhub')
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB error:', err));

module.exports = { app, server };