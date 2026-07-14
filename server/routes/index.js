const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const { loginLimiter, inquiryLimiter, reviewLimiter } = require('../middleware/rateLimiter');

// Controllers
const { authUser, registerUser, changePassword } = require('../controllers/authController');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { getGalleryImages, uploadGalleryImage, deleteGalleryImage } = require('../controllers/galleryController');
const { submitInquiry, getInquiries, markInquiryContacted, deleteInquiry } = require('../controllers/inquiryController');
const { getApprovedReviews, getAllReviews, submitReview, updateReviewStatus, toggleReviewFeatured, deleteReview } = require('../controllers/reviewController');
const { getSettings, updateSettings } = require('../controllers/settingsController');

// Auth Routes
router.post('/auth/login', loginLimiter, authUser);
router.post('/auth/register', protect, admin, registerUser);
router.put('/auth/change-password', protect, changePassword);

// Product Routes
router.get('/products', getProducts);
router.post('/products', protect, admin, upload.array('images', 5), createProduct);
router.get('/products/:id', getProductById);
router.put('/products/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/products/:id', protect, admin, deleteProduct);

// Project Routes
router.get('/projects', getProjects);
router.post('/projects', protect, admin, upload.array('images', 5), createProject);
router.get('/projects/:id', getProjectById);
router.put('/projects/:id', protect, admin, upload.array('images', 5), updateProject);
router.delete('/projects/:id', protect, admin, deleteProject);

// Service Routes
router.get('/services', getServices);
router.post('/services', protect, admin, upload.single('image'), createService);
router.put('/services/:id', protect, admin, upload.single('image'), updateService);
router.delete('/services/:id', protect, admin, deleteService);

// Gallery Routes
router.get('/gallery', getGalleryImages);
router.post('/gallery', protect, admin, upload.single('image'), uploadGalleryImage);
router.delete('/gallery/:id', protect, admin, deleteGalleryImage);

// Inquiry Routes
router.post('/inquiries', inquiryLimiter, upload.single('drawing'), submitInquiry);
router.get('/inquiries', protect, admin, getInquiries);
router.put('/inquiries/:id', protect, admin, markInquiryContacted);
router.delete('/inquiries/:id', protect, admin, deleteInquiry);

// Review Routes
router.get('/reviews', getApprovedReviews);
router.post('/reviews', reviewLimiter, upload.single('image'), submitReview);
router.get('/reviews/admin', protect, admin, getAllReviews);
router.patch('/reviews/:id/status', protect, admin, updateReviewStatus);
router.patch('/reviews/:id/featured', protect, admin, toggleReviewFeatured);
router.delete('/reviews/:id', protect, admin, deleteReview);

// Settings Routes
router.get('/settings', getSettings);
router.put('/settings', protect, admin, upload.single('heroBanner'), updateSettings);

module.exports = router;
