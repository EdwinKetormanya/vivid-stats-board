import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Users, School, LogOut } from "lucide-react";
import { SchoolManager } from "@/components/SchoolManager";
import { UserRoleManager } from "@/components/UserRoleManager";
import { SystemOverview } from "@/components/SystemOverview";

const SuperAdmin = () => {
  const { signOut } = useAuth();
  const { profile, hasRole, loading } = useProfile();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not super admin
  if (!hasRole("super_admin")) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">
                  Super Admin Panel
                </h1>
                <p className="text-muted-foreground text-sm">
                  {profile?.full_name || profile?.email}
                </p>
              </div>
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Shield className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="schools" className="gap-2">
              <School className="w-4 h-4" />
              School Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SystemOverview />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User & Role Management</CardTitle>
                <CardDescription>
                  Assign roles (Super Admin, School Admin, Teacher) to users and manage their school assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserRoleManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schools" className="space-y-6">
            <SchoolManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SuperAdmin;
