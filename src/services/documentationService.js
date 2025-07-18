const logger = require('../utils/logger');

// Documentation templates for different clinical scenarios
const DOCUMENTATION_TEMPLATES = {
  // Clinical assessment templates
  'hypertension_assessment': {
    title: 'Hypertension Assessment',
    sections: [
      {
        name: 'Vital Signs',
        template: 'Blood Pressure: {systolic}/{diastolic} mmHg\nHeart Rate: {heartRate} bpm\nWeight: {weight} kg'
      },
      {
        name: 'Assessment',
        template: 'Patient presents with {bloodPressureCategory} blood pressure. Risk factors include: {riskFactors}.'
      },
      {
        name: 'Plan',
        template: '1. {medicationRecommendation}\n2. Lifestyle modifications: {lifestyleRecommendations}\n3. Follow-up: {followUpPlan}'
      }
    ]
  },

  'diabetes_assessment': {
    title: 'Diabetes Assessment',
    sections: [
      {
        name: 'Lab Results',
        template: 'HbA1c: {hba1c}%\nFasting Glucose: {fastingGlucose} mg/dL\nCreatinine: {creatinine} mg/dL'
      },
      {
        name: 'Assessment',
        template: 'Glycemic control is {glycemicControl}. {complications} complications noted.'
      },
      {
        name: 'Plan',
        template: '1. {medicationAdjustment}\n2. {monitoringPlan}\n3. {educationTopics}'
      }
    ]
  },

  'medication_review': {
    title: 'Medication Review',
    sections: [
      {
        name: 'Current Medications',
        template: '{medicationList}'
      },
      {
        name: 'Interactions',
        template: '{interactionSummary}'
      },
      {
        name: 'Recommendations',
        template: '{recommendations}'
      }
    ]
  }
};

// Note types and categories
const NOTE_TYPES = {
  ASSESSMENT: 'assessment',
  PLAN: 'plan',
  PROGRESS: 'progress',
  DISCHARGE: 'discharge',
  CONSULTATION: 'consultation',
  MEDICATION: 'medication'
};

const NOTE_CATEGORIES = {
  CLINICAL: 'clinical',
  ADMINISTRATIVE: 'administrative',
  MEDICATION: 'medication',
  LAB: 'lab',
  IMAGING: 'imaging'
};

class DocumentationService {
  constructor() {
    this.notes = new Map();
    this.templates = DOCUMENTATION_TEMPLATES;
    this.noteTypes = NOTE_TYPES;
    this.noteCategories = NOTE_CATEGORIES;
  }

  // Create a new clinical note
  async createNote(noteData) {
    try {
      const note = {
        id: this.generateNoteId(),
        patientId: noteData.patientId,
        authorId: noteData.authorId,
        authorName: noteData.authorName,
        type: noteData.type || NOTE_TYPES.ASSESSMENT,
        category: noteData.category || NOTE_CATEGORIES.CLINICAL,
        title: noteData.title,
        content: noteData.content,
        sections: noteData.sections || [],
        tags: noteData.tags || [],
        timestamp: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        status: 'active',
        isTemplate: noteData.isTemplate || false,
        templateId: noteData.templateId || null
      };

      this.notes.set(note.id, note);
      
      logger.info('Clinical note created', { 
        noteId: note.id, 
        patientId: note.patientId, 
        type: note.type 
      });

      return note;
    } catch (error) {
      logger.error('Error creating clinical note', { error: error.message });
      throw error;
    }
  }

  // Generate note from template
  async generateNoteFromTemplate(templateKey, data, noteData) {
    try {
      const template = this.templates[templateKey];
      if (!template) {
        throw new Error(`Template '${templateKey}' not found`);
      }

      const sections = template.sections.map(section => ({
        name: section.name,
        content: this.formatTemplate(section.template, data)
      }));

      const note = await this.createNote({
        ...noteData,
        title: template.title,
        sections: sections,
        content: sections.map(s => `${s.name}:\n${s.content}`).join('\n\n'),
        templateId: templateKey
      });

      return note;
    } catch (error) {
      logger.error('Error generating note from template', { error: error.message, templateKey });
      throw error;
    }
  }

  // Generate clinical recommendation note
  async generateRecommendationNote(patientData, analysis, authorData) {
    try {
      const recommendationContent = this.formatRecommendations(analysis.recommendations);
      const alertContent = this.formatAlerts(analysis.alerts);
      const interactionContent = this.formatInteractions(analysis.drugInteractions);

      const sections = [
        {
          name: 'Clinical Assessment',
          content: `Patient: ${patientData.name}\nConditions: ${analysis.conditions.join(', ')}\nRisk Factors: ${analysis.riskFactors.map(rf => rf.factor).join(', ')}`
        },
        {
          name: 'Recommendations',
          content: recommendationContent
        }
      ];

      if (analysis.alerts.length > 0) {
        sections.push({
          name: 'Alerts',
          content: alertContent
        });
      }

      if (analysis.drugInteractions.length > 0) {
        sections.push({
          name: 'Drug Interactions',
          content: interactionContent
        });
      }

      const note = await this.createNote({
        patientId: patientData.id,
        authorId: authorData.id,
        authorName: authorData.name,
        type: NOTE_TYPES.ASSESSMENT,
        category: NOTE_CATEGORIES.CLINICAL,
        title: 'Clinical Decision Support Recommendations',
        content: sections.map(s => `${s.name}:\n${s.content}`).join('\n\n'),
        sections: sections,
        tags: ['clinical-decision-support', 'recommendations']
      });

      return note;
    } catch (error) {
      logger.error('Error generating recommendation note', { error: error.message });
      throw error;
    }
  }

  // Get notes with optional filtering
  getNotes(filters = {}) {
    let notes = Array.from(this.notes.values());

    // Apply filters
    if (filters.patientId) {
      notes = notes.filter(note => note.patientId === filters.patientId);
    }

    if (filters.type) {
      notes = notes.filter(note => note.type === filters.type);
    }

    if (filters.category) {
      notes = notes.filter(note => note.category === filters.category);
    }

    if (filters.authorId) {
      notes = notes.filter(note => note.authorId === filters.authorId);
    }

    if (filters.status) {
      notes = notes.filter(note => note.status === filters.status);
    }

    if (filters.tags && filters.tags.length > 0) {
      notes = notes.filter(note => 
        filters.tags.some(tag => note.tags.includes(tag))
      );
    }

    // Sort by timestamp (newest first)
    notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return notes;
  }

  // Get note by ID
  getNoteById(noteId) {
    return this.notes.get(noteId);
  }

  // Update a note
  async updateNote(noteId, updates) {
    const note = this.notes.get(noteId);
    if (!note) {
      throw new Error(`Note with ID ${noteId} not found`);
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'timestamp') {
        note[key] = updates[key];
      }
    });

    note.lastModified = new Date().toISOString();

    logger.info('Note updated', { noteId, lastModified: note.lastModified });
    return note;
  }

  // Delete a note
  deleteNote(noteId) {
    const note = this.notes.get(noteId);
    if (!note) {
      throw new Error(`Note with ID ${noteId} not found`);
    }

    this.notes.delete(noteId);
    
    logger.info('Note deleted', { noteId });
    return true;
  }

  // Create a note template
  async createTemplate(templateData) {
    try {
      const template = {
        id: this.generateTemplateId(),
        name: templateData.name,
        description: templateData.description,
        sections: templateData.sections,
        tags: templateData.tags || [],
        createdBy: templateData.createdBy,
        timestamp: new Date().toISOString(),
        isActive: true
      };

      // Store template in a separate collection or mark as template
      this.templates[template.id] = template;
      
      logger.info('Note template created', { templateId: template.id, name: template.name });
      return template;
    } catch (error) {
      logger.error('Error creating note template', { error: error.message });
      throw error;
    }
  }

  // Get available templates
  getTemplates() {
    return Object.keys(this.templates).map(key => ({
      key,
      ...this.templates[key]
    }));
  }

  // Search notes by content
  searchNotes(query, filters = {}) {
    const notes = this.getNotes(filters);
    
    return notes.filter(note => {
      const searchText = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
  }

  // Get note statistics
  getNoteStats() {
    const notes = Array.from(this.notes.values());
    
    const stats = {
      total: notes.length,
      byType: {},
      byCategory: {},
      byAuthor: {},
      recentNotes: notes.filter(note => {
        const noteDate = new Date(note.timestamp);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return noteDate > weekAgo;
      }).length
    };

    // Count by type
    Object.values(NOTE_TYPES).forEach(type => {
      stats.byType[type] = notes.filter(note => note.type === type).length;
    });

    // Count by category
    Object.values(NOTE_CATEGORIES).forEach(category => {
      stats.byCategory[category] = notes.filter(note => note.category === category).length;
    });

    // Count by author
    notes.forEach(note => {
      const author = note.authorName || note.authorId;
      stats.byAuthor[author] = (stats.byAuthor[author] || 0) + 1;
    });

    return stats;
  }

  // Format template with data
  formatTemplate(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  // Format recommendations for note
  formatRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return 'No specific recommendations at this time.';
    }

    return recommendations.map((rec, index) => {
      let formatted = `${index + 1}. ${rec.name} (${rec.type})\n`;
      formatted += `   Reasoning: ${rec.reasoning}\n`;
      if (rec.evidence) {
        formatted += `   Evidence: ${rec.evidence}\n`;
      }
      if (rec.contraindications && rec.contraindications.length > 0) {
        formatted += `   Contraindications: ${rec.contraindications.join(', ')}\n`;
      }
      return formatted;
    }).join('\n');
  }

  // Format alerts for note
  formatAlerts(alerts) {
    if (!alerts || alerts.length === 0) {
      return 'No alerts at this time.';
    }

    return alerts.map((alert, index) => {
      let formatted = `${index + 1}. ${alert.message} (${alert.priority} priority)\n`;
      if (alert.actions && alert.actions.length > 0) {
        formatted += `   Actions: ${alert.actions.join(', ')}\n`;
      }
      return formatted;
    }).join('\n');
  }

  // Format drug interactions for note
  formatInteractions(interactions) {
    if (!interactions || interactions.length === 0) {
      return 'No drug interactions detected.';
    }

    return interactions.map((interaction, index) => {
      let formatted = `${index + 1}. ${interaction.drug1} + ${interaction.drug2}\n`;
      formatted += `   Effect: ${interaction.effect}\n`;
      formatted += `   Severity: ${interaction.severity}\n`;
      formatted += `   Recommendation: ${interaction.recommendation}\n`;
      return formatted;
    }).join('\n');
  }

  // Generate unique note ID
  generateNoteId() {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique template ID
  generateTemplateId() {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export notes for a patient
  exportPatientNotes(patientId, format = 'json') {
    const notes = this.getNotes({ patientId });
    
    if (format === 'json') {
      return JSON.stringify(notes, null, 2);
    } else if (format === 'text') {
      return notes.map(note => {
        let text = `=== ${note.title} ===\n`;
        text += `Date: ${new Date(note.timestamp).toLocaleDateString()}\n`;
        text += `Author: ${note.authorName}\n`;
        text += `Type: ${note.type}\n\n`;
        text += note.content;
        text += '\n\n';
        return text;
      }).join('\n');
    }
    
    return notes;
  }
}

module.exports = new DocumentationService(); 