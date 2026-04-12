import { Outlet, NavLink, useNavigate } from 'react-router';
import { User, MapPin, Clock, Star, LogOut } from 'lucide-react';

export default function ClientLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <h1 className="text-xl text-sidebar-foreground mb-1">RideShare</h1>
          <p className="text-sm text-sidebar-foreground/60">Client Portal</p>
        </div>

        <nav className="px-3 space-y-1">
          <NavLink
            to="/client/account"
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
            to="/client/new-ride"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`
            }
          >
            <MapPin className="w-5 h-5" />
            <span>New Ride</span>
          </NavLink>

          <NavLink
            to="/client/trips"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`
            }
          >
            <Clock className="w-5 h-5" />
            <span>Recent Trips</span>
          </NavLink>

          <NavLink
            to="/client/reviews"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`
            }
          >
            <Star className="w-5 h-5" />
            <span>Reviews Received</span>
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
