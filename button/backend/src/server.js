
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const http = require('http');
const { Server } = require('socket.io');
const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:3001'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS origin denied'));
    }
  },
  credentials: true,
};

// Trabalhar atrás de proxy reverso (Heroku, Nginx, Cloudflare etc.)
app.enable('trust proxy');

// Ative FORCE_HTTPS somente quando houver proxy TLS na frente do Node.
app.use((req, res, next) => {
  const isSecure = req.secure || req.get('x-forwarded-proto') === 'https';
  if (!isSecure && process.env.FORCE_HTTPS === 'true') {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  next();
});

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Serve frontend build if present
const path = require('path');
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Fallback to index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  const indexFile = path.join(publicPath, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) next();
  });
});

// Rota raiz para status
app.get('/', (req, res) => {
  res.send('BACKEND BUTTON RODANDO!');
});

// Dashboard da receber (simplificado)
app.get('/dashboard', (req, res) => {
  res.json({ message: 'Dashboard BUTTON - Em desenvolvimento' });
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Comunicação pedir-receber
io.on('connection', (socket) => {
  socket.on('novo_pedido', (pedido) => {
    // Envia para todos os recebers conectados
    io.emit('novo_pedido', pedido);
  });
  const encaminharMensagemFornecedor = (msg) => {
    // Envia a resposta da loja para os compradores conectados.
    io.emit('mensagem_fornecedor', msg);
  };
  socket.on('mensagem_fornecedor', encaminharMensagemFornecedor);
  socket.on('mensagem_receber', encaminharMensagemFornecedor);
  socket.on('mensagem_comprador', (msg) => {
    socket.broadcast.emit('mensagem_comprador', msg);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 SERVIDOR RODANDO PORTA ${PORT}`);
});
