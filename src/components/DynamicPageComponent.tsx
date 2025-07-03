import { useDynamicPage } from "@/hooks/useDynamicPages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
interface DynamicPageComponentProps {
  slug: string;
}
const DynamicPageComponent = ({
  slug
}: DynamicPageComponentProps) => {
  const {
    data: page,
    isLoading,
    error
  } = useDynamicPage(slug);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  if (isLoading) {
    return <>
        <Navigation />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-6 py-[40px]">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-32 mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>;
  }
  if (error || !page) {
    return <>
        <Navigation />
        <div className="min-h-screen bg-background py-[120px] my-[40px]">
          <div className="container mx-auto px-6 py-[40px]">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>;
  }
  return <>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-[40px]">
          <div className="max-w-4xl mx-auto py-[80px]">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
              <p className="text-sm text-muted-foreground">
                Last updated: {formatDate(page.updated_at)}
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{
                __html: page.body
              }} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>;
};
export default DynamicPageComponent;