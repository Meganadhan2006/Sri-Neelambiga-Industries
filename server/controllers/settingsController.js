const Settings = require('../models/Settings');
const cloudinary = require('cloudinary').v2;

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings({});
    }
    
    const fields = ['companyName', 'tagline', 'aboutText', 'email', 'phone', 'address', 'whatsapp', 'heroTitle', 'heroSubtitle', 'yearsExperience', 'completedProjects', 'happyClients'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) settings[field] = req.body[field];
    });

    if (req.file) {
      if (settings.heroBanner && settings.heroBanner.public_id) {
        const result = await cloudinary.uploader.destroy(settings.heroBanner.public_id);
        if (result.result !== 'ok' && result.result !== 'not found') {
          throw new Error(`Cloudinary deletion failed for public_id: ${settings.heroBanner.public_id}. Details: ${result.result}`);
        }
      }
      settings.heroBanner = { public_id: req.file.filename, secure_url: req.file.path };
    }
    
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getSettings, updateSettings };