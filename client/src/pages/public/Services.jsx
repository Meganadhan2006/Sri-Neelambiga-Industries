import { useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { useSyncRefetch } from '../../utils/sync';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useSyncRefetch(fetchServices, 'services_updated');

  return (
    <div className="min-h-screen bg-primary">
      <section className="py-12 bg-card border-b border-border-main/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-main mb-3">Our Services</h1>
          <div className="w-16 h-1 bg-brand-accent mx-auto rounded-full mb-4"></div>
          <p className="text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
            We provide comprehensive stainless steel fabrication and engineering solutions tailored to industrial, commercial, and residential requirements.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-accent"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border-main p-8">
              <p className="text-text-muted">No services featured yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
              {services.map((service, idx) => (
                <div
                  key={service._id}
                  className="card-premium card-premium-hover flex flex-col overflow-hidden"
                >
                  <div className="h-56 md:h-64 overflow-hidden bg-secondary relative">
                    {service.image?.secure_url ? (
                      <img
                        src={getOptimizedImageUrl(service.image.secure_url, 800)}
                        alt={service.title}
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-102 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
                        No Image Available
                      </div>
                    )}
                  </div>
                  <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl font-black text-brand-accent/25 tracking-tight">
                          0{idx + 1}
                        </span>
                        <h2 className="text-xl font-bold text-text-main tracking-tight">
                          {service.title}
                        </h2>
                      </div>
                      <p className="text-text-muted text-xs leading-relaxed mb-6">
                        {service.description}
                      </p>
                      <ul className="space-y-2 mb-6">
                        {['Custom engineering and design', 'Premium grade stainless steel', 'Professional installation'].map((feature, i) => (
                          <li key={i} className="flex items-center text-xs text-text-main font-medium">
                            <ArrowRight className="w-3.5 h-3.5 text-brand-accent mr-2 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      to={`/contact?service=${encodeURIComponent(service.title)}`}
                      className="inline-flex items-center text-xs text-brand-accent hover:text-brand-accent-hover font-bold transition-all duration-300 group/btn mt-auto"
                    >
                      Inquire about this service
                      <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-card border-t border-border-main/55 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-main mb-3">Need a Custom Solution?</h2>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            Our engineering team can design and manufacture bespoke stainless steel products to meet your exact specifications.
          </p>
          <Link
            to="/contact"
            className="btn-pill-primary shadow-md inline-flex items-center justify-center"
          >
            Contact Our Engineers
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Services;