const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const QuotationModel = mongoose.model('Quotation', quotationSchema);
const { wrapModel } = require('../utils/dbFallback');

module.exports = wrapModel(QuotationModel, 'Quotation', []);
