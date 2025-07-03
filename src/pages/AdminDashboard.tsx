import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import AdminProductsSection from "@/components/admin/AdminProductsSection";
import AdminCollectionsSection from "@/components/admin/AdminCollectionsSection";
import AdminBlogsSection from "@/components/admin/AdminBlogsSection";
import AdminHostsSection from "@/components/admin/AdminHostsSection";
import AdminBookingsSection from "@/components/admin/AdminBookingsSection";
import AdminTimeSlotsSection from "@/components/admin/AdminTimeSlotsSection";
import AdminMediaSection from "@/components/admin/AdminMediaSection";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminNotesSection from "@/components/admin/AdminNotesSection";
import AdminPagesSection from "@/components/admin/AdminPagesSection";
import AdminPricingSection from "@/components/admin/AdminPricingSection";
import AdminQuizSection from "@/components/admin/AdminQuizSection";
import AdminFooterSection from "@/components/admin/AdminFooterSection";
import AdminSectionsManager from "@/components/admin/AdminSectionsManager";
import AdminPlaypathSlideshowManager from "@/components/admin/AdminPlaypathSlideshowManager";
import AdminSalesSection from "@/components/admin/AdminSalesSection";
import AdminTagManagement from "@/components/admin/AdminTagManagement";
import AdminUserProductPurchases from "@/components/admin/AdminUserProductPurchases";
import AdminChallengesSection from "@/components/admin/AdminChallengesSection";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { data: userRole, isLoading } = useUserRole();
  const [activeSection, setActiveSection] = useState("bookings");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["playpath"]);

  const navigationCategories = [
    {
      id: "sales",
      title: "Sales",
      items: [
        { id: "sales", title: "Sales Dashboard", component: AdminSalesSection },
        { id: "users", title: "User Management", component: AdminUserManagement },
        { id: "product-purchases", title: "Product Purchases", component: AdminUserProductPurchases },
        { id: "challenges", title: "Challenges", component: AdminChallengesSection },
      ]
    },
    {
      id: "playpath",
      title: "Playpath",
      items: [
        { id: "bookings", title: "Bookings", component: AdminBookingsSection },
        { id: "timeslots", title: "Time Slots", component: AdminTimeSlotsSection },
        { id: "pricing", title: "Pricing", component: AdminPricingSection },
        { id: "hosts", title: "Hosts", component: AdminHostsSection },
        { id: "playpath-slideshows", title: "Hero Slideshows", component: AdminPlaypathSlideshowManager }
      ]
    },
    {
      id: "shop",
      title: "Shop",
      items: [
        { id: "products", title: "Products", component: AdminProductsSection },
        { id: "collections", title: "Collections", component: AdminCollectionsSection },
        { id: "tags", title: "Tag Management", component: AdminTagManagement }
      ]
    },
    {
      id: "content",
      title: "Content",
      items: [
        { id: "pages", title: "Pages", component: AdminPagesSection },
        { id: "blogs", title: "Blogs", component: AdminBlogsSection },
        { id: "notes", title: "Notes", component: AdminNotesSection },
        { id: "media", title: "Media", component: AdminMediaSection }
      ]
    },
    {
      id: "personalisation",
      title: "Personalisation",
      items: [
        { id: "quiz", title: "Quiz", component: AdminQuizSection }
      ]
    },
    {
      id: "site-management",
      title: "Site Management",
      items: [
        { id: "footer", title: "Footer", component: AdminFooterSection },
        { id: "sections", title: "Sections Management", component: AdminSectionsManager }
      ]
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const getCurrentComponent = () => {
    for (const category of navigationCategories) {
      const item = category.items.find(item => item.id === activeSection);
      if (item) {
        const Component = item.component;
        return <Component />;
      }
    }
    return <AdminBookingsSection />;
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50" style={{ marginTop: '80px' }}>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user || userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50" style={{ marginTop: '80px' }}>
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-2 mb-8 px-[16px] py-[16px] bg-rose-200 rounded-xl">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent text-left">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600 text-left">Manage your platform throughout</p>
          </div>

          {/* Main Layout with Sidebar */}
          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <nav className="space-y-2">
                {navigationCategories.map(category => (
                  <div key={category.id}>
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
                    >
                      <span className="font-semibold text-gray-700">{category.title}</span>
                      {expandedCategories.includes(category.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedCategories.includes(category.id) && (
                      <div className="ml-4 mt-2 space-y-1">
                        {category.items.map(item => (
                          <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full text-left p-2 rounded-md transition-all duration-200 ${
                              activeSection === item.id
                                ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                            }`}
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {getCurrentComponent()}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
