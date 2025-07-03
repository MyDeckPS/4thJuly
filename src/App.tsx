import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import ScrollToTop from "@/components/ScrollToTop";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";

// Page imports
import Index from "./pages/Index";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import EnhancedQuizPage from "./pages/EnhancedQuizPage";
import ShopPage from "./pages/ShopPage";
import CollectionPage from "./pages/CollectionPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import BookingsPage from "./pages/BookingsPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import AllBookingsPage from "./pages/AllBookingsPage";
import MembershipPage from "./pages/MembershipPage";
import ManageMembershipPage from "./pages/ManageMembershipPage";
import BlogsPage from "./pages/BlogsPage";
import BlogPostPage from "./pages/BlogPostPage";
import DiariesPage from "./pages/DiariesPage";
import DiaryPostPage from "./pages/DiaryPostPage";
import PostNotePage from "./pages/PostNotePage";
import ChildInsightsPage from "./pages/ChildInsightsPage";
import AdminDashboard from "./pages/AdminDashboard";
import DynamicPage from "./pages/DynamicPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";
import UserDashboardPage from "./pages/UserDashboardPage";
import ExpertPage from "./pages/ExpertPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
              <Route path="/terms" element={<PublicRoute><TermsPage /></PublicRoute>} />
              
              {/* Shop Routes - Public but enhanced for authenticated users */}
              <Route path="/shop" element={<PublicRoute><ShopPage /></PublicRoute>} />
              <Route path="/collections/:id" element={<PublicRoute><CollectionPage /></PublicRoute>} />
              <Route path="/shop/product/:id" element={<PublicRoute><ProductDetailsPage /></PublicRoute>} />
              
              {/* Blog Routes - Public */}
              <Route path="/blogs" element={<PublicRoute><BlogsPage /></PublicRoute>} />
              <Route path="/blogs/:slug" element={<PublicRoute><BlogPostPage /></PublicRoute>} />
              
              {/* Dynamic Pages - Public */}
              <Route path="/pages/:slug" element={<PublicRoute><DynamicPage /></PublicRoute>} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
              <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
              <Route path="/child-insights" element={<Navigate to="/dashboard" replace />} />
              <Route path="/enhanced-quiz" element={<ProtectedRoute><EnhancedQuizPage /></ProtectedRoute>} />
              
              {/* Booking Routes */}
              <Route path="/booking" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
              <Route path="/booking-details/:id" element={<ProtectedRoute><BookingDetailsPage /></ProtectedRoute>} />
              <Route path="/all-bookings" element={<ProtectedRoute><AllBookingsPage /></ProtectedRoute>} />
              
              {/* Membership Routes */}
              <Route path="/membership" element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />
              <Route path="/manage-membership" element={<ProtectedRoute><ManageMembershipPage /></ProtectedRoute>} />
              
              {/* Community Routes */}
              <Route path="/diaries" element={<ProtectedRoute><DiariesPage /></ProtectedRoute>} />
              <Route path="/diaries/:id" element={<ProtectedRoute><DiaryPostPage /></ProtectedRoute>} />
              <Route path="/post-note" element={<ProtectedRoute><PostNotePage /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              
              {/* Legacy Redirects - Clean up redundant routes */}
              <Route path="/collection/:id" element={<Navigate to="/collections/:id" replace />} />
              <Route path="/product/:id" element={<Navigate to="/shop/product/:id" replace />} />
              <Route path="/products/:id" element={<Navigate to="/shop/product/:id" replace />} />
              <Route path="/blog/:slug" element={<Navigate to="/blogs/:slug" replace />} />
              <Route path="/diary/:id" element={<Navigate to="/diaries/:id" replace />} />
              
              {/* Expert Route */}
              <Route path="/expert" element={<PublicRoute><ExpertPage /></PublicRoute>} />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MobileBottomNav />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
