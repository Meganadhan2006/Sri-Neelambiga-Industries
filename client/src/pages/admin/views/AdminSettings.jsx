import { useState, useEffect } from 'react';
import api from '../../../api';
import { compressImage } from '../../../utils/imageCompressor';
import { useToastStore } from '../../../store/useToastStore';
import { broadcastSyncEvent } from '../../../utils/sync';
import PremiumUploadField from '../../../components/PremiumUploadField';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [settings, setSettings] = useState({
    companyName: '', tagline: '', aboutText: '', email: '', phone: '', address: '', whatsapp: '',
    heroTitle: '', heroSubtitle: '', yearsExperience: '', completedProjects: '', happyClients: ''
  });
  const [heroBanner, setHeroBanner] = useState(null);
  const [existingHeroBanner, setExistingHeroBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data) {
          setSettings(res.data);
          setExistingHeroBanner(res.data.heroBanner);
        }
      } catch(err) {
        console.error(err);
        showToast('Failed to load settings', 'error');
      }
    };
    fetchSettings();
  }, [showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(1);
    try {
      const data = new FormData();
      Object.keys(settings).forEach(key => {
        if (settings[key] !== null && settings[key] !== undefined) {
          // Skip internal mongoose fields
          if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v' && key !== 'heroBanner') {
            data.append(key, settings[key]);
          }
        }
      });
      
      if (heroBanner) {
        const compressedFile = await compressImage(heroBanner, { quality: 0.8 });
        data.append('heroBanner', compressedFile);
      }
      
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      };

      const res = await api.put('/settings', data, config);
      setSettings(res.data);
      setExistingHeroBanner(res.data.heroBanner);
      setHeroBanner(null);
      showToast('Settings updated successfully', 'success');
      broadcastSyncEvent('settings_updated');
    } catch(err) {
      console.error(err);
      showToast('Failed to update settings', 'error');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showToast('Password changed successfully', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-main">Settings</h2>
        <p className="text-xs text-text-muted mt-0.5">Configure company profile details and home banner settings</p>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 mb-6 select-none custom-scrollbar">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-full font-semibold text-xs transition-all border cursor-pointer ${
            activeTab === 'company'
              ? 'bg-card text-brand-accent shadow-sm border-border-main/60'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Company Profile
        </button>
        <button
          onClick={() => setActiveTab('homepage')}
          className={`px-4 py-2 rounded-full font-semibold text-xs transition-all border cursor-pointer ${
            activeTab === 'homepage'
              ? 'bg-card text-brand-accent shadow-sm border-border-main/60'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Homepage Content
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-full font-semibold text-xs transition-all border cursor-pointer ${
            activeTab === 'security'
              ? 'bg-card text-brand-accent shadow-sm border-border-main/60'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Security & Password
        </button>
      </div>

      <div className="bg-card p-6 md:p-8 rounded-2xl border border-border-main/60 shadow-sm">
        {activeTab !== 'security' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'company' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-wider border-b border-border-main/40 pb-2">Company Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Company Name</label>
                    <input
                      value={settings.companyName || ''}
                      onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                      className="input-pill"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Tagline</label>
                    <input
                      value={settings.tagline || ''}
                      onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                      className="input-pill"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={settings.email || ''}
                      onChange={e => setSettings({ ...settings, email: e.target.value })}
                      className="input-pill"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Phone Number</label>
                    <input
                      value={settings.phone || ''}
                      onChange={e => setSettings({ ...settings, phone: e.target.value })}
                      className="input-pill"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">WhatsApp Number</label>
                    <input
                      value={settings.whatsapp || ''}
                      onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="input-pill"
                      placeholder="e.g. +91 98424 99998"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Address</label>
                    <input
                      value={settings.address || ''}
                      onChange={e => setSettings({ ...settings, address: e.target.value })}
                      className="input-pill"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">About Text</label>
                    <textarea
                      rows={4}
                      value={settings.aboutText || ''}
                      onChange={e => setSettings({ ...settings, aboutText: e.target.value })}
                      className="textarea-pill"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'homepage' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-wider border-b border-border-main/40 pb-2">Hero Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Hero Title</label>
                    <input
                      value={settings.heroTitle || ''}
                      onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
                      className="input-pill"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Hero Subtitle</label>
                    <textarea
                      rows={3}
                      value={settings.heroSubtitle || ''}
                      onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
                      className="textarea-pill"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <PremiumUploadField
                      label="Hero Banner Image"
                      newFiles={heroBanner}
                      existingFiles={existingHeroBanner ? [existingHeroBanner] : []}
                      onFilesSelected={(files) => setHeroBanner(files[0])}
                      onRemoveNewFile={() => setHeroBanner(null)}
                      onRemoveExistingFile={() => setExistingHeroBanner(null)}
                      uploadProgress={uploadProgress}
                      loading={loading}
                      success={success}
                    />
                  </div>
                </div>
                
                <h3 className="text-sm font-bold text-text-main uppercase tracking-wider border-b border-border-main/40 pb-2 pt-4">Statistics Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Years Experience</label>
                    <input
                      value={settings.yearsExperience || ''}
                      onChange={e => setSettings({ ...settings, yearsExperience: e.target.value })}
                      className="input-pill"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Completed Projects</label>
                    <input
                      value={settings.completedProjects || ''}
                      onChange={e => setSettings({ ...settings, completedProjects: e.target.value })}
                      className="input-pill"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Happy Clients</label>
                    <input
                      value={settings.happyClients || ''}
                      onChange={e => setSettings({ ...settings, happyClients: e.target.value })}
                      className="input-pill"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {loading && uploadProgress > 0 && (
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden mt-4">
                <div
                  className="bg-brand-accent h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <div className="pt-4 border-t border-border-main/40">
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
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider border-b border-border-main/40 pb-2">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                <div className="md:col-span-2">
                  <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-pill"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">New Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-pill"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xxs font-bold text-text-muted uppercase mb-1.5">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-pill"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-main/40">
              <button
                disabled={passwordLoading}
                type="submit"
                className="btn-pill-primary shadow-xs"
              >
                {passwordLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Changing Password...
                  </>
                ) : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
