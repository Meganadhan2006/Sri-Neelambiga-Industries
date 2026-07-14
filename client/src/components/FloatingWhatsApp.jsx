import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import api from '../api';

const FloatingWhatsApp = () => {
  const [whatsapp, setWhatsapp] = useState('919842499998');
  const location = useLocation();

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data && res.data.whatsapp) {
        // Strip non-numeric characters for wa.me link
        const cleanNumber = res.data.whatsapp.replace(/\D/g, '');
        if (cleanNumber) {
          setWhatsapp(cleanNumber);
        }
      }
    }).catch(console.error);
  }, [location.pathname]);

  const defaultMsg = encodeURIComponent('Hello Sri Neelambiga Industries, I would like to know more about your fabrication services.');

  return (
    <a
      href={`https://wa.me/${whatsapp}?text=${defaultMsg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-text-main p-4 rounded-full shadow-md transition-transform hover:opacity-90 z-50 flex items-center justify-center animate-bounce"
    >
      <MessageCircle className="h-8 w-8" />
    </a>
  );
};

export default FloatingWhatsApp;
