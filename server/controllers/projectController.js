const Project = require('../models/Project');
const cloudinary = require('cloudinary').v2;

const getProjects = async (req, res) => {
  try {
    const items = await Project.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getProjectById = async (req, res) => {
  try {
    const item = await Project.findById(req.params.id);
    if (item) res.json(item);
    else res.status(404).json({ message: 'Project not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createProject = async (req, res) => {
  try {
    const { title, description, location } = req.body;
    let images = [];
    if (req.files) {
      images = req.files.map(file => ({ public_id: file.filename, secure_url: file.path }));
    }
    const item = new Project({ title, description, location, images });
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, location, existingImages } = req.body;
    const item = await Project.findById(req.params.id);
    if (item) {
      item.title = title || item.title;
      item.description = description || item.description;
      item.location = location || item.location;
      
      let parsedExisting = [];
      if (existingImages) parsedExisting = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
      
      const imagesToDelete = item.images.filter(img => !parsedExisting.some(pe => pe.public_id === img.public_id));
      if (imagesToDelete.length > 0) {
        await Promise.all(imagesToDelete.map(async (img) => {
          try {
            const result = await cloudinary.uploader.destroy(img.public_id);
            if (result.result !== 'ok' && result.result !== 'not found') {
              console.warn(`Cloudinary deletion warning for public_id: ${img.public_id}. Details: ${result.result}`);
            }
          } catch (cloudinaryError) {
            console.error(`Cloudinary destroy error for public_id: ${img.public_id}:`, cloudinaryError.message);
          }
        }));
      }
      
      let newImages = [];
      if (req.files && req.files.length > 0) {
        newImages = req.files.map(file => ({ public_id: file.filename, secure_url: file.path }));
      }
      
      item.images = [...parsedExisting, ...newImages];
      const updatedItem = await item.save();
      res.json(updatedItem);
    } else { res.status(404).json({ message: 'Project not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteProject = async (req, res) => {
  try {
    const item = await Project.findById(req.params.id);
    if (item) {
      if (item.images && item.images.length > 0) {
        await Promise.all(item.images.map(async (img) => {
          try {
            const result = await cloudinary.uploader.destroy(img.public_id);
            if (result.result !== 'ok' && result.result !== 'not found') {
              console.warn(`Cloudinary deletion warning for public_id: ${img.public_id}. Details: ${result.result}`);
            }
          } catch (cloudinaryError) {
            console.error(`Cloudinary destroy error for public_id: ${img.public_id}:`, cloudinaryError.message);
          }
        }));
      }
      await Project.deleteOne({ _id: item._id });
      res.json({ message: 'Project removed' });
    } else { res.status(404).json({ message: 'Project not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };