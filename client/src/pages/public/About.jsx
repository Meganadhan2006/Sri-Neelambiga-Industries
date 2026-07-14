import { useState, useCallback } from 'react';
import { Target, Lightbulb, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useSyncRefetch } from '../../utils/sync';

const About = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Sri Neelambiga Industries',
    tagline: 'Premium Stainless Steel Fabrication',
    aboutText: 'Sri Neelambiga Industries is a leading provider of premium stainless steel fabrication and engineering solutions. With years of experience and a commitment to quality, we deliver exceptional products tailored to meet the specific needs of our clients across industrial, commercial, and residential sectors.'
  });

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setCompanyInfo({
          name: res.data.companyName || 'Sri Neelambiga Industries',
          tagline: res.data.tagline || 'Premium Stainless Steel Fabrication',
          aboutText: res.data.aboutText || 'Sri Neelambiga Industries is a leading provider of premium stainless steel fabrication and engineering solutions. With years of experience and a commitment to quality, we deliver exceptional products tailored to meet the specific needs of our clients across industrial, commercial, and residential sectors.'
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useSyncRefetch(fetchSettings, 'settings_updated');

  return (
    <div className="min-h-screen bg-primary">
      <section className="py-12 bg-card border-b border-border-main/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold text-text-main mb-3 tracking-tight">About {companyInfo.name}</h1>
            <div className="w-16 h-1 bg-brand-accent mx-auto rounded-full mb-4"></div>
            <p className="text-sm md:text-base text-text-muted leading-relaxed font-light">{companyInfo.tagline}</p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="relative max-w-md mx-auto lg:max-w-none">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-border-main/60 z-10 relative">
                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Factory" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-brand-accent/10 transform translate-x-3 translate-y-3 rounded-2xl z-0"></div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-text-main">Our Story</h2>
              <div className="text-text-muted text-xs md:text-sm space-y-4 leading-relaxed">
                <p>{companyInfo.aboutText}</p>
                <p>Our state-of-the-art manufacturing facility in Perambalur is equipped with the latest technology, enabling us to handle projects of any scale with unparalleled precision.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-card border-t border-b border-border-main/55">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-main mb-3">Our Core Values</h2>
            <div className="w-16 h-1 bg-brand-accent mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="p-4 flex flex-col items-center">
              <div className="w-12 h-12 bg-brand-accent/15 rounded-full flex items-center justify-center mb-4 shrink-0">
                <Target className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Precision</h3>
              <p className="text-text-muted text-xs leading-relaxed max-w-[250px]">Exact measurements and flawless execution in every weld and cut.</p>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div className="w-12 h-12 bg-brand-accent/15 rounded-full flex items-center justify-center mb-4 shrink-0">
                <Lightbulb className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Innovation</h3>
              <p className="text-text-muted text-xs leading-relaxed max-w-[250px]">Continuously adopting modern techniques to improve structural integrity.</p>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div className="w-12 h-12 bg-brand-accent/15 rounded-full flex items-center justify-center mb-4 shrink-0">
                <Users className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Client Focus</h3>
              <p className="text-text-muted text-xs leading-relaxed max-w-[250px]">Your requirements dictate our design process from start to finish.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12 md:py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-main mb-3">Work With Us</h2>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">Discover how our engineering expertise can bring your vision to life.</p>
          <Link to="/contact" className="btn-pill-primary shadow-md inline-flex items-center justify-center gap-1.5">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
