import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroBannerSlide {
  media_id?: string;
  image_url?: string;
  title?: string;
  description?: string;
  link_type?: 'external' | 'internal' | 'none';
  link_url?: string;
}

interface HeroBannerProps {
  sectionConfig?: {
    slides?: HeroBannerSlide[];
  };
}

const HeroBanner = ({ sectionConfig }: HeroBannerProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageHeights, setImageHeights] = useState<{ [key: number]: number }>({});
  const navigate = useNavigate();

  // Use section config slides if available, otherwise empty array
  const slides = sectionConfig?.slides || [];

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSlideClick = (slide: HeroBannerSlide) => {
    if (slide.link_type === 'external' && slide.link_url) {
      window.open(slide.link_url, '_blank', 'noopener,noreferrer');
    } else if (slide.link_type === 'internal' && slide.link_url) {
      navigate(slide.link_url);
    }
  };

  const handleImageLoad = (index: number, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const aspectRatio = img.naturalHeight / img.naturalWidth;
    const containerWidth = img.offsetWidth;
    const calculatedHeight = containerWidth * aspectRatio;
    
    setImageHeights(prev => ({
      ...prev,
      [index]: calculatedHeight
    }));
  };

  if (slides.length === 0) {
    return null;
  }

  const currentBanner = slides[currentSlide];
  const hasLink = currentBanner.link_type !== 'none' && currentBanner.link_url;
  const currentHeight = imageHeights[currentSlide] || 400; // fallback height

  return (
    <div className="relative w-full max-w-5xl mx-auto p-2 rounded-3xl mb-8 mt-16 md:mt-24 overflow-hidden bg-white shadow-lg">
      <div 
        className="relative w-full transition-all duration-300 ease-in-out"
        style={{ height: `${currentHeight}px`, minHeight: '300px' }}
      >
        <div 
          className={`absolute inset-0 ${hasLink ? 'cursor-pointer' : ''}`}
          onClick={() => hasLink && handleSlideClick(currentBanner)}
        >
          {currentBanner.image_url ? (
            <img
              src={currentBanner.image_url}
              alt={currentBanner.title || 'Hero banner'}
              className="absolute inset-0 w-full h-full object-cover rounded-3xl"
              onLoad={(e) => handleImageLoad(currentSlide, e)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-warm-sage to-soft-blue flex items-center justify-center rounded-3xl">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-4">
                  {currentBanner.title || 'Welcome to Our Store'}
                </h2>
                {currentBanner.description && (
                  <p className="text-lg">{currentBanner.description}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Overlay content for images */}
          {currentBanner.image_url && (currentBanner.title || currentBanner.description) && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center text-white">
                {currentBanner.title && (
                  <h2 className="text-3xl font-bold mb-4">{currentBanner.title}</h2>
                )}
                {currentBanner.description && (
                  <p className="text-lg">{currentBanner.description}</p>
                )}
              </div>
            </div>
          )}
          
          {slides.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(index);
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
