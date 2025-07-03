
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import TypewriterText from '@/components/common/TypewriterText';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchWords = ['puzzle', 'development zone', 'motor skills', 'STEM', 'Robotics'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    data: searchResults = [],
    isLoading
  } = useQuery({
    queryKey: ['product-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) return [];
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
        `).eq('published', true).or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.["${searchTerm}"]`).limit(8);
      if (error) throw error;
      return data as (Product & {
        developmental_level?: {
          name: string;
        };
      })[];
    },
    enabled: searchTerm.trim().length >= 2
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.trim().length >= 2);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setSearchTerm('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search for toys, activities, and more..."
          value={searchTerm}
          onChange={handleInputChange}
          className="pl-10 pr-10 py-3 w-full border-2 border-warm-sage/20 focus:border-warm-sage focus:ring-0 focus:outline-none rounded-full"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {!searchTerm && (
        <div className="mt-2 text-center text-gray-500 text-sm">
          Try searching for: <TypewriterText words={searchWords} />
        </div>
      )}

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-warm-sage/20 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="p-2">
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={handleResultClick}
                  className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {product.product_images && product.product_images.length > 0 && (
                      <img
                        src={product.product_images.find(img => img.is_primary)?.image_url || product.product_images[0]?.image_url}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                      {product.developmental_level && (
                        <span className="text-xs text-warm-sage font-medium">
                          {product.developmental_level.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No products found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
