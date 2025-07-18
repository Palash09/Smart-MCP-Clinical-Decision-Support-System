const express = require('express');
const router = express.Router();
const clinicalDecisionEngine = require('../services/clinicalDecisionEngine');
const alertService = require('../services/alertService');
const documentationService = require('../services/documentationService');
const logger = require('../utils/logger');

// Enhanced clinical analysis with Phase 2 features
router.post('/analyze', async (req, res) => {
  try {
    const { patientData, analysisType = 'comprehensive' } = req.body;

    if (!patientData) {
      return res.status(400).json({
        success: false,
        message: 'Patient data is required'
      });
    }

    logger.info('Starting clinical analysis', { 
      patientId: patientData.id, 
      analysisType 
    });

    // Perform comprehensive clinical analysis
    const analysis = await clinicalDecisionEngine.analyzePatient(patientData);

    // Generate alerts based on analysis
    if (analysis.alerts && analysis.alerts.length > 0) {
      for (const alert of analysis.alerts) {
        await alertService.createCustomAlert({
          title: alert.message,
          message: alert.message,
          category: alert.category,
          priority: alert.priority,
          type: alert.type,
          data: { patientId: patientData.id, ...alert }
        });
      }
    }

    // Generate clinical documentation
    const authorData = {
      id: req.user?.id || 'system',
              name: req.user?.name || 'Smart CDSS'
    };

    const clinicalNote = await documentationService.generateRecommendationNote(
      patientData, 
      analysis, 
      authorData
    );

    res.json({
      success: true,
      data: {
        analysis,
        clinicalNote: {
          id: clinicalNote.id,
          title: clinicalNote.title,
          timestamp: clinicalNote.timestamp
        },
        alertsGenerated: analysis.alerts.length,
        recommendationsCount: analysis.recommendations.length,
        evidenceLevel: analysis.evidenceLevel
      }
    });

  } catch (error) {
    logger.error('Error in clinical analysis', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error performing clinical analysis',
      error: error.message
    });
  }
});

// Drug interaction checking
router.post('/check-interactions', async (req, res) => {
  try {
    const { medications, patientData } = req.body;

    if (!medications || !Array.isArray(medications)) {
      return res.status(400).json({
        success: false,
        message: 'Medications array is required'
      });
    }

    logger.info('Checking drug interactions', { 
      medicationCount: medications.length,
      patientId: patientData?.id 
    });

    // Check for drug interactions
    const interactions = clinicalDecisionEngine.checkDrugInteractions(medications);

    // Generate alerts for high-risk interactions
    const highRiskInteractions = interactions.filter(i => i.severity === 'high');
    for (const interaction of highRiskInteractions) {
      await alertService.createAlert('high_risk_interaction', {
        drug1: interaction.drug1,
        drug2: interaction.drug2,
        patientId: patientData?.id
      });
    }

    // Generate alerts for moderate interactions
    const moderateInteractions = interactions.filter(i => i.severity === 'moderate');
    for (const interaction of moderateInteractions) {
      await alertService.createAlert('moderate_interaction', {
        drug1: interaction.drug1,
        drug2: interaction.drug2,
        patientId: patientData?.id
      });
    }

    res.json({
      success: true,
      data: {
        interactions,
        summary: {
          total: interactions.length,
          highRisk: highRiskInteractions.length,
          moderateRisk: moderateInteractions.length,
          lowRisk: interactions.filter(i => i.severity === 'low').length
        },
        alertsGenerated: highRiskInteractions.length + moderateInteractions.length
      }
    });

  } catch (error) {
    logger.error('Error checking drug interactions', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error checking drug interactions',
      error: error.message
    });
  }
});

// Medication validation
router.post('/validate-medication', async (req, res) => {
  try {
    const { medication, patientData } = req.body;

    if (!medication || !patientData) {
      return res.status(400).json({
        success: false,
        message: 'Medication and patient data are required'
      });
    }

    logger.info('Validating medication order', { 
      medication: medication.name,
      patientId: patientData.id 
    });

    // Validate medication order
    const validation = clinicalDecisionEngine.validateMedicationOrder(medication, patientData);

    // Generate alerts for contraindications
    if (validation.contraindications.length > 0) {
      await alertService.createCustomAlert({
        title: 'Medication Contraindication',
        message: `Contraindications detected for ${medication.name}: ${validation.contraindications.join(', ')}`,
        category: 'medication',
        priority: 'high',
        type: 'error',
        data: { patientId: patientData.id, medication: medication.name }
      });
    }

    // Generate alerts for interactions
    if (validation.warnings.length > 0) {
      for (const warning of validation.warnings) {
        await alertService.createCustomAlert({
          title: 'Medication Interaction Warning',
          message: `Interaction detected: ${warning.effect}`,
          category: 'medication',
          priority: 'medium',
          type: 'warning',
          data: { patientId: patientData.id, medication: medication.name, ...warning }
        });
      }
    }

    res.json({
      success: true,
      data: {
        validation,
        alertsGenerated: (validation.contraindications.length > 0 ? 1 : 0) + validation.warnings.length
      }
    });

  } catch (error) {
    logger.error('Error validating medication', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error validating medication',
      error: error.message
    });
  }
});

// Get recommendations for specific condition
router.get('/recommendations/:condition', async (req, res) => {
  try {
    const { condition } = req.params;
    const { patientData } = req.query;

    logger.info('Getting recommendations for condition', { condition });

    const recommendations = clinicalDecisionEngine.getRecommendationsForCondition(condition);

    // If patient data is provided, contextualize recommendations
    let contextualizedRecommendations = recommendations;
    if (patientData) {
      const patientDataObj = JSON.parse(patientData);
      contextualizedRecommendations = recommendations.map(rec => ({
        ...rec,
        applicable: !rec.contraindications || 
          !rec.contraindications.some(contra => 
            patientDataObj.conditions?.includes(contra) ||
            patientDataObj.medications?.some(med => med.name.toLowerCase().includes(contra))
          )
      }));
    }

    res.json({
      success: true,
      data: {
        condition,
        recommendations: contextualizedRecommendations,
        count: contextualizedRecommendations.length
      }
    });

  } catch (error) {
    logger.error('Error getting recommendations', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error getting recommendations',
      error: error.message
    });
  }
});

// Risk assessment
router.post('/risk-assessment', async (req, res) => {
  try {
    const { patientData } = req.body;

    if (!patientData) {
      return res.status(400).json({
        success: false,
        message: 'Patient data is required'
      });
    }

    logger.info('Performing risk assessment', { patientId: patientData.id });

    // Perform comprehensive analysis to get risk factors
    const analysis = await clinicalDecisionEngine.analyzePatient(patientData);

    const riskAssessment = {
      patientId: patientData.id,
      timestamp: new Date().toISOString(),
      riskFactors: analysis.riskFactors,
      overallRiskLevel: this.calculateOverallRisk(analysis.riskFactors),
      recommendations: analysis.recommendations.filter(rec => 
        rec.type === 'lifestyle' || rec.type === 'monitoring'
      ),
      monitoringPlan: this.generateMonitoringPlan(analysis.riskFactors, analysis.conditions)
    };

    res.json({
      success: true,
      data: riskAssessment
    });

  } catch (error) {
    logger.error('Error in risk assessment', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error performing risk assessment',
      error: error.message
    });
  }
});

// Clinical documentation endpoints
router.post('/notes', async (req, res) => {
  try {
    const noteData = req.body;

    if (!noteData.patientId || !noteData.content) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and content are required'
      });
    }

    logger.info('Creating clinical note', { patientId: noteData.patientId });

    const note = await documentationService.createNote(noteData);

    res.json({
      success: true,
      data: note
    });

  } catch (error) {
    logger.error('Error creating clinical note', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error creating clinical note',
      error: error.message
    });
  }
});

// Generate note from template
router.post('/notes/template/:templateKey', async (req, res) => {
  try {
    const { templateKey } = req.params;
    const { data, noteData } = req.body;

    if (!data || !noteData) {
      return res.status(400).json({
        success: false,
        message: 'Template data and note data are required'
      });
    }

    logger.info('Generating note from template', { templateKey, patientId: noteData.patientId });

    const note = await documentationService.generateNoteFromTemplate(templateKey, data, noteData);

    res.json({
      success: true,
      data: note
    });

  } catch (error) {
    logger.error('Error generating note from template', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error generating note from template',
      error: error.message
    });
  }
});

// Get patient notes
router.get('/notes/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { type, category, limit = 50 } = req.query;

    logger.info('Getting patient notes', { patientId, type, category });

    const filters = { patientId };
    if (type) filters.type = type;
    if (category) filters.category = category;

    const notes = documentationService.getNotes(filters).slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        notes,
        count: notes.length,
        filters
      }
    });

  } catch (error) {
    logger.error('Error getting patient notes', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error getting patient notes',
      error: error.message
    });
  }
});

// Get available templates
router.get('/templates', async (req, res) => {
  try {
    const templates = documentationService.getTemplates();

    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    logger.error('Error getting templates', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error getting templates',
      error: error.message
    });
  }
});

// Search clinical notes
router.get('/notes/search', async (req, res) => {
  try {
    const { query, patientId, type, category } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    logger.info('Searching clinical notes', { query, patientId });

    const filters = {};
    if (patientId) filters.patientId = patientId;
    if (type) filters.type = type;
    if (category) filters.category = category;

    const notes = documentationService.searchNotes(query, filters);

    res.json({
      success: true,
      data: {
        notes,
        count: notes.length,
        query,
        filters
      }
    });

  } catch (error) {
    logger.error('Error searching notes', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error searching notes',
      error: error.message
    });
  }
});

// Helper methods
function calculateOverallRisk(riskFactors) {
  if (!riskFactors || riskFactors.length === 0) return 'low';
  
  const highRiskFactors = riskFactors.filter(rf => rf.risk === 'increased');
  const totalFactors = riskFactors.length;
  
  if (highRiskFactors.length / totalFactors > 0.7) return 'high';
  if (highRiskFactors.length / totalFactors > 0.3) return 'moderate';
  return 'low';
}

function generateMonitoringPlan(riskFactors, conditions) {
  const monitoringPlan = {
    frequency: 'annual',
    tests: [],
    followUp: []
  };

  // Add monitoring based on risk factors
  if (riskFactors.some(rf => rf.factor === 'advanced_age')) {
    monitoringPlan.tests.push('Comprehensive metabolic panel');
    monitoringPlan.frequency = 'semi-annual';
  }

  if (riskFactors.some(rf => rf.factor === 'polypharmacy')) {
    monitoringPlan.tests.push('Medication review');
    monitoringPlan.followUp.push('Pharmacist consultation');
  }

  // Add monitoring based on conditions
  if (conditions.includes('hypertension')) {
    monitoringPlan.tests.push('Blood pressure monitoring');
    monitoringPlan.frequency = 'monthly';
  }

  if (conditions.includes('diabetes_type2')) {
    monitoringPlan.tests.push('HbA1c testing');
    monitoringPlan.frequency = 'quarterly';
  }

  return monitoringPlan;
}

module.exports = router; 