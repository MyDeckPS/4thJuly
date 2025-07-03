
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const PlaypathHeroBanner = () => {
  // Since playpath_slideshows table was deleted, return a simple banner or null
  return (
    <div className="relative w-full rounded-xl mb-8 overflow-hidden">
      <div className="relative w-full" style={{ paddingBottom: '50%' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-warm-sage to-soft-blue flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Welcome to PlayPath</h2>
            <p className="text-lg">Discover personalized learning experiences for your child</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaypathHeroBanner;
