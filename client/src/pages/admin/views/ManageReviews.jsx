import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, MessageSquare, Star, Trash2, CheckCircle2, XCircle, Award } from 'lucide-react';
import api from '../../../api';
import { getOptimizedImageUrl } from '../../../utils/imageOptimizer';
import { useToastStore } from '../../../store/useToastStore';
import { useConfirmStore } from '../../../store/useConfirmStore';
import { broadcastSyncEvent } from '../../../utils/sync';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const showToast = useToastStore((state) => state.showToast);
  const confirm = useConfirmStore((state) => state.confirm);
  const closeConfirm = useConfirmStore((state) => state.close);
  const setConfirmLoading = useConfirmStore((state) => state.setLoading);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get('/reviews/admin');
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load reviews', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/reviews/${id}/status`, { status: newStatus });
      const actionText = newStatus === 'approved' ? 'approved' : newStatus === 'rejected' ? 'rejected' : 'updated';
      showToast(`Review ${actionText} successfully`, 'success');
      broadcastSyncEvent('reviews_updated');
      await fetchReviews();
    } catch (err) {
      console.error(err);
      showToast('Failed to update review status', 'error');
    }
  };

  const handleToggleFeatured = async (review) => {
    try {
      await api.patch(`/reviews/${review._id}/featured`);
      showToast(!review.isFeatured ? 'Review is now featured on the homepage' : 'Review removed from featured list', 'success');
      broadcastSyncEvent('reviews_updated');
      await fetchReviews();
    } catch (err) {
      console.error(err);
      showToast('Failed to update featured status', 'error');
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete Review',
      description: 'Are you sure you want to delete this review permanently? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await api.delete(`/reviews/${id}`);
          showToast('Review deleted successfully', 'success');
          broadcastSyncEvent('reviews_updated');
          await fetchReviews();
          closeConfirm();
        } catch (err) {
          console.error(err);
          showToast('Failed to delete review', 'error');
        } finally {
          setConfirmLoading(false);
        }
      }
    });
  };

  // Filtering reviews
  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = rev.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (rev.projectName && rev.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rev.city && rev.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      rev.reviewText.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return rev.status === statusFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5 text-amber-500">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-current' : 'text-stone-300'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Customer Reviews</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage and moderate customer testimonials and reviews</p>
        </div>
      </div>

      {/* Filters & Search bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-stretch sm:items-center justify-between">
        <div className="flex overflow-x-auto w-full sm:w-auto gap-1.5 bg-primary p-1 rounded-full border border-border-main/50 shrink-0 select-none no-scrollbar">
          {['all', 'pending', 'approved', 'rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xxs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-card text-brand-accent shadow-sm border border-border-main/50'
                  : 'text-text-muted hover:text-text-main border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="search-pill"
          />
        </div>
      </div>

      {currentReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card rounded-2xl border border-border-main/60 text-center">
          <MessageSquare className="w-10 h-10 text-stone-300 mb-3 animate-pulse" />
          <h3 className="text-sm font-semibold text-text-main mb-1">No reviews found</h3>
          <p className="text-xs text-text-muted max-w-xs">There are no reviews matching your filter criteria.</p>
        </div>
      ) : (
        <div className="table-container-premium">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/50 border-b border-border-main/60 text-text-muted text-xxs font-bold uppercase tracking-wider">
                  <th className="p-4 w-20">Photo</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Review Message</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50 text-text-main text-xs">
                {currentReviews.map(review => (
                  <tr key={review._id} className="hover:bg-primary/30 transition-colors">
                    <td className="p-4">
                      {review.image?.secure_url ? (
                        <img
                          src={getOptimizedImageUrl(review.image.secure_url, 150)}
                          alt={review.name}
                          loading="lazy"
                          className="w-12 h-12 object-cover rounded-xl border border-border-main/50"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-text-muted text-[10px]">
                          No Photo
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-xs text-text-main">{review.name}</div>
                      {review.city && (
                        <div className="text-[10px] text-text-muted mt-0.5">City: {review.city}</div>
                      )}
                      {review.projectName && (
                        <div className="text-[10px] text-brand-accent mt-0.5 font-bold uppercase tracking-wider">
                          Project: {review.projectName}
                        </div>
                      )}
                      {review.completionDate && (
                        <div className="text-[9px] text-text-muted mt-0.5 italic">Done: {review.completionDate}</div>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">{renderStars(review.rating)}</td>
                    <td className="p-4 max-w-xs">
                      <p className="text-xxs text-text-muted leading-relaxed line-clamp-3" title={review.reviewText}>
                        {review.reviewText}
                      </p>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleFeatured(review)}
                        className={`btn-action-round border border-transparent ${
                          review.isFeatured 
                            ? 'text-brand-accent bg-brand-accent/10 !border-brand-accent/20' 
                            : 'text-stone-300 hover:text-stone-500 bg-secondary'
                        }`}
                        title={review.isFeatured ? "Unfeature review" : "Feature review on homepage"}
                      >
                        <Award className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          review.status === 'approved'
                            ? 'bg-green-500/10 text-green-700 border-green-500/20'
                            : review.status === 'rejected'
                            ? 'bg-red-500/10 text-red-700 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                        }`}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      {review.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(review._id, 'approved')}
                          className="btn-action-round text-green-600 hover:bg-green-50"
                          title="Approve Review"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {review.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(review._id, 'rejected')}
                          className="btn-action-round text-amber-600 hover:bg-amber-50"
                          title="Reject Review"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="btn-action-round text-error hover:bg-red-50"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border-main/50 bg-primary/20">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-border-main hover:bg-secondary/50 disabled:opacity-40 transition-premium cursor-pointer text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-xxs font-bold text-text-muted uppercase">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-border-main hover:bg-secondary/50 disabled:opacity-40 transition-premium cursor-pointer text-xs font-semibold"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageReviews;
