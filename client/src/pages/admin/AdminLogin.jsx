import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import api from '../../api';
import logo from '../../sni.jpeg';

const AdminLogin = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const navigate = useNavigate();

 const handleLogin = async (e) => {
 e.preventDefault();
 setError('');
 setLoading(true);
 try {
  const res = await api.post('/auth/login', { email, password });
  // Store the full user info including the JWT token
  localStorage.setItem('userInfo', JSON.stringify(res.data));
  navigate('/admin/dashboard');
 } catch (err) {
  setError(err.response?.data?.message || 'Invalid email or password');
 } finally {
  setLoading(false);
 }
 };

 return (
 <div className="min-h-screen bg-primary flex items-center justify-center px-4">
 <div className="card-premium p-8 w-full w-[95%] max-w-md">
 <div className="text-center mb-8">
   <div className="flex justify-center mb-4">
     <img
       src={logo}
       alt="Sri Neelambiga Industries Logo"
       className="h-16 w-auto object-contain rounded-full shadow-md"
     />
   </div>
   <h2 className="text-2xl font-bold text-text-main tracking-tight mb-1">
     Sri Neelambiga Admin
   </h2>
   <p className="text-xs text-text-muted">Secure Access Portal</p>
 </div>

 {error && (
 <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-full mb-6 text-sm text-center">
 {error}
 </div>
 )}

 <form onSubmit={handleLogin} className="space-y-6">
 <div>
 <label className="block text-sm font-medium text-text-muted mb-2">Email Address</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
 <User className="h-5 w-5 text-text-muted" />
 </div>
 <input 
 type="email" 
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="input-pill !pl-10"
 placeholder="admin@srineelambiga.com"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
 <Lock className="h-5 w-5 text-text-muted" />
 </div>
 <input 
 type="password" 
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="input-pill !pl-10"
 placeholder="••••••••"
 />
 </div>
 </div>

 <button 
 type="submit" 
 disabled={loading}
 className="w-full btn-pill-primary shadow-xs"
 >
 {loading ? 'Logging in...' : 'Login to Dashboard'}
 </button>
 </form>
 </div>
 </div>
 );
};

export default AdminLogin;
