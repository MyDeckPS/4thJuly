import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Menu, X, User, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useHeaderLinks } from "@/hooks/useHeaderLinks";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/hooks/useProducts';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerOverlay,
  DrawerTrigger,
} from "@/components/ui/drawer";
import BoringAvatar from "@/components/common/BoringAvatar";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { headerLinks } = useHeaderLinks();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDesktopSearchResults, setShowDesktopSearchResults] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  // Desktop search functionality
  const {
    data: desktopSearchResults = [],
    isLoading: desktopSearchLoading
  } = useQuery({
    queryKey: ['desktop-product-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) return [];
      const {
        data,
        error
      } = await supabase.from('products').select(`
          id,
          title,
          description,
          developmental_level:developmental_levels(name),
          product_images (
            image_url,
            is_primary,
            sort_order
          )
        `).eq('published', true).or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.["${searchQuery}"]`).limit(8);
      if (error) throw error;
      return data as (Product & {
        developmental_level?: {
          name: string;
        };
      })[];
    },
    enabled: searchQuery.trim().length >= 2 && isSearchOpen && !isMobile
  });

  // Close desktop search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node)) {
        setShowDesktopSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDesktopSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDesktopSearchResults(value.trim().length >= 2);
  };

  const handleDesktopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality here
    console.log("Desktop search query:", searchQuery);
    setIsSearchOpen(false);
    setSearchQuery("");
    setShowDesktopSearchResults(false);
  };

  const handleDesktopSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setShowDesktopSearchResults(false);
  };

  const handleDesktopResultClick = () => {
    setShowDesktopSearchResults(false);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality here
    console.log("Search query:", searchQuery);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleMobileSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  // Mobile header with search state
  if (isMobile && isSearchOpen) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <form onSubmit={handleMobileSearchSubmit} className="flex-1 mr-4">
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                autoFocus
              />
            </form>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMobileSearchClose}
              className="text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  // Mobile header default state
  if (isMobile) {
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              {/* Left side: Menu + Logo */}
              <div className="flex items-center space-x-3">
                <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <DrawerTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="bg-white rounded-t-3xl border-t border-gray-200">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8 mt-4" />
                    <div className="px-6 pb-8">
                      <div className="flex flex-col space-y-4">
                        {/* Dynamic Header Links */}
                        <Link
                          to="/shop"
                          className={`text-lg font-medium py-3 transition-colors ${location.pathname.startsWith('/shop') ? 'text-[#FB5607] font-bold' : 'text-[#2E2E2E] hover:text-[#FB5607]'}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Toys
                        </Link>
                        <Link
                          to="/blogs"
                          className={`text-lg font-medium py-3 transition-colors ${location.pathname.startsWith('/blogs') ? 'text-[#FB5607] font-bold' : 'text-[#2E2E2E] hover:text-[#FB5607]'}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Blogs
                        </Link>
                        <Link
                          to="/diaries"
                          className={`text-lg font-medium py-3 transition-colors ${location.pathname.startsWith('/diaries') ? 'text-[#FB5607] font-bold' : 'text-[#2E2E2E] hover:text-[#FB5607]'}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Diaries
                        </Link>

                        {/* User Actions */}
                        {user ? (
                          <>
                            <Link
                              to="/dashboard"
                              className="flex items-center space-x-3 text-lg font-medium text-gray-700 hover:text-forest transition-colors py-3"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <User className="w-5 h-5" />
                              <span>Profile</span>
                            </Link>
                            <Button
                              variant="ghost"
                              size="lg"
                              onClick={() => {
                                handleSignOut();
                                setIsMobileMenuOpen(false);
                              }}
                              className="text-lg font-medium text-gray-700 hover:text-forest justify-start py-3"
                            >
                              <LogOut className="w-5 h-5 mr-3" />
                              Sign Out
                            </Button>
                          </>
                        ) : (
                          <div className="flex flex-col space-y-3">
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                              <Button variant="ghost" size="lg" className="w-full justify-start text-lg font-medium">
                                Sign In
                              </Button>
                            </Link>
                            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                              <Button size="lg" className="w-full text-lg font-medium">Sign Up</Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>

                <Link to="/" className="flex items-center">
                  <img src="/MD.png" alt="MyDeck Logo" className="h-6" />
                </Link>
              </div>

              {/* Right side: Search + Profile */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="text-gray-700"
                >
                  <Search className="w-5 h-5" />
                </Button>

                {user ? (
                  <Link to="/dashboard" className="flex items-center">
                    <BoringAvatar name={profile?.name || user.email || "User"} size={32} />
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Blur overlay when mobile menu is open */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </>
    );
  }

  // Desktop Navigation with Search State
  if (isSearchOpen) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src="/MD.png" alt="MyDeck Logo" className="h-8" />
            </Link>

            {/* Center - Search Bar */}
            <div className="flex-1 flex items-center justify-center max-w-2xl mx-8" ref={desktopSearchRef}>
              <div className="relative w-full">
                <form onSubmit={handleDesktopSearchSubmit} className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest" />
                  <Input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={handleDesktopSearchChange}
                    className="w-full pl-12 pr-12 py-3 text-lg bg-white border-2 border-forest text-gray-900 placeholder:text-black placeholder:opacity-30 focus:border-forest focus:ring-forest transition-all duration-300"
                    autoFocus
                  />
                  <button 
                    type="button"
                    onClick={handleDesktopSearchClose} 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </form>

                {/* Desktop Search Results Dropdown */}
                {showDesktopSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                    {desktopSearchLoading ? (
                      <div className="p-4 text-center text-gray-500">Searching...</div>
                    ) : desktopSearchResults.length > 0 ? (
                      <div className="py-2">
                        {desktopSearchResults.map(product => {
                          const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
                          return (
                            <Link 
                              key={product.id} 
                              to={`/shop/product/${product.id}`} 
                              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors" 
                              onClick={handleDesktopResultClick}
                            >
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {primaryImage ? (
                                  <img src={primaryImage.image_url} alt={product.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Search className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{product.title}</h4>
                                {product.developmental_level && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {product.developmental_level.name}
                                  </p>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : searchQuery.trim().length >= 2 ? (
                      <div className="p-4 text-center text-gray-500">
                        No products found for "{searchQuery}"
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Right - User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 text-gray-700 hover:text-forest transition-colors"
                  >
                    <BoringAvatar name={profile?.name || user.email || "User"} size={32} />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-forest"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-[#E6DEFA] text-[#8338EC] font-semibold hover:bg-[#8338EC] hover:text-white transition-colors">Sign Up</Button>
                  </Link>
                </>
              )}
              <Link to="/expert">
                <button className="bg-[#FB5607] hover:bg-[#e04e06] text-white rounded-full px-6 py-2 font-semibold transition-colors ml-2">
                  Talk to an Expert
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Desktop Navigation Default State
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/MD.png" alt="MyDeck Logo" className="h-8" />
          </Link>

          {/* Center - Dynamic Header Links Only */}
          <div className="flex-1 flex items-center justify-center space-x-8">
            <Link
              to="/shop"
              className={`text-[#2E2E2E] hover:text-[#FB5607] transition-colors text-lg ${location.pathname.startsWith('/shop') ? 'text-[#FB5607] font-bold' : ''}`}
            >
              Toys
            </Link>
            <Link
              to="/blogs"
              className={`text-[#2E2E2E] hover:text-[#FB5607] transition-colors text-lg ${location.pathname.startsWith('/blogs') ? 'text-[#FB5607] font-bold' : ''}`}
            >
              Blogs
            </Link>
            <Link
              to="/diaries"
              className={`text-[#2E2E2E] hover:text-[#FB5607] transition-colors text-lg ${location.pathname.startsWith('/diaries') ? 'text-[#FB5607] font-bold' : ''}`}
            >
              Diaries
            </Link>
          </div>

          {/* Right - Search + User Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-700 hover:text-forest"
            >
              <Search className="w-4 h-4" />
            </Button>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-forest transition-colors"
                >
                  <BoringAvatar name={profile?.name || user.email || "User"} size={32} />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-forest"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-[#E6DEFA] text-[#8338EC] font-semibold hover:bg-[#8338EC] hover:text-white transition-colors">Sign Up</Button>
                </Link>
              </>
            )}
            <Link to="/expert">
              <button className="bg-[#FB5607] hover:bg-[#e04e06] text-white rounded-full px-6 py-2 font-semibold transition-colors ml-2">
                Talk to an Expert
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
