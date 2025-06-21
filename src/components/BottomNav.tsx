import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Store, List, Search, User } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-t border-emerald-200/50 flex justify-between items-center gap-1 px-2 py-3 max-w-screen-sm mx-auto">
      <button 
        onClick={() => navigate('/')} 
        className={`flex flex-col items-center flex-1 py-2 rounded-xl transition-all duration-300 ${
          isActive('/') 
            ? 'bg-emerald-100 text-emerald-700 shadow-lg' 
            : 'hover:bg-emerald-50 text-emerald-600'
        }`}
      >
        <Home className={`w-6 h-6 mb-1 ${isActive('/') ? 'text-emerald-700' : 'text-emerald-500'}`} />
        <span className="text-xs font-semibold">HOME</span>
      </button>
      
      <button 
        onClick={() => navigate('/shop')} 
        className={`flex flex-col items-center flex-1 py-2 rounded-xl transition-all duration-300 ${
          isActive('/shop') 
            ? 'bg-emerald-100 text-emerald-700 shadow-lg' 
            : 'hover:bg-emerald-50 text-emerald-600'
        }`}
      >
        <Store className={`w-6 h-6 mb-1 ${isActive('/shop') ? 'text-emerald-700' : 'text-emerald-500'}`} />
        <span className="text-xs font-semibold">SHOP</span>
      </button>
      
      <button 
        onClick={() => navigate('/categories')} 
        className={`flex flex-col items-center flex-1 py-2 rounded-xl transition-all duration-300 ${
          isActive('/categories') 
            ? 'bg-emerald-100 text-emerald-700 shadow-lg' 
            : 'hover:bg-emerald-50 text-emerald-600'
        }`}
      >
        <List className={`w-6 h-6 mb-1 ${isActive('/categories') ? 'text-emerald-700' : 'text-emerald-500'}`} />
        <span className="text-xs font-semibold">CATEGORIES</span>
      </button>
      
      <button 
        onClick={() => navigate('/shop')} 
        className={`flex flex-col items-center flex-1 py-2 rounded-xl transition-all duration-300 ${
          isActive('/search') 
            ? 'bg-emerald-100 text-emerald-700 shadow-lg' 
            : 'hover:bg-emerald-50 text-emerald-600'
        }`}
      >
        <Search className={`w-6 h-6 mb-1 ${isActive('/search') ? 'text-emerald-700' : 'text-emerald-500'}`} />
        <span className="text-xs font-semibold">SEARCH</span>
      </button>
      
      <button 
        onClick={() => navigate('/admin/login')} 
        className={`flex flex-col items-center flex-1 py-2 rounded-xl transition-all duration-300 ${
          isActive('/admin') 
            ? 'bg-emerald-100 text-emerald-700 shadow-lg' 
            : 'hover:bg-emerald-50 text-emerald-600'
        }`}
      >
        <User className={`w-6 h-6 mb-1 ${isActive('/admin') ? 'text-emerald-700' : 'text-emerald-500'}`} />
        <span className="text-xs font-semibold">ACCOUNT</span>
      </button>
    </div>
  );
};

export default BottomNav; 