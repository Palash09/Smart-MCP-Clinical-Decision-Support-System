const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import middleware and routes
const { errorHandler } = require('../middleware/errorHandler');
const { rateLimiter } = require('../middleware/rateLimiter');
const { authMiddleware } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// Import routes
const patientRoutes = require('../routes/patients');
const decisionRoutes = require('../routes/decisions');
const clinicalRoutes = require('../routes/clinical');
const alertRoutes = require('../routes/alerts');
const mcpRoutes = require('../routes/mcp');
const advancedRoutes = require('../routes/advanced');

// Import services
const { initializeMCPServer } = require('../services/mcpServer');
const { initializeFHIRClient } = require('../services/fhirClient');
const { initializeDatabase } = require('../services/database');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3001",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Serve static files
app.use(express.static('public'));

// Request timeout middleware
app.use((req, res, next) => {
  const timeout = 25000; // 25 seconds
  req.setTimeout(timeout, () => {
    logger.warn(`Request timeout after ${timeout}ms`, { 
      url: req.url, 
      method: req.method 
    });
    if (!res.headersSent) {
      res.status(408).json({
        error: 'Request timeout',
        message: 'The request took too long to process'
      });
    }
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/patients', authMiddleware, patientRoutes);
app.use('/api/decisions', authMiddleware, decisionRoutes);
app.use('/api/clinical', authMiddleware, clinicalRoutes);
app.use('/api/alerts', authMiddleware, alertRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/advanced', advancedRoutes);

// WebSocket for real-time updates
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-patient-room', (patientId) => {
    socket.join(`patient-${patientId}`);
    logger.info(`Client ${socket.id} joined patient room: ${patientId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Initialize services
async function initializeServices() {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Database initialized successfully');
    
    // Initialize FHIR client
    await initializeFHIRClient();
    logger.info('FHIR client initialized successfully');
    
    // Initialize MCP server
    await initializeMCPServer();
    logger.info('MCP server initialized successfully');
    
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  await initializeServices();
  
  // Set server timeouts
  server.timeout = 30000; // 30 seconds
  server.keepAliveTimeout = 65000; // 65 seconds
  server.headersTimeout = 66000; // 66 seconds
  
  server.listen(PORT, () => {
    logger.info(`Smart CDSS running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
    logger.info(`Server timeout: ${server.timeout}ms`);
    logger.info(`Keep-alive timeout: ${server.keepAliveTimeout}ms`);
  });
}

// Graceful shutdown
function gracefulShutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);
  
  // Stop accepting new connections
  server.close(() => {
    logger.info('Server closed');
    
    // Close all socket connections
    io.close(() => {
      logger.info('Socket.IO server closed');
      process.exit(0);
    });
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
    error: error
  });
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', {
    promise,
    reason: reason instanceof Error ? reason.stack : reason,
    error: reason
  });
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Export for testing
module.exports = { app, server, io };

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
} 