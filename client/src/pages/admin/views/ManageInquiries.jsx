import { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, Trash2, CheckCircle, Search, MessageSquare } from 'lucide-react';
import api from '../../../api';
import { useToastStore } from '../../../store/useToastStore';
import { useConfirmStore } from '../../../store/useConfirmStore';

const ManageInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const showToast = useToastStore((state) => state.showToast);
  const confirm = useConfirmStore((state) => state.confirm);
  const closeConfirm = useConfirmStore((state) => state.close);
  const setConfirmLoading = useConfirmStore((state) => state.setLoading);

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await api.get('/inquiries');
      setInquiries(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load inquiries', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleMarkContacted = async (id) => {
    try {
      await api.put(`/inquiries/${id}`);
      showToast('Enquiry updated successfully', 'success');
      await fetchInquiries();
    } catch (err) {
      console.error(err);
      showToast('Failed to update enquiry status', 'error');
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete Inquiry',
      description: 'Are you sure you want to delete this inquiry? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await api.delete(`/inquiries/${id}`);
          showToast('Inquiry deleted successfully', 'success');
          await fetchInquiries();
          closeConfirm();
        } catch (err) {
          console.error(err);
          showToast('Failed to delete inquiry', 'error');
        } finally {
          setConfirmLoading(false);
        }
      }
    });
  };

  const filteredInquiries = inquiries.filter(inq =>
    inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inq.email && inq.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inq.productRequired && inq.productRequired.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-main">Customer Inquiries</h2>
        <p className="text-xs text-text-muted mt-0.5">Track and manage client design quote requests</p>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-pill"
          />
        </div>
        <div className="text-xxs font-bold text-text-muted uppercase tracking-wider">
          Total: {filteredInquiries.length} inquiries
        </div>
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card rounded-2xl border border-border-main/60 text-center">
          <MessageSquare className="w-10 h-10 text-stone-300 mb-3" />
          <h3 className="text-sm font-semibold text-text-main mb-1">No inquiries found</h3>
          <p className="text-xs text-text-muted max-w-xs">Inquiries submitted on the website contact form will appear here.</p>
        </div>
      ) : (
        <div className="table-container-premium">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/50 border-b border-border-main/60 text-text-muted text-xxs font-bold uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Drawing</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50 text-text-main text-xs">
                {filteredInquiries.map(inquiry => (
                  <tr key={inquiry._id} className="hover:bg-primary/30 transition-colors">
                    <td className="p-4 text-text-muted">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="font-semibold text-text-main">{inquiry.name}</div>
                      <div className="text-xxs text-text-muted flex flex-col gap-1 mt-1 font-medium">
                        {inquiry.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-stone-400" /> {inquiry.email}</span>}
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-stone-400" /> {inquiry.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      {inquiry.productRequired && (
                        <div className="text-[10px] font-bold text-brand-accent uppercase tracking-wider mb-1">
                          {inquiry.productRequired}
                        </div>
                      )}
                      <div className="text-xxs text-text-muted leading-relaxed line-clamp-3">{inquiry.message}</div>
                    </td>
                    <td className="p-4">
                      {inquiry.drawing?.secure_url ? (
                        <a
                          href={inquiry.drawing.secure_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-pill-secondary px-3 py-1 text-[10px] inline-block h-auto shadow-xs whitespace-nowrap"
                        >
                          View File
                        </a>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          inquiry.status === 'contacted'
                            ? 'bg-green-500/10 text-green-700 border-green-500/20'
                            : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                        }`}
                      >
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      {inquiry.status === 'new' && (
                        <button
                          onClick={() => handleMarkContacted(inquiry._id)}
                          title="Mark as Contacted"
                          className="btn-action-round text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4.5 h-4.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inquiry._id)}
                        className="btn-action-round text-error hover:bg-red-50"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInquiries;
