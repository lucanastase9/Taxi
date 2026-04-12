import { Outlet, NavLink, useNavigate } from 'react-router';
import { User, MapPin, History, LogOut } from 'lucide-react';

export default function DriverLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <h1 className="text-xl text-sidebar-foreground mb-1">RideShare</h1>
          <p className="text-sm text-sidebar-foreground/60">Driver Portal</p>
        </div>

        <nav className="px-3 space-y-1">
          <NavLink
            to="/driver/account"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`
            }
          >
            <User className="w-5 h-5" />
            <span>Account</span>
          </NavLink>

          <NavLink
            to="/driver/rides"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`
            }
          >
            <MapPin className="w-5 h-5" />
            <span>Available Rides</span>
          </NavLink>

          <NavLink
            to="/driver/history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`
            }
          >
            <History className="w-5 h-5" />
            <span>Trip History</span>
          </NavLink>
        </nav>

        <div className="absolute bottom-0 w-64 p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
