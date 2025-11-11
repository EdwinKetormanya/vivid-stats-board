import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, BookOpen, GraduationCap, ArrowLeft, UserPlus, Trash2, Upload, Download, CheckCircle2, AlertCircle, XCircle, Search, X } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface UserWithRole extends Profile {
  role: "teacher" | "school_admin" | null;
}

interface Class {
  id: string;
  name: string;
  term: string | null;
  year: string | null;
  teacher_id: string | null;
  teacher?: {
    full_name: string | null;
    email: string;
  };
  student_count: number;
}

interface School {
  id: string;
  name: string;
  region: string | null;
  district: string | null;
}

const SchoolAdmin = () => {
  const { signOut } = useAuth();
  const { profile, loading: profileLoading, hasRole } = useProfile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<School | null>(null);
  const [teachers, setTeachers] = useState<UserWithRole[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalClasses: 0,
    totalStudents: 0,
  });

  // Add teacher state
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherRole, setNewTeacherRole] = useState<"teacher" | "school_admin">("teacher");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingTeacher, setPendingTeacher] = useState<{
    email: string;
    name: string | null;
    role: "teacher" | "school_admin";
    profileId: string;
  } | null>(null);
  
  // Bulk import confirmation state
  const [bulkConfirmDialogOpen, setBulkConfirmDialogOpen] = useState(false);
  const [pendingBulkTeachers, setPendingBulkTeachers] = useState<Array<{
    email: string;
    fullName?: string;
    role: "teacher" | "school_admin";
    validationStatus: "valid" | "not_found" | "already_added" | "validating";
    profileId?: string;
    existingName?: string;
  }>>([]);
  const [bulkImportFilter, setBulkImportFilter] = useState<"all" | "valid" | "errors">("all");
  const [bulkImportSearch, setBulkImportSearch] = useState("");

  useEffect(() => {
    if (!profileLoading && !hasRole("school_admin") && !hasRole("super_admin")) {
      navigate("/");
      toast.error("Access denied. School admin privileges required.");
    }
  }, [profileLoading, hasRole, navigate]);

  useEffect(() => {
    if (profile?.school_id) {
      loadSchoolData();
    }
  }, [profile]);

  const loadSchoolData = async () => {
    if (!profile?.school_id) return;

    setLoading(true);
    try {
      // Load school info
      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .select("*")
        .eq("id", profile.school_id)
        .single();

      if (schoolError) throw schoolError;
      setSchool(schoolData);

      // Load teachers and their roles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("school_id", profile.school_id);

      if (profilesError) throw profilesError;

      // Get roles for these users
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("school_id", profile.school_id)
        .in("role", ["teacher", "school_admin"]);

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const teachersWithRoles: UserWithRole[] = (profilesData || []).map((p) => ({
        ...p,
        role: (rolesData?.find((r) => r.user_id === p.id)?.role as "teacher" | "school_admin") || null,
      })).filter((t) => t.role !== null);

      setTeachers(teachersWithRoles);

      // Load classes with teacher info and student count
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select(`
          id,
          name,
          term,
          year,
          teacher_id
        `)
        .eq("school_id", profile.school_id)
        .order("created_at", { ascending: false });

      if (classesError) throw classesError;

      // Get student counts for each class
      const classesWithCounts = await Promise.all(
        (classesData || []).map(async (cls) => {
          const { count } = await supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .eq("class_id", cls.id);

          // Get teacher info
          const teacher = teachersWithRoles.find((t) => t.id === cls.teacher_id);

          return {
            ...cls,
            student_count: count || 0,
            teacher: teacher
              ? { full_name: teacher.full_name, email: teacher.email }
              : undefined,
          };
        })
      );

      setClasses(classesWithCounts);

      // Calculate stats
      const totalStudents = classesWithCounts.reduce((sum, cls) => sum + cls.student_count, 0);
      setStats({
        totalTeachers: teachersWithRoles.length,
        totalClasses: classesWithCounts.length,
        totalStudents,
      });
    } catch (error) {
      console.error("Error loading school data:", error);
      toast.error("Failed to load school data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacherEmail.trim() || !profile?.school_id) {
      toast.error("Please enter a teacher's email");
      return;
    }

    try {
      // Find user by email
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("email", newTeacherEmail.trim())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        toast.error("User not found. They need to sign up first.");
        return;
      }

      // Show confirmation dialog
      setPendingTeacher({
        email: newTeacherEmail.trim(),
        name: profileData.full_name,
        role: newTeacherRole,
        profileId: profileData.id,
      });
      setConfirmDialogOpen(true);
    } catch (error: any) {
      console.error("Error validating teacher:", error);
      toast.error("Failed to validate teacher: " + error.message);
    }
  };

  const confirmAddTeacher = async () => {
    if (!pendingTeacher || !profile?.school_id) return;

    try {
      // Update profile with school_id
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ school_id: profile.school_id })
        .eq("id", pendingTeacher.profileId);

      if (updateError) throw updateError;

      // Add role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: pendingTeacher.profileId,
          role: pendingTeacher.role,
          school_id: profile.school_id,
        });

      if (roleError) throw roleError;

      toast.success(`${pendingTeacher.role === "teacher" ? "Teacher" : "School admin"} added successfully`);
      setNewTeacherEmail("");
      setShowAddTeacher(false);
      setConfirmDialogOpen(false);
      setPendingTeacher(null);
      loadSchoolData();
    } catch (error: any) {
      console.error("Error adding teacher:", error);
      toast.error("Failed to add teacher: " + error.message);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.school_id) return;

    setIsUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<{
        email?: string;
        Email?: string;
        full_name?: string;
        name?: string;
        Name?: string;
        role?: string;
        Role?: string;
      }>;

      if (jsonData.length === 0) {
        toast.error("The Excel file is empty");
        setIsUploading(false);
        return;
      }

      // Process teachers data
      const teachersToProcess: Array<{
        email: string;
        fullName?: string;
        role: "teacher" | "school_admin";
      }> = [];

      jsonData.forEach((row) => {
        const email = (row.email || row.Email)?.toString().trim().toLowerCase();
        const fullName = (row.full_name || row.name || row.Name)?.toString().trim();
        const roleStr = (row.role || row.Role)?.toString().toLowerCase();
        
        let role: "teacher" | "school_admin" = "teacher";
        if (roleStr === "school_admin" || roleStr === "admin") {
          role = "school_admin";
        }

        if (email) {
          teachersToProcess.push({ email, fullName, role });
        }
      });

      if (teachersToProcess.length === 0) {
        toast.error("No valid teachers found. Please ensure there's an 'email' column.");
        setIsUploading(false);
        return;
      }

      // Validate each teacher against the database
      const validatedTeachers = await Promise.all(
        teachersToProcess.map(async (teacher) => {
          try {
            // Check if user exists
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("id, full_name")
              .eq("email", teacher.email)
              .maybeSingle();

            if (profileError || !profileData) {
              return {
                ...teacher,
                validationStatus: "not_found" as const,
              };
            }

            // Check if already has a role at this school
            const { data: existingRole } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", profileData.id)
              .eq("school_id", profile.school_id)
              .maybeSingle();

            if (existingRole) {
              return {
                ...teacher,
                validationStatus: "already_added" as const,
                profileId: profileData.id,
                existingName: profileData.full_name,
              };
            }

            return {
              ...teacher,
              validationStatus: "valid" as const,
              profileId: profileData.id,
              existingName: profileData.full_name,
            };
          } catch (error) {
            return {
              ...teacher,
              validationStatus: "not_found" as const,
            };
          }
        })
      );

      // Show confirmation dialog with validated preview
      setPendingBulkTeachers(validatedTeachers);
      setBulkConfirmDialogOpen(true);
      setIsUploading(false);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process the Excel file");
      setIsUploading(false);
    }
  };

  const confirmBulkImport = async () => {
    if (pendingBulkTeachers.length === 0 || !profile?.school_id) return;

    // Filter only valid teachers
    const validTeachers = pendingBulkTeachers.filter(t => t.validationStatus === "valid");
    
    if (validTeachers.length === 0) {
      toast.error("No valid teachers to import");
      return;
    }

    setIsUploading(true);
    setBulkConfirmDialogOpen(false);

    try {
      let successCount = 0;
      let errorCount = 0;

      // Process only valid teachers
      for (const teacher of validTeachers) {
        try {
          if (!teacher.profileId) continue;

          // Update profile with school_id
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ school_id: profile.school_id })
            .eq("id", teacher.profileId);

          if (updateError) {
            errorCount++;
            continue;
          }

          // Add role
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
              user_id: teacher.profileId,
              role: teacher.role,
              school_id: profile.school_id,
            });

          if (roleError) {
            errorCount++;
            continue;
          }

          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} teacher(s)`);
        loadSchoolData();
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} teacher(s) failed to add`);
      }

      const skippedCount = pendingBulkTeachers.length - validTeachers.length;
      if (skippedCount > 0) {
        toast.info(`${skippedCount} teacher(s) skipped (not found or already added)`);
      }

      setPendingBulkTeachers([]);
    } catch (error) {
      console.error("Error importing teachers:", error);
      toast.error("Failed to import teachers");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (teacherId: string) => {
    setTeacherToDelete(teacherId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete || !profile?.school_id) return;

    try {
      // Remove role
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", teacherToDelete)
        .eq("school_id", profile.school_id);

      if (roleError) throw roleError;

      // Remove school assignment
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ school_id: null })
        .eq("id", teacherToDelete);

      if (updateError) throw updateError;

      toast.success("Teacher removed from school");
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
      loadSchoolData();
    } catch (error) {
      console.error("Error removing teacher:", error);
      toast.error("Failed to remove teacher");
    }
  };

  const handleExportTeachers = () => {
    if (teachers.length === 0) {
      toast.error("No teachers to export");
      return;
    }

    try {
      // Prepare data for export
      const exportData = teachers.map((teacher) => ({
        email: teacher.email,
        name: teacher.full_name || "",
        role: teacher.role === "school_admin" ? "school_admin" : "teacher",
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 30 }, // email
        { wch: 25 }, // name
        { wch: 15 }, // role
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");

      // Generate filename
      const fileName = `${school?.name || 'school'}-teachers-${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, fileName);
      
      toast.success("Teachers list exported successfully!");
    } catch (error) {
      console.error("Error exporting teachers:", error);
      toast.error("Failed to export teachers list");
    }
  };

  const handleDownloadTemplate = () => {
    try {
      // Create template data with example row
      const templateData = [
        {
          email: "teacher@example.com",
          name: "John Doe",
          role: "teacher",
        },
        {
          email: "admin@example.com",
          name: "Jane Smith",
          role: "school_admin",
        },
      ];

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 30 }, // email
        { wch: 25 }, // name
        { wch: 15 }, // role
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers Template");

      // Download file
      XLSX.writeFile(workbook, "teachers-import-template.xlsx");
      
      toast.success("Template downloaded successfully!");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile?.school_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="text-center max-w-md">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">No School Assignment</h2>
          <p className="text-muted-foreground mb-4">
            You need to be assigned to a school to access the admin dashboard.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  School Admin Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">{school?.name}</p>
              </div>
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <p className="text-2xl font-bold">{stats.totalTeachers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary/10">
                <GraduationCap className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Teachers Management */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Teachers & Admins</h2>
            <div className="flex gap-2">
              <Button onClick={handleExportTeachers} variant="outline" disabled={teachers.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export List
              </Button>
              <Button onClick={() => setShowAddTeacher(!showAddTeacher)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
            </div>
          </div>

          {/* Bulk Upload Section */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-semibold mb-4">Bulk Upload Teachers</h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Upload an Excel file (.xlsx, .xls) with teacher information.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Required column:</strong> email or Email
                  <br />
                  <strong>Optional columns:</strong> name, full_name, Name (teacher's name), role, Role (teacher or school_admin)
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Example: | email | name | role |
                  <br />
                  Note: Teachers must sign up before they can be added to your school.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleBulkUpload}
                className="hidden"
                id="bulk-upload-teachers"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button
                  onClick={handleDownloadTemplate}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Excel File"}
                </Button>
              </div>
            </div>
          </div>

          {showAddTeacher && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-semibold mb-4">Add Single Teacher</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teacher-email">Teacher Email</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder="teacher@example.com"
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTeacher()}
                  />
                </div>
                <div>
                  <Label htmlFor="teacher-role">Role</Label>
                  <Select value={newTeacherRole} onValueChange={(v) => setNewTeacherRole(v as "teacher" | "school_admin")}>
                    <SelectTrigger id="teacher-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="school_admin">School Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddTeacher} className="flex-1">
                    Add
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddTeacher(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">
                    {teacher.full_name || "Not set"}
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    <Badge variant={teacher.role === "school_admin" ? "default" : "secondary"}>
                      {teacher.role === "school_admin" ? "School Admin" : "Teacher"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(teacher.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {teachers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No teachers added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Classes Overview */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Classes Overview</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead className="text-right">Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.term || "Not set"}</TableCell>
                  <TableCell>{cls.year || "Not set"}</TableCell>
                  <TableCell>
                    {cls.teacher?.full_name || cls.teacher?.email || "Not assigned"}
                  </TableCell>
                  <TableCell className="text-right">{cls.student_count}</TableCell>
                </TableRow>
              ))}
              {classes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No classes created yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </main>

      {/* Add Teacher Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Add Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              Please review the details before adding this teacher to your school.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {pendingTeacher && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <span className="text-sm font-semibold">{pendingTeacher.email}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Name:</span>
                <span className="text-sm font-semibold">{pendingTeacher.name || "Not set"}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Role:</span>
                <Badge variant={pendingTeacher.role === "school_admin" ? "default" : "secondary"}>
                  {pendingTeacher.role === "school_admin" ? "School Admin" : "Teacher"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">School:</span>
                <span className="text-sm font-semibold">{school?.name}</span>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTeacher(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmAddTeacher}>
              Add Teacher
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Import Confirmation Dialog */}
      <AlertDialog open={bulkConfirmDialogOpen} onOpenChange={setBulkConfirmDialogOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Teacher Import</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Review the {pendingBulkTeachers.length} teacher(s) before importing.</p>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {pendingBulkTeachers.filter(t => t.validationStatus === "valid").length} Ready to import
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  {pendingBulkTeachers.filter(t => t.validationStatus === "already_added").length} Already added
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  {pendingBulkTeachers.filter(t => t.validationStatus === "not_found").length} Not found
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {/* Search and Filter */}
          <div className="space-y-3 px-1">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={bulkImportSearch}
                onChange={(e) => setBulkImportSearch(e.target.value)}
                className="pl-9 pr-9"
              />
              {bulkImportSearch && (
                <button
                  onClick={() => setBulkImportSearch("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Filter Tabs */}
            <Tabs value={bulkImportFilter} onValueChange={(v) => setBulkImportFilter(v as "all" | "valid" | "errors")} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="text-xs">
                  All ({pendingBulkTeachers.length})
                </TabsTrigger>
                <TabsTrigger value="valid" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Valid ({pendingBulkTeachers.filter(t => t.validationStatus === "valid").length})
                </TabsTrigger>
                <TabsTrigger value="errors" className="text-xs">
                  <XCircle className="w-3 h-3 mr-1" />
                  Errors ({pendingBulkTeachers.filter(t => t.validationStatus === "not_found" || t.validationStatus === "already_added").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="overflow-auto flex-1 py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBulkTeachers
                  .filter(teacher => {
                    // Apply status filter
                    if (bulkImportFilter === "valid") {
                      if (teacher.validationStatus !== "valid") return false;
                    }
                    if (bulkImportFilter === "errors") {
                      if (teacher.validationStatus !== "not_found" && teacher.validationStatus !== "already_added") return false;
                    }
                    
                    // Apply search filter
                    if (bulkImportSearch.trim()) {
                      const searchLower = bulkImportSearch.toLowerCase();
                      const emailMatch = teacher.email.toLowerCase().includes(searchLower);
                      const nameMatch = 
                        teacher.fullName?.toLowerCase().includes(searchLower) ||
                        teacher.existingName?.toLowerCase().includes(searchLower);
                      
                      if (!emailMatch && !nameMatch) return false;
                    }
                    
                    return true;
                  })
                  .map((teacher, index) => (
                  <TableRow key={index} className={
                    teacher.validationStatus === "not_found" ? "bg-red-50 dark:bg-red-950/20" :
                    teacher.validationStatus === "already_added" ? "bg-orange-50 dark:bg-orange-950/20" :
                    "bg-green-50 dark:bg-green-950/20"
                  }>
                    <TableCell>
                      {teacher.validationStatus === "valid" && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs">Ready</span>
                        </div>
                      )}
                      {teacher.validationStatus === "already_added" && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">Exists</span>
                        </div>
                      )}
                      {teacher.validationStatus === "not_found" && (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">Not found</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{teacher.email}</TableCell>
                    <TableCell>
                      {teacher.validationStatus === "valid" || teacher.validationStatus === "already_added" ? (
                        <span className="font-medium">{teacher.existingName || teacher.fullName || <span className="text-muted-foreground italic">Not set</span>}</span>
                      ) : (
                        <span className="text-muted-foreground italic">User needs to sign up</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={teacher.role === "school_admin" ? "default" : "secondary"}>
                        {teacher.role === "school_admin" ? "School Admin" : "Teacher"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingBulkTeachers.filter(teacher => {
                  // Apply status filter
                  if (bulkImportFilter === "valid") {
                    if (teacher.validationStatus !== "valid") return false;
                  }
                  if (bulkImportFilter === "errors") {
                    if (teacher.validationStatus !== "not_found" && teacher.validationStatus !== "already_added") return false;
                  }
                  
                  // Apply search filter
                  if (bulkImportSearch.trim()) {
                    const searchLower = bulkImportSearch.toLowerCase();
                    const emailMatch = teacher.email.toLowerCase().includes(searchLower);
                    const nameMatch = 
                      teacher.fullName?.toLowerCase().includes(searchLower) ||
                      teacher.existingName?.toLowerCase().includes(searchLower);
                    
                    if (!emailMatch && !nameMatch) return false;
                  }
                  
                  return true;
                }).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      {bulkImportSearch.trim() ? "No teachers match your search" : "No teachers to display in this filter"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingBulkTeachers([])}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkImport}
              disabled={pendingBulkTeachers.filter(t => t.validationStatus === "valid").length === 0}
            >
              Import {pendingBulkTeachers.filter(t => t.validationStatus === "valid").length} Valid Teacher{pendingBulkTeachers.filter(t => t.validationStatus === "valid").length !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the teacher from your school and revoke their access. They will need to be reassigned to access the system again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTeacherToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SchoolAdmin;
