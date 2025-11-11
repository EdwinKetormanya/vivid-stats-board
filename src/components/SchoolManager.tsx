import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Lock, Unlock } from "lucide-react";
import { regions, ghanaRegionsDistricts } from "@/data/ghanaRegionsDistricts";
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

interface School {
  id: string;
  name: string;
  region: string | null;
  district: string | null;
}

export const SchoolManager = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [newSchool, setNewSchool] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<string | null>(null);

  const DEVELOPER_PASSWORD = "KPS2024!"; // Change this to a secure password

  useEffect(() => {
    if (isUnlocked) {
      fetchSchools();
    }
  }, [isUnlocked]);

  const fetchSchools = async () => {
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to fetch schools");
      console.error(error);
      return;
    }

    setSchools(data || []);
  };

  const handleUnlock = () => {
    if (password === DEVELOPER_PASSWORD) {
      setIsUnlocked(true);
      toast.success("Developer access granted");
    } else {
      toast.error("Incorrect password");
    }
  };

  const handleAddSchool = async () => {
    if (!newSchool.trim()) {
      toast.error("Please enter a school name");
      return;
    }

    const { error } = await supabase
      .from("schools")
      .insert({
        name: newSchool.trim(),
        region: selectedRegion || null,
        district: selectedDistrict || null,
      });

    if (error) {
      if (error.code === "23505") {
        toast.error("This school already exists");
      } else {
        toast.error("Failed to add school");
      }
      console.error(error);
      return;
    }

    toast.success("School added successfully");
    setNewSchool("");
    setSelectedRegion("");
    setSelectedDistrict("");
    fetchSchools();
  };

  const handleDeleteClick = (schoolId: string) => {
    setSchoolToDelete(schoolId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!schoolToDelete) return;

    const { error } = await supabase
      .from("schools")
      .delete()
      .eq("id", schoolToDelete);

    if (error) {
      toast.error("Failed to delete school");
      console.error(error);
      return;
    }

    toast.success("School deleted successfully");
    setDeleteDialogOpen(false);
    setSchoolToDelete(null);
    fetchSchools();
  };

  const districts = selectedRegion ? ghanaRegionsDistricts[selectedRegion] || [] : [];

  if (!isUnlocked) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-bold">Developer Access Required</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the developer password to manage schools
        </p>
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
          />
          <Button onClick={handleUnlock}>Unlock</Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Unlock className="w-5 h-5 text-success" />
            <h2 className="text-xl font-bold">School Management (Developer)</h2>
          </div>
          <Button variant="outline" onClick={() => setIsUnlocked(false)}>
            Lock
          </Button>
        </div>

        {/* Add School Section */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="text-lg font-semibold mb-4">Add New School</h3>
          <div className="space-y-4">
            <Input
              placeholder="School name"
              value={newSchool}
              onChange={(e) => setNewSchool(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSchool()}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Region (Optional)</label>
                <Select value={selectedRegion} onValueChange={(value) => {
                  setSelectedRegion(value);
                  setSelectedDistrict("");
                }}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {regions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">District (Optional)</label>
                <Select
                  value={selectedDistrict}
                  onValueChange={setSelectedDistrict}
                  disabled={!selectedRegion}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={selectedRegion ? "Select District" : "Select Region First"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {districts.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleAddSchool} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add School
            </Button>
          </div>
        </div>

        {/* Schools List */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Existing Schools ({schools.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {schools.map((school) => (
              <div
                key={school.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{school.name}</p>
                  {(school.region || school.district) && (
                    <p className="text-xs text-muted-foreground">
                      {school.region && school.region}
                      {school.region && school.district && " - "}
                      {school.district && school.district}
                    </p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteClick(school.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {schools.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No schools added yet
              </p>
            )}
          </div>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this school. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSchoolToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
