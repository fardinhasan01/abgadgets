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
    <div className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-t border-orange-200/60 flex justify-between items-center gap-1 px-2 py-3 max-w-screen-sm mx-auto">
      <button 
        onClick={() => navigate('/')} 
        className={`flex flex-col items-center flex-1 py-2 rounded-xl transition-all duration-300 ${
          isActive('/') 
            ? 'bg-orange-100 text-orange-700 shadow-lg' 
            : 'hover:bg-orange-50 text-orange-600'
        }`}
      >
        <Home className={`w-6 h-6 mb-1 ${isActive('/') ? 'text-orange-700' : 'text-orange-500'}`} />
        <span className="text-xs font-semibold">হোম</span>
      </button>
      
      <button 
        onClick={() => navigate('/shop')} 
        className={`flex flex-col items-center flex-1 py-2 rounded-xl transition-all duration-300 ${
          isActive('/shop') 
            ? 'bg-orange-100 text-orange-700 shadow-lg' 
            : 'hover:bg-orange-50 text-orange-600'
        }`}
      >
        <Store className={`w-6 h-6 mb-1 ${isActive('/shop') ? 'text-orange-700' : 'text-orange-500'}`} />
        <span className="text-xs font-semibold">শপ</span>
      </button>
      
      <button 
        onClick={() => navigate('/categories')} 
        className={`flex flex-col items-center flex-1 py-2 rounded-xl transition-all duration-300 ${
          isActive('/categories') 
            ? 'bg-orange-100 text-orange-700 shadow-lg' 
            : 'hover:bg-orange-50 text-orange-600'
        }`}
      >
        <List className={`w-6 h-6 mb-1 ${isActive('/categories') ? 'text-orange-700' : 'text-orange-500'}`} />
        <span className="text-xs font-semibold">ক্যাটাগরিজ</span>
      </button>
      
      <button 
        onClick={() => navigate('/shop')} 
        className={`flex flex-col items-center flex-1 py-2 rounded-xl transition-all duration-300 ${
          isActive('/search') 
            ? 'bg-orange-100 text-orange-700 shadow-lg' 
            : 'hover:bg-orange-50 text-orange-600'
        }`}
      >
        <Search className={`w-6 h-6 mb-1 ${isActive('/search') ? 'text-orange-700' : 'text-orange-500'}`} />
        <span className="text-xs font-semibold">সার্চ</span>
      </button>
      
      <button 
        onClick={() => navigate('/admin/login')} 
        className={`flex flex-col items-center flex-1 py-2 rounded-xl transition-all duration-300 ${
          isActive('/admin') 
            ? 'bg-orange-100 text-orange-700 shadow-lg' 
            : 'hover:bg-orange-50 text-orange-600'
        }`}
      >
        <User className={`w-6 h-6 mb-1 ${isActive('/admin') ? 'text-orange-700' : 'text-orange-500'}`} />
        <span className="text-xs font-semibold">লগইন</span>
      </button>
    </div>
  );
};

export default BottomNav; 