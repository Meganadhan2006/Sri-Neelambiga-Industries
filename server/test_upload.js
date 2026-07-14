const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const User = require('./models/User');
const Gallery = require('./models/Gallery');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB
mongoose.connect(process.env.MONGO_URI).then(conn => {
  console.log('MongoDB Connected:', conn.connection.host);
}).catch(err => { console.error(err); process.exit(1); });

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Test route: gallery upload with inline auth + upload
app.post('/api/test-gallery', async (req, res) => {
  try {
    console.log('1. Route handler entered');
    console.log('   Headers:', req.headers.authorization ? 'Bearer ...' : 'NONE');
    
    // Auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ message: 'No token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isAdmin) {
      return res.status(401).json({ message: 'Not admin' });
    }
    console.log('2. Auth passed for', user.email);

    // Multer
    await new Promise((resolve, reject) => {
      upload.single('image')(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    console.log('3. Multer done, file:', !!req.file);

    // Cloudinary
    let images = [];
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'sni-assets', resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      console.log('4. Cloudinary done:', result.public_id);
      images = [{ public_id: result.public_id, secure_url: result.secure_url }];
    }

    // DB
    const { title, category } = req.body;
    const item = new Gallery({ title, category, images });
    const created = await item.save();
    console.log('5. Saved to DB:', created._id);

    res.status(201).json(created);
  } catch (error) {
    console.error('ERROR in test-gallery:', error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(5555, () => console.log('Inline test server on 5555'));
