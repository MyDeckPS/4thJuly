import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, user, isFirstTimeUser, loading } = useAuth();

  // Redirect logic after successful login
  useEffect(() => {
    if (!loading && user && isFirstTimeUser !== null) {
      if (isFirstTimeUser) {
        console.log('User needs to complete quiz, redirecting...');
        navigate("/enhanced-quiz");
      } else {
        console.log('User has completed quiz, redirecting to dashboard...');
        navigate("/dashboard");
      }
    }
  }, [user, isFirstTimeUser, loading, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      // Redirect logic is handled by useEffect above
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      description="Sign in to your MyDeck account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#2E2E2E]">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="bg-[#F5F5F5] text-[#2E2E2E] border border-gray-200 focus:border-[#FB5607] focus:ring-[#FB5607]"
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address"
              }
            })}
          />
          {errors.email && (
            <p className="text-sm text-[#FB5607]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[#2E2E2E]">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="bg-[#F5F5F5] text-[#2E2E2E] border border-gray-200 focus:border-[#FB5607] focus:ring-[#FB5607]"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="text-sm text-[#FB5607]">{errors.password.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#FB5607] hover:bg-[#e65100] text-white rounded-lg shadow-md text-lg font-semibold py-3"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="text-center text-sm">
          <span className="text-[#757575]">Don't have an account? </span>
          <Link to="/signup" className="text-[#FB5607] hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
