import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary px-6 text-center select-none">
      <div className="card-premium p-12 max-w-md mx-auto flex flex-col items-center shadow-lg border border-border-main/80">
        <span className="text-7xl font-extrabold text-brand-accent tracking-widest animate-bounce">404</span>
        <h1 className="text-xl font-bold text-text-main mt-6 mb-2">Page Not Found</h1>
        <p className="text-xs text-text-muted mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/" className="btn-pill-primary shadow-xs">
          <Home className="w-4 h-4" />
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
