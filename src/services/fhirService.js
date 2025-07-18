const axios = require('axios');
const { logger } = require('../utils/logger');

class FHIRService {
  constructor() {
    this.baseURL = process.env.FHIR_BASE_URL || 'https://r4.smarthealthit.org';
    this.clientId = process.env.FHIR_CLIENT_ID;
    this.clientSecret = process.env.FHIR_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // Initialize axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Add request interceptor for authentication
    this.client.interceptors.request.use(async (config) => {
      if (this.shouldRefreshToken()) {
        await this.authenticate();
      }
      
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      
      return config;
    });
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.authenticate();
          // Retry the request
          return this.client.request(error.config);
        }
        throw error;
      }
    );
  }

  async authenticate() {
    try {
      // For SMART on FHIR, we'll use a simplified authentication
      // In production, this should implement proper OAuth2 flow
      const response = await axios.post(`${this.baseURL}/auth/token`, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });
      
      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      logger.info('FHIR authentication successful');
    } catch (error) {
      logger.error('FHIR authentication failed:', error.message);
      // For demo purposes, continue without authentication
      this.accessToken = 'demo-token';
    }
  }

  shouldRefreshToken() {
    return !this.accessToken || (this.tokenExpiry && Date.now() > this.tokenExpiry - 60000);
  }

  async getPatient(patientId) {
    try {
      const response = await this.client.get(`/Patient/${patientId}`);
      return this.formatPatientData(response.data);
    } catch (error) {
      logger.error(`Error fetching patient ${patientId}:`, error.message);
      // Return mock data for demo purposes
      return this.getMockPatientData(patientId);
    }
  }

  async getObservations(patientId, observationType = null) {
    try {
      let url = `/Observation?patient=${patientId}&_count=100`;
      if (observationType) {
        url += `&code=${observationType}`;
      }
      
      const response = await this.client.get(url);
      return this.formatObservations(response.data.entry || []);
    } catch (error) {
      logger.error(`Error fetching observations for patient ${patientId}:`, error.message);
      return this.getMockObservations(patientId);
    }
  }

  async getMedications(patientId) {
    try {
      const response = await this.client.get(`/MedicationRequest?patient=${patientId}&_count=100`);
      return this.formatMedications(response.data.entry || []);
    } catch (error) {
      logger.error(`Error fetching medications for patient ${patientId}:`, error.message);
      return this.getMockMedications(patientId);
    }
  }

  async getConditions(patientId) {
    try {
      const response = await this.client.get(`/Condition?patient=${patientId}&_count=100`);
      return this.formatConditions(response.data.entry || []);
    } catch (error) {
      logger.error(`Error fetching conditions for patient ${patientId}:`, error.message);
      return this.getMockConditions(patientId);
    }
  }

  async getEncounters(patientId) {
    try {
      const response = await this.client.get(`/Encounter?patient=${patientId}&_count=100`);
      return this.formatEncounters(response.data.entry || []);
    } catch (error) {
      logger.error(`Error fetching encounters for patient ${patientId}:`, error.message);
      return this.getMockEncounters(patientId);
    }
  }

  async getProcedures(patientId) {
    try {
      const response = await this.client.get(`/Procedure?patient=${patientId}&_count=100`);
      return this.formatProcedures(response.data.entry || []);
    } catch (error) {
      logger.error(`Error fetching procedures for patient ${patientId}:`, error.message);
      return this.getMockProcedures(patientId);
    }
  }

  async getAllergies(patientId) {
    try {
      const response = await this.client.get(`/AllergyIntolerance?patient=${patientId}&_count=100`);
      return this.formatAllergies(response.data.entry || []);
    } catch (error) {
      logger.error(`Error fetching allergies for patient ${patientId}:`, error.message);
      return this.getMockAllergies(patientId);
    }
  }

  // Data formatting methods
  formatPatientData(patient) {
    return {
      id: patient.id,
      name: `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}`,
      birthDate: patient.birthDate,
      gender: patient.gender,
      address: patient.address?.[0],
      telecom: patient.telecom,
      identifier: patient.identifier,
      resourceType: 'Patient',
    };
  }

  formatObservations(observations) {
    return observations.map(entry => ({
      id: entry.resource.id,
      code: entry.resource.code?.coding?.[0]?.code,
      display: entry.resource.code?.coding?.[0]?.display,
      value: entry.resource.valueQuantity || entry.resource.valueCodeableConcept,
      effectiveDateTime: entry.resource.effectiveDateTime,
      status: entry.resource.status,
      category: entry.resource.category?.[0]?.coding?.[0]?.code,
      resourceType: 'Observation',
    }));
  }

  formatMedications(medications) {
    return medications.map(entry => ({
      id: entry.resource.id,
      medication: entry.resource.medicationCodeableConcept?.coding?.[0]?.display,
      status: entry.resource.status,
      intent: entry.resource.intent,
      dosage: entry.resource.dosageInstruction?.[0],
      prescribedDate: entry.resource.authoredOn,
      resourceType: 'MedicationRequest',
    }));
  }

  formatConditions(conditions) {
    return conditions.map(entry => ({
      id: entry.resource.id,
      code: entry.resource.code?.coding?.[0]?.code,
      display: entry.resource.code?.coding?.[0]?.display,
      status: entry.resource.clinicalStatus?.coding?.[0]?.code,
      onsetDate: entry.resource.onsetDateTime,
      severity: entry.resource.severity?.coding?.[0]?.code,
      resourceType: 'Condition',
    }));
  }

  formatEncounters(encounters) {
    return encounters.map(entry => ({
      id: entry.resource.id,
      type: entry.resource.type?.[0]?.coding?.[0]?.display,
      status: entry.resource.status,
      startDate: entry.resource.period?.start,
      endDate: entry.resource.period?.end,
      provider: entry.resource.participant?.[0]?.individual?.reference,
      resourceType: 'Encounter',
    }));
  }

  formatProcedures(procedures) {
    return procedures.map(entry => ({
      id: entry.resource.id,
      code: entry.resource.code?.coding?.[0]?.code,
      display: entry.resource.code?.coding?.[0]?.display,
      status: entry.resource.status,
      performedDate: entry.resource.performedDateTime,
      performer: entry.resource.performer?.[0]?.actor?.reference,
      resourceType: 'Procedure',
    }));
  }

  formatAllergies(allergies) {
    return allergies.map(entry => ({
      id: entry.resource.id,
      substance: entry.resource.code?.coding?.[0]?.display,
      severity: entry.resource.severity,
      status: entry.resource.clinicalStatus?.coding?.[0]?.code,
      onsetDate: entry.resource.onsetDateTime,
      resourceType: 'AllergyIntolerance',
    }));
  }

  // Mock data methods for demo purposes
  getMockPatientData(patientId) {
    return {
      id: patientId,
      name: 'John Doe',
      birthDate: '1980-05-15',
      gender: 'male',
      address: {
        line: ['123 Main St'],
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
      },
      telecom: [
        { system: 'phone', value: '555-123-4567' },
        { system: 'email', value: 'john.doe@email.com' },
      ],
      identifier: [
        { system: 'http://hospital.example.org/identifiers/patient', value: patientId },
      ],
      resourceType: 'Patient',
    };
  }

  getMockObservations(patientId) {
    return [
      {
        id: 'obs-1',
        code: '8302-2',
        display: 'Body Height',
        value: { value: 175, unit: 'cm' },
        effectiveDateTime: '2024-01-15T10:30:00Z',
        status: 'final',
        category: 'vital-signs',
        resourceType: 'Observation',
      },
      {
        id: 'obs-2',
        code: '29463-7',
        display: 'Body Weight',
        value: { value: 70, unit: 'kg' },
        effectiveDateTime: '2024-01-15T10:30:00Z',
        status: 'final',
        category: 'vital-signs',
        resourceType: 'Observation',
      },
      {
        id: 'obs-3',
        code: '85354-9',
        display: 'Blood pressure panel',
        value: { value: 120, unit: 'mmHg' },
        effectiveDateTime: '2024-01-15T10:30:00Z',
        status: 'final',
        category: 'vital-signs',
        resourceType: 'Observation',
      },
    ];
  }

  getMockMedications(patientId) {
    return [
      {
        id: 'med-1',
        medication: 'Lisinopril 10mg tablet',
        status: 'active',
        intent: 'order',
        dosage: {
          text: '1 tablet daily',
          timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } },
          route: { coding: [{ code: 'oral', display: 'Oral' }] },
        },
        prescribedDate: '2024-01-01T00:00:00Z',
        resourceType: 'MedicationRequest',
      },
      {
        id: 'med-2',
        medication: 'Metformin 500mg tablet',
        status: 'active',
        intent: 'order',
        dosage: {
          text: '1 tablet twice daily',
          timing: { repeat: { frequency: 2, period: 1, periodUnit: 'd' } },
          route: { coding: [{ code: 'oral', display: 'Oral' }] },
        },
        prescribedDate: '2024-01-01T00:00:00Z',
        resourceType: 'MedicationRequest',
      },
    ];
  }

  getMockConditions(patientId) {
    return [
      {
        id: 'cond-1',
        code: 'E11.9',
        display: 'Type 2 diabetes mellitus without complications',
        status: 'active',
        onsetDate: '2020-01-01T00:00:00Z',
        severity: 'moderate',
        resourceType: 'Condition',
      },
      {
        id: 'cond-2',
        code: 'I10',
        display: 'Essential (primary) hypertension',
        status: 'active',
        onsetDate: '2018-06-01T00:00:00Z',
        severity: 'mild',
        resourceType: 'Condition',
      },
    ];
  }

  getMockEncounters(patientId) {
    return [
      {
        id: 'enc-1',
        type: 'Office Visit',
        status: 'finished',
        startDate: '2024-01-15T09:00:00Z',
        endDate: '2024-01-15T10:00:00Z',
        provider: 'Practitioner/practitioner-1',
        resourceType: 'Encounter',
      },
    ];
  }

  getMockProcedures(patientId) {
    return [
      {
        id: 'proc-1',
        code: 'A1C',
        display: 'Hemoglobin A1c measurement',
        status: 'completed',
        performedDate: '2024-01-15T08:00:00Z',
        performer: 'Practitioner/practitioner-1',
        resourceType: 'Procedure',
      },
    ];
  }

  getMockAllergies(patientId) {
    return [
      {
        id: 'allergy-1',
        substance: 'Penicillin',
        severity: 'moderate',
        status: 'active',
        onsetDate: '2015-01-01T00:00:00Z',
        resourceType: 'AllergyIntolerance',
      },
    ];
  }
}

module.exports = {
  FHIRService,
}; 