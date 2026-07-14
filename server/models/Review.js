const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  projectName: { type: String },
  reviewText: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  image: {
    public_id: { type: String },
    secure_url: { type: String }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  city: { type: String },
  completionDate: { type: String },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

reviewSchema.index({ status: 1 });
reviewSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Review', reviewSchema);
