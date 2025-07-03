
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const MembershipFAQs = () => {
  const faqs = [
    {
      question: "What's included in the 7-day free trial?",
      answer: "You get full access to all MyDeck Club features including expert sessions, premium insights, personalized roadmaps, and exclusive discounts. No credit card required to start."
    },
    {
      question: "How do expert sessions work?",
      answer: "You can book 30 or 60-minute video calls with certified child development experts. Sessions are available 24/7 and can be scheduled through our easy booking system. Each expert specializes in different areas of child development."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your MyDeck Club subscription at any time. There are no cancellation fees or hidden charges. You'll continue to have access to Club features until the end of your billing period."
    },
    {
      question: "What age groups do you support?",
      answer: "MyDeck Club supports children from birth to 12 years old. Our experts and recommendations are tailored to specific developmental stages and milestones for each age group."
    },
    {
      question: "How much can I save with toy discounts?",
      answer: "MyDeck Club members save up to 30% on premium educational toys from our curated marketplace. Discounts vary by product and brand, with exclusive member-only deals available regularly."
    },
    {
      question: "Are the insights and recommendations personalized?",
      answer: "Absolutely! All recommendations are based on your child's personalisation quiz, ongoing assessments, and expert sessions. Our AI analyzes your child's unique development pattern to provide tailored guidance."
    },
    {
      question: "What if I need help during off-hours?",
      answer: "MyDeck Club members get priority support with responses typically within 2 hours. For urgent developmental concerns, our expert session booking system is available 24/7."
    },
    {
      question: "Can I upgrade from the free plan later?",
      answer: "Yes, you can upgrade to MyDeck Club at any time. Your existing data and progress will be preserved, and you'll immediately gain access to all premium features."
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-forest mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about MyDeck Club
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-medium text-forest hover:text-warm-sage">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pt-2 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default MembershipFAQs;
