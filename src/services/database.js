const { logger } = require('../utils/logger');
const FHIRParser = require('./fhirParser');

// In-memory storage for demo purposes
const inMemoryStorage = {
  patients: new Map(),
  decisions: new Map(),
  alerts: new Map(),
  sessions: new Map()
};

let fhirParser = null;

async function initializeDatabase() {
  try {
    // Initialize FHIR parser
    fhirParser = new FHIRParser();
    
    // Load patients from FHIR bundles
    const patients = await fhirParser.loadAllPatients();
    
    // Store patients in memory
    patients.forEach(patient => {
      inMemoryStorage.patients.set(patient.id, patient);
    });
    
    // If no FHIR patients loaded, fall back to demo data
    if (patients.length === 0) {
      logger.warn('No FHIR patients loaded, using demo data');
      initializeDemoData();
    }
    
    logger.info(`Database initialized with ${inMemoryStorage.patients.size} patients`);
    
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    logger.info('Falling back to demo data');
    initializeDemoData();
  }
}

function initializeDemoData() {
  // Demo patients
  const demoPatients = [
    {
      id: 'patient-1',
      name: 'John Doe',
      birthDate: '1980-05-15',
      gender: 'male',
      conditions: ['Type 2 diabetes', 'Hypertension'],
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'twice daily' },
        { name: 'Lisinopril', dosage: '10mg', frequency: 'once daily' }
      ],
      vitalSigns: {
        systolic: 145,
        diastolic: 92,
        heartRate: 78,
        temperature: 98.6
      },
      labResults: {
        hba1c: 7.2,
        creatinine: 1.1,
        ldl: 120
      }
    },
    {
      id: 'patient-2',
      name: 'Jane Smith',
      birthDate: '1975-08-22',
      gender: 'female',
      conditions: ['Asthma', 'Obesity'],
      medications: [
        { name: 'Albuterol', dosage: '90mcg', frequency: 'as needed' },
        { name: 'Fluticasone', dosage: '220mcg', frequency: 'twice daily' }
      ],
      vitalSigns: {
        systolic: 135,
        diastolic: 85,
        heartRate: 72,
        temperature: 98.4
      },
      labResults: {
        hba1c: 5.8,
        creatinine: 0.9,
        ldl: 110
      }
    },
    {
      id: 'patient-3',
      name: 'Robert Johnson',
      birthDate: '1965-12-10',
      gender: 'male',
      conditions: ['COPD', 'Heart failure'],
      medications: [
        { name: 'Furosemide', dosage: '40mg', frequency: 'once daily' },
        { name: 'Carvedilol', dosage: '25mg', frequency: 'twice daily' },
        { name: 'Spiriva', dosage: '18mcg', frequency: 'once daily' }
      ],
      vitalSigns: {
        systolic: 160,
        diastolic: 95,
        heartRate: 88,
        temperature: 98.8
      },
      labResults: {
        hba1c: 6.1,
        creatinine: 1.4,
        ldl: 140
      }
    }
  ];

  demoPatients.forEach(patient => {
    inMemoryStorage.patients.set(patient.id, patient);
  });

  logger.info(`Initialized ${demoPatients.length} demo patients`);
}

// Database operations
async function getPatient(patientId) {
  return inMemoryStorage.patients.get(patientId) || null;
}

async function getAllPatients() {
  return Array.from(inMemoryStorage.patients.values());
}

async function saveDecision(decision) {
  const id = `decision-${Date.now()}`;
  inMemoryStorage.decisions.set(id, { ...decision, id, timestamp: new Date().toISOString() });
  return id;
}

async function getDecisions(patientId) {
  return Array.from(inMemoryStorage.decisions.values())
    .filter(decision => decision.patientId === patientId);
}

async function saveAlert(alert) {
  const id = `alert-${Date.now()}`;
  inMemoryStorage.alerts.set(id, { ...alert, id, timestamp: new Date().toISOString() });
  return id;
}

async function getAlerts(patientId) {
  return Array.from(inMemoryStorage.alerts.values())
    .filter(alert => alert.patientId === patientId);
}

module.exports = {
  initializeDatabase,
  getPatient,
  getAllPatients,
  saveDecision,
  getDecisions,
  saveAlert,
  getAlerts
}; 