const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ message: 'Product not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, material, finish, dimensions } = req.body;
    let images = [];
    if (req.files) {
      images = req.files.map(file => ({
        public_id: file.filename,
        secure_url: file.path
      }));
    }
    const product = new Product({ name, description, material, finish, dimensions, images });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, material, finish, dimensions, existingImages } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.material = material || product.material;
      product.finish = finish || product.finish;
      product.dimensions = dimensions || product.dimensions;

      let parsedExisting = [];
      if (existingImages) {
        parsedExisting = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
      }
      
      const imagesToDelete = product.images.filter(img => !parsedExisting.some(pe => pe.public_id === img.public_id));
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
      
      product.images = [...parsedExisting, ...newImages];
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      if (product.images && product.images.length > 0) {
        await Promise.all(product.images.map(async (img) => {
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
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };