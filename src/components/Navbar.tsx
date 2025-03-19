
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, PlusSquare, Package, Skull, Beef, Syringe } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
  const location = useLocation();
  const lots = useStore((state) => state.lots);
  const pastures = useStore((state) => state.pastures);
  const inventoryItems = useStore((state) => state.inventoryItems);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navigation = [
    {
      name: 'Home',
      icon: <Home className="w-5 h-5" />,
      href: '/',
    },
    {
      name: 'Pastures',
      icon: <List className="w-5 h-5" />,
      href: '/pastures',
    },
    {
      name: 'Lots',
      icon: <Beef className="w-5 h-5" />,
      href: '/lots',
    },
    {
      name: 'Plantations',
      icon: <PlusSquare className="w-5 h-5" />,
      href: '/plantations',
    },
    {
      name: 'Inventory',
      icon: <Package className="w-5 h-5" />,
      href: '/inventory',
    },
    {
      name: 'Mortality',
      icon: <Skull className="w-5 h-5" />,
      href: '/mortality',
    },
    {
      name: 'Sanitary Control',
      icon: <Syringe className="w-5 h-5" />,
      href: '/sanitary-control',
    },
  ];

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              FarmOS
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium ${location.pathname === item.href ? 'bg-gray-100 text-gray-800' : ''}`}
                  >
                    <span className="flex items-center gap-2">{item.icon}{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://github.com/shadcn.png" alt="Shadcn" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">shadcn</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        shadcn@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem >
                    Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Button
              onClick={toggleMenu}
              size="icon"
              variant="ghost"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={closeMenu}
              className={`text-gray-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium ${location.pathname === item.href ? 'bg-gray-100 text-gray-800' : ''}`}
            >
              <span className="flex items-center gap-2">{item.icon}{item.name}</span>
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-5 sm:px-6">
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">Shadcn</div>
              <div className="text-sm font-medium text-gray-500">shadcn@example.com</div>
            </div>
          </div>
          <div className="mt-3 px-2 space-y-1 sm:px-3">
            <Link
              to="/settings"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              Settings
            </Link>
            <Link
              to="/logout"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
