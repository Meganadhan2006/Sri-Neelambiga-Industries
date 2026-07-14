import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../sni.jpeg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-card/95 backdrop-blur-md shadow-sm border-b border-border-main/50 py-2.5'
          : 'bg-primary/95 backdrop-blur-md border-b border-border-main/60 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src={logo}
                alt="Sri Neelambiga Industries Logo"
                className="h-8 md:h-10 lg:h-12 w-auto object-contain rounded-lg shadow-sm"
              />
              <span className="text-sm md:text-base font-extrabold text-text-main tracking-tight group-hover:text-brand-accent transition-colors duration-300">
                Sri Neelambiga Industries
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-1.5 text-xs font-semibold transition-all rounded-xl ${
                  location.pathname === link.path
                    ? 'text-brand-accent bg-brand-accent/10'
                    : 'text-text-muted hover:text-brand-accent-hover hover:bg-secondary/60'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <Link to="/contact" className="ml-3 btn-pill-primary shadow-xs">
              Request Quote
            </Link>
          </div>
          
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-text-muted hover:text-text-main hover:bg-secondary focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-t border-border-main shadow-lg absolute w-full left-0 z-50 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 text-sm font-semibold rounded-full ${
                  location.pathname === link.path
                    ? 'text-brand-accent bg-brand-accent/10'
                    : 'text-text-main hover:text-brand-accent-hover hover:bg-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 px-4 pb-1">
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="flex w-full justify-center items-center btn-pill-primary shadow-xs"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
