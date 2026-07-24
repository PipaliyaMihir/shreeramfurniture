const mongoose = require('mongoose');

const emailConfigSchema = new mongoose.Schema(
  {
    subject: { type: String, default: 'Thank you for requesting a quotation from Shree Ram Furniture!' },
    body: { type: String, default: 'Hello,\n\nThank you for reaching out to us. We have received your request for a custom furniture quotation. Please find attached our pricing catalog/brochure.\n\nBest regards,\nShree Ram Furniture Team' },
    pdfUrl: { type: String, default: '' },  // Local or CDN path to uploaded PDF catalog
    logoUrl: { type: String, default: '' } // Local or CDN path to uploaded email header logo
  },
  { timestamps: true }
);

const EmailConfigModel = mongoose.model('EmailConfig', emailConfigSchema);
const { wrapModel } = require('../utils/dbFallback');

const defaultEmailConfig = [
  {
    subject: 'Thank you for requesting a quotation from Shree Ram Furniture!',
    body: 'Hello,\n\nThank you for reaching out to us. We have received your request for a custom furniture quotation. Please find attached our pricing catalog/brochure.\n\nBest regards,\nShree Ram Furniture Team',
    pdfUrl: '',
    logoUrl: ''
  }
];

module.exports = wrapModel(EmailConfigModel, 'EmailConfig', defaultEmailConfig);
