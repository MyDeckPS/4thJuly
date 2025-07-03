import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "../assets/hero-marketplace.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden pt-16 md:pt-24">
      {/* Background */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Developmental toys collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full" />
            <span className="text-orange-500 font-medium">Developmental Excellence</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-[#18181b]">
            Unlock Your Child's
            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent block">
              Potential
            </span>
          </h1>
          
          <p className="text-xl text-[#18181b] mb-8 leading-relaxed">
            Discover expertly curated developmental toys that inspire learning, creativity, 
            and growth at every stage of your child's journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6" size="lg" asChild>
              <Link to="/shop">
                Shop Collections
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 border-gray-300 transition-colors duration-200 text-foreground bg-[#FFF6F0] hover:bg-[#7C3AED] hover:text-white hover:border-[#7C3AED]" 
              asChild
            >
              <Link to="/expert">
                <Play className="w-4 h-4 mr-2" />
                Talk to Expert
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;