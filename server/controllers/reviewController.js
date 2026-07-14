const Review = require('../models/Review');
const cloudinary = require('cloudinary').v2;

// @desc    Get all approved reviews (Public)
// @route   GET /api/reviews
const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews (Admin only)
// @route   GET /api/reviews/admin
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a review (Public)
// @route   POST /api/reviews
const submitReview = async (req, res) => {
  try {
    const { name, projectName, reviewText, rating, city, completionDate } = req.body;
    let image = null;
    if (req.file) {
      image = { public_id: req.file.filename, secure_url: req.file.path };
    }
    
    const review = new Review({
      name,
      projectName,
      reviewText,
      rating: Number(rating),
      image,
      city,
      completionDate,
      status: 'pending',
      isFeatured: false
    });

    const createdReview = await review.save();
    res.status(201).json(createdReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle featured status of review (Admin only)
// @route   PATCH /api/reviews/:id/featured
const toggleReviewFeatured = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (review) {
      review.isFeatured = !review.isFeatured;
      const updatedReview = await review.save();
      res.json(updatedReview);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject review status (Admin only)
// @route   PATCH /api/reviews/:id/status
const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const review = await Review.findById(req.params.id);
    if (review) {
      review.status = status;
      const updatedReview = await review.save();
      res.json(updatedReview);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review (Admin only)
// @route   DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (review) {
      if (review.image && review.image.public_id) {
        const result = await cloudinary.uploader.destroy(review.image.public_id);
        if (result.result !== 'ok' && result.result !== 'not found') {
          throw new Error(`Cloudinary delete failed for: ${review.image.public_id}`);
        }
      }
      await Review.deleteOne({ _id: review._id });
      res.json({ message: 'Review removed successfully' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getApprovedReviews,
  getAllReviews,
  submitReview,
  toggleReviewFeatured,
  updateReviewStatus,
  deleteReview
};
