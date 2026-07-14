import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import api from '../../api';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { useSyncRefetch } from '../../utils/sync';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGallery = useCallback(async () => {
    try {
      const res = await api.get('/gallery');
      setGalleryItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useSyncRefetch(fetchGallery, 'gallery_updated');

  return (
    <div className="min-h-screen bg-primary py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-main mb-3 tracking-tight">
            Project Gallery
          </h1>
          <div className="w-16 h-1 bg-brand-accent mx-auto rounded-full mb-4"></div>
          <p className="text-base text-text-muted max-w-xl mx-auto leading-relaxed">
            Take a visual tour of our manufacturing facility, finished products, and on-site installations.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-accent"></div>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border-main p-8">
            <p className="text-text-muted">No images in the gallery yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {galleryItems.map((item) => (
              <div
                key={item._id}
                onClick={() => setSelectedImage(item)}
                className="card-premium card-premium-hover relative aspect-square overflow-hidden cursor-pointer group"
              >
                {item.images && item.images.length > 0 && (
                  <img
                    src={getOptimizedImageUrl(item.images[0].secure_url, 600)}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                  <h3 className="text-white text-base font-bold tracking-tight">{item.title}</h3>
                  <span className="text-xs text-brand-accent-light mt-1.5 font-medium border-t border-brand-accent-light/35 pt-1.5 px-3">
                    View Details
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
          {selectedImage.images && selectedImage.images.length > 0 && (
            <img
              src={getOptimizedImageUrl(selectedImage.images[0].secure_url, 1200)}
              alt={selectedImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <div className="absolute bottom-8 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{selectedImage.title}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;