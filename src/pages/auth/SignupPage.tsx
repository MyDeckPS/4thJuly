import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface SignupForm {
  name: string;
  email: string;
  password: string;
}

const SignupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    
    const { error } = await signUp(data.email, data.password, data.name);
    
    if (error) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      // Ensure users are directed to the correct enhanced quiz route
      navigate("/enhanced-quiz");
    }
    
    setIsLoading(false);
  };

  return (
    <AuthLayout 
      title="Create Your Account" 
      description="Join MyDeck and start your personalized journey"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[#2E2E2E]">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            className="bg-[#F5F5F5] text-[#2E2E2E] border border-gray-200 focus:border-[#FB5607] focus:ring-[#FB5607]"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <p className="text-sm text-[#FB5607]">{errors.name.message}</p>
          )}
        </div>

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
            placeholder="Create a password"
            className="bg-[#F5F5F5] text-[#2E2E2E] border border-gray-200 focus:border-[#FB5607] focus:ring-[#FB5607]"
            {...register("password", { 
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
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
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>

        <div className="text-center text-sm">
          <span className="text-[#757575]">Already have an account? </span>
          <Link to="/login" className="text-[#FB5607] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
