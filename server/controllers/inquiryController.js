const Inquiry = require('../models/Inquiry');
const cloudinary = require('cloudinary').v2;

const getInquiries = async (req, res) => {
  try {
    const items = await Inquiry.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const submitInquiry = async (req, res) => {
  try {
    const { name, email, phone, productRequired, message } = req.body;
    let drawing = null;
    if (req.file) drawing = { public_id: req.file.filename, secure_url: req.file.path };
    const item = new Inquiry({ name, email, phone, productRequired, message, drawing });
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const markInquiryContacted = async (req, res) => {
  try {
    const item = await Inquiry.findById(req.params.id);
    if (item) {
      item.status = 'contacted';
      const updatedItem = await item.save();
      res.json(updatedItem);
    } else { res.status(404).json({ message: 'Not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteInquiry = async (req, res) => {
  try {
    const item = await Inquiry.findById(req.params.id);
    if (item) {
      if (item.drawing && item.drawing.public_id) { 
        const result = await cloudinary.uploader.destroy(item.drawing.public_id, { resource_type: 'raw' });
        if (result.result !== 'ok') {
          await cloudinary.uploader.destroy(item.drawing.public_id, { resource_type: 'image' });
        }
      }
      await Inquiry.deleteOne({ _id: item._id });
      res.json({ message: 'Removed' });
    } else { res.status(404).json({ message: 'Not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getInquiries, submitInquiry, markInquiryContacted, deleteInquiry };