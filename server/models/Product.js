const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  material: { type: String, required: true },
  dimensions: { type: String },
  finish: { type: String, required: true },
  images: [{
  public_id: { type: String, required: true },
  secure_url: { type: String, required: true }
}]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);