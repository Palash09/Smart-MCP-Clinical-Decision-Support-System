const express = require('express');
const router = express.Router();
const alertService = require('../services/alertService');
const logger = require('../utils/logger');

// Get all alerts with filtering
router.get('/', async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      type,
      acknowledged,
      patientId,
      limit = 100
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (priority) filters.priority = priority;
    if (type) filters.type = type;
    if (acknowledged !== undefined) filters.acknowledged = acknowledged === 'true';
    if (patientId) filters.patientId = patientId;

    logger.info('Getting alerts', { filters });

    const alerts = alertService.getAlerts(filters).slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        alerts,
        count: alerts.length,
        filters
      }
    });

  } catch (error) {
    logger.error('Error getting alerts', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error getting alerts',
      error: error.message
    });
  }
});

// Get alert by ID
router.get('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;

    logger.info('Getting alert by ID', { alertId });

    const alert = alertService.getAlertById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });

  } catch (error) {
    logger.error('Error getting alert by ID', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error getting alert',
      error: error.message
    });
  }
});

// Create a new alert
router.post('/', async (req, res) => {
  try {
    const alertData = req.body;

    if (!alertData.message) {
      return res.status(400).json({
        success: false,
        message: 'Alert message is required'
      });
    }

    logger.info('Creating new alert', { 
      category: alertData.category, 
      priority: alertData.priority 
    });

    const alert = alertService.createCustomAlert(alertData);

    res.status(201).json({
      success: true,
      data: alert
    });

  } catch (error) {
    logger.error('Error creating alert', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error creating alert',
      error: error.message
    });
  }
});

// Create alert from template
router.post('/template/:templateKey', async (req, res) => {
  try {
    const { templateKey } = req.params;
    const { data, customMessage } = req.body;

    logger.info('Creating alert from template', { templateKey });

    const alert = alertService.createAlert(templateKey, data, customMessage);

    res.status(201).json({
      success: true,
      data: alert
    });

  } catch (error) {
    logger.error('Error creating alert from template', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error creating alert from template',
      error: error.message
    });
  }
});

// Acknowledge an alert
router.patch('/:alertId/acknowledge', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { acknowledgedBy } = req.body;

    if (!acknowledgedBy) {
      return res.status(400).json({
        success: false,
        message: 'Acknowledged by is required'
      });
    }

    logger.info('Acknowledging alert', { alertId, acknowledgedBy });

    const alert = alertService.acknowledgeAlert(alertId, acknowledgedBy);

    res.json({
      success: true,
      data: alert
    });

  } catch (error) {
    logger.error('Error acknowledging alert', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert',
      error: error.message
    });
  }
});

// Resolve an alert
router.patch('/:alertId/resolve', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { resolvedBy, resolutionNotes } = req.body;

    if (!resolvedBy) {
      return res.status(400).json({
        success: false,
        message: 'Resolved by is required'
      });
    }

    logger.info('Resolving alert', { alertId, resolvedBy });

    const alert = alertService.resolveAlert(alertId, resolvedBy, resolutionNotes);

    res.json({
      success: true,
      data: alert
    });

  } catch (error) {
    logger.error('Error resolving alert', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error resolving alert',
      error: error.message
    });
  }
});

// Delete an alert
router.delete('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;

    logger.info('Deleting alert', { alertId });

    alertService.deleteAlert(alertId);

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting alert', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error deleting alert',
      error: error.message
    });
  }
});

// Get alert statistics
router.get('/stats/overview', async (req, res) => {
  try {
    logger.info('Getting alert statistics');

    const stats = alertService.getAlertStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error getting alert statistics', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error getting alert statistics',
      error: error.message
    });
  }
});

// Get critical alerts
router.get('/critical/active', async (req, res) => {
  try {
    logger.info('Getting critical active alerts');

    const criticalAlerts = alertService.getCriticalAlerts();

    res.json({
      success: true,
      data: {
        alerts: criticalAlerts,
        count: criticalAlerts.length
      }
    });

  } catch (error) {
    logger.error('Error getting critical alerts', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error getting critical alerts',
      error: error.message
    });
  }
});

// Get unacknowledged alerts
router.get('/unacknowledged/active', async (req, res) => {
  try {
    logger.info('Getting unacknowledged active alerts');

    const unacknowledgedAlerts = alertService.getUnacknowledgedAlerts();

    res.json({
      success: true,
      data: {
        alerts: unacknowledgedAlerts,
        count: unacknowledgedAlerts.length
      }
    });

  } catch (error) {
    logger.error('Error getting unacknowledged alerts', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error getting unacknowledged alerts',
      error: error.message
    });
  }
});

// Get patient-specific alerts
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, priority } = req.query;

    logger.info('Getting patient alerts', { patientId, status, priority });

    const filters = { patientId };
    if (status) filters.status = status;
    if (priority) filters.priority = priority;

    const patientAlerts = alertService.getPatientAlerts(patientId);

    res.json({
      success: true,
      data: {
        alerts: patientAlerts,
        count: patientAlerts.length,
        patientId
      }
    });

  } catch (error) {
    logger.error('Error getting patient alerts', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error getting patient alerts',
      error: error.message
    });
  }
});

// Bulk acknowledge alerts
router.patch('/bulk/acknowledge', async (req, res) => {
  try {
    const { alertIds, acknowledgedBy } = req.body;

    if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Alert IDs array is required'
      });
    }

    if (!acknowledgedBy) {
      return res.status(400).json({
        success: false,
        message: 'Acknowledged by is required'
      });
    }

    logger.info('Bulk acknowledging alerts', { alertCount: alertIds.length, acknowledgedBy });

    const results = [];
    const errors = [];

    for (const alertId of alertIds) {
      try {
        const alert = alertService.acknowledgeAlert(alertId, acknowledgedBy);
        results.push(alert);
      } catch (error) {
        errors.push({ alertId, error: error.message });
      }
    }

    res.json({
      success: true,
      data: {
        acknowledged: results.length,
        failed: errors.length,
        results,
        errors
      }
    });

  } catch (error) {
    logger.error('Error bulk acknowledging alerts', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error bulk acknowledging alerts',
      error: error.message
    });
  }
});

// Clear all alerts (for testing/reset purposes)
router.delete('/clear/all', async (req, res) => {
  try {
    logger.info('Clearing all alerts');

    alertService.clearAllAlerts();

    res.json({
      success: true,
      message: 'All alerts cleared successfully'
    });

  } catch (error) {
    logger.error('Error clearing all alerts', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error clearing all alerts',
      error: error.message
    });
  }
});

module.exports = router; 