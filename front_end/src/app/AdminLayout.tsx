import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { Users, LogOut, Car, LayoutDashboard, Tag, History, Star } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem('isAdminAuth');
    if (!isAuth) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuth');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white border-r">
        <div className="p-6">
          <h1 className="text-xl font-bold mb-1">RideShare admin</h1>
          <p className="text-sm text-slate-400">Control panel</p>
        </div>

        <nav className="px-3 space-y-1">
          <NavLink to="/admin" end className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/clients" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
            <Users className="w-5 h-5" />
            <span>Gestionare clienți</span>
          </NavLink>
          
          <NavLink to="/admin/drivers" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
            <Car className="w-5 h-5" />
            <span>Gestionare șoferi</span>
          </NavLink>

          <NavLink to="/admin/cars" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
            <Car className="w-5 h-5" />
            <span>Flotă auto</span>
          </NavLink>

          <NavLink to="/admin/history" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
            <History className="w-5 h-5" />
            <span>Istoric curse</span>
          </NavLink>

          <NavLink to="/admin/discounts" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
            <Tag className="w-5 h-5" />
            <span>Promoții & discounturi</span>
          </NavLink>

          <NavLink to="/admin/reviews" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
            <Star className="w-5 h-5" />
            <span>Moderare recenzii</span>
         </NavLink>
        </nav>

        <div className="absolute bottom-0 w-64 p-3 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-slate-400 hover:bg-slate-800/50 transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}