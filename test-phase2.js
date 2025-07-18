const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data for Phase 2 features
const testPatientData = {
  id: 'patient-phase2-001',
  name: 'John Smith',
  age: 68,
  gender: 'male',
  vitalSigns: {
    systolic: 165,
    diastolic: 95,
    heartRate: 88,
    weight: 85
  },
  labResults: {
    hba1c: 8.2,
    fastingGlucose: 145,
    creatinine: 1.4
  },
  medications: [
    { name: 'Lisinopril', dosage: '10mg', frequency: 'daily' },
    { name: 'Metformin', dosage: '500mg', frequency: 'twice daily' },
    { name: 'Warfarin', dosage: '5mg', frequency: 'daily' },
    { name: 'Aspirin', dosage: '81mg', frequency: 'daily' }
  ],
  conditions: ['hypertension', 'diabetes_type2', 'atrial_fibrillation']
};

async function testPhase2Features() {
  console.log('🚀 Testing Phase 2 Features - Enhanced Clinical Decision Support\n');

  try {
    // Test 1: Enhanced Clinical Analysis
    console.log('1. Testing Enhanced Clinical Analysis...');
    const analysisResponse = await axios.post(`${BASE_URL}/clinical/analyze`, {
      patientData: testPatientData,
      analysisType: 'comprehensive'
    });
    
    console.log('✅ Analysis completed');
    console.log(`   - Conditions identified: ${analysisResponse.data.data.analysis.conditions.join(', ')}`);
    console.log(`   - Recommendations: ${analysisResponse.data.data.recommendationsCount}`);
    console.log(`   - Alerts generated: ${analysisResponse.data.data.alertsGenerated}`);
    console.log(`   - Evidence level: ${analysisResponse.data.data.evidenceLevel}`);
    console.log(`   - Clinical note created: ${analysisResponse.data.data.clinicalNote.id}\n`);

    // Test 2: Drug Interaction Checking
    console.log('2. Testing Drug Interaction Checking...');
    const interactionResponse = await axios.post(`${BASE_URL}/clinical/check-interactions`, {
      medications: testPatientData.medications,
      patientData: testPatientData
    });
    
    console.log('✅ Drug interactions checked');
    console.log(`   - Total interactions: ${interactionResponse.data.data.summary.total}`);
    console.log(`   - High risk: ${interactionResponse.data.data.summary.highRisk}`);
    console.log(`   - Moderate risk: ${interactionResponse.data.data.summary.moderateRisk}`);
    console.log(`   - Alerts generated: ${interactionResponse.data.data.alertsGenerated}\n`);

    // Test 3: Medication Validation
    console.log('3. Testing Medication Validation...');
    const validationResponse = await axios.post(`${BASE_URL}/clinical/validate-medication`, {
      medication: { name: 'ACE Inhibitor', dosage: '10mg', frequency: 'daily' },
      patientData: testPatientData
    });
    
    console.log('✅ Medication validation completed');
    console.log(`   - Valid: ${validationResponse.data.data.validation.isValid}`);
    console.log(`   - Contraindications: ${validationResponse.data.data.validation.contraindications.length}`);
    console.log(`   - Warnings: ${validationResponse.data.data.validation.warnings.length}\n`);

    // Test 4: Risk Assessment
    console.log('4. Testing Risk Assessment...');
    const riskResponse = await axios.post(`${BASE_URL}/clinical/risk-assessment`, {
      patientData: testPatientData
    });
    
    console.log('✅ Risk assessment completed');
    console.log(`   - Overall risk level: ${riskResponse.data.data.overallRiskLevel}`);
    console.log(`   - Risk factors: ${riskResponse.data.data.riskFactors.length}`);
    console.log(`   - Monitoring frequency: ${riskResponse.data.data.monitoringPlan.frequency}\n`);

    // Test 5: Get Recommendations for Specific Condition
    console.log('5. Testing Condition-Specific Recommendations...');
    const recommendationsResponse = await axios.get(`${BASE_URL}/clinical/recommendations/hypertension`);
    
    console.log('✅ Recommendations retrieved');
    console.log(`   - Recommendations count: ${recommendationsResponse.data.data.count}`);
    console.log(`   - First recommendation: ${recommendationsResponse.data.data.recommendations[0]?.name}\n`);

    // Test 6: Enhanced Alerts
    console.log('6. Testing Enhanced Alert System...');
    const alertsResponse = await axios.get(`${BASE_URL}/alerts?limit=10`);
    
    console.log('✅ Alerts retrieved');
    console.log(`   - Total alerts: ${alertsResponse.data.data.count}`);
    
    const criticalAlertsResponse = await axios.get(`${BASE_URL}/alerts/critical/active`);
    console.log(`   - Critical alerts: ${criticalAlertsResponse.data.data.count}`);
    
    const unacknowledgedResponse = await axios.get(`${BASE_URL}/alerts/unacknowledged/active`);
    console.log(`   - Unacknowledged alerts: ${unacknowledgedResponse.data.data.count}\n`);

    // Test 7: Clinical Documentation
    console.log('7. Testing Clinical Documentation...');
    const noteData = {
      patientId: testPatientData.id,
      authorId: 'test-user',
      authorName: 'Test User',
      title: 'Test Clinical Note',
      content: 'This is a test clinical note for Phase 2 testing.',
      type: 'assessment',
      category: 'clinical'
    };
    
    const noteResponse = await axios.post(`${BASE_URL}/clinical/notes`, noteData);
    console.log('✅ Clinical note created');
    console.log(`   - Note ID: ${noteResponse.data.data.id}`);
    console.log(`   - Title: ${noteResponse.data.data.title}\n`);

    // Test 8: Get Patient Notes
    console.log('8. Testing Patient Notes Retrieval...');
    const patientNotesResponse = await axios.get(`${BASE_URL}/clinical/notes/patient/${testPatientData.id}`);
    
    console.log('✅ Patient notes retrieved');
    console.log(`   - Notes count: ${patientNotesResponse.data.data.count}\n`);

    // Test 9: Alert Statistics
    console.log('9. Testing Alert Statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/alerts/stats/overview`);
    
    console.log('✅ Alert statistics retrieved');
    console.log(`   - Total alerts: ${statsResponse.data.data.total}`);
    console.log(`   - Active alerts: ${statsResponse.data.data.active}`);
    console.log(`   - Resolved alerts: ${statsResponse.data.data.resolved}`);
    console.log(`   - Acknowledged alerts: ${statsResponse.data.data.acknowledged}\n`);

    // Test 10: Search Clinical Notes
    console.log('10. Testing Clinical Note Search...');
    const searchResponse = await axios.get(`${BASE_URL}/clinical/notes/search?query=test&patientId=${testPatientData.id}`);
    
    console.log('✅ Note search completed');
    console.log(`   - Search results: ${searchResponse.data.data.count}\n`);

    console.log('🎉 All Phase 2 features tested successfully!');
    console.log('\n📋 Summary of Phase 2 Features:');
    console.log('   ✅ Enhanced clinical analysis with evidence-based recommendations');
    console.log('   ✅ Comprehensive drug interaction checking');
    console.log('   ✅ Medication validation with contraindication checking');
    console.log('   ✅ Risk assessment and monitoring plans');
    console.log('   ✅ Advanced alert system with templates and filtering');
    console.log('   ✅ Clinical documentation with templates and search');
    console.log('   ✅ Condition-specific recommendations');
    console.log('   ✅ Alert statistics and management');

  } catch (error) {
    console.error('❌ Error testing Phase 2 features:', error.response?.data || error.message);
  }
}

// Run the tests
if (require.main === module) {
  testPhase2Features();
}

module.exports = { testPhase2Features }; 