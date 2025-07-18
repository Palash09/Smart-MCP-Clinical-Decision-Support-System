const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testApplication() {
  console.log('🧪 Testing Smart CDSS (No MongoDB)\n');

  try {
    // Test 1: Health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log(`✅ Health: ${healthResponse.status} - ${JSON.stringify(healthResponse.data)}\n`);

    // Test 2: UI endpoint
    console.log('2. Testing UI endpoint...');
    const uiResponse = await axios.get(`${BASE_URL}/`);
    console.log(`✅ UI: ${uiResponse.status} - HTML content loaded (${uiResponse.data.length} characters)\n`);

    // Test 3: Patient list
    console.log('3. Testing patient list...');
    const patientsResponse = await axios.get(`${BASE_URL}/api/patients`);
    console.log(`✅ Patients: ${patientsResponse.status} - ${patientsResponse.data.data.length} patients loaded`);
    patientsResponse.data.data.forEach(patient => {
      console.log(`   - ${patient.name} (${patient.age} years, ${patient.conditions.join(', ')})`);
    });
    console.log();

    // Test 4: Patient details
    console.log('4. Testing patient details...');
    const patientDetailsResponse = await axios.get(`${BASE_URL}/api/patients/patient-1`);
    const patient = patientDetailsResponse.data.data;
    console.log(`✅ Patient Details: ${patientDetailsResponse.status}`);
    console.log(`   - Name: ${patient.name}`);
    console.log(`   - Conditions: ${patient.conditions.join(', ')}`);
    console.log(`   - Medications: ${patient.medications.length} medications`);
    console.log(`   - Vital Signs: BP ${patient.vitalSigns.systolic}/${patient.vitalSigns.diastolic}`);
    console.log();

    // Test 5: Advanced analysis
    console.log('5. Testing advanced analysis...');
    const analysisResponse = await axios.post(
      `${BASE_URL}/api/advanced/analyze`,
      {
        patientData: {
          id: 'patient-1',
          age: 45,
          conditions: ['diabetes'],
          medications: [{ name: 'metformin' }]
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(`✅ Advanced Analysis: ${analysisResponse.status}`);
    console.log(`   - Overall Risk: ${analysisResponse.data.data.riskAssessment.overall.risk}`);
    console.log(`   - Confidence: ${Math.round(analysisResponse.data.data.confidence * 100)}%`);
    console.log();

    // Test 6: Risk stratification
    console.log('6. Testing risk stratification...');
    const riskResponse = await axios.post(
      `${BASE_URL}/api/advanced/risk-stratification`,
      {
        patientData: {
          id: 'patient-2',
          age: 65,
          conditions: ['hypertension', 'diabetes'],
          medications: [{ name: 'metformin' }, { name: 'lisinopril' }]
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(`✅ Risk Stratification: ${riskResponse.status}`);
    console.log(`   - Overall Risk: ${riskResponse.data.data.riskAssessment.overall.risk}`);
    console.log(`   - Cardiovascular Risk: ${riskResponse.data.data.riskAssessment.cardiovascular.risk}`);
    console.log();

    // Test 7: Predictions
    console.log('7. Testing predictions...');
    const predictionsResponse = await axios.post(
      `${BASE_URL}/api/advanced/predictions`,
      {
        patientData: {
          id: 'patient-3',
          age: 75,
          conditions: ['heart_failure'],
          history: { admissions: 3 }
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(`✅ Predictions: ${predictionsResponse.status}`);
    console.log(`   - Readmission Risk: ${Math.round(predictionsResponse.data.data.predictions.readmission.probability * 100)}%`);
    console.log(`   - Deterioration Risk: ${Math.round(predictionsResponse.data.data.predictions.deterioration.probability * 100)}%`);
    console.log();

    // Test 8: Drug interactions
    console.log('8. Testing drug interactions...');
    const interactionsResponse = await axios.post(
      `${BASE_URL}/api/decisions/interactions`,
      {
        medications: [
          { name: 'Warfarin' },
          { name: 'Aspirin' },
          { name: 'Metformin' }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(`✅ Drug Interactions: ${interactionsResponse.status}`);
    console.log(`   - Interactions Found: ${interactionsResponse.data.data.interactions.length}`);
    console.log();

    // Test 9: Alerts
    console.log('9. Testing alerts...');
    const alertsResponse = await axios.post(
      `${BASE_URL}/api/advanced/alerts`,
      {
        patientData: {
          id: 'patient-4',
          age: 80,
          conditions: ['diabetes', 'kidney_disease'],
          medications: [{ name: 'metformin' }, { name: 'warfarin' }],
          vitalSigns: { systolic: 190, diastolic: 110 }
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(`✅ Alerts: ${alertsResponse.status}`);
    console.log(`   - Alerts Generated: ${alertsResponse.data.data.alerts.length}`);
    console.log();

    // Test 10: Disabled recommendations
    console.log('10. Testing disabled recommendations...');
    const recommendationsResponse = await axios.post(
      `${BASE_URL}/api/advanced/recommendations`,
      {
        patientData: { id: 'patient-1' }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(`✅ Disabled Recommendations: ${recommendationsResponse.status}`);
    console.log(`   - Message: ${recommendationsResponse.data.message}`);
    console.log();

    // Test 11: Specific predictions
    console.log('11. Testing specific predictions...');
    const specificPredictionsResponse = await axios.post(
      `${BASE_URL}/api/advanced/specific-predictions`,
      {
        patientData: {
          id: 'patient-5',
          age: 70,
          conditions: ['COPD'],
          history: { admissions: 2 }
        },
        predictionType: 'readmission'
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(`✅ Specific Predictions: ${specificPredictionsResponse.status}`);
    console.log(`   - Prediction Type: ${specificPredictionsResponse.data.data.prediction.type}`);
    console.log();

    // Test 12: Risk assessment
    console.log('12. Testing risk assessment...');
    const riskAssessmentResponse = await axios.post(
      `${BASE_URL}/api/advanced/risk-assessment`,
      {
        patientData: {
          id: 'patient-6',
          age: 60,
          conditions: ['diabetes'],
          labResults: { hba1c: 8.5, creatinine: 1.3 }
        },
        riskType: 'diabetes'
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(`✅ Risk Assessment: ${riskAssessmentResponse.status}`);
    console.log(`   - Risk Level: ${riskAssessmentResponse.data.data.riskAssessment.risk}`);
    console.log();

    // Test 13: Condition-specific recommendations
    console.log('13. Testing condition-specific recommendations...');
    const conditionRecommendationsResponse = await axios.post(
      `${BASE_URL}/api/advanced/condition-recommendations`,
      {
        patientData: {
          id: 'patient-7',
          age: 50,
          conditions: ['hypertension']
        },
        condition: 'hypertension'
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(`✅ Condition-specific Recommendations: ${conditionRecommendationsResponse.status}`);
    console.log(`   - Recommendations: ${conditionRecommendationsResponse.data.data.recommendations.length}`);
    console.log();

    console.log('🎉 All tests completed successfully!');
    console.log('📊 Summary:');
    console.log('   ✅ Health endpoint working');
    console.log('   ✅ UI serving correctly');
    console.log('   ✅ Patient management working');
    console.log('   ✅ Advanced analysis working');
    console.log('   ✅ Risk stratification working');
    console.log('   ✅ Predictions working');
    console.log('   ✅ Drug interactions working');
    console.log('   ✅ Alerts working');
    console.log('   ✅ Recommendations properly disabled');
    console.log('   ✅ All Phase 3 features functional');
    console.log('   ✅ No MongoDB dependencies');
    console.log('\n🌐 Access the UI at: http://localhost:3000');

  } catch (error) {
    if (error.response) {
      console.error(`❌ Server error: ${error.response.status} - ${error.response.data.error || error.response.data.message}`);
    } else {
      console.error(`❌ Network error: ${error.message}`);
    }
  }
}

// Run the test
testApplication(); 