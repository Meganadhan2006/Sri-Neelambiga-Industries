import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import api from '../api';
import logo from '../sni.jpeg';

const Footer = () => {
  const [settings, setSettings] = useState({
    companyName: 'Sri Neelambiga Industries',
    email: 'srineelambiga@gmail.com',
    phone: '+91 98420 99998 / +91 98424 99998 / +91 96260 99998',
    address: 'Thuraiyur Main Road, Near Aranarai Road, Perambalur, Tamil Nadu - 621212',
    whatsapp: '+91 98424 99998'
  });
  const [services, setServices] = useState([]);
  const location = useLocation();

  useEffect(() => {
    api.get('/settings').then(res => { if(res.data) setSettings(prev => ({ ...prev, ...res.data })); }).catch(console.error);
    api.get('/services').then(res => { if(res.data) setServices(res.data); }).catch(console.error);
  }, [location.pathname]);

  return (
    <footer className="bg-card text-text-muted pt-10 pb-6 border-t border-border-main/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src={logo}
                alt="Sri Neelambiga Industries Logo"
                className="h-10 w-auto object-contain rounded-full shadow-sm"
              />
              <span className="text-base font-extrabold text-text-main tracking-tight">
                Sri Neelambiga Industries
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Premium stainless steel fabrication company providing high-quality industrial and commercial solutions.
            </p>
          </div>

          <div>
            <h4 className="text-text-main font-bold mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/about" className="hover:text-brand-accent transition-colors">About Us</Link></li>
              <li><Link to="/products" className="hover:text-brand-accent transition-colors">Products</Link></li>
              <li><Link to="/projects" className="hover:text-brand-accent transition-colors">Projects</Link></li>
              <li><Link to="/gallery" className="hover:text-brand-accent transition-colors">Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-text-main font-bold mb-3 text-sm">Services</h4>
            <ul className="space-y-1.5 text-xs">
              {services.slice(0, 4).map(service => (
                <li key={service._id}>
                  <Link to="/services" className="hover:text-brand-accent transition-colors">
                    {service.title}
                  </Link>
                </li>
              ))}
              {services.length === 0 && (
                <li><Link to="/services" className="hover:text-brand-accent transition-colors">Our Services</Link></li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-text-main font-bold mb-3 text-sm">Contact Us</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-brand-accent flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{settings.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="h-4.5 w-4.5 text-brand-accent flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  {settings.phone
                    .split(/[/,]|\s+(?=\+)/)
                    .map(p => p.trim())
                    .filter(Boolean)
                    .map(phone => (
                      <a key={phone} href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-brand-accent transition-colors">
                        {phone}
                      </a>
                    ))
                  }
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4.5 w-4.5 text-brand-accent flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-brand-accent transition-colors">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="h-4.5 w-4.5 text-brand-accent flex-shrink-0" />
                <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors">
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-border-main/50 mt-8 pt-5 text-center text-xs text-text-muted flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>&copy; {new Date().getFullYear()} {settings.companyName}. All rights reserved.</p>
          <p className="font-semibold text-text-main">Premium Fabrication Quality</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;