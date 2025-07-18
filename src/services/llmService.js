const OpenAI = require('openai');
const { logger } = require('../utils/logger');

class LLMService {
  constructor() {
    // For demo purposes, handle missing API key gracefully
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'demo-api-key-for-testing') {
      this.openai = new OpenAI({
        apiKey: apiKey,
        // Set a higher timeout for API calls (60 seconds)
        defaultHeaders: { 'OpenAI-Timeout': '60000' },
        // If the OpenAI SDK supports a timeout option, set it here
        // timeout: 60000,
      });
    } else {
      this.openai = null;
      console.log('OpenAI API key not configured - using fallback responses for demo');
    }
    
    this.model = process.env.OPENAI_MODEL || 'gpt-4';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 4000;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3;
    
    // Clinical analysis prompts
    this.clinicalPrompts = {
      general: `You are a clinical decision support AI assistant. Analyze the provided patient data and provide evidence-based clinical insights. Focus on:
1. Key clinical findings
2. Potential risks or concerns
3. Recommended next steps
4. Clinical reasoning

Patient Data:`,
      
      vitalSigns: `Analyze the patient's vital signs and provide clinical interpretation. Consider:
1. Normal ranges for age and gender
2. Trends over time
3. Clinical significance of abnormal values
4. Recommended monitoring or interventions

Vital Signs Data:`,
      
      medications: `Review the patient's medication list and provide clinical analysis. Consider:
1. Medication appropriateness for conditions
2. Potential drug interactions
3. Dosage optimization opportunities
4. Medication adherence considerations

Medication Data:`,
      
      conditions: `Analyze the patient's medical conditions and provide clinical insights. Consider:
1. Condition severity and progression
2. Comorbidity interactions
3. Treatment optimization opportunities
4. Preventive care recommendations

Condition Data:`,
      
      summary: `Generate a comprehensive clinical summary for this patient. Include:
1. Active problems and conditions
2. Current medications and their purposes
3. Recent clinical findings
4. Recommended follow-up actions
5. Risk factors and preventive measures

Patient Summary Data:`,
    };
  }

  async analyzeClinicalData(clinicalData, analysisType = 'general') {
    try {
      // If OpenAI is not available, use fallback
      if (!this.openai) {
        return this.getFallbackAnalysis(clinicalData, analysisType);
      }

      // Check if there's a custom prompt in the clinical data
      const customPrompt = clinicalData.prompt;
      let prompt, dataString;
      
      if (customPrompt) {
        // Use custom prompt directly
        prompt = customPrompt;
        dataString = '';
      } else {
        // Use standard prompts
        prompt = this.clinicalPrompts[analysisType] || this.clinicalPrompts.general;
        dataString = JSON.stringify(clinicalData, null, 2);
      }
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a clinical decision support AI assistant. Provide clear, evidence-based clinical analysis. Always consider patient safety and clinical best practices.'
          },
          {
            role: 'user',
            content: customPrompt ? prompt : `${prompt}\n\n${dataString}`
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error in clinical data analysis:', error);
      return this.getFallbackAnalysis(clinicalData, analysisType);
    }
  }

  async generateClinicalSummary(patientData, summaryType = 'comprehensive') {
    try {
      // If OpenAI is not available, use fallback
      if (!this.openai) {
        return this.getFallbackSummary(patientData, summaryType);
      }

      const prompt = this.clinicalPrompts.summary;
      const dataString = JSON.stringify(patientData, null, 2);
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a clinical documentation assistant. Generate clear, professional clinical summaries suitable for healthcare providers.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nSummary Type: ${summaryType}\n\n${dataString}`
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error generating clinical summary:', error);
      return this.getFallbackSummary(patientData, summaryType);
    }
  }

  async generateTreatmentRecommendations(patientData, condition) {
    try {
      // If OpenAI is not available, use fallback
      if (!this.openai) {
        return this.getFallbackRecommendations(patientData, condition);
      }

      let prompt, dataString;
      
      // Check if there's a custom prompt in the patient data
      if (patientData.prompt) {
        prompt = patientData.prompt;
        dataString = '';
      } else {
        // Use standard prompt
        prompt = `Based on the patient data and the specified condition, provide evidence-based treatment recommendations. Consider:
1. Current clinical guidelines
2. Patient-specific factors (age, comorbidities, allergies)
3. Medication interactions
4. Monitoring requirements
5. Follow-up recommendations

Condition: ${condition}
Patient Data:`;
        dataString = JSON.stringify(patientData, null, 2);
      }

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a clinical decision support AI assistant. Provide evidence-based treatment recommendations based on current clinical guidelines and patient-specific factors.'
          },
          {
            role: 'user',
            content: patientData.prompt ? prompt : `${prompt}\n\n${dataString}`
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error generating treatment recommendations:', error);
      return this.getFallbackRecommendations(patientData, condition);
    }
  }

  async assessClinicalRisk(patientData, riskFactors) {
    try {
      const prompt = `Assess the patient's clinical risk based on the provided data and risk factors. Consider:
1. Current risk factors
2. Historical data trends
3. Clinical indicators
4. Risk stratification
5. Preventive recommendations

Risk Factors: ${riskFactors.join(', ')}
Patient Data:`;

      const dataString = JSON.stringify(patientData, null, 2);
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a clinical risk assessment AI assistant. Provide evidence-based risk assessment and recommendations for risk mitigation.'
          },
          {
            role: 'user',
            content: `${prompt}\n\n${dataString}`
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error in clinical risk assessment:', error);
      return this.getFallbackRiskAssessment(patientData, riskFactors);
    }
  }

  async interpretLabResults(labData) {
    try {
      const prompt = `Interpret the provided laboratory results. Consider:
1. Normal reference ranges
2. Clinical significance of abnormal values
3. Trends over time
4. Potential clinical implications
5. Recommended follow-up actions

Laboratory Results:`;

      const dataString = JSON.stringify(labData, null, 2);
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a clinical laboratory interpretation AI assistant. Provide clear, evidence-based interpretation of laboratory results.'
          },
          {
            role: 'user',
            content: `${prompt}\n\n${dataString}`
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error interpreting lab results:', error);
      return this.getFallbackLabInterpretation(labData);
    }
  }

  async generateSOAPNote(patientData, encounterData) {
    try {
      const prompt = `Generate a SOAP note based on the patient data and encounter information. Include:

Subjective: Patient's chief complaint and history
Objective: Physical examination findings and vital signs
Assessment: Clinical impressions and differential diagnosis
Plan: Treatment plan and follow-up recommendations

Encounter Data:`;

      const dataString = JSON.stringify({ patient: patientData, encounter: encounterData }, null, 2);
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a clinical documentation AI assistant. Generate professional SOAP notes following standard medical documentation practices.'
          },
          {
            role: 'user',
            content: `${prompt}\n\n${dataString}`
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error generating SOAP note:', error);
      return this.getFallbackSOAPNote(patientData, encounterData);
    }
  }

  // Fallback methods for when LLM is unavailable
  getFallbackAnalysis(clinicalData, analysisType) {
    const patient = clinicalData.patient;
    const observations = clinicalData.observations || [];
    const medications = clinicalData.medications || [];
    const conditions = clinicalData.conditions || [];

    let analysis = `Clinical Analysis for ${patient.name} (ID: ${patient.id})\n\n`;
    
    if (observations.length > 0) {
      analysis += `Vital Signs: ${observations.length} observations recorded\n`;
    }
    
    if (medications.length > 0) {
      analysis += `Medications: ${medications.length} active medications\n`;
    }
    
    if (conditions.length > 0) {
      analysis += `Conditions: ${conditions.length} active conditions\n`;
    }
    
    analysis += `\nRecommendation: Review complete patient data for comprehensive assessment.`;
    
    return analysis;
  }

  getFallbackSummary(patientData, summaryType) {
    const patient = patientData.patient;
    return `Clinical Summary for ${patient.name}
Date: ${new Date().toLocaleDateString()}
Patient ID: ${patient.id}

This is a fallback summary. Please review the complete patient data for accurate clinical assessment.`;
  }

  getFallbackRecommendations(patientData, condition) {
    return `Treatment Recommendations for ${condition}

Based on available data, consider:
1. Review current clinical guidelines for ${condition}
2. Assess patient-specific factors
3. Consider medication interactions
4. Plan appropriate follow-up

Note: This is a fallback recommendation. Please consult current clinical guidelines and patient-specific factors.`;
  }

  getFallbackRiskAssessment(patientData, riskFactors) {
    return `Clinical Risk Assessment

Risk Factors Identified: ${riskFactors.join(', ')}

Recommendations:
1. Monitor identified risk factors
2. Implement appropriate preventive measures
3. Schedule regular follow-up assessments
4. Consider specialist consultation if indicated

Note: This is a fallback assessment. Please conduct comprehensive risk evaluation.`;
  }

  getFallbackLabInterpretation(labData) {
    return `Laboratory Results Interpretation

Results available: ${labData.length} laboratory values

Recommendations:
1. Review all laboratory values against reference ranges
2. Consider clinical context and patient history
3. Assess trends over time if available
4. Plan appropriate follow-up testing if indicated

Note: This is a fallback interpretation. Please review actual laboratory values and reference ranges.`;
  }

  getFallbackSOAPNote(patientData, encounterData) {
    const patient = patientData.patient;
    return `SOAP Note - Fallback Template

Subjective: [Patient's chief complaint and history]
Objective: [Physical examination findings and vital signs]
Assessment: [Clinical impressions and differential diagnosis]
Plan: [Treatment plan and follow-up recommendations]

Patient: ${patient.name}
Date: ${new Date().toLocaleDateString()}

Note: This is a fallback SOAP note template. Please complete with actual clinical data.`;
  }
}

module.exports = {
  LLMService,
}; 