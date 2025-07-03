import { useParams, Link } from 'react-router-dom';
import { useProduct, useProductsByLevel } from '@/hooks/useProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Clock, Play } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '@/components/ui/carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useMemo } from 'react';

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading } = useProduct(id!);
  const { products: relatedProducts } = useProductsByLevel(product?.developmental_level_id || '');
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Helper function to detect if a URL is a video
  const isVideoUrl = (url: string) => {
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('vimeo.com') || 
           url.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi)$/);
  };

  // Helper function to get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}?autoplay=1` : url;
  };

  // Helper function to get video thumbnail
  const getVideoThumbnail = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return videoId ? `https://img.youtube.com/vi/${videoId[1]}/maxresdefault.jpg` : null;
    }
    return null; // For other video types, we'll use a generic video icon
  };

  // Get all media items (images and videos)
  const mediaItems = product ? product.product_images.map((image, index) => ({
    type: isVideoUrl(image.image_url) ? 'video' as const : 'image' as const,
    url: image.image_url,
    alt: image.alt_text || product.title,
    isPrimary: image.is_primary,
    originalIndex: index
  })) : [];

  // Get only image items for the carousel
  const imageItems = mediaItems.filter(item => item.type === 'image');

  // Helper to handle image error
  const handleImageError = (url: string) => {
    setFailedImages(prev => new Set(prev).add(url));
  };

  // Filter out failed images from mediaItems
  const filteredMediaItems = useMemo(() =>
    mediaItems.filter(item => item.type !== 'image' || !failedImages.has(item.url)),
    [mediaItems, failedImages]
  );
  const filteredImageItems = useMemo(() =>
    filteredMediaItems.filter(item => item.type === 'image'),
    [filteredMediaItems]
  );

  // Sync carousel with selected media when thumbnails are clicked
  useEffect(() => {
    if (carouselApi && !isVideoPlaying) {
      const selectedItem = filteredMediaItems[selectedMediaIndex];
      if (selectedItem && selectedItem.type === 'image') {
        const imageIndex = filteredImageItems.findIndex(img => img.url === selectedItem.url);
        if (imageIndex >= 0) {
          carouselApi.scrollTo(imageIndex);
        }
      }
    }
  }, [selectedMediaIndex, carouselApi, isVideoPlaying, filteredMediaItems, filteredImageItems]);

  // Update selected index when carousel changes
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      const currentIndex = carouselApi.selectedScrollSnap();
      const currentImageItem = filteredImageItems[currentIndex];
      if (currentImageItem && !isVideoPlaying) {
        const mediaIndex = filteredMediaItems.findIndex(item => item.url === currentImageItem.url);
        if (mediaIndex >= 0) {
          setSelectedMediaIndex(mediaIndex);
        }
      }
    };

    carouselApi.on('select', onSelect);
    
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi, filteredImageItems, filteredMediaItems, isVideoPlaying]);

  const handleThumbnailClick = (index: number) => {
    const selectedMedia = filteredMediaItems[index];
    setSelectedMediaIndex(index);
    
    if (selectedMedia.type === 'video') {
      setIsVideoPlaying(true);
    } else {
      setIsVideoPlaying(false);
      // The useEffect will handle syncing the carousel
    }
  };

  const renderMainMedia = () => {
    if (!product || filteredMediaItems.length === 0) return null;

    const selectedMedia = filteredMediaItems[selectedMediaIndex] || filteredMediaItems[0];

    if (isVideoPlaying && selectedMedia.type === 'video') {
      if (selectedMedia.url.includes('youtube.com') || selectedMedia.url.includes('youtu.be')) {
        return (
          <div className="aspect-square overflow-hidden rounded-lg bg-black">
            <iframe
              src={getYouTubeEmbedUrl(selectedMedia.url)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      } else if (selectedMedia.url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/)) {
        return (
          <div className="aspect-square overflow-hidden rounded-lg bg-black">
            <video
              src={selectedMedia.url}
              className="w-full h-full object-cover"
              controls
              autoPlay
            />
          </div>
        );
      }
    }

    // Show carousel for images
    if (filteredImageItems.length > 0) {
      return (
        <Carousel className="w-full" setApi={setCarouselApi}>
          <CarouselContent>
            {filteredImageItems.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img 
                    src={image.url} 
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(image.url)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {filteredImageItems.length > 1 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <Navigation />
        <div className="pt-20 pb-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center py-8">Loading product...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <Navigation />
        <div className="pt-20 pb-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center py-8">Product not found</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleShopNow = () => {
    window.open(product.amazon_affiliate_link, '_blank');
  };

  const hasDiscount = product.compare_at_price && product.price && product.compare_at_price > product.price;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navigation />
      <div className="pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Back button */}
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/shop">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 items-start">
            {/* Product Images with Thumbnails */}
            <div className="space-y-4">
              {/* Main Media Display - larger */}
              <div className="bg-white rounded-3xl p-4 shadow-sm">
              {renderMainMedia()}
              </div>
              {/* Thumbnail Row */}
              {filteredMediaItems.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {filteredMediaItems.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => handleThumbnailClick(index)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                        selectedMediaIndex === index 
                          ? 'border-[#FB5607] shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {media.type === 'video' ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          {getVideoThumbnail(media.url) ? (
                            <img 
                              src={getVideoThumbnail(media.url)!} 
                              alt={media.alt}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={media.url} 
                          alt={media.alt}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(media.url)}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info - clean vertical stack, no card bg */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">{product.title}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 py-1 bg-zinc-600 rounded-full px-4">
                    <span className="text-2xl">{product.developmental_level.icon}</span>
                    <span className="font-medium text-lg text-neutral-50">{product.developmental_level.name}</span>
                  </div>
                </div>
                {/* Price Display */}
                {product.price && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-bold text-black">
                      {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-xl text-muted-foreground line-through">
                          {formatPrice(product.compare_at_price)}
                        </span>
                        <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full ml-2">SALE</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Age Group & Days to Complete */}
              <div className="flex flex-wrap gap-8 mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Age Group</p>
                    <p className="font-medium">{product.age_group}</p>
                  </div>
                  {product.days_to_complete && (
                    <div>
                      <p className="text-sm text-muted-foreground">Days to Complete</p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <p className="font-medium">{product.days_to_complete} days</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Developmental Goals as Pills */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Developmental Goals</p>
                  {product.developmental_goals && product.developmental_goals.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.developmental_goals.map((goal) => (
                        <div
                          key={goal.id}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border"
                          style={{ 
                          backgroundColor: '#FFF3E6',
                          borderColor: '#FB5607',
                          color: '#FB5607'
                          }}
                        >
                          <span>{goal.emoji}</span>
                          <span>{goal.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No developmental goals specified for this product.</p>
                  )}
                </div>

                {/* Description */}
              <div>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                {/* Shop Now Button */}
                <Button 
                  onClick={handleShopNow} 
                  size="lg" 
                className="w-full bg-[#FB5607] hover:bg-[#e65100] text-white text-lg font-semibold rounded-lg py-4 mt-2"
                >
                Shop Now <ExternalLink className="w-5 h-5 ml-2" />
                </Button>

              {/* Shipping/Warranty/Return Info (static) */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 rounded-lg px-4 py-2 text-sm flex-1">
                  <span role="img" aria-label="shipping">🚚</span>
                  Free shipping on orders over ₹500
                </div>
                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 rounded-lg px-4 py-2 text-sm flex-1">
                  <span role="img" aria-label="warranty">🛡️</span>
                  1-year warranty included
                </div>
                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 rounded-lg px-4 py-2 text-sm flex-1">
                  <span role="img" aria-label="return">↩️</span>
                  30-day return policy
                </div>
              </div>
            </div>
          </div>

          {/* Product Accordions */}
          {product.product_accordions.length > 0 && (
            <Card className="mb-12">
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {product.product_accordions.map((accordion, index) => (
                    <AccordionItem key={accordion.id} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {accordion.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div dangerouslySetInnerHTML={{ __html: accordion.content }} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-forest mb-6">
                More {product.developmental_level.name} Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts
                  .filter(p => p.id !== product.id)
                  .slice(0, 4)
                  .map((relatedProduct) => (
                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
