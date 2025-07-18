const express = require('express');
const { FHIRService } = require('../services/fhirService');
const { LLMService } = require('../services/llmService');
const clinicalDecisionEngine = require('../services/clinicalDecisionEngine');
const { logger } = require('../utils/logger');

const router = express.Router();
const fhirService = new FHIRService();
const llmService = new LLMService();


// Analyze patient clinical data
router.post('/analyze', async (req, res, next) => {
  try {
    const { patientId, analysisType = 'general' } = req.body;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    // Get comprehensive patient data
    const [patient, observations, medications, conditions] = await Promise.all([
      fhirService.getPatient(patientId),
      fhirService.getObservations(patientId),
      fhirService.getMedications(patientId),
      fhirService.getConditions(patientId)
    ]);

    const clinicalData = {
      patient,
      observations,
      medications,
      conditions
    };

    // Analyze using LLM
    const analysis = await llmService.analyzeClinicalData(clinicalData, analysisType);

    res.json({
      success: true,
      data: {
        analysis,
        clinicalData,
        analysisType,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get treatment recommendations
router.post('/recommendations', async (req, res, next) => {
  try {
    const { patientId, condition } = req.body;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    // Get patient data
    const [patient, medications, conditions] = await Promise.all([
      fhirService.getPatient(patientId),
      fhirService.getMedications(patientId),
      fhirService.getConditions(patientId)
    ]);

    const patientData = {
      patient,
      medications,
      conditions,
      targetCondition: condition
    };

    // Generate recommendations
    const recommendations = await clinicalDecisionEngine.analyzePatient(patientData);

    res.json({
      success: true,
      data: {
        recommendations,
        patientData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Check drug interactions
router.post('/interactions', async (req, res, next) => {
  try {
    const { medications } = req.body;
    
    if (!medications || !Array.isArray(medications)) {
      return res.status(400).json({
        success: false,
        error: 'Medications array is required'
      });
    }

    // Check interactions
    const interactions = clinicalDecisionEngine.checkDrugInteractions(medications);

    res.json({
      success: true,
      data: {
        interactions,
        medications,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Generate clinical summary
router.post('/summary', async (req, res, next) => {
  try {
    const { patientId, summaryType = 'comprehensive' } = req.body;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    // Get patient data
    const [patient, observations, medications, conditions] = await Promise.all([
      fhirService.getPatient(patientId),
      fhirService.getObservations(patientId),
      fhirService.getMedications(patientId),
      fhirService.getConditions(patientId)
    ]);

    const patientData = {
      patient,
      observations,
      medications,
      conditions
    };

    // Generate summary
    const summary = await llmService.generateClinicalSummary(patientData, summaryType);

    res.json({
      success: true,
      data: {
        summary,
        patientData,
        summaryType,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Assess clinical risk
router.post('/risk-assessment', async (req, res, next) => {
  try {
    const { patientId, riskFactors = [] } = req.body;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    // Get patient data
    const [patient, observations, conditions] = await Promise.all([
      fhirService.getPatient(patientId),
      fhirService.getObservations(patientId),
      fhirService.getConditions(patientId)
    ]);

    const patientData = {
      patient,
      observations,
      conditions,
      riskFactors
    };

    // Assess risk
    const riskAssessment = await clinicalDecisionEngine.analyzePatient(patientData);

    res.json({
      success: true,
      data: {
        riskAssessment,
        patientData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get evidence-based guidelines
router.post('/guidelines', async (req, res, next) => {
  try {
    const { condition, patientAge, patientGender } = req.body;
    
    if (!condition) {
      return res.status(400).json({
        success: false,
        error: 'Condition is required'
      });
    }

    // Get guidelines
    const guidelines = clinicalDecisionEngine.getRecommendationsForCondition(condition);

    res.json({
      success: true,
      data: {
        guidelines,
        condition,
        patientAge,
        patientGender,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Generate SOAP note
router.post('/soap-note', async (req, res, next) => {
  try {
    const { patientId, encounterData } = req.body;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    // Get patient data
    const patient = await fhirService.getPatient(patientId);

    // Generate SOAP note
    const soapNote = await llmService.generateSOAPNote(patient, encounterData);

    res.json({
      success: true,
      data: {
        soapNote,
        patient,
        encounterData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Interpret lab results
router.post('/lab-interpretation', async (req, res, next) => {
  try {
    const { labData } = req.body;
    
    if (!labData) {
      return res.status(400).json({
        success: false,
        error: 'Lab data is required'
      });
    }

    // Interpret lab results
    const interpretation = await llmService.interpretLabResults(labData);

    res.json({
      success: true,
      data: {
        interpretation,
        labData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Medication reasoning using OpenAI for physician persona
router.post('/medication-reasoning', async (req, res, next) => {
  try {
    const { medication, patient } = req.body;
    
    if (!medication || !patient) {
      return res.status(400).json({
        success: false,
        error: 'Medication and patient data are required'
      });
    }

    // Create a more specific and focused prompt for medication reasoning
    const prompt = `You are a clinical pharmacist providing medication reasoning. Based on the patient's profile and the specific medication, provide a concise, evidence-based clinical rationale for why this medication was prescribed.

Patient Profile:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Medical Conditions: ${(patient.conditions || []).join(', ') || 'None documented'}
- Current Medications: ${(patient.medications || []).map(m => m.name).join(', ') || 'None documented'}

Medication to Analyze: ${medication.name} ${medication.dosage || ''}

Instructions:
1. Provide a specific clinical indication for this medication
2. Relate it to the patient's conditions if applicable
3. Mention the drug class and mechanism if relevant
4. Keep response to 1-2 sentences maximum
5. Be specific and avoid generic statements

Clinical Reasoning:`;

    const reasoning = await llmService.analyzeClinicalData({
      patient: patient,
      medication: medication,
      prompt: prompt
    }, 'medications');

    // Clean up the response to get just the reasoning
    let cleanReasoning = reasoning;
    if (reasoning.includes('Clinical Reasoning:')) {
      cleanReasoning = reasoning.split('Clinical Reasoning:')[1] || reasoning;
    }
    
    // Get the first meaningful sentence
    cleanReasoning = cleanReasoning.split('\n').find(line => line.trim().length > 20) || 
                   cleanReasoning.split('.')[0] + '.' || 
                   'Prescribed for patient-specific clinical indication';

    res.json({
      success: true,
      reasoning: cleanReasoning.trim()
    });
  } catch (error) {
    res.json({
      success: false,
      reasoning: 'Prescribed for patient-specific clinical indication'
    });
  }
});

// Condition recommendations using OpenAI for physician persona
router.post('/condition-recommendations', async (req, res, next) => {
  try {
    const { patient, conditions } = req.body;
    
    if (!patient || !conditions) {
      return res.status(400).json({
        success: false,
        error: 'Patient and conditions data are required'
      });
    }

    const recommendations = [];
    
    // Get one concise recommendation per condition
    for (const condition of conditions) {
      try {
        // Create a more specific prompt for condition recommendations
        const prompt = `You are a clinical physician providing evidence-based treatment recommendations. Based on the patient's complete profile and the specific condition, provide ONE specific, actionable clinical recommendation.

Patient Profile:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- All Medical Conditions: ${(patient.conditions || []).join(', ') || 'None documented'}
- Current Medications: ${(patient.medications || []).map(m => m.name).join(', ') || 'None documented'}

Condition to Address: ${condition}

Instructions:
1. Provide ONE specific, actionable recommendation for this condition
2. Consider the patient's age, gender, and other conditions
3. Consider current medications and potential interactions
4. Base recommendation on current clinical guidelines
5. Keep response to 1 sentence maximum
6. Be specific and avoid generic monitoring statements
7. Focus on treatment optimization or specific interventions

Specific Recommendation:`;

        const recommendation = await llmService.generateTreatmentRecommendations({
          patient: patient,
          condition: condition,
          prompt: prompt
        }, condition);
        
        // Clean up the response to get just the recommendation
        let cleanRecommendation = recommendation;
        if (recommendation.includes('Specific Recommendation:')) {
          cleanRecommendation = recommendation.split('Specific Recommendation:')[1] || recommendation;
        }
        
        // Extract the first meaningful sentence from the response
        cleanRecommendation = cleanRecommendation
          .split('\n')
          .find(line => line.trim().length > 20) || 
          cleanRecommendation.split('.')[0] + '.' ||
          `Consider evidence-based treatment optimization for ${condition}`;
        
        recommendations.push({
          condition: condition,
          recommendation: cleanRecommendation.trim()
        });
      } catch (error) {
        // Fallback to condition-specific static recommendations
        const staticRecommendation = getStaticConditionRecommendation(condition, patient);
        recommendations.push({
          condition: condition,
          recommendation: staticRecommendation
        });
      }
    }

    res.json({
      success: true,
      recommendations: recommendations
    });
  } catch (error) {
    res.json({
      success: false,
      recommendations: []
    });
  }
});

// Helper function for static condition recommendations
function getStaticConditionRecommendation(condition, patient) {
  const conditionLower = condition.toLowerCase();
  const age = patient.age || 0;
  const medications = (patient.medications || []).map(m => m.name.toLowerCase());
  
  if (conditionLower.includes('diabetes')) {
    if (!medications.some(m => m.includes('metformin'))) {
      return 'Consider initiating metformin as first-line therapy for type 2 diabetes management';
    }
    return 'Monitor HbA1c every 3-6 months and assess for diabetic complications';
  }
  
  if (conditionLower.includes('hypertension')) {
    if (!medications.some(m => m.includes('lisinopril') || m.includes('losartan'))) {
      return 'Consider ACE inhibitor or ARB for hypertension management';
    }
    return 'Monitor blood pressure regularly and assess cardiovascular risk factors';
  }
  
  if (conditionLower.includes('pain')) {
    if (age > 65) {
      return 'Use acetaminophen as first-line for pain management in elderly patients';
    }
    return 'Assess pain severity and consider multimodal pain management approach';
  }
  
  if (conditionLower.includes('cardiovascular') || conditionLower.includes('heart')) {
    if (!medications.some(m => m.includes('aspirin'))) {
      return 'Consider low-dose aspirin for cardiovascular protection if no contraindications';
    }
    return 'Optimize cardiovascular risk factors and monitor cardiac function';
  }
  
  if (conditionLower.includes('iron') || conditionLower.includes('anemia')) {
    return 'Monitor iron levels and hemoglobin response to iron supplementation';
  }
  
  return `Monitor ${condition} progression and adjust treatment plan based on clinical response`;
}

module.exports = router; 