const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileFilter = (req, file, cb) => {
  const dangerousExtensions = /\.(exe|bat|sh|js|jsx|ts|tsx|php|pl|py|rb|cgi|dll|cmd|com|vbs|msi)$/i;
  if (dangerousExtensions.test(file.originalname)) {
    const error = new Error('Executable or script files are not allowed');
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
};

// Use memory storage instead of multer-storage-cloudinary (incompatible with cloudinary@2 + multer@2)
const storage = multer.memoryStorage();
const multerUpload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Helper: upload a single file buffer to Cloudinary
const uploadBufferToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'sni-assets', resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });
};

// Creates a single middleware that handles multer + cloudinary upload for a single file
const single = (fieldName) => {
  return async (req, res, next) => {
    try {
      // First, run multer to parse the multipart form
      await new Promise((resolve, reject) => {
        multerUpload.single(fieldName)(req, res, (err) => {
          if (err) {
            err.statusCode = err.statusCode || 400;
            return reject(err);
          }
          resolve();
        });
      });

      // Then upload to Cloudinary if a file was provided
      if (req.file) {
        const result = await uploadBufferToCloudinary(req.file);
        req.file.filename = result.public_id;
        req.file.path = result.secure_url;
      }

      next();
    } catch (error) {
      console.error('Upload error:', error);
      const status = error.statusCode || 500;
      res.status(status).json({ message: 'Image upload failed', error: error.message });
    }
  };
};

// Creates a single middleware that handles multer + cloudinary upload for multiple files
const array = (fieldName, maxCount) => {
  return async (req, res, next) => {
    try {
      // First, run multer to parse the multipart form
      await new Promise((resolve, reject) => {
        multerUpload.array(fieldName, maxCount)(req, res, (err) => {
          if (err) {
            err.statusCode = err.statusCode || 400;
            return reject(err);
          }
          resolve();
        });
      });

      // Then upload each file to Cloudinary in parallel
      if (req.files && req.files.length > 0) {
        await Promise.all(req.files.map(async (file) => {
          const result = await uploadBufferToCloudinary(file);
          file.filename = result.public_id;
          file.path = result.secure_url;
        }));
      }

      next();
    } catch (error) {
      console.error('Upload error:', error);
      const status = error.statusCode || 500;
      res.status(status).json({ message: 'Image upload failed', error: error.message });
    }
  };
};

module.exports = { single, array };
