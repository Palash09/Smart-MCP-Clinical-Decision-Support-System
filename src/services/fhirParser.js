const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');

class FHIRParser {
  constructor() {
    this.patients = new Map();
    this.patientFiles = [];
  }

  async loadAllPatients() {
    try {
      const dataDir = path.join(process.cwd(), 'generated-data');
      const files = await fs.readdir(dataDir);
      
      // Filter for FHIR bundle files
      this.patientFiles = files.filter(file => 
        file.endsWith('.fhir-bundle.xml') && 
        file.startsWith('patient-')
      );

      logger.info(`Found ${this.patientFiles.length} patient files to load`);

      // Load all patients instead of just a subset
      const filesToLoad = this.patientFiles;
      
      for (const file of filesToLoad) {
        try {
          const patientData = await this.parsePatientFile(file);
          if (patientData) {
            this.patients.set(patientData.id, patientData);
          }
        } catch (error) {
          logger.error(`Error parsing ${file}:`, error.message);
        }
      }

      logger.info(`Successfully loaded ${this.patients.size} patients`);
      return Array.from(this.patients.values());
    } catch (error) {
      logger.error('Error loading patients:', error);
      return [];
    }
  }

  async parsePatientFile(filename) {
    try {
      const filePath = path.join(process.cwd(), 'generated-data', filename);
      const xmlContent = await fs.readFile(filePath, 'utf8');
      
      // Extract patient ID from filename
      const patientId = filename.replace('patient-', '').replace('.fhir-bundle.xml', '');
      
      // Parse XML content
      const patientData = this.parseXMLContent(xmlContent, patientId);
      
      return patientData;
    } catch (error) {
      logger.error(`Error parsing file ${filename}:`, error);
      return null;
    }
  }

  parseXMLContent(xmlContent, patientId) {
    try {
      // Basic XML parsing using regex (for simplicity)
      // In production, use a proper XML parser like xml2js
      
      const patient = {
        id: patientId,
        name: '',
        birthDate: '',
        gender: '',
        email: '',
        address: {},
        medications: [],
        conditions: [],
        observations: [],
        encounters: [],
        allergies: []
      };

      // Extract Patient information
      const patientMatch = xmlContent.match(/<Patient[^>]*>([\s\S]*?)<\/Patient>/);
      if (patientMatch) {
        const patientXml = patientMatch[1];
        
        // Extract name
        const nameMatch = patientXml.match(/<family value="([^"]*)"[^>]*>[\s\S]*?<given value="([^"]*)"[^>]*>/);
        if (nameMatch) {
          patient.name = `${nameMatch[2]} ${nameMatch[1]}`;
        }

        // Extract birth date
        const birthMatch = patientXml.match(/<birthDate value="([^"]*)"[^>]*>/);
        if (birthMatch) {
          patient.birthDate = birthMatch[1];
        }

        // Extract gender
        const genderMatch = patientXml.match(/<gender value="([^"]*)"[^>]*>/);
        if (genderMatch) {
          patient.gender = genderMatch[1];
        }

        // Extract email
        const emailMatch = patientXml.match(/<telecom[^>]*>[\s\S]*?<value value="([^"]*)"[^>]*>/);
        if (emailMatch) {
          patient.email = emailMatch[1];
        }

        // Extract address
        const addressMatch = patientXml.match(/<address[^>]*>[\s\S]*?<line value="([^"]*)"[^>]*>[\s\S]*?<city value="([^"]*)"[^>]*>[\s\S]*?<state value="([^"]*)"[^>]*>/);
        if (addressMatch) {
          patient.address = {
            line: addressMatch[1],
            city: addressMatch[2],
            state: addressMatch[3]
          };
        }
      }

      // Extract medications
      const medicationMatches = xmlContent.match(/<MedicationOrder[^>]*>([\s\S]*?)<\/MedicationOrder>/g);
      if (medicationMatches) {
        patient.medications = medicationMatches.map(medXml => {
          const displayMatch = medXml.match(/<display value="([^"]*)"[^>]*>/);
          const textMatch = medXml.match(/<text value="([^"]*)"[^>]*>/);
          const dosageMatch = medXml.match(/<text value="([^"]*)"[^>]*>/);
          
          return {
            name: displayMatch ? displayMatch[1] : (textMatch ? textMatch[1] : 'Unknown'),
            dosage: dosageMatch ? dosageMatch[1] : 'As prescribed',
            frequency: this.extractFrequency(dosageMatch ? dosageMatch[1] : ''),
            type: 'medication'
          };
        });
      }

      // Extract conditions (if any)
      const conditionMatches = xmlContent.match(/<Condition[^>]*>([\s\S]*?)<\/Condition>/g);
      if (conditionMatches) {
        patient.conditions = conditionMatches.map(condXml => {
          const textMatch = condXml.match(/<text value="([^"]*)"[^>]*>/);
          return textMatch ? textMatch[1] : 'Unknown condition';
        });
      }

      // Extract observations (vital signs, lab results)
      const observationMatches = xmlContent.match(/<Observation[^>]*>([\s\S]*?)<\/Observation>/g);
      if (observationMatches) {
        patient.observations = observationMatches.map(obsXml => {
          const idMatch = obsXml.match(/<id value="([^"]*)"[^>]*>/);
          const valueMatch = obsXml.match(/<valueQuantity[^>]*>[\s\S]*?<value value="([^"]*)"[^>]*>[\s\S]*?<unit value="([^"]*)"[^>]*>/);
          
          return {
            id: idMatch ? idMatch[1] : 'unknown',
            value: valueMatch ? parseFloat(valueMatch[1]) : null,
            unit: valueMatch ? valueMatch[2] : '',
            type: this.extractObservationType(idMatch ? idMatch[1] : '')
          };
        });
      }

      // Extract encounters
      const encounterMatches = xmlContent.match(/<Encounter[^>]*>([\s\S]*?)<\/Encounter>/g);
      if (encounterMatches) {
        patient.encounters = encounterMatches.map(encXml => {
          const idMatch = encXml.match(/<id value="([^"]*)"[^>]*>/);
          const dateMatch = encXml.match(/<div[^>]*>([^:]*):/);
          
          return {
            id: idMatch ? idMatch[1] : 'unknown',
            date: dateMatch ? dateMatch[1].trim() : 'Unknown',
            type: 'ambulatory'
          };
        });
      }

      // Calculate age
      if (patient.birthDate) {
        patient.age = this.calculateAge(patient.birthDate);
      }

      // Extract vital signs from observations
      patient.vitalSigns = this.extractVitalSigns(patient.observations);

      // Extract lab results from observations
      patient.labResults = this.extractLabResults(patient.observations);

      // Generate conditions from medications (if no conditions found)
      if (patient.conditions.length === 0) {
        patient.conditions = this.inferConditionsFromMedications(patient.medications);
      }

      return patient;
    } catch (error) {
      logger.error(`Error parsing XML content for patient ${patientId}:`, error);
      return null;
    }
  }

  extractFrequency(dosageText) {
    if (!dosageText) return 'As needed';
    
    const frequencyMap = {
      'qd': 'once daily',
      'bid': 'twice daily',
      'tid': 'three times daily',
      'qid': 'four times daily',
      'q4h': 'every 4 hours',
      'q6h': 'every 6 hours',
      'q8h': 'every 8 hours',
      'prn': 'as needed',
      'wf': 'with food',
      'ac': 'before meals',
      'pc': 'after meals'
    };

    for (const [code, description] of Object.entries(frequencyMap)) {
      if (dosageText.toLowerCase().includes(code)) {
        return description;
      }
    }

    return dosageText;
  }

  extractObservationType(observationId) {
    if (observationId.includes('height')) return 'height';
    if (observationId.includes('weight')) return 'weight';
    if (observationId.includes('bmi')) return 'bmi';
    if (observationId.includes('bp') || observationId.includes('blood-pressure')) return 'blood-pressure';
    if (observationId.includes('hr') || observationId.includes('heart-rate')) return 'heart-rate';
    if (observationId.includes('temp') || observationId.includes('temperature')) return 'temperature';
    if (observationId.includes('glucose') || observationId.includes('sugar')) return 'glucose';
    if (observationId.includes('hba1c')) return 'hba1c';
    if (observationId.includes('creatinine')) return 'creatinine';
    if (observationId.includes('ldl') || observationId.includes('cholesterol')) return 'cholesterol';
    return 'unknown';
  }

  extractVitalSigns(observations) {
    const vitalSigns = {};
    
    observations.forEach(obs => {
      switch (obs.type) {
        case 'height':
          vitalSigns.height = { value: obs.value, unit: obs.unit };
          break;
        case 'weight':
          vitalSigns.weight = { value: obs.value, unit: obs.unit };
          break;
        case 'bmi':
          vitalSigns.bmi = { value: obs.value, unit: obs.unit };
          break;
        case 'blood-pressure':
          // Parse systolic/diastolic if available
          break;
        case 'heart-rate':
          vitalSigns.heartRate = { value: obs.value, unit: obs.unit };
          break;
        case 'temperature':
          vitalSigns.temperature = { value: obs.value, unit: obs.unit };
          break;
      }
    });

    return vitalSigns;
  }

  extractLabResults(observations) {
    const labResults = {};
    
    observations.forEach(obs => {
      switch (obs.type) {
        case 'glucose':
          labResults.glucose = { value: obs.value, unit: obs.unit };
          break;
        case 'hba1c':
          labResults.hba1c = { value: obs.value, unit: obs.unit };
          break;
        case 'creatinine':
          labResults.creatinine = { value: obs.value, unit: obs.unit };
          break;
        case 'cholesterol':
          labResults.ldl = { value: obs.value, unit: obs.unit };
          break;
      }
    });

    return labResults;
  }

  inferConditionsFromMedications(medications) {
    const conditions = [];
    const medicationConditions = {
      'metformin': 'Type 2 diabetes',
      'glucophage': 'Type 2 diabetes',
      'insulin': 'Diabetes',
      'levemir': 'Diabetes',
      'novolog': 'Diabetes',
      'lisinopril': 'Hypertension',
      'prinivil': 'Hypertension',
      'metoprolol': 'Hypertension',
      'toprol': 'Hypertension',
      'aspirin': 'Cardiovascular disease',
      'warfarin': 'Blood clotting disorder',
      'plavix': 'Cardiovascular disease',
      'atorvastatin': 'High cholesterol',
      'lipitor': 'High cholesterol',
      'simvastatin': 'High cholesterol',
      'albuterol': 'Asthma',
      'ventolin': 'Asthma',
      'fluticasone': 'Asthma',
      'advair': 'Asthma',
      'prednisone': 'Inflammatory condition',
      'ibuprofen': 'Pain management',
      'acetaminophen': 'Pain management',
      'tylenol': 'Pain management',
      'ferrous': 'Iron deficiency anemia',
      'feosol': 'Iron deficiency anemia'
    };

    medications.forEach(med => {
      const medName = med.name.toLowerCase();
      for (const [medKeyword, condition] of Object.entries(medicationConditions)) {
        if (medName.includes(medKeyword.toLowerCase()) && !conditions.includes(condition)) {
          conditions.push(condition);
        }
      }
    });

    return conditions;
  }

  calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  async getPatient(patientId) {
    return this.patients.get(patientId) || null;
  }

  async getAllPatients() {
    return Array.from(this.patients.values());
  }

  async getPatientList() {
    const patients = await this.getAllPatients();
    return patients.map(patient => ({
      id: patient.id,
      name: patient.name,
      birthDate: patient.birthDate,
      gender: patient.gender,
      age: patient.age,
      conditions: patient.conditions,
      medicationCount: patient.medications.length,
      encounterCount: patient.encounters.length
    }));
  }
}

module.exports = FHIRParser; 