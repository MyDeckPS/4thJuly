
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Users, TestTube, Trophy } from "lucide-react";
import AdminSalesSection from "./AdminSalesSection";
import PaymentTestingSection from "./PaymentTestingSection";
import AdminChallengesSection from "./AdminChallengesSection";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<'sales' | 'users' | 'reports' | 'settings' | 'testing' | 'challenges'>('sales');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'sales':
        return <AdminSalesSection />;
      case 'users':
        return (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>User management content goes here.</p>
            </CardContent>
          </Card>
        );
      case 'reports':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Reports and Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Reports and analytics content goes here.</p>
            </CardContent>
          </Card>
        );
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Settings content goes here.</p>
            </CardContent>
          </Card>
        );
      case 'testing':
        return <PaymentTestingSection />;
      case 'challenges':
        return <AdminChallengesSection />;
      default:
        return <AdminSalesSection />;
    }
  };

  return (
    <div className="min-h-screen bg-warm-peach">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-forest">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your platform efficiently</p>
        </header>
        
        <nav className="flex flex-wrap gap-2 mb-8">
          {[
            { key: 'sales', label: 'Sales', icon: DollarSign },
            { key: 'users', label: 'Users', icon: Users },
            { key: 'reports', label: 'Reports', icon: FileText },
            { key: 'challenges', label: 'Challenges', icon: Trophy },
            { key: 'testing', label: 'Payment Testing', icon: TestTube },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeSection === key ? "default" : "outline"}
              onClick={() => setActiveSection(key as 'sales' | 'users' | 'reports' | 'settings' | 'testing' | 'challenges')}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </nav>

        {renderActiveSection()}
      </div>
    </div>
  );
};

export default AdminDashboard;
