const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  images: [{
  public_id: { type: String, required: true },
  secure_url: { type: String, required: true }
}]
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);