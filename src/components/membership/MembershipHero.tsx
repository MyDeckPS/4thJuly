
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const MembershipHero = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Calendar className="w-12 h-12 text-warm-sage" />
          <Sparkles className="w-8 h-8 text-warm-peach" />
        </div>
        
        <h1 className="text-5xl font-bold text-forest mb-6">
          Unlock Your Child's Potential with{" "}
          <span className="text-warm-sage">PlayPath Sessions</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get expert guidance and personalized developmental activities 
          that adapt to your child's unique learning journey.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/booking/playpath">
            <Button size="lg" className="bg-warm-sage hover:bg-forest text-white px-8 py-3">
              Book PlayPath Session
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-white px-8 py-3">
            Learn More
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4">
          ✨ Expert-guided sessions • Personalized for your child • Flexible scheduling
        </p>
      </div>
    </section>
  );
};

export default MembershipHero;
