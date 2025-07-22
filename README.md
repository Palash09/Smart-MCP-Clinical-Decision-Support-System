# Smart CDSS

A modern clinical decision support system designed to assist healthcare professionals with clinical decision-making, leveraging model-context protocol.

## 🚀 Features

### Core Features
- **Patient Management**: Complete patient data management with demographics, conditions, medications, and vital signs
- **Clinical Decision Support**: AI-powered clinical analysis and recommendations
- **Drug Interaction Checking**: Real-time medication interaction analysis
- **Risk Assessment**: Comprehensive risk stratification across multiple domains
- **Predictive Analytics**: Machine learning-based predictions for readmission, deterioration, and complications
- **Real-time Alerts**: Intelligent alert system for critical clinical situations

### Persona-Based Access
- **Physician**: Full access to all features with prescribing capabilities
- **Pharmacist**: Focused on medication management and drug interactions


### Technical Features
- **No Database Dependencies**: Uses in-memory storage for demo purposes
- **RESTful API**: Comprehensive API endpoints for all functionality
- **Modern UI**: Responsive web interface with Bootstrap 5
- **Real-time Processing**: Fast response times for clinical decisions
- **Error Handling**: Robust error handling and graceful degradation

## 🏗️ Architecture

### Backend
- **Node.js/Express**: RESTful API server
- **MCP Framework**: Model Context Protocol integration
- **In-Memory Storage**: No external database dependencies
- **Modular Design**: Clean separation of concerns

### Frontend
- **HTML5/CSS3**: Modern, responsive interface
- **Bootstrap 5**: Professional UI components
- **Vanilla JavaScript**: No framework dependencies
- **Real-time Updates**: Dynamic content updates

### Services
- **Clinical Decision Engine**: Core decision-making logic
- **Drug Interaction Service**: Medication safety checking
- **Alert Service**: Real-time clinical alerts
- **Risk Assessment Service**: Multi-domain risk analysis

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- OpenAI API key (optional, for enhanced LLM features)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MCP-Clinical-Chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Create .env file (optional)
   cp .env.example .env
   
   # Add OpenAI API key for enhanced features (optional)
   echo "OPENAI_API_KEY=your_api_key_here" >> .env
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the application**
   - Web UI: http://localhost:3000
   - API Documentation: Available at `/api` endpoints

## 🧪 Testing

Run the comprehensive test suite:

```bash
node test-app.js
```

This will test all major functionality including:
- Health endpoint
- UI serving
- Patient management
- Clinical analysis
- Risk assessment
- Drug interactions
- Predictive analytics
- Alert system


## 🎯 Usage

### 1. Select Your Role
Choose from four personas:
- **Physician**: Full clinical access
- **Pharmacist**: Medication management


### 2. Patient Management
- View patient list with demographics
- Access detailed patient information
- Review conditions, medications, and vital signs

### 3. Clinical Decision Support
- Run clinical analysis on selected patients
- Check for drug interactions
- Generate risk assessments
- View predictive analytics

### 4. Real-time Alerts
- Monitor for critical clinical situations
- Receive intelligent alerts based on patient data
- Take action on high-priority notifications

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your_api_key_here

# Client Configuration
CLIENT_URL=http://localhost:3001
```

---

**Note**: This is a demonstration system and should not be used for actual clinical decision-making without proper validation and certification. 
