// Global variables
let currentPersona = null;
let currentPatient = null;
let patients = [];

// API base URL
const API_BASE = 'http://localhost:3000/api';

// Pagination state
let currentPage = 1;
const patientsPerPage = 10;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializePersonaSelection();
    loadPatients();
    // Persona switching from navbar dropdown
    document.querySelectorAll('.persona-switch').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const persona = this.getAttribute('data-persona');
            if (persona) {
                currentPersona = persona;
                updateUIForPersona();
                document.getElementById('currentPersona').textContent = capitalize(persona);
                // Hide persona selection if visible
                const personaSelection = document.getElementById('personaSelection');
                if (personaSelection) personaSelection.style.display = 'none';
            }
        });
    });
});

// Persona selection
function initializePersonaSelection() {
    const personaCards = document.querySelectorAll('.persona-card');
    
    personaCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove previous selection
            personaCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            this.classList.add('selected');
            
            // Set current persona
            currentPersona = this.dataset.persona;
            document.getElementById('currentPersona').textContent = 
                this.querySelector('.card-title').textContent;
            
            // Show main application
            document.getElementById('personaSelection').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            
            // Update UI based on persona
            updateUIForPersona();
        });
    });
}

// Update UI based on selected persona
function updateUIForPersona() {
  const personaFeatures = {
    physician: {
      canAnalyze: true,
      canPrescribe: false,
      canViewAll: true,
      canEdit: true,
      title: 'Physician Dashboard',
      description: 'Full clinical access with prescribing capabilities',
      primaryActions: ['analyze', 'risk-assessment', 'predictions'],
      secondaryActions: ['alerts']
    },
    pharmacist: {
      canAnalyze: false,
      canPrescribe: false,
      canViewAll: false,
      canEdit: false,
      focusOn: 'medications',
      title: 'Pharmacist Dashboard',
      description: 'Medication management and drug interaction focus',
      primaryActions: ['interactions', 'medication-review'],
      secondaryActions: []
    }
  };
  const features = personaFeatures[currentPersona];
  updateDashboard(features);
  updateClinicalButtons(features);
  updatePatientFilters(features);
  // Show patient table when persona is selected
  const patientListCard = document.querySelector('.card.purple-gradient:has(#patientList)');
  if (features && patientListCard) {
    patientListCard.style.display = '';
  }
}

// On load, show patient table (patients are loaded immediately)
window.addEventListener('DOMContentLoaded', function() {
  const patientListCard = document.querySelector('.card.purple-gradient:has(#patientList)');
  if (patientListCard) {
    patientListCard.style.display = 'block';
  }
});

// Only show implemented buttons in createActionButton with uniform sizing
function createActionButton(action, priority) {
  const implementedActions = ['analyze', 'risk-assessment', 'predictions', 'interactions', 'alerts', 'medication-review'];
  if (!implementedActions.includes(action)) return document.createElement('div');
  
  const col = document.createElement('div');
  col.className = 'col-12 mb-2';
  
  const button = document.createElement('button');
  button.className = `btn btn-${priority === 'primary' ? 'primary' : 'success'} w-100`;
  
      const actionConfig = {
        'analyze': { icon: 'chart-line', text: 'Analyze Patient', handler: analyzePatient },
        'prescribe': { icon: 'prescription', text: 'Prescribe Medication', handler: prescribeMedication },
        'risk-assessment': { icon: 'shield-alt', text: 'Risk Assessment', handler: assessRisk },
        'predictions': { icon: 'brain', text: 'Generate Predictions', handler: generatePredictions },
        'interactions': { icon: 'exclamation-triangle', text: 'Check Interactions', handler: checkInteractions },
        'alerts': { icon: 'bell', text: 'View Alerts', handler: viewAlerts },
        'monitor': { icon: 'heartbeat', text: 'Monitor Patient', handler: monitorPatient },
        'vital-signs': { icon: 'thermometer-half', text: 'Vital Signs', handler: viewVitalSigns },
        'medication-review': { icon: 'pills', text: 'Medication Review', handler: reviewMedications },
        'dosage-check': { icon: 'calculator', text: 'Dosage Check', handler: checkDosage },
        'analytics': { icon: 'chart-bar', text: 'Analytics', handler: viewAnalytics },
                'risk-stratification': { icon: 'layer-group', text: 'Risk Stratification', handler: stratifyRisk }
    };
  
  const config = actionConfig[action];
  if (config) {
    button.innerHTML = `<i class="fas fa-${config.icon} me-2"></i>${config.text}`;
    button.onclick = config.handler;
  } else {
    button.innerHTML = `<i class="fas fa-cog me-2"></i>${action}`;
    button.onclick = () => showError(`${action} feature not implemented yet`);
  }
  
  col.appendChild(button);
  return col;
}

// Update patient filters based on persona (remove filter buttons)
function updatePatientFilters(features) {
  // Remove filter functionality as requested
  return;
}

// Simplified medication review for pharmacist
async function reviewMedications() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    if (currentPersona !== 'pharmacist') {
        showError('This feature is for pharmacists only');
        return;
    }
    
    const resultsElement = document.getElementById('decisionResults');
    const medications = currentPatient.medications || [];
    
    if (medications.length === 0) {
        resultsElement.innerHTML = `
            <div class="alert alert-info">
                <h6><i class="fas fa-pills me-2"></i>Medication Review</h6>
                <p class="text-muted">No medications found for this patient.</p>
            </div>
        `;
        return;
    }
    
    // Generate simplified medication review
    let reviewHtml = `
        <div class="alert alert-info">
            <h6><i class="fas fa-pills me-2"></i>Medication Review for ${currentPatient.name}</h6>
            <div class="mt-3">
                <h6>Patient Summary:</h6>
                <p><strong>Age:</strong> ${currentPatient.age || 'Not specified'} | <strong>Conditions:</strong> ${(currentPatient.conditions || []).map(c => toProperCase(c)).join(', ') || 'None recorded'}</p>
                
                <h6>Medication Analysis (${medications.length} medications):</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Medication</th>
                                <th>Risk Level</th>
                                <th>Side Effects to Monitor</th>
                                <th>Pharmacist Notes</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    medications.forEach((med, index) => {
        const riskLevel = assessMedicationRisk(med);
        const riskClass = riskLevel === 'high' ? 'danger' : riskLevel === 'medium' ? 'warning' : 'success';
        const sideEffects = getMedicationSideEffects(med);
        const pharmacistNotes = getPharmacistNotes(med, currentPatient);
        
        // For pharmacist persona, only show frequency if different from dosage
        let medicationInfo = `<strong>${med.name}</strong><br><small class="text-muted">${med.dosage || 'As prescribed'}</small>`;
        if (med.frequency && med.frequency !== med.dosage) {
            medicationInfo += `<br><small class="text-muted">Frequency: ${med.frequency}</small>`;
        }
        
        reviewHtml += `
            <tr>
                <td>${medicationInfo}</td>
                <td><span class="badge bg-${riskClass}">${riskLevel.toUpperCase()}</span></td>
                <td><small>${sideEffects}</small></td>
                <td><small>${pharmacistNotes}</small></td>
            </tr>
        `;
    });
    
    reviewHtml += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    resultsElement.innerHTML = reviewHtml;
}

// Assess medication risk for pharmacist review
function assessMedicationRisk(medication) {
    const highRiskMeds = ['warfarin', 'digoxin', 'lithium', 'methotrexate', 'insulin'];
    const mediumRiskMeds = ['aspirin', 'ibuprofen', 'prednisone', 'furosemide'];
    
    const medName = medication.name.toLowerCase();
    
    if (highRiskMeds.some(risk => medName.includes(risk))) {
        return 'high';
    } else if (mediumRiskMeds.some(risk => medName.includes(risk))) {
        return 'medium';
    }
    
    return 'low';
}

// Enhanced pharmacist interaction check with valuable information
function displayPharmacistInteractionCheck() {
    const resultsElement = document.getElementById('decisionResults');
    const medications = currentPatient.medications || [];
    
    if (medications.length === 0) {
        resultsElement.innerHTML = `
            <div class="alert alert-info">
                <h6><i class="fas fa-exclamation-triangle me-2"></i>Drug Interaction Check</h6>
                <p class="text-muted">No medications found for this patient to check interactions.</p>
            </div>
        `;
        return;
    }
    
    // Generate interaction analysis
    const interactions = [];
    const warnings = [];
    
    // Check for common drug interactions
    for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
            const med1 = medications[i].name.toLowerCase();
            const med2 = medications[j].name.toLowerCase();
            
            // Common interaction patterns
            if ((med1.includes('warfarin') && med2.includes('aspirin')) || 
                (med1.includes('aspirin') && med2.includes('warfarin'))) {
                interactions.push({
                    drug1: medications[i].name,
                    drug2: medications[j].name,
                    severity: 'high',
                    effect: 'Increased bleeding risk',
                    recommendation: 'Monitor INR closely, consider alternative antiplatelet therapy'
                });
            }
            
            if ((med1.includes('digoxin') && med2.includes('furosemide')) || 
                (med1.includes('furosemide') && med2.includes('digoxin'))) {
                interactions.push({
                    drug1: medications[i].name,
                    drug2: medications[j].name,
                    severity: 'medium',
                    effect: 'Increased digoxin toxicity risk due to hypokalemia',
                    recommendation: 'Monitor potassium levels and digoxin levels'
                });
            }
            
            if ((med1.includes('metformin') && med2.includes('furosemide')) || 
                (med1.includes('furosemide') && med2.includes('metformin'))) {
                interactions.push({
                    drug1: medications[i].name,
                    drug2: medications[j].name,
                    severity: 'medium',
                    effect: 'Potential for lactic acidosis',
                    recommendation: 'Monitor renal function and lactate levels'
                });
            }
        }
    }
    
    // Check for age-related concerns
    if (currentPatient.age && currentPatient.age > 65) {
        medications.forEach(med => {
            const medName = med.name.toLowerCase();
            if (medName.includes('diphenhydramine') || medName.includes('diazepam')) {
                warnings.push({
                    medication: med.name,
                    concern: 'Beers Criteria - Inappropriate for elderly',
                    recommendation: 'Consider alternative therapy for geriatric patients'
                });
            }
        });
    }
    
    // Generate comprehensive report
    let reportHtml = `
        <div class="alert alert-info">
            <h6><i class="fas fa-exclamation-triangle me-2"></i>Drug Interaction Analysis for ${currentPatient.name}</h6>
            <div class="mt-3">
                <h6>Medication Summary:</h6>
                <p><strong>Total Medications:</strong> ${medications.length}</p>
                <p><strong>Patient Age:</strong> ${currentPatient.age || 'Not specified'}</p>
                <p><strong>Gender:</strong> ${currentPatient.gender || 'Not specified'}</p>
            </div>
    `;
    
    if (interactions.length > 0) {
        reportHtml += `
            <div class="mt-3">
                <h6 class="text-warning">⚠️ Potential Interactions Found (${interactions.length}):</h6>
                <ul class="list-group list-group-flush">
        `;
        
        interactions.forEach(interaction => {
            const severityClass = interaction.severity === 'high' ? 'danger' : 'warning';
            reportHtml += `
                <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${interaction.drug1} + ${interaction.drug2}</strong><br>
                        <small class="text-muted">${interaction.effect}</small><br>
                        <small><strong>Recommendation:</strong> ${interaction.recommendation}</small>
                    </div>
                    <span class="badge bg-${severityClass}">${interaction.severity.toUpperCase()}</span>
                </li>
            `;
        });
        
        reportHtml += `</ul></div>`;
    }
    
    if (warnings.length > 0) {
        reportHtml += `
            <div class="mt-3">
                <h6 class="text-warning">⚠️ Clinical Warnings (${warnings.length}):</h6>
                <ul class="list-group list-group-flush">
        `;
        
        warnings.forEach(warning => {
            reportHtml += `
                <li class="list-group-item">
                    <strong>${warning.medication}</strong><br>
                    <small class="text-muted">${warning.concern}</small><br>
                    <small><strong>Recommendation:</strong> ${warning.recommendation}</small>
                </li>
            `;
        });
        
        reportHtml += `</ul></div>`;
    }
    
    if (interactions.length === 0 && warnings.length === 0) {
        reportHtml += `
            <div class="mt-3">
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    No major drug interactions or clinical warnings detected based on current medication profile.
                </div>
            </div>
        `;
    }
    
    reportHtml += `
            <div class="mt-3">
                <h6>Pharmacist Recommendations:</h6>
                <ul class="list-unstyled">
                    <li><i class="fas fa-check-circle text-success me-2"></i>Review medication adherence with patient</li>
                    <li><i class="fas fa-check-circle text-success me-2"></i>Monitor for adverse drug reactions</li>
                    <li><i class="fas fa-check-circle text-success me-2"></i>Assess for duplicate therapy</li>
                    <li><i class="fas fa-check-circle text-success me-2"></i>Consider therapeutic alternatives if needed</li>
                </ul>
            </div>
        </div>
    `;
    
    resultsElement.innerHTML = reportHtml;
}

// Load patients from API
async function loadPatients() {
    try {
        console.log('Loading patients from API...');
        const response = await fetch(`${API_BASE}/patients`);
        const data = await response.json();
        
        console.log('Patient data received:', data);
        
        if (data.success) {
            patients = data.data;
            console.log('Loaded', patients.length, 'patients');
            displayPatients(patients);
            updateDashboardStats();
        } else {
            console.error('Failed to load patients:', data);
            showError('Failed to load patients');
        }
    } catch (error) {
        console.error('Error loading patients:', error);
        showError('Error loading patients: ' + error.message);
    }
}

// Display patients in the list with pagination, including location and risk level columns
function displayPatients(patientList) {
    console.log('displayPatients called with:', patientList?.length, 'patients');
    const patientListElement = document.getElementById('patientList');
    if (!patientListElement) {
        console.error('Patient list element not found!');
        return;
    }
    if (!Array.isArray(patientList) || patientList.length === 0) {
        console.log('No patients to display');
        patientListElement.innerHTML = '<div class="text-muted">No patients found.</div>';
        return;
    }
    // Pagination logic
    const totalPages = Math.ceil(patientList.length / patientsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const startIdx = (currentPage - 1) * patientsPerPage;
    const endIdx = startIdx + patientsPerPage;
    const pagePatients = patientList.slice(startIdx, endIdx);
    // Create table
    let tableHtml = `<table class="table table-hover table-bordered align-middle mb-0">
        <thead class="table-light">
            <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Patient ID</th>
                <th>Email/Contact</th>
                <th>Location</th>
                <th>Risk Level</th>
            </tr>
        </thead>
        <tbody>`;
    for (const patient of pagePatients) {
        const riskLevel = getPatientRiskLevel(patient);
        tableHtml += `<tr class="patient-row" data-patient-id="${patient.id}">
            <td>${patient.name || ''}</td>
            <td>${patient.age || ''}</td>
            <td>${patient.gender || ''}</td>
            <td>${patient.id || ''}</td>
            <td>${patient.email || patient.contact || ''}</td>
            <td>${patient.location || (patient.address && patient.address.city ? patient.address.city : '')}</td>
            <td><span class="risk-${riskLevel.toLowerCase()}">${riskLevel.toUpperCase()}</span></td>
        </tr>`;
    }
    tableHtml += '</tbody></table>';
    // Pagination controls
    if (totalPages > 1) {
        tableHtml += `<nav class="mt-2"><ul class="pagination justify-content-center">`;
        for (let i = 1; i <= totalPages; i++) {
            tableHtml += `<li class="page-item${i === currentPage ? ' active' : ''}"><a class="page-link patient-page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
        tableHtml += `</ul></nav>`;
    }
    patientListElement.innerHTML = tableHtml;
    // Add click event listeners for each row
    document.querySelectorAll('.patient-row').forEach(row => {
        row.addEventListener('click', function(e) {
            e.stopPropagation();
            const patientId = this.getAttribute('data-patient-id');
            selectPatient(patientId);
        });
    });
    // Pagination click events
    document.querySelectorAll('.patient-page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (!isNaN(page)) {
                currentPage = page;
                displayPatients(patients);
            }
        });
    });
}

// Determine patient risk level based on persona and data
function getPatientRiskLevel(patient) {
  // Always calculate risk level regardless of persona for dashboard stats
  const medicationCount = (patient.medications || []).length;
  const riskFactors = {
    age: patient.age > 65 ? 2 : patient.age > 50 ? 1 : 0,
    medications: medicationCount > 5 ? 2 : medicationCount > 3 ? 1 : 0,
    conditions: (patient.conditions || []).length > 2 ? 2 : (patient.conditions || []).length > 0 ? 1 : 0
  };
  
  const totalRisk = riskFactors.age + riskFactors.medications + riskFactors.conditions;
  
  if (totalRisk >= 4) return 'high';
  if (totalRisk >= 2) return 'medium';
  return 'low';
}

// Select a patient and show modal
async function selectPatient(patientId) {
    try {
        const response = await fetch(`${API_BASE}/patients/${patientId}`);
        const data = await response.json();
        if (data.success) {
            currentPatient = data.data;
            await displayPatientDetails(currentPatient);
            // Clear previous clinical decision support results
            const resultsElement = document.getElementById('decisionResults');
            if (resultsElement) {
                resultsElement.innerHTML = '';
            }
            // Update clinical buttons in modal based on current persona
            if (currentPersona) {
                const personaFeatures = {
                    physician: {
                        primaryActions: ['analyze', 'risk-assessment', 'predictions'],
                        secondaryActions: ['alerts']
                    },
                    pharmacist: {
                        primaryActions: ['interactions', 'medication-review'],
                        secondaryActions: []
                    }
                };
                const features = personaFeatures[currentPersona];
                if (features) {
                    updateClinicalButtons(features);
                }
            }
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('patientDetailsModal'));
            modal.show();
        } else {
            showError('Failed to load patient details');
        }
    } catch (error) {
        showError('Error loading patient details: ' + error.message);
    }
}

// Display patient details in single column: demographics, then conditions, then medications
async function displayPatientDetails(patient) {
    const detailsElement = document.getElementById('patientDetails');
    if (!detailsElement) return;
    const riskLevel = getPatientRiskLevel(patient);
    const riskClass = riskLevel === 'high' ? 'text-danger' : riskLevel === 'medium' ? 'text-warning' : 'text-success';
    
    // Basic patient info
    let patientHtml = `
        <div class="mb-3">
            <h5><i class="fas fa-user me-2"></i>${patient.name}</h5>
            <p><strong>Age:</strong> ${patient.age || calculateAge(patient.birthDate)} years</p>
            <p><strong>Gender:</strong> ${patient.gender}</p>
            <p><strong>Patient ID:</strong> ${patient.id}</p>
            ${patient.email ? `<p><strong>Email:</strong> ${patient.email}</p>` : ''}
            ${patient.address && patient.address.city ? 
              `<p><strong>Location:</strong> ${patient.address.city}, ${patient.address.state}</p>` : ''}
            <p><strong>Risk Level:</strong> <span class="${riskClass}">${riskLevel.toUpperCase()}</span></p>
        </div>
        <div class="mb-3">
            <h6><i class="fas fa-disease me-2"></i>Conditions</h6>
            ${patient.conditions && patient.conditions.length > 0 ? 
              `<ul class="list-unstyled ms-2">
                ${patient.conditions.map(condition => `<li><i class="fas fa-circle text-danger me-2"></i>${toProperCase(condition)}</li>`).join('')}
              </ul>` : 
              '<p class="text-muted">No conditions recorded</p>'
            }
        </div>
        <div class="mb-3">
            <h6><i class="fas fa-pills me-2"></i>Medications (${patient.medications ? patient.medications.length : 0})</h6>
    `;
    
    if (patient.medications && patient.medications.length > 0) {
        patientHtml += `
            <div class="table-responsive">
                <p class="small text-muted mb-2">
                    <i class="fas fa-info-circle me-1"></i>
                    Medication reasoning uses evidence-based clinical logic for accurate prescribing rationale
                </p>
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Reason for Prescription</th>
                    </tr>
                  </thead>
                  <tbody>
        `;
        
        // Always use static logic for better quality and consistency
        for (const med of patient.medications) {
            const reasoning = await getMedicationReason(med, patient);
            patientHtml += `
                <tr>
                    <td><strong>${med.name}</strong><br><small class="text-muted">${med.dosage || 'As prescribed'}</small></td>
                    <td><small class="text-muted">${reasoning}</small></td>
                </tr>
            `;
        }
        
        patientHtml += `
                  </tbody>
                </table>
              </div>
        `;
    } else {
        patientHtml += '<p class="text-muted">No medications recorded</p>';
    }
    
    patientHtml += '</div>';
    detailsElement.innerHTML = patientHtml;
}

// Clinical decision support functions
async function analyzePatient() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    try {
        document.getElementById('mainApp').style.display = 'none'; // Hide main app while loading
        const response = await fetch(`${API_BASE}/advanced/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                patientData: currentPatient
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAnalysisResults(data.data);
        } else {
            showError('Analysis failed: ' + data.error);
        }
    } catch (error) {
        showError('Error during analysis: ' + error.message);
    } finally {
        document.getElementById('mainApp').style.display = 'block'; // Show main app after loading
    }
}

async function checkInteractions() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    if (currentPersona === 'pharmacist') {
        // Enhanced pharmacist interaction check
        displayPharmacistInteractionCheck();
        return;
    }
    
    if (!currentPatient.medications) {
        showError('No medications found for this patient');
        return;
    }
    
    try {
        document.getElementById('mainApp').style.display = 'none'; // Hide main app while loading
        const response = await fetch(`${API_BASE}/decisions/interactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                medications: currentPatient.medications
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayInteractionResults(data.data);
        } else {
            showError('Interaction check failed: ' + data.error);
        }
    } catch (error) {
        showError('Error checking interactions: ' + error.message);
    } finally {
        document.getElementById('mainApp').style.display = 'block'; // Show main app after loading
    }
}

async function generatePredictions() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    try {
        document.getElementById('mainApp').style.display = 'none'; // Hide main app while loading
        const response = await fetch(`${API_BASE}/advanced/predictions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                patientData: currentPatient
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayPredictionResults(data.data);
        } else {
            showError('Prediction generation failed: ' + data.error);
        }
    } catch (error) {
        showError('Error generating predictions: ' + error.message);
    } finally {
        document.getElementById('mainApp').style.display = 'block'; // Show main app after loading
    }
}

async function assessRisk() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    try {
        document.getElementById('mainApp').style.display = 'none'; // Hide main app while loading
        const response = await fetch(`${API_BASE}/advanced/risk-stratification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                patientData: currentPatient
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayRiskResults(data.data);
        } else {
            showError('Risk assessment failed: ' + data.error);
        }
    } catch (error) {
        showError('Error assessing risk: ' + error.message);
    } finally {
        document.getElementById('mainApp').style.display = 'block'; // Show main app after loading
    }
}

// Persona-specific action handlers
async function prescribeMedication() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    if (currentPersona !== 'physician') {
        showError('Only physicians can prescribe medications');
        return;
    }
    
    showError('Prescription feature not implemented yet');
}

async function viewAlerts() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    try {
        document.getElementById('mainApp').style.display = 'none'; // Hide main app while loading
        const response = await fetch(`${API_BASE}/advanced/alerts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                patientData: currentPatient
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAlertResults(data.data);
        } else {
            showError('Alert generation failed: ' + data.error);
        }
    } catch (error) {
        showError('Error generating alerts: ' + error.message);
    } finally {
        document.getElementById('mainApp').style.display = 'block'; // Show main app after loading
    }
}

async function monitorPatient() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    if (currentPersona !== 'nurse') {
        showError('This feature is for nurses only');
        return;
    }
    
    showError('Patient monitoring feature not implemented yet');
}

async function viewVitalSigns() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    const resultsElement = document.getElementById('decisionResults');
    resultsElement.innerHTML = `
        <div class="alert alert-info">
            <h6><i class="fas fa-thermometer-half me-2"></i>Vital Signs Summary</h6>
            <div class="row">
                ${currentPatient.vitalSigns && Object.keys(currentPatient.vitalSigns).length > 0 ? 
                    Object.entries(currentPatient.vitalSigns).map(([key, value]) => 
                        `<div class="col-md-4"><p><strong>${key}:</strong> ${value.value} ${value.unit}</p></div>`
                    ).join('') : 
                    '<div class="col-12"><p class="text-muted">No vital signs recorded</p></div>'
                }
            </div>
        </div>
    `;
}

// This duplicate function is removed - using the enhanced version above

async function checkDosage() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    if (currentPersona !== 'pharmacist') {
        showError('This feature is for pharmacists only');
        return;
    }
    
    showError('Dosage checking feature not implemented yet');
}

async function viewAnalytics() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    if (currentPersona !== 'researcher') {
        showError('This feature is for researchers only');
        return;
    }
    
    showError('Analytics feature not implemented yet');
}

async function stratifyRisk() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    if (currentPersona !== 'researcher') {
        showError('This feature is for researchers only');
        return;
    }
    
    // Use the existing risk assessment
    await assessRisk();
}

async function getConditionRecommendations() {
    if (!currentPatient) {
        showError('Please select a patient first');
        return;
    }
    
    if (currentPersona !== 'physician') {
        showError('This feature is for physicians only');
        return;
    }
    
    // Generate condition-specific recommendations based on patient's conditions
    const conditions = currentPatient.conditions || [];
    
    if (conditions.length === 0) {
        showError('No conditions found for this patient to provide recommendations');
        return;
    }
    
    // Use static recommendations for better quality and consistency
    // The static implementation provides more detailed, structured recommendations
    const conditionRecommendations = conditions.map(condition => {
        return generateConditionSpecificRecommendations(condition, currentPatient);
    });
    
    displayConditionRecommendations({
        patientName: currentPatient.name,
        conditions: conditionRecommendations
    });
}

// Display functions for new features
function displayAlertResults(data) {
    const resultsElement = document.getElementById('decisionResults');
    
    if (!data.alerts || data.alerts.length === 0) {
        resultsElement.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                No alerts generated for this patient
            </div>
        `;
    } else {
        const alertsHtml = data.alerts.map(alert => `
            <div class="alert alert-${alert.severity === 'critical' ? 'danger' : alert.severity === 'high' ? 'warning' : 'info'}">
                <h6><i class="fas fa-exclamation-triangle me-2"></i>${alert.type || 'Clinical Alert'}</h6>
                <p><strong>Severity:</strong> ${(alert.severity || 'medium').toUpperCase()}</p>
                <p><strong>Message:</strong> ${alert.message || 'No message available'}</p>
                <p><strong>Recommendation:</strong> ${alert.recommendation || 'No recommendation available'}</p>
            </div>
        `).join('');
        
        resultsElement.innerHTML = alertsHtml;
    }
}

function displayConditionRecommendations(data) {
    const resultsElement = document.getElementById('decisionResults');
    
    let recommendationsHtml = `
        <div class="alert alert-info">
            <h6><i class="fas fa-stethoscope me-2"></i>Condition-Specific Recommendations for ${data.patientName}</h6>
            <small class="text-muted">Using evidence-based static recommendations for consistent, detailed clinical guidance</small>
    `;
    
    data.conditions.forEach(conditionData => {
        recommendationsHtml += `
            <div class="mb-3">
                <h6 class="text-primary">${toProperCase(conditionData.condition)}</h6>
        `;
        
        // Check if this is OpenAI format (single recommendation) or static format (multiple categories)
        if (conditionData.recommendation) {
            // OpenAI format - single recommendation
            recommendationsHtml += `
                <p class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>${conditionData.recommendation}</p>
            `;
        } else if (conditionData.recommendations) {
            // Static format - multiple categories
            recommendationsHtml += `
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="text-success">📊 Monitoring</h6>
                        <ul class="list-unstyled small">
                            ${conditionData.recommendations.monitoring.map(item => `<li>• ${item}</li>`).join('')}
                        </ul>
                        
                        <h6 class="text-warning">💊 Medications</h6>
                        <ul class="list-unstyled small">
                            ${conditionData.recommendations.medications.map(item => `<li>• ${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6 class="text-info">🏃 Lifestyle</h6>
                        <ul class="list-unstyled small">
                            ${conditionData.recommendations.lifestyle.map(item => `<li>• ${item}</li>`).join('')}
                        </ul>
                        
                        <h6 class="text-danger">🎯 Targets</h6>
                        <ul class="list-unstyled small">
                            ${conditionData.recommendations.targets.map(item => `<li>• ${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        recommendationsHtml += `</div>`;
    });
    
    recommendationsHtml += `
        </div>
    `;
    
    resultsElement.innerHTML = recommendationsHtml;
}

// Display results functions
function displayAnalysisResults(analysis) {
    const resultsElement = document.getElementById('decisionResults');
    
    resultsElement.innerHTML = `
        <div class="alert alert-info">
            <h6><i class="fas fa-chart-line me-2"></i>Clinical Analysis Results</h6>
            <p><strong>Patient:</strong> ${analysis.patientId}</p>
            <p><strong>Overall Risk:</strong> <span class="risk-${analysis.riskAssessment.overall.risk}">${analysis.riskAssessment.overall.risk.toUpperCase()}</span></p>
            <p><strong>Confidence:</strong> ${Math.round(analysis.confidence * 100)}%</p>
        </div>
    `;
}

function displayInteractionResults(data) {
    const resultsElement = document.getElementById('decisionResults');
    
    if (data.interactions.length === 0) {
        resultsElement.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                No drug interactions detected
            </div>
        `;
    } else {
        const interactionsHtml = data.interactions.map(interaction => `
            <div class="alert alert-warning">
                <h6><i class="fas fa-exclamation-triangle me-2"></i>Drug Interaction</h6>
                <p><strong>Drugs:</strong> ${interaction.drug1} + ${interaction.drug2}</p>
                <p><strong>Severity:</strong> <span class="risk-${interaction.severity}">${interaction.severity.toUpperCase()}</span></p>
                <p><strong>Effect:</strong> ${interaction.effect}</p>
                <p><strong>Recommendation:</strong> ${interaction.recommendation}</p>
            </div>
        `).join('');
        
        resultsElement.innerHTML = interactionsHtml;
    }
}

function displayPredictionResults(data) {
    const resultsElement = document.getElementById('decisionResults');
    
    resultsElement.innerHTML = `
        <div class="alert alert-info">
            <h6><i class="fas fa-crystal-ball me-2"></i>Predictive Analytics</h6>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Readmission Risk:</strong> ${Math.round(data.predictions.readmission.probability * 100)}%</p>
                    <p><strong>Deterioration Risk:</strong> ${Math.round(data.predictions.deterioration.probability * 100)}%</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Medication Adherence:</strong> ${Math.round(data.predictions.medicationAdherence.probability * 100)}%</p>
                    <p><strong>Complications Risk:</strong> ${Math.round(data.predictions.complications.probability * 100)}%</p>
                </div>
            </div>
        </div>
    `;
}

function displayRiskResults(data) {
    const resultsElement = document.getElementById('decisionResults');
    
    resultsElement.innerHTML = `
        <div class="alert alert-info">
            <h6><i class="fas fa-shield-alt me-2"></i>Risk Assessment</h6>
            <div class="mb-3">
                <p><strong>Cardiovascular:</strong> <span class="risk-${data.riskAssessment.cardiovascular.risk}">${data.riskAssessment.cardiovascular.risk.toUpperCase()}</span></p>
                <p><strong>Diabetes:</strong> <span class="risk-${data.riskAssessment.diabetes.risk}">${data.riskAssessment.diabetes.risk.toUpperCase()}</span></p>
                <p><strong>Kidney:</strong> <span class="risk-${data.riskAssessment.kidney.risk}">${data.riskAssessment.kidney.risk.toUpperCase()}</span></p>
                <p><strong>Medication:</strong> <span class="risk-${data.riskAssessment.medication.risk}">${data.riskAssessment.medication.risk.toUpperCase()}</span></p>
            </div>
            <p><strong>Overall Risk:</strong> <span class="risk-${data.riskAssessment.overall.risk}">${data.riskAssessment.overall.risk.toUpperCase()}</span></p>
        </div>
    `;
}

// Utility functions
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

function updateDashboardStats() {
    document.getElementById('totalPatients').textContent = patients.length;
    
    // Calculate active alerts (patients with conditions or high medication count)
    const activeAlerts = patients.filter(patient => 
        (patient.conditions && patient.conditions.length > 0) || 
        (patient.medications && patient.medications.length > 5)
    ).length;
    document.getElementById('activeAlerts').textContent = activeAlerts;
    
    // Calculate pending decisions (patients needing review - multiple conditions + medications)
    const pendingDecisions = patients.filter(patient => 
        (patient.conditions && patient.conditions.length > 1) && 
        (patient.medications && patient.medications.length > 3)
    ).length;
    document.getElementById('pendingDecisions').textContent = pendingDecisions;
    
    // Calculate high risk patients (specifically those with "HIGH" risk level)
    const highRiskPatients = patients.filter(patient => {
        const riskLevel = getPatientRiskLevel(patient);
        return riskLevel.toLowerCase() === 'high';
    }).length;
    
    console.log('High risk patients count:', highRiskPatients);
    console.log('Total patients:', patients.length);
    
    const riskPatientsElement = document.getElementById('riskPatients');
    if (riskPatientsElement) {
        riskPatientsElement.textContent = highRiskPatients;
    } else {
        console.error('riskPatients element not found');
    }
}

function updateDashboard(features) {
    // Update dashboard based on persona permissions
    console.log('Updated dashboard for persona:', currentPersona, features);
}

function showError(message) {
    const resultsElement = document.getElementById('decisionResults');
    resultsElement.innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-circle me-2"></i>
            ${message}
        </div>
    `;
} 

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Convert conditions to proper case
function toProperCase(str) {
    if (!str) return str;
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

// Get medication reason using static logic (reverted from OpenAI due to quality issues)
async function getMedicationReason(medication, patient) {
    // Always use static logic for better quality and consistency
    // The static implementation provides more detailed, condition-specific reasoning
    
    const medName = medication.name.toLowerCase();
    const conditions = patient.conditions || [];
    const age = patient.age || 0;
    
    // Common medication-condition mappings
    const medicationReasons = {
        'metformin': 'Type 2 diabetes management, first-line treatment',
        'lisinopril': 'Hypertension control, ACE inhibitor therapy',
        'atorvastatin': 'Cholesterol management, cardiovascular risk reduction',
        'amlodipine': 'Hypertension management, calcium channel blocker',
        'levothyroxine': 'Hypothyroidism treatment, thyroid hormone replacement',
        'omeprazole': 'Gastric acid reduction, GERD management',
        'aspirin': 'Cardiovascular protection, antiplatelet therapy',
        'simvastatin': 'Hyperlipidemia treatment, statin therapy',
        'hydrochlorothiazide': 'Hypertension management, diuretic therapy',
        'warfarin': 'Anticoagulation therapy, blood clot prevention',
        'insulin': 'Diabetes management, blood glucose control',
        'furosemide': 'Fluid retention management, loop diuretic',
        'prednisone': 'Anti-inflammatory treatment, corticosteroid therapy',
        'albuterol': 'Bronchodilator therapy, asthma/COPD management',
        'digoxin': 'Heart failure management, cardiac glycoside',
        'gabapentin': 'Neuropathic pain management, anticonvulsant',
        'sertraline': 'Depression treatment, SSRI antidepressant',
        'losartan': 'Hypertension management, ARB therapy',
        'pantoprazole': 'Proton pump inhibitor, gastric protection',
        'clopidogrel': 'Antiplatelet therapy, cardiovascular protection'
    };
    
    // Check for exact matches first
    for (const [drug, reason] of Object.entries(medicationReasons)) {
        if (medName.includes(drug)) {
            return reason;
        }
    }
    
    // Condition-based reasoning
    if (conditions.some(c => c.toLowerCase().includes('diabetes'))) {
        if (medName.includes('insulin') || medName.includes('metformin') || medName.includes('glipizide')) {
            return 'Diabetes management and blood glucose control';
        }
    }
    
    if (conditions.some(c => c.toLowerCase().includes('hypertension') || c.toLowerCase().includes('blood pressure'))) {
        if (medName.includes('lisinopril') || medName.includes('amlodipine') || medName.includes('losartan')) {
            return 'Blood pressure management and hypertension control';
        }
    }
    
    if (conditions.some(c => c.toLowerCase().includes('heart') || c.toLowerCase().includes('cardiac'))) {
        if (medName.includes('aspirin') || medName.includes('clopidogrel')) {
            return 'Cardiovascular protection and heart disease management';
        }
    }
    
    // Age-based considerations
    if (age > 65) {
        if (medName.includes('aspirin')) {
            return 'Cardiovascular protection in elderly patient';
        }
    }
    
    // Default reasoning
    return 'Prescribed for patient-specific clinical indication';
}

// Get potential interactions for medication review
function getPotentialInteractions(medication, allMedications) {
    const medName = medication.name.toLowerCase();
    const interactions = [];
    
    // Check against other medications
    allMedications.forEach(otherMed => {
        if (otherMed.name !== medication.name) {
            const otherName = otherMed.name.toLowerCase();
            
            // Common interaction patterns
            if ((medName.includes('warfarin') && otherName.includes('aspirin')) ||
                (medName.includes('aspirin') && otherName.includes('warfarin'))) {
                interactions.push('Bleeding risk with aspirin/warfarin');
            }
            
            if ((medName.includes('digoxin') && otherName.includes('furosemide')) ||
                (medName.includes('furosemide') && otherName.includes('digoxin'))) {
                interactions.push('Digoxin toxicity risk');
            }
            
            if ((medName.includes('lisinopril') && otherName.includes('potassium')) ||
                (medName.includes('potassium') && otherName.includes('lisinopril'))) {
                interactions.push('Hyperkalemia risk');
            }
        }
    });
    
    return interactions.length > 0 ? interactions.join('; ') : 'No major interactions identified';
}

// Get side effects to monitor
function getMedicationSideEffects(medication) {
    const medName = medication.name.toLowerCase();
    
    const sideEffectMap = {
        'acetaminophen': 'Hepatotoxicity with overdose, skin rash',
        'aspirin': 'GI bleeding, tinnitus, bruising',
        'diclofenac': 'GI upset, cardiovascular risk, renal impairment',
        'ferrous': 'Constipation, nausea, dark stools',
        'lisinopril': 'Dry cough, hyperkalemia, angioedema',
        'metformin': 'GI upset, lactic acidosis (rare), B12 deficiency',
        'metoprolol': 'Bradycardia, fatigue, hypotension',
        'warfarin': 'Bleeding, bruising, skin necrosis',
        'insulin': 'Hypoglycemia, weight gain, lipodystrophy',
        'furosemide': 'Dehydration, electrolyte imbalance, ototoxicity',
        'prednisone': 'Weight gain, mood changes, infections, osteoporosis',
        'albuterol': 'Tremor, tachycardia, nervousness',
        'digoxin': 'Nausea, arrhythmias, visual changes, confusion',
        'sertraline': 'Nausea, sexual dysfunction, sleep changes, weight gain',
        'atorvastatin': 'Muscle pain, elevated liver enzymes, memory issues',
        'amlodipine': 'Peripheral edema, dizziness, flushing',
        'omeprazole': 'Bone fractures, B12 deficiency, C. diff risk',
        'levothyroxine': 'Palpitations, insomnia, weight loss',
        'simvastatin': 'Muscle pain, liver dysfunction, memory issues',
        'hydrochlorothiazide': 'Hyponatremia, hyperuricemia, photosensitivity',
        'gabapentin': 'Drowsiness, dizziness, peripheral edema',
        'losartan': 'Hyperkalemia, dizziness, angioedema',
        'pantoprazole': 'Headache, diarrhea, bone fractures',
        'clopidogrel': 'Bleeding, bruising, thrombotic thrombocytopenic purpura'
    };
    
    for (const [drug, effects] of Object.entries(sideEffectMap)) {
        if (medName.includes(drug)) {
            return effects;
        }
    }
    
    return 'Monitor for common medication side effects';
}

// Get pharmacist notes
function getPharmacistNotes(medication, patient) {
    const medName = medication.name.toLowerCase();
    const age = patient.age || 0;
    const conditions = patient.conditions || [];
    const notes = [];
    
    // Medication-specific monitoring and counseling points
    if (medName.includes('acetaminophen')) {
        notes.push('Max 4g/day, avoid with alcohol');
        if (age > 65) notes.push('Consider dose reduction in elderly');
    }
    
    if (medName.includes('aspirin')) {
        notes.push('Take with food, monitor for GI bleeding');
        if (age > 65) notes.push('Increased bleeding risk in elderly');
    }
    
    if (medName.includes('diclofenac')) {
        notes.push('Apply thin layer, avoid broken skin');
        if (conditions.some(c => c.toLowerCase().includes('heart'))) {
            notes.push('Caution with cardiovascular disease');
        }
    }
    
    if (medName.includes('ferrous')) {
        notes.push('Take on empty stomach, separate from tea/coffee');
        notes.push('Expect dark stools, constipation common');
    }
    
    if (medName.includes('lisinopril')) {
        notes.push('Monitor BP, K+, creatinine');
        if (age > 65) notes.push('Start low dose in elderly');
    }
    
    if (medName.includes('metformin')) {
        notes.push('Take with meals, monitor renal function');
        if (age > 80) notes.push('Contraindicated if eGFR <30');
    }
    
    if (medName.includes('metoprolol')) {
        notes.push('Monitor HR, BP, don\'t stop abruptly');
        if (conditions.some(c => c.toLowerCase().includes('asthma'))) {
            notes.push('Caution with respiratory disease');
        }
    }
    
    if (medName.includes('warfarin')) {
        notes.push('INR monitoring, drug/food interactions');
        notes.push('Consistent vitamin K intake');
    }
    
    if (medName.includes('digoxin')) {
        notes.push('Monitor levels, pulse, K+');
        if (age > 65) notes.push('Reduce dose in elderly');
    }
    
    if (medName.includes('insulin')) {
        notes.push('Rotate injection sites, monitor glucose');
        notes.push('Store properly, check expiration');
    }
    
    // Age-specific considerations
    if (age > 65) {
        if (medName.includes('diazepam') || medName.includes('diphenhydramine')) {
            notes.push('Avoid in elderly (Beers criteria)');
        }
        if (medName.includes('furosemide')) {
            notes.push('Monitor fluid status, electrolytes');
        }
    }
    
    // Condition-specific monitoring
    if (conditions.some(c => c.toLowerCase().includes('kidney'))) {
        if (medName.includes('metformin') || medName.includes('lisinopril')) {
            notes.push('Monitor renal function closely');
        }
    }
    
    if (conditions.some(c => c.toLowerCase().includes('diabetes'))) {
        if (medName.includes('metoprolol')) {
            notes.push('May mask hypoglycemia symptoms');
        }
    }
    
    return notes.length > 0 ? notes.join('; ') : 'Standard monitoring recommended';
}

// Generate condition-specific recommendations
function generateConditionSpecificRecommendations(condition, patient) {
    const conditionLower = condition.toLowerCase();
    const age = patient.age || 0;
    const medications = patient.medications || [];
    
    const conditionRecommendations = {
        'diabetes': {
            monitoring: ['HbA1c every 3-6 months', 'Annual eye exam', 'Foot examination', 'Lipid profile'],
            lifestyle: ['Carbohydrate counting', 'Regular exercise', 'Weight management', 'Smoking cessation'],
            medications: ['Metformin first-line', 'Consider SGLT2 inhibitors', 'Insulin if needed'],
            targets: ['HbA1c <7%', 'BP <140/90', 'LDL <100 mg/dL']
        },
        'hypertension': {
            monitoring: ['Blood pressure checks', 'Renal function monitoring', 'Electrolyte monitoring'],
            lifestyle: ['DASH diet', 'Sodium restriction', 'Regular exercise', 'Weight loss'],
            medications: ['ACE inhibitors first-line', 'Thiazide diuretics', 'Calcium channel blockers'],
            targets: ['BP <140/90', 'BP <130/80 if high risk']
        },
        'heart failure': {
            monitoring: ['Daily weights', 'BNP/NT-proBNP', 'Renal function', 'Electrolytes'],
            lifestyle: ['Fluid restriction', 'Sodium restriction', 'Regular exercise as tolerated'],
            medications: ['ACE inhibitors', 'Beta-blockers', 'Diuretics', 'Aldosterone antagonists'],
            targets: ['Symptom improvement', 'Functional capacity', 'Quality of life']
        },
        'copd': {
            monitoring: ['Spirometry', 'Oxygen saturation', 'Exacerbation frequency'],
            lifestyle: ['Smoking cessation', 'Pulmonary rehabilitation', 'Vaccination'],
            medications: ['Bronchodilators', 'Inhaled corticosteroids', 'Oxygen therapy'],
            targets: ['Symptom control', 'Prevent exacerbations', 'Improve quality of life']
        },
        'asthma': {
            monitoring: ['Peak flow monitoring', 'Symptom control', 'Medication adherence'],
            lifestyle: ['Trigger avoidance', 'Regular exercise', 'Proper inhaler technique'],
            medications: ['Inhaled corticosteroids', 'LABA if needed', 'Rescue inhalers'],
            targets: ['Symptom control', 'Normal lung function', 'Prevent exacerbations']
        }
    };
    
    // Find matching condition
    let recommendations = null;
    for (const [key, value] of Object.entries(conditionRecommendations)) {
        if (conditionLower.includes(key)) {
            recommendations = value;
            break;
        }
    }
    
    // Default recommendations if condition not found
    if (!recommendations) {
        recommendations = {
            monitoring: ['Regular follow-up', 'Symptom monitoring', 'Medication adherence'],
            lifestyle: ['Healthy diet', 'Regular exercise', 'Stress management'],
            medications: ['As prescribed by physician', 'Regular medication review'],
            targets: ['Symptom improvement', 'Quality of life', 'Prevent complications']
        };
    }
    
    return {
        condition: toProperCase(condition),
        recommendations: recommendations
    };
} 

// Update clinical decision support buttons based on persona
function updateClinicalButtons(features) {
  const buttonContainer = document.getElementById('clinicalButtonsRow');
  if (!buttonContainer) return;
  // Clear existing buttons
  buttonContainer.innerHTML = '';
  // Add persona-specific buttons (all blue/primary)
  features.primaryActions.forEach(action => {
    const button = createActionButton(action, 'primary');
    buttonContainer.appendChild(button);
  });
  features.secondaryActions.forEach(action => {
    const button = createActionButton(action, 'primary');
    buttonContainer.appendChild(button);
  });
} 