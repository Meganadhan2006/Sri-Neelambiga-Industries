import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, Image as ImageIcon, Search } from 'lucide-react';
import api from '../../../api';
import { compressImage } from '../../../utils/imageCompressor';
import { getOptimizedImageUrl } from '../../../utils/imageOptimizer';
import { useToastStore } from '../../../store/useToastStore';
import { useConfirmStore } from '../../../store/useConfirmStore';
import { broadcastSyncEvent } from '../../../utils/sync';
import PremiumUploadField from '../../../components/PremiumUploadField';

const ManageGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '' });
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const showToast = useToastStore((state) => state.showToast);
  const confirm = useConfirmStore((state) => state.confirm);
  const closeConfirm = useConfirmStore((state) => state.close);
  const setConfirmLoading = useConfirmStore((state) => state.setLoading);

  const fetchGallery = useCallback(async () => {
    try {
      const res = await api.get('/gallery');
      setGallery(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load gallery images', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newImage) {
      showToast('Please select an image', 'error');
      return;
    }
    setLoading(true);
    setUploadProgress(1);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      
      // Compress the single image file client-side
      const compressedFile = await compressImage(newImage, { quality: 0.8 });
      data.append('image', compressedFile);

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      };

      await api.post('/gallery', data, config);
      showToast('Image uploaded successfully', 'success');
      broadcastSyncEvent('gallery_updated');
      await fetchGallery();
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setFormData({ title: '' });
        setNewImage(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast('Upload failed', 'error');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete Gallery Item',
      description: 'Are you sure you want to delete this gallery item? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await api.delete(`/gallery/${id}`);
          showToast('Image removed from gallery', 'success');
          broadcastSyncEvent('gallery_updated');
          await fetchGallery();
          closeConfirm();
        } catch (err) {
          console.error(err);
          showToast('Failed to delete image', 'error');
        } finally {
          setConfirmLoading(false);
        }
      }
    });
  };

  const filteredItems = gallery.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Gallery Images</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage portfolio images displayed on the website</p>
        </div>
        <button
          onClick={() => { setUploadProgress(0); setSuccess(false); setIsModalOpen(true); }}
          className="btn-pill-primary shadow-xs"
        >
          <Plus className="w-4.5 h-4.5" /> Upload Image
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
          <input
            type="text"
            placeholder="Search gallery..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-pill"
          />
        </div>
        <div className="text-xxs font-bold text-text-muted uppercase tracking-wider">
          Total: {filteredItems.length} items
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card rounded-2xl border border-border-main/60 text-center">
          <ImageIcon className="w-10 h-10 text-stone-300 mb-3 animate-pulse" />
          <h3 className="text-sm font-semibold text-text-main mb-1">No images found</h3>
          <p className="text-xs text-text-muted max-w-xs mb-4">Start uploading showcase photos of your works.</p>
          <button
            onClick={() => { setUploadProgress(0); setSuccess(false); setIsModalOpen(true); }}
            className="btn-pill-secondary shadow-xs mt-2"
          >
            Upload Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item._id} className="card-premium card-premium-hover flex flex-col justify-between overflow-hidden group">
              <div className="relative h-44 bg-secondary overflow-hidden shrink-0">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={getOptimizedImageUrl(item.images[0].secure_url, 400)}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-[10px]">No image</div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn-action-round text-error hover:bg-red-50/20"
                    title="Delete Image"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
              <div className="p-4 border-t border-border-main/50 flex-grow">
                <h3 className="font-semibold text-text-main text-xs truncate" title={item.title}>
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="modal-premium max-w-sm">
            <div className="flex justify-between items-center p-6 border-b border-border-main/60 bg-primary/20">
              <div>
                <h3 className="text-base font-bold text-text-main">Upload Image</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Add a new photo to the website portfolio</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Image Title *</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="input-pill"
                />
              </div>
              
              <PremiumUploadField
                label="Image File *"
                newFiles={newImage}
                onFilesSelected={(files) => setNewImage(files[0])}
                onRemoveNewFile={() => setNewImage(null)}
                uploadProgress={uploadProgress}
                loading={loading}
                success={success}
              />

              <div className="flex justify-end pt-4 border-t border-border-main/50 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-pill-secondary"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="btn-pill-primary shadow-xs"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Uploading ({uploadProgress}%)
                    </>
                  ) : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGallery;
