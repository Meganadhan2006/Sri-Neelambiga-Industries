import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Search, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import api from '../../../api';
import { compressImage } from '../../../utils/imageCompressor';
import { getOptimizedImageUrl } from '../../../utils/imageOptimizer';
import { useToastStore } from '../../../store/useToastStore';
import { useConfirmStore } from '../../../store/useConfirmStore';
import { broadcastSyncEvent } from '../../../utils/sync';
import PremiumUploadField from '../../../components/PremiumUploadField';

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const showToast = useToastStore((state) => state.showToast);
  const confirm = useConfirmStore((state) => state.confirm);
  const closeConfirm = useConfirmStore((state) => state.close);
  const setConfirmLoading = useConfirmStore((state) => state.setLoading);

  const [formData, setFormData] = useState({ title: '', description: '', location: '' });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load projects', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const openModal = (project = null) => {
    setUploadProgress(0);
    if (project) {
      setEditingId(project._id);
      setFormData({
        title: project.title,
        description: project.description,
        location: project.location
      });
      setExistingImages(project.images || []);
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', location: '' });
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
    setUploadProgress(1);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      if (editingId) {
        data.append('existingImages', JSON.stringify(existingImages));
      }
      
      // Parallel image compression
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
        await api.put(`/projects/${editingId}`, data, config);
        showToast('Project updated successfully', 'success');
      } else {
        await api.post('/projects', data, config);
        showToast('Project added successfully', 'success');
      }
      
      broadcastSyncEvent('projects_updated');
      await fetchProjects();
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast('Error saving project', 'error');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete Project',
      description: 'Are you sure you want to delete this project? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await api.delete(`/projects/${id}`);
          showToast('Project deleted successfully', 'success');
          broadcastSyncEvent('projects_updated');
          await fetchProjects();
          closeConfirm();
        } catch (err) {
          console.error(err);
          showToast('Error deleting project', 'error');
        } finally {
          setConfirmLoading(false);
        }
      }
    });
  };

  // Filter projects by search
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Manage Projects</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage completed and featured projects</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-pill-primary shadow-xs"
        >
          <Plus className="w-4.5 h-4.5" /> Add Project
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="search-pill"
          />
        </div>
        <div className="text-xxs font-bold text-text-muted uppercase tracking-wider">
          Total: {filteredProjects.length} items
        </div>
      </div>

      {currentProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card rounded-2xl border border-border-main/60 text-center">
          <Briefcase className="w-10 h-10 text-stone-300 mb-3" />
          <h3 className="text-sm font-semibold text-text-main mb-1">No projects found</h3>
          <p className="text-xs text-text-muted max-w-xs mb-4">Post details of completed project contracts.</p>
          <button
            onClick={() => openModal()}
            className="btn-pill-secondary shadow-xs mt-2"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="table-container-premium">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/50 border-b border-border-main/60 text-text-muted text-xxs font-bold uppercase tracking-wider">
                  <th className="p-4 w-20">Image</th>
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50 text-text-main text-xs">
                {currentProjects.map(project => (
                  <tr key={project._id} className="hover:bg-primary/30 transition-colors">
                    <td className="p-4">
                      {project.images && project.images.length > 0 ? (
                        <img
                          src={getOptimizedImageUrl(project.images[0].secure_url, 150)}
                          alt={project.title}
                          loading="lazy"
                          className="w-12 h-12 object-cover rounded-xl border border-border-main/50"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-text-muted text-[10px]">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold">{project.title}</td>
                    <td className="p-4 text-text-muted">{project.location}</td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openModal(project)}
                        className="btn-action-round text-brand-accent hover:bg-brand-accent/10"
                        title="Edit Project"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="btn-action-round text-error hover:bg-red-50"
                        title="Delete Project"
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
                <h3 className="text-base font-bold text-text-main">{editingId ? 'Edit Project' : 'Add New Project'}</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Fill in details to save your project record</p>
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
                  <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Project Title *</label>
                  <input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="input-pill"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Location *</label>
                  <input
                    required
                    placeholder="e.g. Coimbatore, Tamil Nadu"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
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
                  ) : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProjects;
