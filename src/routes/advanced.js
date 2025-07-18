const express = require('express');
const advancedClinicalEngine = require('../services/advancedClinicalEngine');
const { logger } = require('../utils/logger');

const router = express.Router();

// Advanced patient analysis with predictive analytics
router.post('/analyze', async (req, res, next) => {
  try {
    const { patientData, analysisOptions } = req.body;

    if (!patientData || !patientData.id) {
      return res.status(400).json({
        success: false,
        error: 'Patient data with ID is required'
      });
    }

    const analysis = await advancedClinicalEngine.analyzePatientAdvanced(patientData, analysisOptions);

    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in advanced analysis', { error: error.message });
    next(error);
  }
});

// Risk stratification endpoint
router.post('/risk-stratification', async (req, res, next) => {
  try {
    const { patientData } = req.body;

    if (!patientData || !patientData.id) {
      return res.status(400).json({
        success: false,
        error: 'Patient data with ID is required'
      });
    }

    const riskAssessment = await advancedClinicalEngine.performRiskStratification(patientData);

    res.json({
      success: true,
      data: {
        riskAssessment,
        patientId: patientData.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in risk stratification', { error: error.message });
    next(error);
  }
});

// Predictive analytics endpoint
router.post('/predictions', async (req, res, next) => {
  try {
    const { patientData } = req.body;

    if (!patientData || !patientData.id) {
      return res.status(400).json({
        success: false,
        error: 'Patient data with ID is required'
      });
    }

    const predictions = await advancedClinicalEngine.generatePredictions(patientData);

    res.json({
      success: true,
      data: {
        predictions,
        patientId: patientData.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in predictive analytics', { error: error.message });
    next(error);
  }
});

// Advanced recommendations endpoint (DISABLED)
router.post('/recommendations', async (req, res, next) => {
  res.status(501).json({
    success: false,
    error: 'Advanced recommendations feature is currently disabled',
    message: 'This feature has been removed from the current implementation'
  });
});

// Advanced alerts endpoint
router.post('/alerts', async (req, res, next) => {
  try {
    const { patientData, analysis } = req.body;

    if (!patientData || !patientData.id) {
      return res.status(400).json({
        success: false,
        error: 'Patient data with ID is required'
      });
    }

    // Generate analysis if not provided
    let patientAnalysis = analysis;
    if (!patientAnalysis) {
      patientAnalysis = await advancedClinicalEngine.analyzePatientAdvanced(patientData);
    }

    const alerts = await advancedClinicalEngine.generateAdvancedAlerts(patientData, patientAnalysis);

    res.json({
      success: true,
      data: {
        alerts,
        patientId: patientData.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in advanced alerts', { error: error.message });
    next(error);
  }
});

// Condition-specific recommendations (GET)
router.get('/recommendations/:condition', async (req, res, next) => {
  try {
    const { condition } = req.params;
    const { patientData } = req.query;

    if (!condition) {
      return res.status(400).json({
        success: false,
        error: 'Condition parameter is required'
      });
    }

    const parsedPatientData = patientData ? JSON.parse(patientData) : {};
    const recommendations = advancedClinicalEngine.getConditionSpecificRecommendations(condition, parsedPatientData);

    res.json({
      success: true,
      data: {
        condition,
        recommendations,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in condition-specific recommendations', { error: error.message });
    next(error);
  }
});

// Condition-specific recommendations (POST)
router.post('/condition-recommendations', async (req, res, next) => {
  try {
    const { patientData, condition } = req.body;

    if (!patientData || !patientData.id) {
      return res.status(400).json({
        success: false,
        error: 'Patient data with ID is required'
      });
    }

    if (!condition) {
      return res.status(400).json({
        success: false,
        error: 'Condition is required'
      });
    }

    // Generate condition-specific recommendations
    const recommendations = generateConditionRecommendations(patientData, condition);

    res.json({
      success: true,
      data: {
        condition,
        recommendations,
        patientId: patientData.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in condition-specific recommendations', { error: error.message });
    next(error);
  }
});

// Helper function to generate condition-specific recommendations
function generateConditionRecommendations(patientData, condition) {
  const recommendations = [];
  const age = patientData.age || 50;
  
  // Condition-specific recommendations
  const conditionRecommendations = {
    'diabetes': [
      'Monitor blood glucose levels regularly',
      'Maintain HbA1c below 7%',
      'Follow diabetic diet and exercise plan',
      'Check feet daily for wounds or infections',
      'Schedule regular eye exams'
    ],
    'hypertension': [
      'Monitor blood pressure daily',
      'Reduce sodium intake',
      'Maintain regular exercise routine',
      'Limit alcohol consumption',
      'Follow up with cardiologist'
    ],
    'asthma': [
      'Use rescue inhaler as prescribed',
      'Avoid known triggers',
      'Monitor peak flow readings',
      'Keep follow-up appointments',
      'Have action plan for exacerbations'
    ],
    'heart failure': [
      'Monitor daily weight',
      'Limit fluid intake as prescribed',
      'Take medications as directed',
      'Report shortness of breath',
      'Follow low-sodium diet'
    ],
    'copd': [
      'Use prescribed inhalers regularly',
      'Avoid smoking and second-hand smoke',
      'Participate in pulmonary rehabilitation',
      'Monitor oxygen levels',
      'Get annual flu vaccine'
    ],
    'gastroesophageal reflux disease': [
      'Avoid large meals before bedtime',
      'Elevate head of bed',
      'Avoid trigger foods',
      'Take medications as prescribed',
      'Maintain healthy weight'
    ]
  };

  // Get specific recommendations for the condition
  const conditionKey = condition.toLowerCase();
  for (const [key, recs] of Object.entries(conditionRecommendations)) {
    if (conditionKey.includes(key)) {
      recommendations.push(...recs);
      break;
    }
  }

  // Add general recommendations if no specific ones found
  if (recommendations.length === 0) {
    recommendations.push(
      'Follow up with primary care provider',
      'Take medications as prescribed',
      'Maintain healthy lifestyle',
      'Report any new symptoms',
      'Keep regular appointments'
    );
  }

  // Add age-specific recommendations
  if (age > 65) {
    recommendations.push('Consider fall prevention measures');
    recommendations.push('Review medication list with pharmacist');
  }

  if (age < 18) {
    recommendations.push('Ensure proper immunization schedule');
    recommendations.push('Monitor growth and development');
  }

  return recommendations.slice(0, 8); // Limit to 8 recommendations
}

// Readmission risk prediction
router.post('/predictions/readmission', async (req, res, next) => {
  try {
    const { patientData } = req.body;

    if (!patientData || !patientData.id) {
      return res.status(400).json({
        success: false,
        error: 'Patient data with ID is required'
      });
    }

    const prediction = advancedClinicalEngine.predictiveModels.readmission(patientData);

    res.json({
      success: true,
      data: {
        prediction,
        patientId: patientData.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in readmission prediction', { error: error.message });
    next(error);
  }
});

// Clinical deterioration prediction
router.post('/predictions/deterioration', async (req, res, next) => {
  try {
    const { patientData } = req.body;

    if (!patientData || !patientData.id) {
      return res.status(400).json({
        success: false,
        error: 'Patient data with ID is required'
      });
    }

    const prediction = advancedClinicalEngine.predictiveModels.deterioration(patientData);

    res.json({
      success: true,
      data: {
        prediction,
        patientId: patientData.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in deterioration prediction', { error: error.message });
    next(error);
  }
});

// Medication adherence prediction
router.post('/predictions/adherence', async (req, res, next) => {
  try {
    const { patientData } = req.body;

    if (!patientData || !patientData.id) {
      return res.status(400).json({
        success: false,
        error: 'Patient data with ID is required'
      });
    }

    const prediction = advancedClinicalEngine.predictiveModels.medicationAdherence(patientData);

    res.json({
      success: true,
      data: {
        prediction,
        patientId: patientData.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in adherence prediction', { error: error.message });
    next(error);
  }
});

// Cardiovascular risk assessment
router.post('/risk/cardiovascular', async (req, res, next) => {
  try {
    const { patientData } = req.body;

    if (!patientData || !patientData.id) {
      return res.status(400).json({
        success: false,
        error: 'Patient data with ID is required'
      });
    }

    const riskAssessment = advancedClinicalEngine.riskModels.cardiovascular(patientData);

    res.json({
      success: true,
      data: {
        riskAssessment,
        patientId: patientData.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in cardiovascular risk assessment', { error: error.message });
    next(error);
  }
});

// Diabetes risk assessment
router.post('/risk/diabetes', async (req, res, next) => {
  try {
    const { patientData } = req.body;

    if (!patientData || !patientData.id) {
      return res.status(400).json({
        success: false,
        error: 'Patient data with ID is required'
      });
    }

    const riskAssessment = advancedClinicalEngine.riskModels.diabetes(patientData);

    res.json({
      success: true,
      data: {
        riskAssessment,
        patientId: patientData.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in diabetes risk assessment', { error: error.message });
    next(error);
  }
});

// Medication risk assessment
router.post('/risk/medication', async (req, res, next) => {
  try {
    const { patientData } = req.body;

    if (!patientData || !patientData.id) {
      return res.status(400).json({
        success: false,
        error: 'Patient data with ID is required'
      });
    }

    const riskAssessment = advancedClinicalEngine.riskModels.medication(patientData);

    res.json({
      success: true,
      data: {
        riskAssessment,
        patientId: patientData.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in medication risk assessment', { error: error.message });
    next(error);
  }
});

// Get available risk models
router.get('/risk-models', async (req, res, next) => {
  try {
    const riskModels = Object.keys(advancedClinicalEngine.riskModels);
    const predictiveModels = Object.keys(advancedClinicalEngine.predictiveModels);

    res.json({
      success: true,
      data: {
        riskModels,
        predictiveModels,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting risk models', { error: error.message });
    next(error);
  }
});

module.exports = router; 