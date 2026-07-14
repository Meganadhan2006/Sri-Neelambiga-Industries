import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Search, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import api from '../../../api';
import { compressImage } from '../../../utils/imageCompressor';
import { getOptimizedImageUrl } from '../../../utils/imageOptimizer';
import { useToastStore } from '../../../store/useToastStore';
import { useConfirmStore } from '../../../store/useConfirmStore';
import { broadcastSyncEvent } from '../../../utils/sync';
import PremiumUploadField from '../../../components/PremiumUploadField';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const showToast = useToastStore((state) => state.showToast);
  const confirm = useConfirmStore((state) => state.confirm);
  const closeConfirm = useConfirmStore((state) => state.close);
  const setConfirmLoading = useConfirmStore((state) => state.setLoading);

  const [formData, setFormData] = useState({
    name: '', description: '', material: '', finish: '', dimensions: ''
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load products', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openModal = (product = null) => {
    setUploadProgress(0);
    if (product) {
      setEditingId(product._id);
      setFormData({
        name: product.name,
        description: product.description,
        material: product.material,
        finish: product.finish,
        dimensions: product.dimensions || ''
      });
      setExistingImages(product.images || []);
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', material: '', finish: '', dimensions: '' });
      setExistingImages([]);
    }
    setNewImages([]);
    setSuccess(false);
    setIsModalOpen(true);
  };

  const handleRemoveExistingImage = (public_id) => {
    setExistingImages(prev => prev.filter(img => img.public_id !== public_id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(1); // Start indicator
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      if (editingId) {
        data.append('existingImages', JSON.stringify(existingImages));
      }
      
      // Parallel image compression before sending
      if (newImages.length > 0) {
        const compressed = await Promise.all(
          Array.from(newImages).map(file => compressImage(file, { quality: 0.8 }))
        );
        compressed.forEach(file => data.append('images', file));
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, data, config);
        showToast('Product updated successfully', 'success');
      } else {
        await api.post('/products', data, config);
        showToast('Product added successfully', 'success');
      }
      
      broadcastSyncEvent('products_updated');
      await fetchProducts();
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error saving product', 'error');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete Product',
      description: 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await api.delete(`/products/${id}`);
          showToast('Product deleted successfully', 'success');
          broadcastSyncEvent('products_updated');
          await fetchProducts();
          closeConfirm();
        } catch (err) {
          console.error(err);
          showToast('Error deleting product', 'error');
        } finally {
          setConfirmLoading(false);
        }
      }
    });
  };

  // Filter products by search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.finish.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Manage Products</h2>
          <p className="text-xs text-text-muted mt-0.5">Add, edit, or remove catalog items</p>
        </div>
          <button
            onClick={() => openModal()}
            className="btn-pill-primary shadow-xs mt-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="search-pill"
          />
        </div>
        <div className="text-xxs font-bold text-text-muted uppercase tracking-wider">
          Total: {filteredProducts.length} items
        </div>
      </div>

      {currentProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card rounded-2xl border border-border-main/60 text-center">
          <FileSpreadsheet className="w-10 h-10 text-stone-300 mb-3" />
          <h3 className="text-sm font-semibold text-text-main mb-1">No products found</h3>
          <p className="text-xs text-text-muted max-w-xs mb-4">Get started by creating your first product listing in the catalog.</p>
          <button
            onClick={() => openModal()}
            className="bg-secondary hover:bg-brand-accent hover:text-white border border-border-main hover:border-brand-accent text-text-main text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Create Product
          </button>
        </div>
      ) : (
        <div className="table-container-premium">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/50 border-b border-border-main/60 text-text-muted text-xxs font-bold uppercase tracking-wider">
                  <th className="p-4 w-20">Image</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Material</th>
                  <th className="p-4">Finish</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50 text-text-main text-xs">
                {currentProducts.map(product => (
                  <tr key={product._id} className="hover:bg-primary/30 transition-colors">
                    <td className="p-4">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={getOptimizedImageUrl(product.images[0].secure_url, 150)}
                          alt={product.name}
                          loading="lazy"
                          className="w-12 h-12 object-cover rounded-xl border border-border-main/50"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-text-muted text-[10px]">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold">{product.name}</td>
                    <td className="p-4 text-text-muted">{product.material}</td>
                    <td className="p-4 text-text-muted">{product.finish}</td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openModal(product)}
                        className="btn-action-round text-brand-accent hover:bg-brand-accent/10"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="btn-action-round text-error hover:bg-red-50"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="modal-premium max-w-xl my-8">
            <div className="flex justify-between items-center p-6 border-b border-border-main/60 bg-primary/20">
              <div>
                <h3 className="text-base font-bold text-text-main">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Fill in details to save to your catalog</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Product Name *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input-pill"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Material *</label>
                  <input
                    required
                    placeholder="e.g. SS 304, SS 316"
                    value={formData.material}
                    onChange={e => setFormData({ ...formData, material: e.target.value })}
                    className="input-pill"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Finish *</label>
                  <input
                    required
                    placeholder="e.g. Matte, Mirror Polish"
                    value={formData.finish}
                    onChange={e => setFormData({ ...formData, finish: e.target.value })}
                    className="input-pill"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Dimensions (Optional)</label>
                  <input
                    placeholder="e.g. 1000 x 500 mm"
                    value={formData.dimensions}
                    onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                    className="input-pill"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="textarea-pill"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <PremiumUploadField
                    label="Upload Images"
                    multiple
                    newFiles={newImages}
                    existingFiles={existingImages}
                    onFilesSelected={(files) => setNewImages(prev => [...prev, ...files])}
                    onRemoveNewFile={(index) => setNewImages(prev => prev.filter((_, idx) => idx !== index))}
                    onRemoveExistingFile={handleRemoveExistingImage}
                    uploadProgress={uploadProgress}
                    loading={loading}
                    success={success}
                  />
                </div>
              </div>

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
                      Saving ({uploadProgress}%)
                    </>
                  ) : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;