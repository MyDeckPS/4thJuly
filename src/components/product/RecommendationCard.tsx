
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface RecommendationProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  featured: boolean;
  amazon_affiliate_link: string;
}

interface RecommendationCardProps {
  product: RecommendationProduct;
}

const RecommendationCard = ({ product }: RecommendationCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      currencyDisplay: 'symbol'
    }).format(price).replace('₹', '₹');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{product.description}</p>
        </div>
        
        <div className="space-y-3">
          {product.featured && (
            <Badge variant="secondary" className="w-fit">
              Featured
            </Badge>
          )}
          
          {product.price > 0 && (
            <div className="text-lg font-semibold">
              {formatPrice(product.price)}
            </div>
          )}
          
          <Button
            asChild
            className="w-full"
            variant="outline"
          >
            <a
              href={product.amazon_affiliate_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              View on Amazon
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
