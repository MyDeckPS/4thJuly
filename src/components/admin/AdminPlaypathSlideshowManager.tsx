
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const AdminPlaypathSlideshowManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Playpath Banner Images</h3>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold mb-2">PlayPath Slideshows Deprecated</h3>
          <p className="text-muted-foreground">
            PlayPath slideshows have been removed from the system. Please use the Hero Slideshow section in Shop Sections instead.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlaypathSlideshowManager;
