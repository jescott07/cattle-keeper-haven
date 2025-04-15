
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackagePlus, 
  MapPin, 
  Beef, 
  Weight, 
  Menu, 
  X,
  Database,
  Sprout,
  Syringe
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useSyncService } from '@/lib/syncService';
import { Button } from '@/components/ui/button';
import { SyncStatus } from './SyncStatus';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { syncPending, isOnline, pendingCount } = useSyncService();
  const isMobile = useIsMobile();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/lots', label: 'Lotes', icon: <Beef className="h-5 w-5" /> },
    { path: '/inventory', label: 'Inventário', icon: <PackagePlus className="h-5 w-5" /> },
    { path: '/pastures', label: 'Pastagens', icon: <MapPin className="h-5 w-5" /> },
    { path: '/plantations', label: 'Plantações', icon: <Sprout className="h-5 w-5" /> },
    { path: '/weighing', label: 'Pesagem', icon: <Weight className="h-5 w-5" /> },
    { path: '/animal-health', label: 'Saúde Animal', icon: <Syringe className="h-5 w-5" /> }
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Beef className="h-8 w-8 text-accent" />
                <span className="text-lg font-semibold hidden sm:inline-block">Cattle Keeper</span>
              </Link>
            </div>
            
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors 
                    ${location.pathname === item.path 
                      ? 'bg-accent/10 text-accent' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
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
          
          <div className="hidden md:flex md:items-center md:ml-6 gap-4">
            <SyncStatus pendingSyncs={pendingCount} isOnline={isOnline} />
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={syncPending}
              disabled={!isOnline || pendingCount === 0}
            >
              <Database className="h-4 w-4" />
              Sincronizar
            </Button>
          </div>

          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md"
              aria-label="Menu principal"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b shadow-sm animate-in slide-in-from-top">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block py-2.5 px-3 rounded-md text-base font-medium transition-colors flex items-center gap-2
                  ${location.pathname === item.path 
                    ? 'bg-accent/10 text-accent' 
                    : 'text-foreground hover:bg-accent/5 hover:text-accent'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            
            <div className="px-3 py-3 flex justify-between items-center border-t mt-3">
              <SyncStatus pendingSyncs={pendingCount} isOnline={isOnline} />
              
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => {
                  syncPending();
                  setIsOpen(false);
                }}
                disabled={!isOnline || pendingCount === 0}
              >
                <Database className="h-4 w-4" />
                Sincronizar
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
