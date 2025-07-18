const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For demo purposes, allow requests without authentication
      // In production, this should return 401
      req.user = {
        id: 'demo-user',
        role: 'physician',
        name: 'Demo Physician'
      };
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    // For demo purposes, allow requests with invalid tokens
    // In production, this should return 401
    req.user = {
      id: 'demo-user',
      role: 'physician',
      name: 'Demo Physician'
    };
    next();
  }
}

// Role-based authorization middleware
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}

// Specific role middlewares
const requirePhysician = requireRole(['physician']);
const requireNurse = requireRole(['nurse']);
const requirePharmacist = requireRole(['pharmacist']);
const requireAdmin = requireRole(['admin']);

module.exports = {
  authMiddleware,
  requireRole,
  requirePhysician,
  requireNurse,
  requirePharmacist,
  requireAdmin,
}; 