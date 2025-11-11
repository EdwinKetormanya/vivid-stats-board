import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Lock, Unlock, Upload } from "lucide-react";
import { regions, ghanaRegionsDistricts } from "@/data/ghanaRegionsDistricts";
import * as XLSX from "xlsx";
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<{
        name?: string;
        school_name?: string;
        School?: string;
        region?: string;
        Region?: string;
        district?: string;
        District?: string;
      }>;

      if (jsonData.length === 0) {
        toast.error("The Excel file is empty");
        setIsUploading(false);
        return;
      }

      // Map the data to our schema (support multiple column name variations)
      const schoolsToInsert = jsonData
        .map((row) => {
          const name = row.name || row.school_name || row.School;
          if (!name || typeof name !== "string") return null;

          return {
            name: name.trim(),
            region: (row.region || row.Region || null) as string | null,
            district: (row.district || row.District || null) as string | null,
          };
        })
        .filter((school): school is { name: string; region: string | null; district: string | null } => 
          school !== null
        );

      if (schoolsToInsert.length === 0) {
        toast.error("No valid schools found in the file. Please ensure there's a 'name' or 'school_name' column.");
        setIsUploading(false);
        return;
      }

      // Insert in batches to avoid timeouts
      const batchSize = 100;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < schoolsToInsert.length; i += batchSize) {
        const batch = schoolsToInsert.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from("schools")
          .insert(batch);

        if (error) {
          console.error("Batch insert error:", error);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} school(s)`);
        fetchSchools();
      }

      if (errorCount > 0) {
        toast.warning(`${errorCount} school(s) were skipped (possibly duplicates)`);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process the Excel file");
    } finally {
      setIsUploading(false);
    }
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

        {/* Bulk Upload Section */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="text-lg font-semibold mb-4">Bulk Upload Schools</h3>
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Upload an Excel file (.xlsx, .xls) with school information.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Required column:</strong> name, school_name, or School
                <br />
                <strong>Optional columns:</strong> region, Region, district, District
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Example: | name | region | district |
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleBulkUpload}
              className="hidden"
              id="bulk-upload"
            />
            
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
