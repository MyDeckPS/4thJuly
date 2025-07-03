
import { useParams } from "react-router-dom";
import DynamicPageComponent from "@/components/DynamicPageComponent";

const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Page</h1>
          <p className="text-muted-foreground">The page URL is not valid.</p>
        </div>
      </div>
    );
  }

  return <DynamicPageComponent slug={slug} />;
};

export default DynamicPage;
