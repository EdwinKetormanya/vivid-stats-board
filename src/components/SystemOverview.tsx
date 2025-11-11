import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, School, GraduationCap, BookOpen } from "lucide-react";

interface SystemStats {
  totalUsers: number;
  totalSchools: number;
  totalClasses: number;
  totalStudents: number;
  superAdmins: number;
  schoolAdmins: number;
  teachers: number;
}

export const SystemOverview = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalSchools: 0,
    totalClasses: 0,
    totalStudents: 0,
    superAdmins: 0,
    schoolAdmins: 0,
    teachers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get total users
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get total schools
      const { count: schoolsCount } = await supabase
        .from("schools")
        .select("*", { count: "exact", head: true });

      // Get total classes
      const { count: classesCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true });

      // Get total students
      const { count: studentsCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });

      // Get role counts
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role");

      const superAdmins = rolesData?.filter((r) => r.role === "super_admin").length || 0;
      const schoolAdmins = rolesData?.filter((r) => r.role === "school_admin").length || 0;
      const teachers = rolesData?.filter((r) => r.role === "teacher").length || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalSchools: schoolsCount || 0,
        totalClasses: classesCount || 0,
        totalStudents: studentsCount || 0,
        superAdmins,
        schoolAdmins,
        teachers,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">System Overview</h2>
        <p className="text-muted-foreground">
          Overview of all users, schools, classes, and students in the system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.superAdmins} Super Admin, {stats.schoolAdmins} School Admin, {stats.teachers} Teachers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Enrolled students
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Use the <strong>User Management</strong> tab to assign roles to users</p>
            <p>• Use the <strong>School Management</strong> tab to add or remove schools</p>
            <p>• Super admins have full access to all system features</p>
            <p>• School admins can manage their assigned school</p>
            <p>• Teachers can manage their classes and students</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
