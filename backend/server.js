const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const pollController = require('./controllers/pollController');
const pollSocket = require('./sockets/pollSocket');
const chatSocket = require('./sockets/chatSocket');

// Connect to MongoDB
connectDB();

const app = express();

// ✅ CORS Configuration
const corsOptions = {
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use((req, res, next) => {
  console.log(`📥 Incoming ${req.method} ${req.url}`);
  next();
});

app.use(cors(corsOptions));
app.use(express.json());

// ✅ HTTP server and Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// ✅ Set io reference in controller and sockets
pollController.setSocketIO(io);
pollSocket(io);
chatSocket(io);

// ✅ REST API routes (after io is defined)
const pollRoutes = require('./routes/pollRoutes')(io);
app.use('/api/polls', pollRoutes);


// ✅ Default route (optional)
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// ✅ Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
