
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackagePlus, 
  MapPin, 
  Cow, 
  Weight, 
  Menu, 
  X,
  Database
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useSyncService } from '@/lib/syncService';
import { Button } from '@/components/ui/button';
import { SyncStatus } from './SyncStatus';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const pendingSyncs = useStore(state => state.getPendingSyncs());
  const { syncPending, isOnline } = useSyncService();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/lots', label: 'Lots', icon: <Cow className="h-5 w-5" /> },
    { path: '/inventory', label: 'Inventory', icon: <PackagePlus className="h-5 w-5" /> },
    { path: '/pastures', label: 'Pastures', icon: <MapPin className="h-5 w-5" /> },
    { path: '/weighing', label: 'Weighing', icon: <Weight className="h-5 w-5" /> }
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Cow className="h-8 w-8 text-accent" />
                <span className="text-lg font-semibold hidden sm:inline-block">Cattle Keeper</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors 
                    ${location.pathname === item.path 
                      ? 'border-b-2 border-accent text-foreground' 
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted'
                    }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:ml-6 gap-4">
            <SyncStatus pendingSyncs={pendingSyncs} isOnline={isOnline} />
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={syncPending}
              disabled={!isOnline || pendingSyncs === 0}
            >
              <Database className="h-4 w-4" />
              Sync Data
            </Button>
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1 animate-fade-in">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center gap-2
                ${location.pathname === item.path 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-foreground hover:bg-accent/20 hover:text-accent'
                }`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          
          <div className="px-3 py-3 flex justify-between items-center border-t mt-3">
            <SyncStatus pendingSyncs={pendingSyncs} isOnline={isOnline} />
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={syncPending}
              disabled={!isOnline || pendingSyncs === 0}
            >
              <Database className="h-4 w-4" />
              Sync
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
