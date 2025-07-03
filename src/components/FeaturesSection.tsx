import { Shield, Star, Truck, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Expert Curated",
    description: "Every toy is selected by child development specialists"
  },
  {
    icon: Star,
    title: "Quality Guaranteed",
    description: "Premium, safe materials that last for years of play"
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Free shipping on orders over $50 with 2-day delivery"
  },
  {
    icon: HeartHandshake,
    title: "30-Day Returns",
    description: "Not satisfied? Return any item within 30 days"
  }
];

const FeaturesSection = () => (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
              <feature.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection; 