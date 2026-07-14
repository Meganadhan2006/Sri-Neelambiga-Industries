const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  productRequired: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'contacted'], default: 'new' },
  drawing: {
  public_id: { type: String },
  secure_url: { type: String }
}
}, { timestamps: true });

inquirySchema.index({ status: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);