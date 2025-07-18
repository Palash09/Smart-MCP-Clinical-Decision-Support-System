const logger = require('../utils/logger');

// Alert categories and types
const ALERT_CATEGORIES = {
  DRUG_INTERACTION: 'drug_interaction',
  VITAL_SIGNS: 'vital_signs',
  LAB_RESULTS: 'lab_results',
  MEDICATION: 'medication',
  CLINICAL: 'clinical',
  SYSTEM: 'system'
};

const ALERT_PRIORITIES = {
  CRITICAL: 'critical',
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

const ALERT_TYPES = {
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success'
};

class AlertService {
  constructor() {
    this.alerts = new Map();
    this.subscribers = new Set();
    this.alertTemplates = this.initializeAlertTemplates();
  }

  // Initialize predefined alert templates
  initializeAlertTemplates() {
    return {
      // Drug interaction templates
      'high_risk_interaction': {
        title: 'High-Risk Drug Interaction',
        message: 'Critical drug interaction detected between {drug1} and {drug2}',
        category: ALERT_CATEGORIES.DRUG_INTERACTION,
        priority: ALERT_PRIORITIES.CRITICAL,
        type: ALERT_TYPES.ERROR,
        actions: ['review_medications', 'consult_pharmacist', 'adjust_dosing']
      },

      'moderate_interaction': {
        title: 'Moderate Drug Interaction',
        message: 'Moderate interaction detected between {drug1} and {drug2}',
        category: ALERT_CATEGORIES.DRUG_INTERACTION,
        priority: ALERT_PRIORITIES.MEDIUM,
        type: ALERT_TYPES.WARNING,
        actions: ['monitor_closely', 'adjust_dosing']
      },

      // Vital signs templates
      'severe_hypertension': {
        title: 'Severe Hypertension',
        message: 'Blood pressure {systolic}/{diastolic} requires immediate attention',
        category: ALERT_CATEGORIES.VITAL_SIGNS,
        priority: ALERT_PRIORITIES.URGENT,
        type: ALERT_TYPES.ERROR,
        actions: ['immediate_assessment', 'medication_adjustment', 'lifestyle_counseling']
      },

      'elevated_heart_rate': {
        title: 'Elevated Heart Rate',
        message: 'Heart rate of {heartRate} bpm is elevated',
        category: ALERT_CATEGORIES.VITAL_SIGNS,
        priority: ALERT_PRIORITIES.MEDIUM,
        type: ALERT_TYPES.WARNING,
        actions: ['assess_cause', 'monitor_trends']
      },

      // Lab results templates
      'poor_glycemic_control': {
        title: 'Poor Glycemic Control',
        message: 'HbA1c of {hba1c}% indicates poor diabetes control',
        category: ALERT_CATEGORIES.LAB_RESULTS,
        priority: ALERT_PRIORITIES.HIGH,
        type: ALERT_TYPES.WARNING,
        actions: ['medication_adjustment', 'lifestyle_counseling', 'diabetes_education']
      },

      'renal_function_concern': {
        title: 'Renal Function Concern',
        message: 'Creatinine of {creatinine} mg/dL indicates renal impairment',
        category: ALERT_CATEGORIES.LAB_RESULTS,
        priority: ALERT_PRIORITIES.HIGH,
        type: ALERT_TYPES.WARNING,
        actions: ['medication_review', 'nephrology_consult', 'dose_adjustment']
      },

      // Medication templates
      'medication_gap': {
        title: 'Medication Gap Detected',
        message: 'Missing medication for condition: {condition}',
        category: ALERT_CATEGORIES.MEDICATION,
        priority: ALERT_PRIORITIES.MEDIUM,
        type: ALERT_TYPES.WARNING,
        actions: ['review_guidelines', 'consider_prescription']
      },

      'polypharmacy_risk': {
        title: 'Polypharmacy Risk',
        message: 'Patient on {medicationCount} medications - increased risk of interactions',
        category: ALERT_CATEGORIES.MEDICATION,
        priority: ALERT_PRIORITIES.MEDIUM,
        type: ALERT_TYPES.WARNING,
        actions: ['medication_review', 'deprescribing_consideration']
      }
    };
  }

  // Create a new alert
  createAlert(templateKey, data = {}, customMessage = null) {
    try {
      const template = this.alertTemplates[templateKey];
      if (!template) {
        throw new Error(`Alert template '${templateKey}' not found`);
      }

      const alert = {
        id: this.generateAlertId(),
        title: template.title,
        message: customMessage || this.formatMessage(template.message, data),
        category: template.category,
        priority: template.priority,
        type: template.type,
        actions: template.actions,
        data: data,
        timestamp: new Date().toISOString(),
        status: 'active',
        acknowledged: false,
        acknowledgedBy: null,
        acknowledgedAt: null
      };

      this.alerts.set(alert.id, alert);
      this.notifySubscribers(alert);
      
      logger.info('Alert created', { 
        alertId: alert.id, 
        category: alert.category, 
        priority: alert.priority 
      });

      return alert;
    } catch (error) {
      logger.error('Error creating alert', { error: error.message, templateKey });
      throw error;
    }
  }

  // Create a custom alert
  createCustomAlert(alertData) {
    try {
      const alert = {
        id: this.generateAlertId(),
        title: alertData.title || 'Custom Alert',
        message: alertData.message,
        category: alertData.category || ALERT_CATEGORIES.CLINICAL,
        priority: alertData.priority || ALERT_PRIORITIES.MEDIUM,
        type: alertData.type || ALERT_TYPES.WARNING,
        actions: alertData.actions || [],
        data: alertData.data || {},
        timestamp: new Date().toISOString(),
        status: 'active',
        acknowledged: false,
        acknowledgedBy: null,
        acknowledgedAt: null
      };

      this.alerts.set(alert.id, alert);
      this.notifySubscribers(alert);
      
      logger.info('Custom alert created', { 
        alertId: alert.id, 
        category: alert.category, 
        priority: alert.priority 
      });

      return alert;
    } catch (error) {
      logger.error('Error creating custom alert', { error: error.message });
      throw error;
    }
  }

  // Get all alerts with optional filtering
  getAlerts(filters = {}) {
    let alerts = Array.from(this.alerts.values());

    // Apply filters
    if (filters.status) {
      alerts = alerts.filter(alert => alert.status === filters.status);
    }

    if (filters.category) {
      alerts = alerts.filter(alert => alert.category === filters.category);
    }

    if (filters.priority) {
      alerts = alerts.filter(alert => alert.priority === filters.priority);
    }

    if (filters.type) {
      alerts = alerts.filter(alert => alert.type === filters.type);
    }

    if (filters.acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === filters.acknowledged);
    }

    if (filters.patientId) {
      alerts = alerts.filter(alert => alert.data.patientId === filters.patientId);
    }

    // Sort by priority and timestamp
    alerts.sort((a, b) => {
      const priorityOrder = {
        [ALERT_PRIORITIES.CRITICAL]: 0,
        [ALERT_PRIORITIES.URGENT]: 1,
        [ALERT_PRIORITIES.HIGH]: 2,
        [ALERT_PRIORITIES.MEDIUM]: 3,
        [ALERT_PRIORITIES.LOW]: 4
      };
      
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    return alerts;
  }

  // Get alert by ID
  getAlertById(alertId) {
    return this.alerts.get(alertId);
  }

  // Acknowledge an alert
  acknowledgeAlert(alertId, acknowledgedBy) {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date().toISOString();

    logger.info('Alert acknowledged', { 
      alertId, 
      acknowledgedBy, 
      category: alert.category 
    });

    return alert;
  }

  // Resolve an alert
  resolveAlert(alertId, resolvedBy, resolutionNotes = '') {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }

    alert.status = 'resolved';
    alert.resolvedBy = resolvedBy;
    alert.resolvedAt = new Date().toISOString();
    alert.resolutionNotes = resolutionNotes;

    logger.info('Alert resolved', { 
      alertId, 
      resolvedBy, 
      category: alert.category 
    });

    return alert;
  }

  // Delete an alert
  deleteAlert(alertId) {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }

    this.alerts.delete(alertId);
    
    logger.info('Alert deleted', { 
      alertId, 
      category: alert.category 
    });

    return true;
  }

  // Get alert statistics
  getAlertStats() {
    const alerts = Array.from(this.alerts.values());
    
    const stats = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      acknowledged: alerts.filter(a => a.acknowledged).length,
      byCategory: {},
      byPriority: {},
      byType: {}
    };

    // Count by category
    Object.values(ALERT_CATEGORIES).forEach(category => {
      stats.byCategory[category] = alerts.filter(a => a.category === category).length;
    });

    // Count by priority
    Object.values(ALERT_PRIORITIES).forEach(priority => {
      stats.byPriority[priority] = alerts.filter(a => a.priority === priority).length;
    });

    // Count by type
    Object.values(ALERT_TYPES).forEach(type => {
      stats.byType[type] = alerts.filter(a => a.type === type).length;
    });

    return stats;
  }

  // Subscribe to alert notifications
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify subscribers of new alerts
  notifySubscribers(alert) {
    this.subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        logger.error('Error in alert subscriber callback', { error: error.message });
      }
    });
  }

  // Generate unique alert ID
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Format message with data
  formatMessage(message, data) {
    return message.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  // Clear all alerts (for testing/reset purposes)
  clearAllAlerts() {
    this.alerts.clear();
    logger.info('All alerts cleared');
  }

  // Get alerts for a specific patient
  getPatientAlerts(patientId) {
    return this.getAlerts({ patientId });
  }

  // Get critical alerts
  getCriticalAlerts() {
    return this.getAlerts({ 
      priority: ALERT_PRIORITIES.CRITICAL, 
      status: 'active' 
    });
  }

  // Get unacknowledged alerts
  getUnacknowledgedAlerts() {
    return this.getAlerts({ acknowledged: false, status: 'active' });
  }
}

module.exports = new AlertService(); 