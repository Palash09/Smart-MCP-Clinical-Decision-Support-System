const fs = require('fs');
const path = require('path');

// Environment configuration
const envConfig = `# Environment Configuration for Smart CDSS

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mcp-fhir-cdss

# FHIR Configuration
FHIR_BASE_URL=https://r4.smarthealthit.org

# Client Configuration
CLIENT_URL=http://localhost:3001

# Logging Configuration
LOG_LEVEL=info

# Security Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# MCP Configuration
MCP_SERVER_PORT=3002
MCP_RESOURCES_PATH=./mcp-resources
`;

// Write to .env file
const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, envConfig);

console.log('✅ .env file created successfully!');
console.log('📝 Please edit the .env file and replace "your_openai_api_key_here" with your actual OpenAI API key.');
console.log('🔑 You can get your API key from: https://platform.openai.com/api-keys');
console.log('');
console.log('After updating the .env file, restart the server to use LLM-powered features.'); 