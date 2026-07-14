import { useState, useEffect } from 'react';
import { Package, Image as ImageIcon, Briefcase, MessageSquare } from 'lucide-react';
import api from '../../../api';

const DashboardHome = () => {
  const [counts, setCounts] = useState({ products: 0, gallery: 0, projects: 0, inquiries: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [p, g, pr, i] = await Promise.all([
          api.get('/products'), api.get('/gallery'), api.get('/projects'), api.get('/inquiries')
        ]);
        setCounts({
          products: p.data.length,
          gallery: g.data.length,
          projects: pr.data.length,
          inquiries: i.data.filter(inq => inq.status === 'new').length
        });
      } catch(err) { console.error(err); }
    };
    fetchCounts();
  }, []);

  const stats = [
    { title: 'Total Products', value: counts.products, icon: Package, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
    { title: 'Gallery Images', value: counts.gallery, icon: ImageIcon, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Completed Projects', value: counts.projects, icon: Briefcase, color: 'text-warning', bg: 'bg-warning/10' },
    { title: 'New Inquiries', value: counts.inquiries, icon: MessageSquare, color: 'text-error', bg: 'bg-error/10' }
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-text-main mb-8">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card-premium p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted font-medium mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-text-main">{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-4 rounded-full`}>
                <Icon className="w-8 h-8" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-12 p-8 bg-brand-accent/10 border border-brand-accent/30 rounded-2xl text-center shadow-xs">
        <h3 className="text-xl font-bold text-brand-accent mb-2">Welcome to the Sri Neelambiga Admin Panel</h3>
        <p className="text-brand-accent/80">Manage your products, projects, and customer inquiries from the sidebar menu.</p>
      </div>
    </div>
  );
};
export default DashboardHome;
