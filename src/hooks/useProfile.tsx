import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  school_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: "super_admin" | "school_admin" | "teacher";
  school_id: string | null;
  created_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch roles
        const { data: rolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id);

        if (rolesError) throw rolesError;
        setRoles(rolesData || []);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const hasRole = (role: "super_admin" | "school_admin" | "teacher") => {
    return roles.some((r) => r.role === role);
  };

  return { profile, roles, loading, hasRole };
};
