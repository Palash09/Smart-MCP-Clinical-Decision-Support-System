const { logger } = require('../utils/logger');

// Enhanced clinical decision rules with evidence-based guidelines
const CLINICAL_RULES = {
  // Cardiovascular rules
  'hypertension': {
    conditions: ['blood_pressure_high'],
    recommendations: [
      {
        type: 'medication',
        name: 'ACE Inhibitor',
        reasoning: 'First-line treatment for hypertension based on JNC-8 guidelines',
        evidence: 'JNC-8 Guidelines, Grade A recommendation',
        contraindications: ['pregnancy', 'angioedema_history']
      },
      {
        type: 'lifestyle',
        name: 'DASH Diet',
        reasoning: 'Dietary Approaches to Stop Hypertension',
        evidence: 'Multiple RCTs showing 8-14 mmHg reduction',
        priority: 'high'
      }
    ]
  },
  
  // Diabetes management
  'diabetes_type2': {
    conditions: ['diabetes', 'hba1c_elevated'],
    recommendations: [
      {
        type: 'medication',
        name: 'Metformin',
        reasoning: 'First-line therapy for type 2 diabetes',
        evidence: 'ADA Standards of Care 2024',
        contraindications: ['kidney_disease_severe', 'heart_failure']
      },
      {
        type: 'monitoring',
        name: 'HbA1c Testing',
        reasoning: 'Quarterly monitoring recommended',
        evidence: 'ADA Guidelines',
        frequency: 'every_3_months'
      }
    ]
  },
  
  // Drug interaction rules
  'warfarin_interactions': {
    conditions: ['warfarin_use'],
    interactions: [
      {
        drug: 'aspirin',
        severity: 'high',
        effect: 'Increased bleeding risk',
        recommendation: 'Avoid combination or monitor closely',
        evidence: 'Drug interaction database'
      },
      {
        drug: 'nsaids',
        severity: 'moderate',
        effect: 'Increased bleeding risk',
        recommendation: 'Use with caution, monitor INR',
        evidence: 'Clinical studies'
      }
    ]
  }
};

// Drug interaction database
const DRUG_INTERACTIONS = {
  'warfarin': {
    'aspirin': { severity: 'high', effect: 'Bleeding risk', action: 'avoid' },
    'ibuprofen': { severity: 'moderate', effect: 'Bleeding risk', action: 'monitor' },
    'amiodarone': { severity: 'high', effect: 'INR elevation', action: 'dose_adjust' }
  },
  'metformin': {
    'furosemide': { severity: 'moderate', effect: 'Lactic acidosis risk', action: 'monitor' },
    'alcohol': { severity: 'moderate', effect: 'Hypoglycemia risk', action: 'avoid' }
  },
  'digoxin': {
    'amiodarone': { severity: 'high', effect: 'Digoxin toxicity', action: 'dose_adjust' },
    'furosemide': { severity: 'moderate', effect: 'Electrolyte imbalance', action: 'monitor' }
  }
};

// Enhanced clinical decision engine
class ClinicalDecisionEngine {
  constructor() {
    this.rules = CLINICAL_RULES;
    this.drugInteractions = DRUG_INTERACTIONS;
  }

  // Analyze patient data and generate comprehensive recommendations
  async analyzePatient(patientData) {
    try {
      const analysis = {
        patientId: patientData.id,
        timestamp: new Date().toISOString(),
        conditions: [],
        recommendations: [],
        alerts: [],
        drugInteractions: [],
        riskFactors: [],
        evidenceLevel: 'moderate'
      };

      // Analyze conditions and generate recommendations
      const conditions = this.identifyConditions(patientData);
      analysis.conditions = conditions;

      // Generate evidence-based recommendations
      for (const condition of conditions) {
        const rule = this.rules[condition];
        if (rule) {
          analysis.recommendations.push(...rule.recommendations);
        }
      }

      // Check for drug interactions
      const interactions = this.checkDrugInteractions(patientData.medications || []);
      analysis.drugInteractions = interactions;

      // Generate alerts for high-priority issues
      analysis.alerts = this.generateAlerts(patientData, analysis);

      // Assess risk factors
      analysis.riskFactors = this.assessRiskFactors(patientData);

      // Determine evidence level
      analysis.evidenceLevel = this.determineEvidenceLevel(analysis.recommendations);

      logger.info('Clinical analysis completed', { patientId: patientData.id });
      return analysis;

    } catch (error) {
      logger.error('Error in clinical analysis', { error: error.message });
      throw error;
    }
  }

  // Identify clinical conditions from patient data
  identifyConditions(patientData) {
    const conditions = [];
    
    // Check vital signs
    if (patientData.vitalSigns) {
      if (patientData.vitalSigns.systolic > 140 || patientData.vitalSigns.diastolic > 90) {
        conditions.push('hypertension');
      }
      if (patientData.vitalSigns.heartRate > 100) {
        conditions.push('tachycardia');
      }
    }

    // Check lab results
    if (patientData.labResults) {
      if (patientData.labResults.hba1c > 6.5) {
        conditions.push('diabetes_type2');
      }
      if (patientData.labResults.creatinine > 1.2) {
        conditions.push('kidney_disease');
      }
    }

    // Check medications for condition indicators
    if (patientData.medications) {
      const medNames = patientData.medications.map(m => m.name.toLowerCase());
      if (medNames.some(m => m.includes('warfarin'))) {
        conditions.push('warfarin_use');
      }
      if (medNames.some(m => m.includes('insulin'))) {
        conditions.push('diabetes');
      }
    }

    return conditions;
  }

  // Check for drug interactions
  checkDrugInteractions(medications) {
    const interactions = [];
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].name.toLowerCase();
        const med2 = medications[j].name.toLowerCase();
        
        // Check if either drug has known interactions
        for (const [drug, drugInteractions] of Object.entries(this.drugInteractions)) {
          if (med1.includes(drug) || med2.includes(drug)) {
            for (const [interactingDrug, interaction] of Object.entries(drugInteractions)) {
              if (med1.includes(interactingDrug) || med2.includes(interactingDrug)) {
                interactions.push({
                  drug1: medications[i].name,
                  drug2: medications[j].name,
                  severity: interaction.severity,
                  effect: interaction.effect,
                  recommendation: interaction.action,
                  evidence: 'Drug interaction database'
                });
              }
            }
          }
        }
      }
    }

    return interactions;
  }

  // Generate clinical alerts
  generateAlerts(patientData, analysis) {
    const alerts = [];

    // High-priority alerts
    if (analysis.drugInteractions.some(i => i.severity === 'high')) {
      alerts.push({
        type: 'critical',
        message: 'High-risk drug interaction detected',
        priority: 'immediate',
        category: 'drug_interaction'
      });
    }

    // Vital sign alerts
    if (patientData.vitalSigns) {
      if (patientData.vitalSigns.systolic > 180 || patientData.vitalSigns.diastolic > 110) {
        alerts.push({
          type: 'urgent',
          message: 'Severe hypertension - immediate attention required',
          priority: 'high',
          category: 'vital_signs'
        });
      }
    }

    // Lab result alerts
    if (patientData.labResults) {
      if (patientData.labResults.hba1c > 9.0) {
        alerts.push({
          type: 'warning',
          message: 'Poor glycemic control - consider medication adjustment',
          priority: 'medium',
          category: 'lab_results'
        });
      }
    }

    return alerts;
  }

  // Assess patient risk factors
  assessRiskFactors(patientData) {
    const riskFactors = [];
    
    // Age-related risks
    if (patientData.age > 65) {
      riskFactors.push({
        factor: 'advanced_age',
        risk: 'increased',
        category: 'demographic'
      });
    }

    // Comorbidity risks
    if (patientData.conditions && patientData.conditions.length > 3) {
      riskFactors.push({
        factor: 'multiple_comorbidities',
        risk: 'increased',
        category: 'clinical'
      });
    }

    // Medication-related risks
    if (patientData.medications && patientData.medications.length > 5) {
      riskFactors.push({
        factor: 'polypharmacy',
        risk: 'increased',
        category: 'medication'
      });
    }

    return riskFactors;
  }

  // Determine evidence level of recommendations
  determineEvidenceLevel(recommendations) {
    const evidenceLevels = recommendations.map(r => {
      if (r.evidence && r.evidence.includes('Grade A')) return 'high';
      if (r.evidence && r.evidence.includes('RCT')) return 'high';
      if (r.evidence && r.evidence.includes('Guidelines')) return 'moderate';
      return 'low';
    });

    const highEvidence = evidenceLevels.filter(l => l === 'high').length;
    const total = evidenceLevels.length;

    if (highEvidence / total > 0.7) return 'high';
    if (highEvidence / total > 0.3) return 'moderate';
    return 'low';
  }

  // Get specific recommendations for a condition
  getRecommendationsForCondition(condition) {
    return this.rules[condition]?.recommendations || [];
  }

  // Validate medication orders
  validateMedicationOrder(medication, patientData) {
    const validation = {
      isValid: true,
      warnings: [],
      contraindications: [],
      interactions: []
    };

    // Check contraindications
    const contraindications = this.checkContraindications(medication, patientData);
    if (contraindications.length > 0) {
      validation.isValid = false;
      validation.contraindications = contraindications;
    }

    // Check interactions
    const interactions = this.checkDrugInteractions([medication, ...patientData.medications || []]);
    if (interactions.length > 0) {
      validation.warnings.push(...interactions);
    }

    return validation;
  }

  // Check medication contraindications
  checkContraindications(medication, patientData) {
    const contraindications = [];

    // Example contraindication checks
    if (medication.name.toLowerCase().includes('ace inhibitor') && 
        patientData.conditions?.includes('pregnancy')) {
      contraindications.push('ACE inhibitors contraindicated in pregnancy');
    }

    if (medication.name.toLowerCase().includes('metformin') && 
        patientData.labResults?.creatinine > 1.5) {
      contraindications.push('Metformin contraindicated with severe kidney disease');
    }

    return contraindications;
  }
}

module.exports = new ClinicalDecisionEngine(); 