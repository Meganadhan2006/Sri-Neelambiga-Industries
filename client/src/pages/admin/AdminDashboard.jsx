import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Image as ImageIcon, 
  MessageSquare, 
  Settings, 
  LogOut,
  FolderOpen,
  Briefcase,
  Menu,
  X,
  Star
} from 'lucide-react';
import logo from '../../sni.jpeg';

const DashboardHome = lazy(() => import('./views/DashboardHome'));
const ManageProducts = lazy(() => import('./views/ManageProducts'));
const ManageProjects = lazy(() => import('./views/ManageProjects'));
const ManageGallery = lazy(() => import('./views/ManageGallery'));
const ManageServices = lazy(() => import('./views/ManageServices'));
const ManageInquiries = lazy(() => import('./views/ManageInquiries'));
const ManageReviews = lazy(() => import('./views/ManageReviews'));
const AdminSettings = lazy(() => import('./views/AdminSettings'));

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Basic auth check placeholder
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Products', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
    { name: 'Projects', path: '/admin/projects', icon: <FolderOpen className="w-5 h-5" /> },
    { name: 'Gallery', path: '/admin/gallery', icon: <ImageIcon className="w-5 h-5" /> },
    { name: 'Services', path: '/admin/services', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Inquiries', path: '/admin/inquiries', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <Star className="w-5 h-5" /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-primary relative">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-card border-b border-border-main z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Sri Neelambiga Logo"
            className="h-8 w-auto object-contain rounded-full shadow-sm"
          />
          <span className="font-bold text-text-main tracking-tight text-sm">Sri Neelambiga Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-text-muted hover:bg-secondary rounded-full cursor-pointer">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden animate-fade-in" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-card border-r border-border-main flex flex-col z-50 transition-all duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-16 flex items-center px-4 border-b border-border-main justify-between overflow-hidden">
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="Sri Neelambiga Logo"
              className="h-9 w-9 object-contain rounded-full shadow-sm shrink-0"
            />
            {!isCollapsed && (
              <span className="font-extrabold text-sm text-text-main tracking-tight whitespace-nowrap">
                Sri Neelambiga Admin
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden lg:block p-1.5 text-text-muted hover:bg-secondary rounded-lg transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>
          <button className="lg:hidden p-1.5 text-text-muted hover:bg-secondary rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname === '/admin' && item.path === '/admin/dashboard');
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                      isActive 
                        ? 'bg-brand-accent text-btn-text shadow-md' 
                        : 'text-text-muted hover:bg-secondary hover:text-text-main'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    {item.icon}
                    {!isCollapsed && <span className="font-medium text-xs">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="p-4 border-t border-border-main">
          <button 
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
            className={`flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium text-xs">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 w-full bg-primary min-h-screen pt-20 lg:pt-8 pb-12 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="px-4 sm:px-6 lg:px-8 h-full max-w-7xl mx-auto overflow-hidden">
          {/* Content Routing */}
          <div className="bg-card rounded-2xl border border-border-main min-h-[calc(100vh-8rem)] w-full">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[40vh] w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/products" element={<ManageProducts />} />
                <Route path="/projects" element={<ManageProjects />} />
                <Route path="/gallery" element={<ManageGallery />} />
                <Route path="/services" element={<ManageServices />} />
                <Route path="/inquiries" element={<ManageInquiries />} />
                <Route path="/reviews" element={<ManageReviews />} />
                <Route path="/settings" element={<AdminSettings />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
