import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogCardProps {
  id: string;
  title: string;
  heroImage: string;
  readTime: string;
  category: string;
  excerpt?: string | null;
}

const BlogCard = ({ id, title, heroImage, readTime, category, excerpt }: BlogCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="aspect-video overflow-hidden">
        <img 
          src={heroImage} 
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-[#8338EC] text-white">
            {category}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{readTime}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-forest mb-2 line-clamp-2">
          {title}
        </h3>
        
        {excerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {excerpt}
          </p>
        )}
        
        <div className="flex-1" />
        <Link to={`/blogs/${id}`} className="block mt-4">
          <Button className="bg-[#FB5607] hover:bg-[#e65100] text-white w-full">
            Read Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
