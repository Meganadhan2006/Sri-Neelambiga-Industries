import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Search, Briefcase, Factory, Wrench, Hammer, Settings as SettingsIcon } from 'lucide-react';
import api from '../../../api';
import { compressImage } from '../../../utils/imageCompressor';
import { getOptimizedImageUrl } from '../../../utils/imageOptimizer';
import { useToastStore } from '../../../store/useToastStore';
import { useConfirmStore } from '../../../store/useConfirmStore';
import { broadcastSyncEvent } from '../../../utils/sync';
import PremiumUploadField from '../../../components/PremiumUploadField';

const iconMap = {
  Factory: Factory,
  Wrench: Wrench,
  Hammer: Hammer,
  Briefcase: Briefcase,
  Settings: SettingsIcon
};

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', icon: 'Briefcase' });
  const [newImage, setNewImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const showToast = useToastStore((state) => state.showToast);
  const confirm = useConfirmStore((state) => state.confirm);
  const closeConfirm = useConfirmStore((state) => state.close);
  const setConfirmLoading = useConfirmStore((state) => state.setLoading);

  const fetchServices = useCallback(async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load services', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openModal = (service = null) => {
    setUploadProgress(0);
    if (service) {
      setEditingId(service._id);
      setFormData({
        title: service.title,
        description: service.description,
        icon: service.icon || 'Briefcase'
      });
      setExistingImage(service.image || null);
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', icon: 'Briefcase' });
      setExistingImage(null);
    }
    setNewImage(null);
    setSuccess(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(1);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      if (newImage) {
        const compressedFile = await compressImage(newImage, { quality: 0.8 });
        data.append('image', compressedFile);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      };

      if (editingId) {
        await api.put(`/services/${editingId}`, data, config);
        showToast('Service updated successfully', 'success');
      } else {
        await api.post('/services', data, config);
        showToast('Service added successfully', 'success');
      }
      
      broadcastSyncEvent('services_updated');
      await fetchServices();
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast('Error saving service', 'error');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete Service',
      description: 'Are you sure you want to delete this service? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await api.delete(`/services/${id}`);
          showToast('Service deleted successfully', 'success');
          broadcastSyncEvent('services_updated');
          await fetchServices();
          closeConfirm();
        } catch (err) {
          console.error(err);
          showToast('Error deleting service', 'error');
        } finally {
          setConfirmLoading(false);
        }
      }
    });
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Manage Services</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage services offered on the client website</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-pill-primary shadow-xs"
        >
          <Plus className="w-4.5 h-4.5" /> Add Service
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-pill"
          />
        </div>
        <div className="text-xxs font-bold text-text-muted uppercase tracking-wider">
          Total: {filteredServices.length} services
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card rounded-2xl border border-border-main/60 text-center">
          <Briefcase className="w-10 h-10 text-stone-300 mb-3" />
          <h3 className="text-sm font-semibold text-text-main mb-1">No services found</h3>
          <p className="text-xs text-text-muted max-w-xs mb-4">Post details of custom structural engineering services.</p>
          <button
            onClick={() => openModal()}
            className="btn-pill-secondary shadow-xs mt-2"
          >
            Create Service
          </button>
        </div>
      ) : (
        <div className="table-container-premium">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/50 border-b border-border-main/60 text-text-muted text-xxs font-bold uppercase tracking-wider">
                  <th className="p-4 w-20">Image</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Icon Type</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50 text-text-main text-xs">
                {filteredServices.map(service => {
                  const IconComp = iconMap[service.icon] || Briefcase;
                  return (
                    <tr key={service._id} className="hover:bg-primary/30 transition-colors">
                      <td className="p-4">
                        {service.image?.secure_url ? (
                          <img
                            src={getOptimizedImageUrl(service.image.secure_url, 150)}
                            alt={service.title}
                            loading="lazy"
                            className="w-12 h-12 object-cover rounded-xl border border-border-main/50"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-text-muted text-[10px]">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-semibold">{service.title}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 font-medium text-text-muted">
                          <IconComp className="w-4 h-4 text-brand-accent" />
                          {service.icon || 'Briefcase'}
                        </span>
                      </td>
                      <td className="p-4 text-text-muted max-w-xs truncate">{service.description}</td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openModal(service)}
                          className="btn-action-round text-brand-accent hover:bg-brand-accent/10"
                          title="Edit Service"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="btn-action-round text-error hover:bg-red-50"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="modal-premium max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-border-main/60 bg-primary/20">
              <div>
                <h3 className="text-base font-bold text-text-main">{editingId ? 'Edit Service' : 'Add New Service'}</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Fill in details to save your service info</p>
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
                <div className="sm:col-span-2">
                  <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Service Title *</label>
                  <input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="input-pill"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Service Icon *</label>
                  <select
                    required
                    value={formData.icon}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    className="select-pill"
                  >
                    <option value="Factory">Factory (Industrial)</option>
                    <option value="Wrench">Wrench (Fabrication)</option>
                    <option value="Hammer">Hammer (Specialized)</option>
                    <option value="Briefcase">Briefcase (General)</option>
                    <option value="Settings">Gear/Settings</option>
                  </select>
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
                    label="Upload Service Image"
                    newFiles={newImage}
                    existingFiles={existingImage ? [existingImage] : []}
                    onFilesSelected={(files) => setNewImage(files[0])}
                    onRemoveNewFile={() => setNewImage(null)}
                    onRemoveExistingFile={() => setExistingImage(null)}
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
                  ) : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;
