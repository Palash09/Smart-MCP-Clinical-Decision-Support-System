const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { logger } = require('../utils/logger');
const { FHIRService } = require('./fhirService');
const { LLMService } = require('./llmService');
const clinicalDecisionEngine = require('./clinicalDecisionEngine');

class MCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mcp-fhir-cdss',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.fhirService = new FHIRService();
    this.llmService = new LLMService();
    this.clinicalEngine = clinicalDecisionEngine;
    
    this.setupTools();
    this.setupResources();
  }

  setupTools() {
    // Patient Data Tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case 'get_patient_data':
            return await this.getPatientData(args);
          
          case 'get_patient_observations':
            return await this.getPatientObservations(args);
          
          case 'get_patient_medications':
            return await this.getPatientMedications(args);
          
          case 'get_patient_conditions':
            return await this.getPatientConditions(args);
          
          case 'analyze_clinical_data':
            return await this.analyzeClinicalData(args);
          
          case 'get_treatment_recommendations':
            return await this.getTreatmentRecommendations(args);
          
          case 'check_drug_interactions':
            return await this.checkDrugInteractions(args);
          
          case 'generate_clinical_summary':
            return await this.generateClinicalSummary(args);
          
          case 'assess_clinical_risk':
            return await this.assessClinicalRisk(args);
          
          case 'get_evidence_based_guidelines':
            return await this.getEvidenceBasedGuidelines(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Error in tool ${name}:`, error);
        throw error;
      }
    });
  }

  setupResources() {
    // For demo purposes, skip MCP resource setup to avoid SDK issues
    logger.info('MCP resources setup skipped for demo - using REST API instead');
  }

  // Tool Implementations
  async getPatientData(args) {
    const { patientId } = args;
    const patientData = await this.fhirService.getPatient(patientId);
    
    return {
      content: [
        {
          type: 'text',
          text: `Patient data retrieved for ID: ${patientId}`,
        },
        {
          type: 'json',
          json: patientData,
        },
      ],
    };
  }

  async getPatientObservations(args) {
    const { patientId, observationType } = args;
    const observations = await this.fhirService.getObservations(patientId, observationType);
    
    return {
      content: [
        {
          type: 'text',
          text: `Observations retrieved for patient ${patientId}`,
        },
        {
          type: 'json',
          json: observations,
        },
      ],
    };
  }

  async getPatientMedications(args) {
    const { patientId } = args;
    const medications = await this.fhirService.getMedications(patientId);
    
    return {
      content: [
        {
          type: 'text',
          text: `Medications retrieved for patient ${patientId}`,
        },
        {
          type: 'json',
          json: medications,
        },
      ],
    };
  }

  async getPatientConditions(args) {
    const { patientId } = args;
    const conditions = await this.fhirService.getConditions(patientId);
    
    return {
      content: [
        {
          type: 'text',
          text: `Medical conditions retrieved for patient ${patientId}`,
        },
        {
          type: 'json',
          json: conditions,
        },
      ],
    };
  }

  async analyzeClinicalData(args) {
    const { patientId, analysisType } = args;
    
    // Get comprehensive patient data
    const patientData = await this.fhirService.getPatient(patientId);
    const observations = await this.fhirService.getObservations(patientId);
    const medications = await this.fhirService.getMedications(patientId);
    const conditions = await this.fhirService.getConditions(patientId);
    
    // Combine data for analysis
    const clinicalData = {
      patient: patientData,
      observations,
      medications,
      conditions,
    };
    
    // Use LLM for clinical analysis
    const analysis = await this.llmService.analyzeClinicalData(clinicalData, analysisType);
    
    return {
      content: [
        {
          type: 'text',
          text: analysis,
        },
        {
          type: 'json',
          json: clinicalData,
        },
      ],
    };
  }

  async getTreatmentRecommendations(args) {
    const { patientId, condition } = args;
    
    // Get patient data
    const patientData = await this.fhirService.getPatient(patientId);
    const medications = await this.fhirService.getMedications(patientId);
    const conditions = await this.fhirService.getConditions(patientId);
    
    // Generate treatment recommendations using clinical decision engine
    const recommendations = await this.clinicalEngine.generateRecommendations({
      patient: patientData,
      medications,
      conditions,
      targetCondition: condition,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: recommendations.summary,
        },
        {
          type: 'json',
          json: recommendations,
        },
      ],
    };
  }

  async checkDrugInteractions(args) {
    const { medications } = args;
    
    const interactions = await this.clinicalEngine.checkDrugInteractions(medications);
    
    return {
      content: [
        {
          type: 'text',
          text: interactions.summary,
        },
        {
          type: 'json',
          json: interactions,
        },
      ],
    };
  }

  async generateClinicalSummary(args) {
    const { patientId, summaryType } = args;
    
    // Get patient data
    const patientData = await this.fhirService.getPatient(patientId);
    const observations = await this.fhirService.getObservations(patientId);
    const medications = await this.fhirService.getMedications(patientId);
    const conditions = await this.fhirService.getConditions(patientId);
    
    // Generate clinical summary using LLM
    const summary = await this.llmService.generateClinicalSummary({
      patient: patientData,
      observations,
      medications,
      conditions,
    }, summaryType);
    
    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
      ],
    };
  }

  async assessClinicalRisk(args) {
    const { patientId, riskFactors } = args;
    
    // Get patient data
    const patientData = await this.fhirService.getPatient(patientId);
    const observations = await this.fhirService.getObservations(patientId);
    const conditions = await this.fhirService.getConditions(patientId);
    
    // Assess clinical risk
    const riskAssessment = await this.clinicalEngine.assessRisk({
      patient: patientData,
      observations,
      conditions,
      riskFactors,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: riskAssessment.summary,
        },
        {
          type: 'json',
          json: riskAssessment,
        },
      ],
    };
  }

  async getEvidenceBasedGuidelines(args) {
    const { condition, patientAge, patientGender } = args;
    
    const guidelines = await this.clinicalEngine.getGuidelines({
      condition,
      patientAge,
      patientGender,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: guidelines.summary,
        },
        {
          type: 'json',
          json: guidelines,
        },
      ],
    };
  }

  async getFHIRResource(uri) {
    // Parse URI to determine resource type and ID
    const uriParts = uri.replace('fhir://', '').split('/');
    const resourceType = uriParts[0];
    const resourceId = uriParts[1];
    
    switch (resourceType) {
      case 'patients':
        return await this.fhirService.getPatient(resourceId);
      case 'observations':
        return await this.fhirService.getObservations(resourceId);
      case 'medications':
        return await this.fhirService.getMedications(resourceId);
      case 'conditions':
        return await this.fhirService.getConditions(resourceId);
      default:
        throw new Error(`Unknown resource type: ${resourceType}`);
    }
  }

  async start() {
    // For demo purposes, skip MCP server startup to avoid SDK issues
    logger.info('MCP Server initialization skipped for demo - using REST API instead');
  }
}

// Singleton instance
let mcpServerInstance = null;

async function initializeMCPServer() {
  if (!mcpServerInstance) {
    mcpServerInstance = new MCPServer();
    await mcpServerInstance.start();
  }
  return mcpServerInstance;
}

module.exports = {
  MCPServer,
  initializeMCPServer,
}; 