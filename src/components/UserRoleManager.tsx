import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Trash2, Mail, Shield, GraduationCap, Building2 } from "lucide-react";
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
  school_id: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "super_admin" | "school_admin" | "teacher";
  school_id: string | null;
}

interface School {
  id: string;
  name: string;
}

interface UserWithRoles extends Profile {
  roles: UserRole[];
  school_name?: string;
}

export const UserRoleManager = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"super_admin" | "school_admin" | "teacher">("teacher");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Log profile access for audit (bulk query by school admin)
      if (profilesData && profilesData.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user?.id || "");
        
        const isSchoolAdmin = userRoles?.some(r => r.role === "school_admin");
        
        if (isSchoolAdmin && user) {
          await supabase.from("profile_access_logs").insert({
            accessed_by: user.id,
            accessed_profile_id: user.id, // Self-reference for bulk queries
            access_type: "bulk_query"
          });
        }
      }

      // Load roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Load schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from("schools")
        .select("*")
        .order("name");

      if (schoolsError) throw schoolsError;

      // Combine data
      const usersWithRoles: UserWithRoles[] = (profilesData || []).map((profile) => {
        const userRoles = (rolesData || []).filter((r) => r.user_id === profile.id);
        const school = (schoolsData || []).find((s) => s.id === profile.school_id);
        
        return {
          ...profile,
          roles: userRoles,
          school_name: school?.name,
        };
      });

      setUsers(usersWithRoles);
      setSchools(schoolsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast.error("Please select a user and role");
      return;
    }

    if ((selectedRole === "school_admin" || selectedRole === "teacher") && !selectedSchoolId) {
      toast.error("Please select a school for this role");
      return;
    }

    try {
      // Check if role already exists
      const user = users.find((u) => u.id === selectedUserId);
      const existingRole = user?.roles.find((r) => r.role === selectedRole);

      if (existingRole) {
        toast.error("User already has this role");
        return;
      }

      // Insert role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: selectedUserId,
        role: selectedRole,
        school_id: selectedRole === "super_admin" ? null : selectedSchoolId,
      });

      if (roleError) throw roleError;

      // Update profile school_id if needed
      if (selectedRole !== "super_admin" && selectedSchoolId) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ school_id: selectedSchoolId })
          .eq("id", selectedUserId);

        if (profileError) throw profileError;
      }

      toast.success("Role assigned successfully!");
      setSelectedUserId("");
      setSelectedRole("teacher");
      setSelectedSchoolId("");
      loadData();
    } catch (error: any) {
      console.error("Error assigning role:", error);
      toast.error("Failed to assign role: " + error.message);
    }
  };

  const handleDeleteClick = (roleId: string) => {
    setRoleToDelete(roleId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleToDelete);

      if (error) throw error;

      toast.success("Role removed successfully");
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      loadData();
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to remove role");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Shield className="w-3 h-3" />;
      case "school_admin":
        return <Building2 className="w-3 h-3" />;
      case "teacher":
        return <GraduationCap className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "school_admin":
        return "default";
      case "teacher":
        return "secondary";
      default:
        return "default";
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
      {/* Assign Role Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Assign New Role
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="user-select">Select User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Choose user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="role-select">Role</Label>
            <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
              <SelectTrigger id="role-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="school_admin">School Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="school-select">School {selectedRole !== "super_admin" && "*"}</Label>
            <Select
              value={selectedSchoolId}
              onValueChange={setSelectedSchoolId}
              disabled={selectedRole === "super_admin"}
            >
              <SelectTrigger id="school-select">
                <SelectValue placeholder={selectedRole === "super_admin" ? "N/A" : "Choose school"} />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleAssignRole} className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Role
            </Button>
          </div>
        </div>
      </Card>

      {/* Users List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Users ({users.length})</h3>
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="font-medium truncate">{user.full_name || user.email}</p>
                  </div>
                  {user.email !== user.full_name && (
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  )}
                  {user.school_name && (
                    <p className="text-xs text-muted-foreground mt-1">
                      School: {user.school_name}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.roles.length === 0 ? (
                      <Badge variant="outline" className="text-xs">No roles assigned</Badge>
                    ) : (
                      user.roles.map((role) => (
                        <div key={role.id} className="flex items-center gap-1">
                          <Badge variant={getRoleBadgeVariant(role.role)} className="gap-1">
                            {getRoleIcon(role.role)}
                            {role.role.replace("_", " ")}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeleteClick(role.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No users found
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this role from the user. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToDelete(null)}>
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
