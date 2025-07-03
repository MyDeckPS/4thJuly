import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const AuthLayout = ({
  children,
  title,
  description
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FFF8F1] relative">
      {/* Optional: Subtle grid or gradient background */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        <svg width="100%" height="100%" className="opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FB5607" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        </div>
      <div className="w-full max-w-md relative z-10">
        <Card className="border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-md p-0">
          <div className="flex flex-col items-center pt-8 pb-2">
            <img src="/MD.png" alt="Logo" className="mb-4" style={{ maxWidth: '120px', height: 'auto', display: 'block' }} />
            <CardHeader className="text-center p-0 mb-2">
              <CardTitle className="text-2xl font-bold text-[#2E2E2E] mb-1">{title}</CardTitle>
              <CardDescription className="text-base text-[#757575] mb-2">{description}</CardDescription>
          </CardHeader>
          </div>
          <CardContent className="pt-0 pb-8 px-8">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;