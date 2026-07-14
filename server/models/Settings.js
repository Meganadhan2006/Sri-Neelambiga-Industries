const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'Sri Neelambiga Industries' },
  tagline: { type: String, default: 'Premium Stainless Steel Fabrication' },
  aboutText: { type: String, default: '' },
  email: { type: String, default: 'srineelambiga@gmail.com' },
  phone: { type: String, default: '+91 98420 99998 / +91 98424 99998 / +91 96260 99998' },
  address: { type: String, default: 'Thuraiyur Main Road, Near Aranarai Road, Perambalur, Tamil Nadu - 621212' },
  whatsapp: { type: String, default: '+91 98424 99998' },
  heroTitle: { type: String, default: 'Welcome to Sri Neelambiga Industries' },
  heroSubtitle: { type: String, default: 'Quality Fabrication' },
  yearsExperience: { type: String, default: '10+' },
  completedProjects: { type: String, default: '500+' },
  happyClients: { type: String, default: '300+' },
  heroBanner: {
  public_id: { type: String },
  secure_url: { type: String }
}
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);