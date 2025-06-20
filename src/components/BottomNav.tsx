import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Store, List, Search, User } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-white/90 border-t border-gray-200 flex justify-between items-center gap-2 px-2 py-2 max-w-screen-sm mx-auto">
      <button onClick={() => navigate('/')} className="flex flex-col items-center flex-1 py-1 rounded-xl hover:bg-orange-100 transition">
        <Home className="text-orange-500 w-6 h-6 mb-1" />
        <span className="text-xs font-semibold text-gray-700">HOME</span>
      </button>
      <button onClick={() => navigate('/shop')} className="flex flex-col items-center flex-1 py-1 rounded-xl hover:bg-orange-100 transition">
        <Store className="text-gray-500 w-6 h-6 mb-1" />
        <span className="text-xs font-semibold text-gray-700">SHOP</span>
      </button>
      <button onClick={() => navigate('/shop')} className="flex flex-col items-center flex-1 py-1 rounded-xl hover:bg-orange-100 transition">
        <List className="text-gray-500 w-6 h-6 mb-1" />
        <span className="text-xs font-semibold text-gray-700">CATEGORIES</span>
      </button>
      <button onClick={() => navigate('/shop')} className="flex flex-col items-center flex-1 py-1 rounded-xl hover:bg-orange-100 transition">
        <Search className="text-gray-500 w-6 h-6 mb-1" />
        <span className="text-xs font-semibold text-gray-700">SEARCH</span>
      </button>
      <button onClick={() => navigate('/admin/login')} className="flex flex-col items-center flex-1 py-1 rounded-xl hover:bg-orange-100 transition">
        <User className="text-gray-500 w-6 h-6 mb-1" />
        <span className="text-xs font-semibold text-gray-700">ACCOUNT</span>
      </button>
    </div>
  );
};

export default BottomNav; 