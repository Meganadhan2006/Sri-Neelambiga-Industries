import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Factory, Users, ShieldCheck, Star, ChevronLeft, ChevronRight, Quote, Calendar, MapPin, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { useToastStore } from '../../store/useToastStore';
import { useSyncRefetch } from '../../utils/sync';
import PremiumUploadField from '../../components/PremiumUploadField';

const Home = () => {
  const [data, setData] = useState({
    heroTitle: 'Premium Stainless Steel Fabrication',
    heroSubtitle: 'Delivering exceptional quality and precision for your industrial and commercial needs.',
    yearsExperience: '12+',
    completedProjects: '250+',
    happyClients: '180+'
  });
  const [heroBannerUrl, setHeroBannerUrl] = useState('https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', projectName: '', reviewText: '', rating: 5, city: '', completionDate: '' });
  const [reviewImage, setReviewImage] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [readingReview, setReadingReview] = useState(null);
  const showToast = useToastStore((state) => state.showToast);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res.data && res.data.heroTitle) {
        setData(res.data);
        if (res.data.heroBanner?.secure_url) {
          setHeroBannerUrl(res.data.heroBanner.secure_url);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useSyncRefetch(fetchData, 'settings_updated');
  useSyncRefetch(fetchReviews, 'reviews_updated');

  // Filter reviews for homepage carousel: prioritize featured reviews, fallback to approved
  const carouselReviews = reviews.filter(r => r.isFeatured).length > 0
    ? reviews.filter(r => r.isFeatured)
    : reviews;

  const handleNext = useCallback(() => {
    if (carouselReviews.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % carouselReviews.length);
  }, [carouselReviews.length]);

  const handlePrev = () => {
    if (carouselReviews.length === 0) return;
    setActiveSlide((prev) => (prev - 1 + carouselReviews.length) % carouselReviews.length);
  };

  // Auto rotate carousel every 8 seconds
  useEffect(() => {
    if (carouselReviews.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(interval);
  }, [carouselReviews.length, handleNext]);

  const handleDragEnd = (event, info) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      handlePrev();
    } else if (info.offset.x < -threshold) {
      handleNext();
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      const formData = new FormData();
      Object.keys(reviewForm).forEach(key => formData.append(key, reviewForm[key]));
      if (reviewImage) {
        formData.append('image', reviewImage);
      }

      await api.post('/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Thank you! Your review has been submitted for moderation.', 'success');
      setReviewForm({ name: '', projectName: '', reviewText: '', rating: 5, city: '', completionDate: '' });
      setReviewImage(null);
      setShowForm(false);
      
      const fileInput = document.getElementById('review-file-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error(err);
      showToast('Failed to submit review. Please try again.', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-primary relative overflow-x-hidden">
      
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat py-20 lg:py-24 text-white flex items-center"
        style={{ backgroundImage: `linear-gradient(to right, rgba(20, 20, 20, 0.85), rgba(20, 20, 20, 0.4)), url(${heroBannerUrl})` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <motion.h1 
            {...fadeInUp}
            className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-3xl"
          >
            {data.heroTitle}
          </motion.h1>
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-4 text-base md:text-lg text-stone-200 max-w-2xl font-light leading-relaxed"
          >
            {data.heroSubtitle}
          </motion.p>
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              to="/contact"
              className="btn-pill-primary !bg-brand-accent hover:!bg-brand-accent-hover text-btn-text shadow-md inline-flex items-center justify-center gap-1.5 group cursor-pointer"
            >
              Request a Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/projects"
              className="btn-pill-secondary !bg-white/10 hover:!bg-white/20 !border-white/20 !text-white backdrop-blur-sm inline-flex items-center justify-center cursor-pointer"
            >
              View Our Projects
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary border-b border-border-main/55">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <motion.div
              {...fadeInUp}
              className="p-6 rounded-2xl bg-card border border-border-main/60 shadow-sm"
            >
              <Factory className="h-10 w-10 text-brand-accent mx-auto mb-3" />
              <h3 className="text-3xl font-extrabold text-text-main mb-1">{data.yearsExperience}</h3>
              <p className="text-text-muted uppercase tracking-wider text-xxs font-bold">Years Experience</p>
            </motion.div>
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="p-6 rounded-2xl bg-card border border-border-main/60 shadow-sm"
            >
              <CheckCircle className="h-10 w-10 text-brand-accent mx-auto mb-3" />
              <h3 className="text-3xl font-extrabold text-text-main mb-1">{data.completedProjects}</h3>
              <p className="text-text-muted uppercase tracking-wider text-xxs font-bold">Projects Completed</p>
            </motion.div>
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="p-6 rounded-2xl bg-card border border-border-main/60 shadow-sm"
            >
              <Users className="h-10 w-10 text-brand-accent mx-auto mb-3" />
              <h3 className="text-3xl font-extrabold text-text-main mb-1">{data.happyClients}</h3>
              <p className="text-text-muted uppercase tracking-wider text-xxs font-bold">Happy Clients</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-card border-b border-border-main/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-text-main mb-3">Why Choose Sri Neelambiga Industries?</h2>
            <div className="w-16 h-1 bg-brand-accent mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Premium Quality', desc: 'We use only the highest grade stainless steel for maximum durability.' },
              { title: 'Expert Craftsmanship', desc: 'Our skilled team ensures precision in every cut, weld, and polish.' },
              { title: 'Custom Solutions', desc: 'Tailored designs to meet your specific architectural requirements.' },
              { title: 'On-Time Delivery', desc: 'Committed to completing your projects within the agreed timeframe.' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-primary p-6 rounded-2xl shadow-sm border border-border-main/60 hover:border-brand-accent/40 transition-all duration-300"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
              >
                <ShieldCheck className="h-8 w-8 text-brand-accent mb-3" />
                <h3 className="text-lg font-bold text-text-main mb-2">{feature.title}</h3>
                <p className="text-text-muted text-xs leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Customer Reviews Redesign */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-primary via-secondary/20 to-primary border-b border-border-main/60">
        
        {/* Floating blurred abstract shapes */}
        <div className="absolute top-12 left-[-10%] w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-12 right-[-10%] w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-[10px] tracking-[0.25em] font-black uppercase text-brand-accent">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-black text-text-main mt-3 mb-4 tracking-tight leading-tight">
              Customer Reviews
            </h2>
            <div className="w-16 h-1 bg-brand-accent mx-auto rounded-full mb-4"></div>
            <p className="text-xs md:text-sm text-text-muted max-w-xl mx-auto leading-relaxed font-light">
              We build long-term relationships through exceptional engineering, transparent processes, and premium quality craftsmanship.
            </p>
          </div>

          {/* Premium Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-card/45 backdrop-blur-md rounded-[20px] border border-border-main/50 p-8 shadow-sm mb-16">
            <div className="text-center">
              <div className="flex gap-0.5 text-amber-500 justify-center mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <div className="text-2xl md:text-3xl font-black text-text-main">4.9 / 5</div>
              <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest mt-1">Customer Rating</p>
            </div>
            <div className="text-center border-l border-border-main/40">
              <div className="text-2xl md:text-3xl font-black text-brand-accent">250+</div>
              <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest mt-1">Completed Projects</p>
            </div>
            <div className="text-center border-l border-border-main/40">
              <div className="text-2xl md:text-3xl font-black text-brand-accent">180+</div>
              <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest mt-1">Happy Customers</p>
            </div>
            <div className="text-center border-l border-border-main/40">
              <div className="text-2xl md:text-3xl font-black text-brand-accent">12+</div>
              <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest mt-1">Years Experience</p>
            </div>
          </div>

          {carouselReviews.length === 0 ? (
            <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-[20px] p-12 text-center text-text-muted text-xs leading-relaxed max-w-2xl mx-auto shadow-sm">
              No reviews featured yet. Be the first to share your experience using the submission section below!
            </div>
          ) : (
            <div className="relative max-w-4xl mx-auto">
              
              {/* Swipe/Drag Wrapper */}
              <div className="overflow-hidden relative min-h-[360px] md:min-h-[280px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="bg-card/45 backdrop-blur-md border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] rounded-[20px] p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center cursor-grab active:cursor-grabbing relative select-none w-full"
                  >
                    
                    {/* Decorative quote icon */}
                    <Quote className="absolute -top-4 -right-4 w-28 h-28 text-brand-accent/5 select-none pointer-events-none" />

                    {/* Customer image container */}
                    <div className="relative shrink-0 select-none">
                      {carouselReviews[activeSlide].image?.secure_url ? (
                        <img
                          src={getOptimizedImageUrl(carouselReviews[activeSlide].image.secure_url, 200)}
                          alt={carouselReviews[activeSlide].name}
                          className="w-24 h-24 md:w-28 md:h-28 rounded-full border-[4px] border-brand-accent/20 object-cover shadow-sm pointer-events-none"
                        />
                      ) : (
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-secondary flex items-center justify-center text-text-muted font-bold text-lg border-[4px] border-brand-accent/15 select-none">
                          {carouselReviews[activeSlide].name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-1 bg-brand-accent text-white rounded-full p-1 border border-card shadow-sm flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>

                    {/* Client info & text block */}
                    <div className="flex-1 w-full text-center md:text-left">
                      <div className="flex flex-wrap gap-0.5 text-amber-500 justify-center md:justify-start mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < carouselReviews[activeSlide].rating ? 'fill-current' : 'text-stone-200'}`} />
                        ))}
                      </div>

                      <h3 className="text-lg font-bold text-text-main leading-tight mb-2">
                        {carouselReviews[activeSlide].name}
                      </h3>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1.5 text-xxs text-text-muted mb-4 font-medium uppercase tracking-wider">
                        {carouselReviews[activeSlide].city && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-brand-accent" /> {carouselReviews[activeSlide].city}</span>
                        )}
                        {carouselReviews[activeSlide].projectName && (
                          <span className="text-brand-accent font-bold">Project: {carouselReviews[activeSlide].projectName}</span>
                        )}
                        {carouselReviews[activeSlide].completionDate && (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-brand-accent" /> {carouselReviews[activeSlide].completionDate}</span>
                        )}
                      </div>

                      <p className="text-xs md:text-sm text-text-muted italic leading-relaxed font-light line-clamp-3">
                        "{carouselReviews[activeSlide].reviewText}"
                      </p>

                      {carouselReviews[activeSlide].reviewText.length > 180 && (
                        <button
                          onClick={() => setReadingReview(carouselReviews[activeSlide])}
                          className="mt-3.5 text-xxs text-brand-accent font-bold uppercase tracking-wider hover:text-brand-accent-hover transition-colors cursor-pointer"
                        >
                          Read Full Review
                        </button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between mt-6 px-2 select-none">
                
                {/* Previous Button */}
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 bg-card border border-border-main/55 hover:border-brand-accent/30 text-text-muted hover:text-brand-accent hover:bg-secondary/40 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Pagination Dots & Indexes */}
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-text-muted tracking-wider">
                    {String(activeSlide + 1).padStart(2, '0')} / {String(carouselReviews.length).padStart(2, '0')}
                  </span>
                  <div className="flex gap-1.5">
                    {carouselReviews.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          activeSlide === i ? 'bg-brand-accent w-5' : 'bg-stone-300 w-1.5'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  className="w-10 h-10 bg-card border border-border-main/55 hover:border-brand-accent/30 text-text-muted hover:text-brand-accent hover:bg-secondary/40 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>
            </div>
          )}

          {/* Form expander trigger */}
          <div className="text-center mt-16 select-none">
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-pill-secondary shadow-sm"
            >
              {showForm ? 'Cancel Submission' : 'Have We Worked Together? Write a Review'}
            </button>
          </div>

          {/* Collapsible Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto mt-8 bg-card border border-border-main/60 rounded-[20px] p-6 md:p-8 shadow-md"
            >
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-1">Share Your Experience</h3>
              <p className="text-[10px] text-text-muted mb-6">Tell us about the quality of fabrication work, duration, and customer service.</p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Your Name *</label>
                    <input
                      required
                      type="text"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="input-pill"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Your Location (City)</label>
                    <input
                      type="text"
                      value={reviewForm.city}
                      onChange={(e) => setReviewForm({ ...reviewForm, city: e.target.value })}
                      placeholder="e.g. Coimbatore, TN"
                      className="input-pill"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Project Name (Optional)</label>
                    <input
                      type="text"
                      value={reviewForm.projectName}
                      onChange={(e) => setReviewForm({ ...reviewForm, projectName: e.target.value })}
                      placeholder="e.g. Industrial Shed Fabrication"
                      className="input-pill"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Completion Date (Optional)</label>
                    <input
                      type="text"
                      value={reviewForm.completionDate}
                      onChange={(e) => setReviewForm({ ...reviewForm, completionDate: e.target.value })}
                      placeholder="e.g. June 2026"
                      className="input-pill"
                    />
                  </div>
                </div>

                {/* Rating Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Rating *</label>
                  <div className="flex gap-1 items-center py-1 select-none">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewForm.rating ? 'fill-current' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xxs font-bold text-text-muted uppercase ml-2">
                      {reviewForm.rating} Star{reviewForm.rating > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">Review Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.reviewText}
                    onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                    placeholder="Tell us about the quality of fabrication work, duration, or communication..."
                    className="textarea-pill"
                  />
                </div>

                <PremiumUploadField
                  label="Add Photo (Optional)"
                  newFiles={reviewImage}
                  onFilesSelected={(files) => setReviewImage(files[0])}
                  onRemoveNewFile={() => setReviewImage(null)}
                  loading={reviewLoading}
                />

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full btn-pill-primary shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {reviewLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : 'Submit Review'}
                </button>
              </form>
            </motion.div>
          )}

        </div>
      </section>

      {/* Review Read-More Modal */}
      {readingReview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-zoom-in relative">
            <button
              onClick={() => setReadingReview(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-main bg-primary p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                {readingReview.image?.secure_url ? (
                  <img
                    src={getOptimizedImageUrl(readingReview.image.secure_url, 150)}
                    alt={readingReview.name}
                    className="w-16 h-16 rounded-full border-2 border-brand-accent/25 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-text-muted font-bold text-base border-2 border-brand-accent/15">
                    {readingReview.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-text-main text-base leading-tight">{readingReview.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-text-muted mt-1 uppercase font-medium tracking-wider">
                    {readingReview.city && <span>{readingReview.city}</span>}
                    {readingReview.projectName && <span className="text-brand-accent font-bold">| {readingReview.projectName}</span>}
                    {readingReview.completionDate && <span className="italic">| {readingReview.completionDate}</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-0.5 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < readingReview.rating ? 'fill-current' : 'text-stone-200'}`} />
                ))}
              </div>

              <p className="text-xs md:text-sm text-text-muted italic leading-relaxed whitespace-pre-wrap font-light border-t border-border-main/50 pt-4">
                "{readingReview.reviewText}"
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Call to Action */}
      <section className="py-16 relative overflow-hidden bg-gradient-to-br from-secondary/80 to-primary border-t border-b border-border-main/60">
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-4">Ready to start your project?</h2>
          <p className="text-sm md:text-base text-text-muted mb-8 max-w-lg mx-auto leading-relaxed">
            Get in touch with us today for a free consultation, design estimate, and quote.
          </p>
          <Link
            to="/contact"
            className="btn-pill-primary shadow-md inline-flex items-center justify-center"
          >
            Contact Us Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;