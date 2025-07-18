const express = require('express');
const { FHIRService } = require('../services/fhirService');
const { LLMService } = require('../services/llmService');
const clinicalDecisionEngine = require('../services/clinicalDecisionEngine');
const logger = require('../utils/logger');

const router = express.Router();
const fhirService = new FHIRService();
const llmService = new LLMService();

// Get patient list
router.get('/', async (req, res, next) => {
  try {
    const { getAllPatients } = require('../services/database');
    const patients = await getAllPatients();
    
    // Return simplified patient list for UI
    const patientList = patients.map(patient => ({
      id: patient.id,
      name: patient.name,
      birthDate: patient.birthDate,
      gender: patient.gender,
      conditions: patient.conditions,
      age: patient.age || calculateAge(patient.birthDate),
      medicationCount: patient.medications ? patient.medications.length : 0,
      encounterCount: patient.encounters ? patient.encounters.length : 0,
      email: patient.email,
      address: patient.address
    }));

    res.json({
      success: true,
      data: patientList,
      count: patientList.length
    });
  } catch (error) {
    next(error);
  }
});

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Get patient details
router.get('/:patientId', async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { getPatient } = require('../services/database');
    
    const patient = await getPatient(patientId);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
});

// Get patient observations
router.get('/:patientId/observations', async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { type } = req.query;
    
    const observations = await fhirService.getObservations(patientId, type);
    
    res.json({
      success: true,
      data: observations,
      count: observations.length
    });
  } catch (error) {
    next(error);
  }
});

// Get patient medications
router.get('/:patientId/medications', async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    const medications = await fhirService.getMedications(patientId);
    
    res.json({
      success: true,
      data: medications,
      count: medications.length
    });
  } catch (error) {
    next(error);
  }
});

// Get patient conditions
router.get('/:patientId/conditions', async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    const conditions = await fhirService.getConditions(patientId);
    
    res.json({
      success: true,
      data: conditions,
      count: conditions.length
    });
  } catch (error) {
    next(error);
  }
});

// Get patient encounters
router.get('/:patientId/encounters', async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    const encounters = await fhirService.getEncounters(patientId);
    
    res.json({
      success: true,
      data: encounters,
      count: encounters.length
    });
  } catch (error) {
    next(error);
  }
});

// Get patient procedures
router.get('/:patientId/procedures', async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    const procedures = await fhirService.getProcedures(patientId);
    
    res.json({
      success: true,
      data: procedures,
      count: procedures.length
    });
  } catch (error) {
    next(error);
  }
});

// Get patient allergies
router.get('/:patientId/allergies', async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    const allergies = await fhirService.getAllergies(patientId);
    
    res.json({
      success: true,
      data: allergies,
      count: allergies.length
    });
  } catch (error) {
    next(error);
  }
});

// Get comprehensive patient data
router.get('/:patientId/comprehensive', async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    // Get all patient data
    const [patient, observations, medications, conditions, encounters, procedures, allergies] = await Promise.all([
      fhirService.getPatient(patientId),
      fhirService.getObservations(patientId),
      fhirService.getMedications(patientId),
      fhirService.getConditions(patientId),
      fhirService.getEncounters(patientId),
      fhirService.getProcedures(patientId),
      fhirService.getAllergies(patientId)
    ]);
    
    const comprehensiveData = {
      patient,
      observations,
      medications,
      conditions,
      encounters,
      procedures,
      allergies,
      summary: {
        totalObservations: observations.length,
        totalMedications: medications.length,
        totalConditions: conditions.length,
        totalEncounters: encounters.length,
        totalProcedures: procedures.length,
        totalAllergies: allergies.length
      }
    };
    
    res.json({
      success: true,
      data: comprehensiveData
    });
  } catch (error) {
    next(error);
  }
});

// Search patients
router.get('/search/:query', async (req, res, next) => {
  try {
    const { query } = req.params;
    
    // For demo purposes, return mock search results
    const searchResults = [
      {
        id: 'patient-1',
        name: 'John Doe',
        birthDate: '1980-05-15',
        gender: 'male',
        matchReason: 'Name matches query'
      }
    ];
    
    res.json({
      success: true,
      data: searchResults,
      query,
      count: searchResults.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 