import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Smile, Users, Brain, User } from "lucide-react";

const MobileBottomNav = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't render if user is not authenticated
  if (!user) return null;

  // Don't render if not on mobile
  if (!isMobile) return null;

  // Don't render on auth pages or admin pages
  const hiddenPaths = ['/login', '/signup', '/personalization', '/admin'];
  if (hiddenPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  const navItems = [
    {
      id: 'shop',
      label: 'Shop',
      icon: ShoppingBag,
      path: '/shop',
      isActive: location.pathname.startsWith('/shop')
    },
    {
      id: 'playpath',
      label: 'Playpath',
      icon: Smile,
      path: '/booking',
      isActive: location.pathname === '/booking' || location.pathname.startsWith('/booking')
    },
    {
      id: 'diaries',
      label: 'Diaries',
      icon: Users,
      path: '/diaries',
      isActive: location.pathname.startsWith('/diaries')
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: User,
      path: '/dashboard',
      isActive: location.pathname.startsWith('/dashboard')
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
              item.isActive 
                ? 'text-warm-sage bg-warm-sage/10' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className={`text-xs font-medium ${
              item.isActive ? 'text-warm-sage' : 'text-gray-500'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
