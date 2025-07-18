# Smart CDSS

A modern clinical decision support system designed to assist healthcare professionals with clinical decision-making.

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
- **Nurse**: Patient monitoring and basic clinical support
- **Pharmacist**: Focused on medication management and drug interactions
- **Researcher**: Access to analytics and predictive modeling features

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
- **Advanced Clinical Engine**: Phase 3 features with predictive analytics
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

## 📚 API Endpoints

### Health & Status
- `GET /health` - Application health check

### Patient Management
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient details

### Clinical Decision Support
- `POST /api/decisions/analyze` - Basic clinical analysis
- `POST /api/decisions/interactions` - Check drug interactions
- `POST /api/decisions/validate` - Validate medications
- `POST /api/decisions/risk` - Basic risk assessment

### Advanced Features (Phase 3)
- `POST /api/advanced/analyze` - Advanced patient analysis
- `POST /api/advanced/risk-stratification` - Comprehensive risk stratification
- `POST /api/advanced/predictions` - Predictive analytics
- `POST /api/advanced/alerts` - Real-time alerts
- `POST /api/advanced/specific-predictions` - Specific prediction types
- `POST /api/advanced/risk-assessment` - Domain-specific risk assessment
- `POST /api/advanced/condition-recommendations` - Condition-specific recommendations

### Disabled Features
- `POST /api/advanced/recommendations` - Advanced recommendations (disabled)

## 🎯 Usage

### 1. Select Your Role
Choose from four personas:
- **Physician**: Full clinical access
- **Nurse**: Patient monitoring focus
- **Pharmacist**: Medication management
- **Researcher**: Analytics and research

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

### Demo Data
The application includes pre-loaded demo patients:
- **John Doe**: 45-year-old with diabetes and hypertension
- **Jane Smith**: 49-year-old with asthma and obesity
- **Robert Johnson**: 59-year-old with COPD and heart failure

## 🚫 Limitations

- **No Database**: Uses in-memory storage (data lost on restart)
- **Demo Mode**: Designed for demonstration purposes
- **Limited LLM**: Basic fallback responses without OpenAI API key
- **No Authentication**: No user authentication system
- **Disabled Features**: Advanced recommendations feature is disabled

## 🔮 Future Enhancements

- **Database Integration**: Add persistent storage options
- **Authentication**: Implement user authentication and authorization
- **FHIR Integration**: Full FHIR resource support
- **Real-time Collaboration**: Multi-user support
- **Mobile App**: Native mobile application
- **Advanced Analytics**: Enhanced predictive models
- **Integration APIs**: Connect with external healthcare systems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the test files for usage examples

## 🔍 Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if port 3000 is available
   - Ensure Node.js version is 18+
   - Verify all dependencies are installed

2. **API endpoints not responding**
   - Check server logs for errors
   - Verify the server is running
   - Test with the health endpoint first

3. **UI not loading**
   - Check browser console for errors
   - Verify static files are being served
   - Clear browser cache

4. **LLM features not working**
   - Add OpenAI API key to environment
   - Check API key validity
   - Review network connectivity

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 📊 Performance

- **Response Time**: < 500ms for most endpoints
- **Concurrent Users**: Supports multiple simultaneous users
- **Memory Usage**: ~50MB base memory usage
- **CPU Usage**: Minimal CPU overhead

---

**Note**: This is a demonstration system and should not be used for actual clinical decision-making without proper validation and certification. 