const Gallery = require('../models/Gallery');
const cloudinary = require('cloudinary').v2;

const getGalleryImages = async (req, res) => {
  try {
    const items = await Gallery.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const uploadGalleryImage = async (req, res) => {
  try {
    const { title } = req.body;
    let images = [];
    if (req.file) {
      images = [{ public_id: req.file.filename, secure_url: req.file.path }];
    } else if (req.files) {
      images = req.files.map(file => ({ public_id: file.filename, secure_url: file.path }));
    }
    const item = new Gallery({ title, images });
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteGalleryImage = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
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
      await Gallery.deleteOne({ _id: item._id });
      res.json({ message: 'Item removed' });
    } else { res.status(404).json({ message: 'Item not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getGalleryImages, uploadGalleryImage, deleteGalleryImage };