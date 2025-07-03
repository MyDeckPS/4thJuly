import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Star, Calendar, Phone, Video, MessageCircle, Target, Brain, Pencil, Handshake, School } from "lucide-react";
import expertImage from "@/assets/expert-consultation.jpg";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import React, { useState } from "react";
import BookingDialog from "@/components/BookingDialog";

const ExpertPage = () => {
  const commonQuestions = [
    {
      icon: "target",
      question: "Which toys are best for my child's age, interests, and developmental needs?",
      category: "Age-Appropriate Selection"
    },
    {
      icon: "brain",
      question: "How can I support my child's focus, creativity, or confidence through play?",
      category: "Cognitive Development"
    },
    {
      icon: "pencil",
      question: "Is my child hitting the right milestones? What signs should I look for?",
      category: "Development Tracking"
    },
    {
      icon: "brain",
      question: "How do I use a toy to build real learning—beyond just entertainment?",
      category: "Educational Value"
    },
    {
      icon: "handshake",
      question: "How do I encourage more sibling play or reduce screen time?",
      category: "Social Skills"
    },
    {
      icon: "target",
      question: "My child is very active (or too passive)—how can play help balance that?",
      category: "Activity Balance"
    },
    {
      icon: "school",
      question: "Can play really help with school readiness and emotional regulation?",
      category: "School Preparation"
    }
  ];

  const parentWonderings = [
    "Is this toy helping my child grow—or just keeping them busy?",
    "What kind of play does my child really need at this stage?",
    "How do I support focus, creativity, or confidence through toys?",
    "Are we missing important developmental signs or opportunities?"
  ];

  const bookingSteps = [
    {
      title: "Choose a Time",
      description: "Pick a 20-minute slot on our calendar."
    },
    {
      title: "Tell Us About Your Child",
      description: "A short form helps us personalize your session."
    },
    {
      title: "Join the Call",
      description: "Meet your expert on Google Meet."
    },
    {
      title: "Get a Plan",
      description: "Receive toy suggestions, play strategies, and a custom growth path."
    }
  ];

  const experts = [
    {
      name: "Dr. Sarah Chen",
      title: "Child Development Specialist",
      experience: "12 years",
      specialty: "Early Childhood Development",
      rating: 4.9,
      consultations: 500,
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Dr. Michael Rodriguez",
      title: "Educational Psychologist",
      experience: "8 years",
      specialty: "STEM Learning & Cognitive Development",
      rating: 4.8,
      consultations: 350,
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Dr. Emily Watson",
      title: "Pediatric Occupational Therapist",
      experience: "15 years",
      specialty: "Motor Skills & Sensory Development",
      rating: 4.9,
      consultations: 600,
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const handleBookNowClick = () => {
    setBookingDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {/* Hero Section */}
      <section className="relative pt-36 pb-20 bg-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={expertImage} 
            alt="Expert consultation"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-white/80" />
        </div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4 text-foreground">
              Talk to an <span className="text-orange-500">Expert</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Get personalized guidance from certified child development specialists to choose the perfect toys for your child's unique developmental journey.
            </p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4 font-semibold shadow-none" size="lg" onClick={handleBookNowClick}>
              Book a Session Now
            </Button>
          </div>
        </div>
      </section>
      {/* Booking Dialog */}
      <BookingDialog 
        open={bookingDialogOpen} 
        onOpenChange={setBookingDialogOpen} 
      />
      {/* What Parents Often Ask Us Section */}
      <section className="py-16 bg-[#FFF8F3]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">What Parents Often Ask Us (You Might Be Wondering Too!)</h2>
            <div className="max-w-3xl mx-auto mb-12">
              <p className="text-lg text-gray-600 mb-4">
                Wondering if your child is learning enough through play? Or unsure which toy actually supports growth?
              </p>
              <p className="text-lg font-medium text-gray-900">
                Here are some questions our experts help with every day:
              </p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-12">
            {commonQuestions.map((questionItem, index) => {
              const IconComponent = {
                target: Target,
                brain: Brain,
                pencil: Pencil,
                handshake: Handshake,
                school: School
              }[questionItem.icon] || Target;
              return (
                <div key={index} className="flex items-start gap-4 p-6 bg-white border border-orange-100 rounded-xl">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-100 text-orange-500 text-2xl">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-orange-500 text-xs mb-1">{questionItem.category}</div>
                    <div className="text-base text-gray-900">{questionItem.question}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-orange-500">
              No question is too small. If it helps your child grow, we're here to guide you.
            </p>
          </div>
        </div>
      </section>
      {/* Why Expert Guidance Matters Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-6">🌟 Why Expert Guidance Matters</h2>
              <p className="text-lg text-gray-600 mb-8">
                Your child may choose a toy they love—without knowing if it truly supports what they need right now.
              </p>
              <p className="text-lg font-medium text-gray-900 mb-8">
                And you, as a parent, are often left wondering:
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {parentWonderings.map((wondering, index) => (
                <div key={index} className="flex items-start gap-3 p-6 bg-[#FFF8F3] rounded-xl border border-orange-100">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-700 leading-relaxed">{wondering}</p>
                </div>
              ))}
            </div>
            <div className="text-center bg-orange-50 rounded-2xl p-8">
              <p className="text-lg font-semibold text-gray-900 mb-4">
                With expert guidance, you get clarity on what works for your child—not just what's trending.
              </p>
              <p className="text-lg text-gray-600">
                We help you make intentional play choices that fuel growth, not guesswork.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* How to Book Your Session Section */}
      <section className="py-16 bg-[#FFF8F3]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-6">✅ How to Book Your Session</h2>
            <p className="text-lg text-gray-600">
              Getting expert support is quick and easy:
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {bookingSteps.map((step, index) => (
              <div key={index} className="text-center bg-white border border-orange-100 rounded-xl p-8 flex flex-col items-center">
                <div className="w-12 h-12 mb-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold">{index + 1}</div>
                <div className="font-semibold text-gray-900 mb-2">{step.title}</div>
                <div className="text-gray-600 text-sm">{step.description}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4 font-semibold shadow-none" size="lg" onClick={handleBookNowClick}>
              Book a Session Now
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ExpertPage; 