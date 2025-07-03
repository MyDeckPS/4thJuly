import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Play, Users, Clock, ArrowDown } from "lucide-react";
interface PlayPathLandingSectionProps {
  onBookNowClick: () => void;
}
const PlayPathLandingSection = ({
  onBookNowClick
}: PlayPathLandingSectionProps) => {
  const benefits = [{
    icon: <Play className="w-6 h-6 text-warm-sage" />,
    title: "Personalized Play Sessions",
    description: "Expert-guided sessions tailored to your child's developmental needs and interests"
  }, {
    icon: <Users className="w-6 h-6 text-warm-sage" />,
    title: "Child Development Experts",
    description: "Work with certified professionals who understand child psychology and development"
  }, {
    icon: <Clock className="w-6 h-6 text-warm-sage" />,
    title: "Flexible Scheduling",
    description: "Book sessions that fit your family's schedule with convenient time slots"
  }];
  const testimonials = [{
    name: "Priya Sharma",
    role: "Mother of 4-year-old",
    content: "PlayPath sessions have been amazing! My daughter looks forward to every session and I can see her confidence growing.",
    rating: 5
  }, {
    name: "Rajesh Kumar",
    role: "Father of 6-year-old",
    content: "The experts really understand children. My son has improved so much in social skills and problem-solving.",
    rating: 5
  }, {
    name: "Anita Desai",
    role: "Mother of 3-year-old",
    content: "Flexible scheduling made it easy to fit sessions into our busy routine. Highly recommend!",
    rating: 5
  }];
  return <div className="bg-gradient-to-b from-warm-sage/10 to-white py-12 sm:py-16">
      <div className="container mx-auto px-4 max-w-6xl py-[38px]">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="bg-warm-sage/10 text-warm-sage mb-4">Expert-Led Sessions</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-forest mb-4">
            Unlock Your Child's Potential with PlayPath Sessions
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Personalized, expert-guided play sessions designed to support your child's unique developmental journey
          </p>
          <Button size="lg" className="bg-warm-sage hover:bg-forest text-white px-8 py-3 text-lg" onClick={onBookNowClick}>
            Book Your Session Now
            <ArrowDown className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-warm-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-forest mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </CardContent>
            </Card>)}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-forest mb-2">What Parents Say</h2>
          <p className="text-muted-foreground">Real experiences from families in our community</p>
        </div>
        
        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-forest">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </div>;
};
export default PlayPathLandingSection;