const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Import routes
const patientRoutes = require('../../src/routes/patients');
const decisionRoutes = require('../../src/routes/decisions');
const clinicalRoutes = require('../../src/routes/clinical');
const alertRoutes = require('../../src/routes/alerts');
const mcpRoutes = require('../../src/routes/mcp');
const advancedRoutes = require('../../src/routes/advanced');

// Import services
const { initializeDatabase } = require('../../src/services/database');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// Initialize database
let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

// Routes
app.use('/api/patients', async (req, res, next) => {
  await ensureDbInitialized();
  next();
}, patientRoutes);

app.use('/api/decisions', async (req, res, next) => {
  await ensureDbInitialized();
  next();
}, decisionRoutes);

app.use('/api/clinical', async (req, res, next) => {
  await ensureDbInitialized();
  next();
}, clinicalRoutes);

app.use('/api/alerts', async (req, res, next) => {
  await ensureDbInitialized();
  next();
}, alertRoutes);

app.use('/api/mcp', mcpRoutes);

app.use('/api/advanced', async (req, res, next) => {
  await ensureDbInitialized();
  next();
}, advancedRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports.handler = serverless(app); 