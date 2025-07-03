import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, User, Gift, Heart, FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PersonalizedDiscovery = () => {
  return <section className="py-20 bg-[#FFF8F1]">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Personalized for <span className="text-[#FB5607] font-bold">Your Child</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Every child is unique. Our intelligent discovery system adapts to your child's age, 
              interests, and developmental needs to recommend exactly what they need, when they need it.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warm-peach rounded-xl flex items-center justify-center flex-shrink-0 bg-teal-100">
                  <User className="w-6 h-6 text-forest" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">No two kids are the same. So why should their toys be?</h3>
                  <p className="text-muted-foreground"> Our recommendations are 100% tailored—based on age, learning needs, and what excites your child.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warm-sage/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Search className="w-6 h-6 text-forest" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Interest-Based Discovery</h3>
                  <p className="text-muted-foreground">Toys and content tailored to your child's unique interests and learning style</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-soft-blue/20 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-100">
                  <Heart className="w-6 h-6 text-forest" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Expert Consultation Integration</h3>
                  <p className="text-muted-foreground">Recommendations evolve based on expert consultations and assessments</p>
                </div>
              </div>
            </div>
            
            <PersonalizeNowDialog />
          </div>
          
          <div className="relative">
            <Card className="shadow-2xl border-0 bg-[#F5F5F5] backdrop-blur-sm rounded-xl">
              <CardHeader className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-warm rounded-2xl flex items-center justify-center bg-teal-600">
                  <Gift className="w-10 h-10 text-[#FB5607]" />
                </div>
                <CardTitle className="text-2xl text-[#2E2E2E]">Smart Recommendations</CardTitle>
                <CardDescription className="text-[#757575]">Powered by developmental science</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-warm-peach/30 rounded-lg">
                  <h4 className="font-semibold mb-2 text-[#2E2E2E]"> For Aanya, Age 3</h4>
                  <p className="text-sm text-[#757575]">stories + fine motor play</p>
                </div>
                <div className="p-4 bg-soft-blue/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-[#2E2E2E]">For Vir, Age 5</h4>
                  <p className="text-sm text-[#757575]">STEM + social-emotional skills</p>
                </div>
                <div className="p-4 bg-warm-sage/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-[#2E2E2E]">For Arjun, Age 8</h4>
                  <p className="text-sm text-[#757575]">Problem-solving + creative thinking</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>;
};

function PersonalizeNowDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        className="px-10 py-4 rounded-xl text-white font-semibold text-xl bg-gradient-to-r from-[#FB5607] to-[#FD7B2A] shadow-md transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#FB5607] focus:ring-offset-2"
      >
        Personalize Now
      </Button>
      <DialogContent className="max-w-md bg-[#FFF8F1]">
        <div className="text-center p-2">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#2E2E2E]">Let's Personalize Your Experience</h2>
          <p className="text-lg text-[#757575] mb-8">Have you already taken our personalized quiz?</p>
          <div className="flex flex-col gap-4">
            <Button
              className="w-full flex items-center justify-center gap-2 text-lg font-semibold bg-gradient-to-r from-[#FB5607] to-[#FD7B2A] text-white rounded-xl py-4 shadow-none hover:opacity-90"
              onClick={() => { setOpen(false); navigate('/login'); }}
            >
              <User className="w-6 h-6" /> Yes, I'll Login
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-lg font-semibold bg-white border-2 border-[#F5D6C6] text-[#2E2E2E] rounded-xl py-4 hover:bg-[#FFF3E6]"
              onClick={() => { setOpen(false); navigate('/signup', { state: { redirectTo: '/enhanced-quiz' } }); }}
            >
              <FileText className="w-6 h-6" /> No, Start Quiz
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PersonalizedDiscovery;