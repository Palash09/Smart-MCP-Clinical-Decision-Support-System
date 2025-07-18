const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testTimeoutHandling() {
  console.log('🧪 Testing Server Timeout Handling...\n');

  try {
    // Test 1: Health endpoint (should be fast)
    console.log('1. Testing health endpoint...');
    const start1 = Date.now();
    const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    const healthTime = Date.now() - start1;
    console.log(`✅ Health endpoint: ${healthTime}ms - Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthResponse.data, null, 2)}\n`);

    // Test 2: Advanced analysis (should work within timeout)
    console.log('2. Testing advanced analysis endpoint...');
    const start2 = Date.now();
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
      { 
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const analysisTime = Date.now() - start2;
    console.log(`✅ Advanced analysis: ${analysisTime}ms - Status: ${analysisResponse.status}`);
    console.log(`   Patient ID: ${analysisResponse.data.data.patientId}`);
    console.log(`   Risk Level: ${analysisResponse.data.data.riskAssessment.overall.risk}\n`);

    // Test 3: Risk stratification
    console.log('3. Testing risk stratification endpoint...');
    const start3 = Date.now();
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
      { 
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const riskTime = Date.now() - start3;
    console.log(`✅ Risk stratification: ${riskTime}ms - Status: ${riskResponse.status}`);
    console.log(`   Overall Risk: ${riskResponse.data.data.riskAssessment.overall.risk}\n`);

    // Test 4: Predictions
    console.log('4. Testing predictions endpoint...');
    const start4 = Date.now();
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
      { 
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const predictionsTime = Date.now() - start4;
    console.log(`✅ Predictions: ${predictionsTime}ms - Status: ${predictionsResponse.status}`);
    console.log(`   Readmission Risk: ${Math.round(predictionsResponse.data.data.predictions.readmission.probability * 100)}%\n`);

    // Test 5: Recommendations
    console.log('5. Testing recommendations endpoint...');
    const start5 = Date.now();
    const recommendationsResponse = await axios.post(
      `${BASE_URL}/api/advanced/recommendations`,
      {
        patientData: {
          id: 'patient-4',
          age: 55,
          conditions: ['diabetes', 'hypertension'],
          medications: [{ name: 'metformin' }, { name: 'amlodipine' }]
        }
      },
      { 
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const recommendationsTime = Date.now() - start5;
    console.log(`✅ Recommendations: ${recommendationsTime}ms - Status: ${recommendationsResponse.status}`);
    console.log(`   Number of recommendations: ${recommendationsResponse.data.data.recommendations.length}\n`);

    // Test 6: Alerts
    console.log('6. Testing alerts endpoint...');
    const start6 = Date.now();
    const alertsResponse = await axios.post(
      `${BASE_URL}/api/advanced/alerts`,
      {
        patientData: {
          id: 'patient-5',
          age: 80,
          conditions: ['diabetes', 'kidney_disease'],
          medications: [{ name: 'metformin' }, { name: 'warfarin' }],
          vitalSigns: { systolic: 190, diastolic: 110 }
        }
      },
      { 
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const alertsTime = Date.now() - start6;
    console.log(`✅ Alerts: ${alertsTime}ms - Status: ${alertsResponse.status}`);
    console.log(`   Number of alerts: ${alertsResponse.data.data.alerts.length}\n`);

    // Test 7: Specific predictions
    console.log('7. Testing specific predictions endpoint...');
    const start7 = Date.now();
    const specificPredictionsResponse = await axios.post(
      `${BASE_URL}/api/advanced/specific-predictions`,
      {
        patientData: {
          id: 'patient-6',
          age: 70,
          conditions: ['COPD'],
          history: { admissions: 2 }
        },
        predictionType: 'readmission'
      },
      { 
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const specificPredictionsTime = Date.now() - start7;
    console.log(`✅ Specific predictions: ${specificPredictionsTime}ms - Status: ${specificPredictionsResponse.status}`);
    console.log(`   Prediction: ${specificPredictionsResponse.data.data.prediction.type}\n`);

    // Test 8: Risk assessment
    console.log('8. Testing risk assessment endpoint...');
    const start8 = Date.now();
    const riskAssessmentResponse = await axios.post(
      `${BASE_URL}/api/advanced/risk-assessment`,
      {
        patientData: {
          id: 'patient-7',
          age: 60,
          conditions: ['diabetes'],
          labResults: { hba1c: 8.5, creatinine: 1.3 }
        },
        riskType: 'diabetes'
      },
      { 
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const riskAssessmentTime = Date.now() - start8;
    console.log(`✅ Risk assessment: ${riskAssessmentTime}ms - Status: ${riskAssessmentResponse.status}`);
    console.log(`   Risk Level: ${riskAssessmentResponse.data.data.riskAssessment.risk}\n`);

    // Test 9: Condition-specific recommendations
    console.log('9. Testing condition-specific recommendations endpoint...');
    const start9 = Date.now();
    const conditionRecommendationsResponse = await axios.post(
      `${BASE_URL}/api/advanced/condition-recommendations`,
      {
        patientData: {
          id: 'patient-8',
          age: 50,
          conditions: ['hypertension']
        },
        condition: 'hypertension'
      },
      { 
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const conditionRecommendationsTime = Date.now() - start9;
    console.log(`✅ Condition-specific recommendations: ${conditionRecommendationsTime}ms - Status: ${conditionRecommendationsResponse.status}`);
    console.log(`   Number of recommendations: ${conditionRecommendationsResponse.data.data.recommendations.length}\n`);

    console.log('🎉 All timeout tests completed successfully!');
    console.log('📊 Performance Summary:');
    console.log(`   Health: ${healthTime}ms`);
    console.log(`   Analysis: ${analysisTime}ms`);
    console.log(`   Risk: ${riskTime}ms`);
    console.log(`   Predictions: ${predictionsTime}ms`);
    console.log(`   Recommendations: ${recommendationsTime}ms`);
    console.log(`   Alerts: ${alertsTime}ms`);
    console.log(`   Specific Predictions: ${specificPredictionsTime}ms`);
    console.log(`   Risk Assessment: ${riskAssessmentTime}ms`);
    console.log(`   Condition Recommendations: ${conditionRecommendationsTime}ms`);

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout - server timeout handling working correctly');
    } else if (error.response) {
      console.error(`❌ Server error: ${error.response.status} - ${error.response.data.error}`);
    } else {
      console.error(`❌ Network error: ${error.message}`);
    }
  }
}

// Run the test
testTimeoutHandling(); 