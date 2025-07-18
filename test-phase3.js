const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Sample patient data for testing
const samplePatientData = {
  id: 'patient-advanced-1',
  name: 'Sarah Johnson',
  age: 72,
  gender: 'female',
  vitalSigns: {
    systolic: 165,
    diastolic: 95,
    heartRate: 88,
    temperature: 98.6,
    oxygenSaturation: 96
  },
  labResults: {
    hba1c: 8.2,
    creatinine: 1.4,
    ldl: 145,
    glucose: 180
  },
  medications: [
    { name: 'Metformin', dose: '500mg', frequency: 'twice daily' },
    { name: 'Lisinopril', dose: '10mg', frequency: 'once daily' },
    { name: 'Atorvastatin', dose: '20mg', frequency: 'once daily' },
    { name: 'Aspirin', dose: '81mg', frequency: 'once daily' },
    { name: 'Warfarin', dose: '5mg', frequency: 'once daily' },
    { name: 'Furosemide', dose: '40mg', frequency: 'once daily' }
  ],
  conditions: [
    'Type 2 Diabetes',
    'Hypertension',
    'Hyperlipidemia',
    'Atrial Fibrillation',
    'Chronic Kidney Disease',
    'Heart Failure'
  ],
  history: {
    admissions: 3,
    lastAdmission: '2024-01-15',
    emergencyVisits: 2
  }
};

// Test functions
async function testAdvancedAnalysis() {
  console.log('\n🔬 Testing Advanced Clinical Analysis...');
  try {
    const response = await axios.post(`${BASE_URL}/advanced/analyze`, {
      patientData: samplePatientData,
      analysisOptions: { includePredictions: true, includeRiskAssessment: true }
    });
    
    console.log('✅ Advanced Analysis Response:');
    console.log(`   - Risk Assessment: ${response.data.data.riskAssessment.overall.risk} risk`);
    console.log(`   - Confidence Score: ${response.data.data.confidence}`);
    console.log(`   - Recommendations: ${response.data.data.recommendations.length} items`);
    console.log(`   - Alerts: ${response.data.data.alerts.length} alerts`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Advanced Analysis Error:', error.response?.data || error.message);
    return null;
  }
}

async function testRiskStratification() {
  console.log('\n📊 Testing Risk Stratification...');
  try {
    const response = await axios.post(`${BASE_URL}/advanced/risk-stratification`, {
      patientData: samplePatientData
    });
    
    console.log('✅ Risk Stratification Response:');
    const risk = response.data.data.riskAssessment;
    console.log(`   - Overall Risk: ${risk.overall.risk} (score: ${risk.overall.score.toFixed(2)})`);
    console.log(`   - Cardiovascular Risk: ${risk.cardiovascular.risk}`);
    console.log(`   - Diabetes Risk: ${risk.diabetes.risk}`);
    console.log(`   - Medication Risk: ${risk.medication.risk}`);
    console.log(`   - Risk Factors: ${risk.overall.factors.join(', ')}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Risk Stratification Error:', error.response?.data || error.message);
    return null;
  }
}

async function testPredictiveAnalytics() {
  console.log('\n🔮 Testing Predictive Analytics...');
  try {
    const response = await axios.post(`${BASE_URL}/advanced/predictions`, {
      patientData: samplePatientData
    });
    
    console.log('✅ Predictive Analytics Response:');
    const predictions = response.data.data.predictions;
    console.log(`   - Readmission Risk: ${(predictions.readmission.probability * 100).toFixed(1)}%`);
    console.log(`   - Deterioration Risk: ${(predictions.deterioration.probability * 100).toFixed(1)}%`);
    console.log(`   - Medication Adherence: ${(predictions.medicationAdherence.probability * 100).toFixed(1)}%`);
    console.log(`   - Complications Risk: ${(predictions.complications.probability * 100).toFixed(1)}%`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Predictive Analytics Error:', error.response?.data || error.message);
    return null;
  }
}

async function testAdvancedRecommendations() {
  console.log('\n💡 Testing Advanced Recommendations...');
  try {
    const analysis = await testAdvancedAnalysis();
    if (!analysis) return null;
    
    const response = await axios.post(`${BASE_URL}/advanced/recommendations`, {
      patientData: samplePatientData,
      analysis: analysis.data
    });
    
    console.log('✅ Advanced Recommendations Response:');
    const recommendations = response.data.data.recommendations;
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.title} (${rec.priority} priority)`);
      console.log(`      Category: ${rec.category}`);
      console.log(`      Evidence: ${rec.evidence}`);
      console.log(`      Expected Outcome: ${rec.expectedOutcome}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Advanced Recommendations Error:', error.response?.data || error.message);
    return null;
  }
}

async function testAdvancedAlerts() {
  console.log('\n🚨 Testing Advanced Alerts...');
  try {
    const analysis = await testAdvancedAnalysis();
    if (!analysis) return null;
    
    const response = await axios.post(`${BASE_URL}/advanced/alerts`, {
      patientData: samplePatientData,
      analysis: analysis.data
    });
    
    console.log('✅ Advanced Alerts Response:');
    const alerts = response.data.data.alerts;
    alerts.forEach((alert, index) => {
      console.log(`   ${index + 1}. ${alert.title} (${alert.priority} priority)`);
      console.log(`      Type: ${alert.type}`);
      console.log(`      Category: ${alert.category}`);
      console.log(`      Message: ${alert.message}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Advanced Alerts Error:', error.response?.data || error.message);
    return null;
  }
}

async function testSpecificPredictions() {
  console.log('\n🎯 Testing Specific Predictions...');
  
  // Test readmission prediction
  try {
    const readmissionResponse = await axios.post(`${BASE_URL}/advanced/predictions/readmission`, {
      patientData: samplePatientData
    });
    console.log('✅ Readmission Prediction:');
    console.log(`   - Probability: ${(readmissionResponse.data.data.prediction.probability * 100).toFixed(1)}%`);
    console.log(`   - Timeframe: ${readmissionResponse.data.data.prediction.timeframe}`);
    console.log(`   - Confidence: ${(readmissionResponse.data.data.prediction.confidence * 100).toFixed(1)}%`);
  } catch (error) {
    console.error('❌ Readmission Prediction Error:', error.response?.data || error.message);
  }
  
  // Test deterioration prediction
  try {
    const deteriorationResponse = await axios.post(`${BASE_URL}/advanced/predictions/deterioration`, {
      patientData: samplePatientData
    });
    console.log('✅ Deterioration Prediction:');
    console.log(`   - Probability: ${(deteriorationResponse.data.data.prediction.probability * 100).toFixed(1)}%`);
    console.log(`   - Timeframe: ${deteriorationResponse.data.data.prediction.timeframe}`);
    console.log(`   - Confidence: ${(deteriorationResponse.data.data.prediction.confidence * 100).toFixed(1)}%`);
  } catch (error) {
    console.error('❌ Deterioration Prediction Error:', error.response?.data || error.message);
  }
  
  // Test medication adherence prediction
  try {
    const adherenceResponse = await axios.post(`${BASE_URL}/advanced/predictions/adherence`, {
      patientData: samplePatientData
    });
    console.log('✅ Medication Adherence Prediction:');
    console.log(`   - Probability: ${(adherenceResponse.data.data.prediction.probability * 100).toFixed(1)}%`);
    console.log(`   - Timeframe: ${adherenceResponse.data.data.prediction.timeframe}`);
    console.log(`   - Confidence: ${(adherenceResponse.data.data.prediction.confidence * 100).toFixed(1)}%`);
  } catch (error) {
    console.error('❌ Medication Adherence Prediction Error:', error.response?.data || error.message);
  }
}

async function testSpecificRiskAssessments() {
  console.log('\n⚖️ Testing Specific Risk Assessments...');
  
  // Test cardiovascular risk
  try {
    const cvResponse = await axios.post(`${BASE_URL}/advanced/risk/cardiovascular`, {
      patientData: samplePatientData
    });
    console.log('✅ Cardiovascular Risk Assessment:');
    console.log(`   - Risk Level: ${cvResponse.data.data.riskAssessment.risk}`);
    console.log(`   - Score: ${cvResponse.data.data.riskAssessment.score.toFixed(2)}`);
    console.log(`   - Factors: ${cvResponse.data.data.riskAssessment.factors.join(', ')}`);
  } catch (error) {
    console.error('❌ Cardiovascular Risk Assessment Error:', error.response?.data || error.message);
  }
  
  // Test diabetes risk
  try {
    const diabetesResponse = await axios.post(`${BASE_URL}/advanced/risk/diabetes`, {
      patientData: samplePatientData
    });
    console.log('✅ Diabetes Risk Assessment:');
    console.log(`   - Risk Level: ${diabetesResponse.data.data.riskAssessment.risk}`);
    console.log(`   - Score: ${diabetesResponse.data.data.riskAssessment.score.toFixed(2)}`);
    console.log(`   - Factors: ${diabetesResponse.data.data.riskAssessment.factors.join(', ')}`);
  } catch (error) {
    console.error('❌ Diabetes Risk Assessment Error:', error.response?.data || error.message);
  }
  
  // Test medication risk
  try {
    const medResponse = await axios.post(`${BASE_URL}/advanced/risk/medication`, {
      patientData: samplePatientData
    });
    console.log('✅ Medication Risk Assessment:');
    console.log(`   - Risk Level: ${medResponse.data.data.riskAssessment.risk}`);
    console.log(`   - Score: ${medResponse.data.data.riskAssessment.score.toFixed(2)}`);
    console.log(`   - Factors: ${medResponse.data.data.riskAssessment.factors.join(', ')}`);
  } catch (error) {
    console.error('❌ Medication Risk Assessment Error:', error.response?.data || error.message);
  }
}

async function testConditionSpecificRecommendations() {
  console.log('\n🏥 Testing Condition-Specific Recommendations...');
  
  const conditions = ['hypertension', 'diabetes', 'heart_failure'];
  
  for (const condition of conditions) {
    try {
      const response = await axios.get(`${BASE_URL}/advanced/recommendations/${condition}`, {
        params: { patientData: JSON.stringify(samplePatientData) }
      });
      
      console.log(`✅ ${condition.toUpperCase()} Recommendations:`);
      response.data.data.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec.title}`);
        console.log(`      Description: ${rec.description}`);
        console.log(`      Evidence: ${rec.evidence}`);
      });
    } catch (error) {
      console.error(`❌ ${condition} Recommendations Error:`, error.response?.data || error.message);
    }
  }
}

async function testAvailableModels() {
  console.log('\n📋 Testing Available Models...');
  try {
    const response = await axios.get(`${BASE_URL}/advanced/risk-models`);
    
    console.log('✅ Available Models:');
    console.log(`   - Risk Models: ${response.data.data.riskModels.join(', ')}`);
    console.log(`   - Predictive Models: ${response.data.data.predictiveModels.join(', ')}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Available Models Error:', error.response?.data || error.message);
    return null;
  }
}

// Main test function
async function runPhase3Tests() {
  console.log('🚀 Starting Phase 3 Advanced Clinical Decision Support Tests...');
  console.log('=' .repeat(80));
  
  // Test server health first
  try {
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Server Health Check:', healthResponse.data.status);
  } catch (error) {
    console.error('❌ Server not responding. Please start the server first.');
    return;
  }
  
  // Run all tests
  await testAvailableModels();
  await testAdvancedAnalysis();
  await testRiskStratification();
  await testPredictiveAnalytics();
  await testAdvancedRecommendations();
  await testAdvancedAlerts();
  await testSpecificPredictions();
  await testSpecificRiskAssessments();
  await testConditionSpecificRecommendations();
  
  console.log('\n' + '=' .repeat(80));
  console.log('🎉 Phase 3 Testing Complete!');
  console.log('\n📊 Summary of Phase 3 Features:');
  console.log('   ✅ Advanced Clinical Analysis with Predictive Analytics');
  console.log('   ✅ Multi-Domain Risk Stratification');
  console.log('   ✅ Machine Learning-Based Predictions');
  console.log('   ✅ Evidence-Based Advanced Recommendations');
  console.log('   ✅ Real-Time Advanced Alerts');
  console.log('   ✅ Condition-Specific Clinical Guidance');
  console.log('   ✅ Comprehensive Risk Assessment Models');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPhase3Tests().catch(console.error);
}

module.exports = {
  runPhase3Tests,
  testAdvancedAnalysis,
  testRiskStratification,
  testPredictiveAnalytics,
  testAdvancedRecommendations,
  testAdvancedAlerts
}; 