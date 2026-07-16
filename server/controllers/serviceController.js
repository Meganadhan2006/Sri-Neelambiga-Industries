const Service = require('../models/Service');
const cloudinary = require('cloudinary').v2;

const getServices = async (req, res) => {
  try {
    const items = await Service.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createService = async (req, res) => {
  try {
    const { title, description, icon } = req.body;
    let image = null;
    if (req.file) image = { public_id: req.file.filename, secure_url: req.file.path };
    const item = new Service({ title, description, icon, image });
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateService = async (req, res) => {
  try {
    const { title, description, icon } = req.body;
    const item = await Service.findById(req.params.id);
    if (item) {
      item.title = title || item.title;
      item.description = description || item.description;
      item.icon = icon || item.icon;
      if (req.file) {
        if (item.image && item.image.public_id) {
          try {
            const result = await cloudinary.uploader.destroy(item.image.public_id);
            if (result.result !== 'ok' && result.result !== 'not found') {
              console.warn(`Cloudinary deletion warning for public_id: ${item.image.public_id}. Details: ${result.result}`);
            }
          } catch (cloudinaryError) {
            console.error(`Cloudinary destroy error for public_id: ${item.image.public_id}:`, cloudinaryError.message);
          }
        }
        item.image = { public_id: req.file.filename, secure_url: req.file.path };
      }
      const updatedItem = await item.save();
      res.json(updatedItem);
    } else { res.status(404).json({ message: 'Service not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteService = async (req, res) => {
  try {
    const item = await Service.findById(req.params.id);
    if (item) {
      if (item.image && item.image.public_id) {
        try {
          const result = await cloudinary.uploader.destroy(item.image.public_id);
          if (result.result !== 'ok' && result.result !== 'not found') {
            console.warn(`Cloudinary deletion warning for public_id: ${item.image.public_id}. Details: ${result.result}`);
          }
        } catch (cloudinaryError) {
          console.error(`Cloudinary destroy error for public_id: ${item.image.public_id}:`, cloudinaryError.message);
        }
      }
      await Service.deleteOne({ _id: item._id });
      res.json({ message: 'Service removed' });
    } else { res.status(404).json({ message: 'Service not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getServices, createService, updateService, deleteService };