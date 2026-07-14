import { useState, useCallback } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api';
import { useSyncRefetch } from '../../utils/sync';
import PremiumUploadField from '../../components/PremiumUploadField';

const Contact = () => {
  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Sri+Neelambiga+Industries+Thuraiyur+Main+Road+Near+Aranarai+Road+Perambalur+Tamil+Nadu+621212';
  const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=Sri+Neelambiga+Industries+Thuraiyur+Main+Road+Near+Aranarai+Road+Perambalur+Tamil+Nadu+621212';

  const [searchParams] = useSearchParams();
  const preselectedProduct = searchParams.get('product') || '';
  const preselectedService = searchParams.get('service') || '';

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', productRequired: preselectedProduct || preselectedService, message: ''
  });
  const [drawing, setDrawing] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({ email: '', phone: '', address: '', whatsapp: '' });

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setCompanyInfo({ 
          email: res.data.email || '', 
          phone: res.data.phone || '', 
          address: res.data.address || '', 
          whatsapp: res.data.whatsapp || '' 
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useSyncRefetch(fetchSettings, 'settings_updated');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (drawing) data.append('drawing', drawing);

      await api.post('/inquiries', data);
      setStatus({ type: 'success', message: 'Thank you for your inquiry. Our team will contact you shortly.' });
      setFormData({ name: '', email: '', phone: '', productRequired: '', message: '' });
      setDrawing(null);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-main mb-3 tracking-tight">Contact Us</h1>
          <div className="w-16 h-1 bg-brand-accent mx-auto rounded-full mb-4"></div>
          <p className="text-base text-text-muted max-w-xl mx-auto leading-relaxed">
            Get in touch with our engineering team for inquiries, quotes, or custom fabrication requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border-main/60">
              <h3 className="text-xl font-bold text-text-main mb-6">Contact Information</h3>
              <div className="space-y-5">
                <a 
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group/address cursor-pointer"
                >
                  <div className="bg-brand-accent/15 p-2.5 rounded-xl shrink-0 group-hover/address:bg-brand-accent/25 transition-colors">
                    <MapPin className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-text-main group-hover/address:text-brand-accent transition-colors">Our Location</h4>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed whitespace-pre-line group-hover/address:text-text-main transition-colors">
                      <strong>Sri Neelambiga Industries</strong><br />
                      {companyInfo.address || `Thuraiyur Main Road,\nNear Aranarai Road,\nPerambalur, Tamil Nadu - 621212`}
                    </p>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="bg-brand-accent/15 p-2.5 rounded-xl shrink-0">
                    <Phone className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-text-main">Phone Numbers</h4>
                    <div className="flex flex-col gap-1 mt-1">
                      {(companyInfo.phone || '+91 98420 99998 / +91 98424 99998 / +91 96260 99998')
                        .split(/[/,]|\s+(?=\+)/)
                        .map(p => p.trim())
                        .filter(Boolean)
                        .map(phone => (
                          <a key={phone} href={`tel:${phone.replace(/\s+/g, '')}`} className="text-xs text-text-muted hover:text-brand-accent transition-colors">
                            {phone}
                          </a>
                        ))
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-brand-accent/15 p-2.5 rounded-xl shrink-0">
                    <Mail className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-text-main">Email Address</h4>
                    <a href={`mailto:${companyInfo.email || 'srineelambiga@gmail.com'}`} className="text-xs text-text-muted mt-1 hover:text-brand-accent transition-colors">
                      {companyInfo.email || 'srineelambiga@gmail.com'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-500/15 p-2.5 rounded-xl shrink-0">
                    <Phone className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-text-main">WhatsApp</h4>
                    <a href={`https://wa.me/${(companyInfo.whatsapp || '+91 98424 99998').replace(/[^0-9]/g, '')}?text=Hello%20Sri%20Neelambiga%20Industries%2C%20I%20would%20like%20to%20know%20more%20about%20your%20fabrication%20services.`} target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted mt-1 hover:text-green-500 transition-colors">
                      {companyInfo.whatsapp || '+91 98424 99998'}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border-main/60">
              <h3 className="text-xl font-bold text-text-main mb-4">Business Hours</h3>
              <ul className="space-y-2.5 text-xs text-text-muted">
                <li className="flex justify-between border-b border-border-main/40 pb-2">
                  <span>Monday - Saturday:</span>
                  <span className="font-semibold text-text-main">9:00 AM - 7:00 PM</span>
                </li>
                <li className="flex justify-between pt-1">
                  <span>Sunday:</span>
                  <span className="font-semibold text-text-main">Closed</span>
                </li>
              </ul>
            </div>

             {/* Google Maps */}
             <div className="bg-card rounded-2xl shadow-sm border border-border-main/60 overflow-hidden relative group/map">
               <iframe
                 title="Sri Neelambiga Industries Location"
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.732997230492!2d78.86873527480574!3d11.233519888918236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baad7b82756d10f%3A0x6d90e0c06a4b1e5!2sSri%20Neelambiga%20Industries!5e0!3m2!1sen!2sin!4v1720945000000!5m2!1sen!2sin"
                 width="100%"
                 height="230"
                 style={{ border: 0 }}
                 allowFullScreen=""
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
                 className="w-full"
               ></iframe>
               <a 
                 href={googleMapsUrl} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="absolute inset-0 bg-transparent flex items-center justify-center cursor-pointer"
                 title="Open in Google Maps"
               >
                 <div className="bg-btn-bg/85 backdrop-blur-xs text-btn-text text-xxs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-md opacity-0 group-hover/map:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
                   View on Google Maps
                 </div>
               </a>
             </div>

             <div className="mt-4 flex flex-col sm:flex-row gap-3">
               <a
                 href={googleMapsUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="sm:flex-1 w-full btn-pill-secondary shadow-xs text-center justify-center items-center"
               >
                 View on Map
               </a>
               <a
                 href={directionsUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="sm:flex-1 w-full btn-pill-primary !bg-brand-accent hover:!bg-brand-accent-hover shadow-xs text-center justify-center items-center"
               >
                 Get Directions
               </a>
             </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7 bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border-main/60">
            <h3 className="text-xl font-bold text-text-main mb-6">Send an Inquiry</h3>
            {status.message && (
              <div
                className={`p-4 rounded-xl mb-6 text-sm border ${
                  status.type === 'success'
                    ? 'bg-green-500/10 text-green-700 border-green-500/20'
                    : 'bg-red-500/10 text-red-700 border-red-500/20'
                }`}
              >
                {status.message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2">Your Name *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-pill"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2">Phone Number *</label>
                  <input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-pill"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-pill"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2">Product/Service Required</label>
                  <input
                    value={formData.productRequired}
                    onChange={(e) => setFormData({ ...formData, productRequired: e.target.value })}
                    className="input-pill"
                  />
                </div>
              </div>

              <PremiumUploadField
                label="Upload Drawing / Reference (Optional)"
                newFiles={drawing}
                onFilesSelected={(files) => setDrawing(files[0])}
                onRemoveNewFile={() => setDrawing(null)}
                loading={loading}
              />

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2">Message / Requirements *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="textarea-pill"
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full btn-pill-primary shadow-xs inline-flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Inquiry</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;