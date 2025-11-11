import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/FileUpload";
import { StatCard } from "@/components/StatCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { InsightsPanel } from "@/components/InsightsPanel";
import { PrintReports } from "@/components/PrintReports";
import { TeacherRemarksSelector } from "@/components/TeacherRemarksSelector";
import { Footer } from "@/components/Footer";
import { Users, TrendingUp, Trophy, BarChart3, Printer, Download, LogOut, GraduationCap, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseExcelFile, calculateSubjectPerformance, calculateDashboardStats } from "@/utils/dataParser";
import { exportToExcel } from "@/utils/excelExporter";
import { LearnerScore } from "@/types/learner";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import kpsBrandLogo from "@/assets/kps-brand-logo.png";

interface Class {
  id: string;
  name: string;
  term: string | null;
  year: string | null;
  number_on_roll: number | null;
  vacation_date: string | null;
  reopening_date: string | null;
}

interface School {
  id: string;
  name: string;
  region: string | null;
  district: string | null;
  logo_url: string | null;
}

const Index = () => {
  const { signOut } = useAuth();
  const { profile, loading: profileLoading, hasRole } = useProfile();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<LearnerScore[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [showNewClassDialog, setShowNewClassDialog] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Load school data
  useEffect(() => {
    if (profile?.school_id) {
      loadSchool(profile.school_id);
    }
  }, [profile]);

  // Load classes for the user
  useEffect(() => {
    if (profile?.id) {
      loadClasses();
    }
  }, [profile]);

// Load students when class is selected
useEffect(() => {
  if (selectedClassId) {
    loadStudents(selectedClassId);
  } else {
    setStudents([]);
  }
}, [selectedClassId]);

// Ensure updated school logo reflects on all learners even if loaded earlier
useEffect(() => {
  if (school?.logo_url) {
    setStudents((prev) => prev.map((s) => ({ ...s, schoolLogo: school.logo_url || "" })));
  }
}, [school?.logo_url]);

  const loadSchool = async (schoolId: string) => {
    try {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("id", schoolId)
        .single();

      if (error) throw error;
      setSchool(data);
    } catch (error) {
      console.error("Error loading school:", error);
    }
  };

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", profile?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClasses(data || []);
      
      // Auto-select first class if available
      if (data && data.length > 0 && !selectedClassId) {
        setSelectedClassId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      toast.error("Failed to load classes");
    }
  };

  const loadStudents = async (classId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("class_id", classId)
        .order("position");

      if (error) throw error;

      // Transform database records to LearnerScore format
      const transformedStudents: LearnerScore[] = (data || []).map((student, index) => ({
        sn: index + 1,
        name: student.name,
        englishLanguage: student.english_language || 0,
        mathematics: student.mathematics || 0,
        naturalScience: student.natural_science || 0,
        history: student.history || 0,
        computing: student.computing || 0,
        rme: student.rme || 0,
        creativeArts: student.creative_arts || 0,
        owop: student.owop || 0,
        ghanaianLanguage: student.ghanaian_language || 0,
        french: student.french || 0,
        totalRawScore: student.total_raw_score || 0,
        averageScore: student.average_score || 0,
        totalAggregate: student.total_aggregate || 0,
        position: student.position || "",
        remarks: (student.remarks as LearnerScore['remarks']) || {},
        teacherRemark: student.teacher_remark || "",
        conduct: student.conduct || "",
        interest: student.interest || "",
        attendance: student.attendance,
        attendanceOutOf: student.attendance_out_of,
        status: student.status || "",
        term: classes.find((c) => c.id === classId)?.term || "",
        year: classes.find((c) => c.id === classId)?.year || "",
        numberOnRoll: classes.find((c) => c.id === classId)?.number_on_roll?.toString() || "",
        vacationDate: classes.find((c) => c.id === classId)?.vacation_date
          ? new Date(classes.find((c) => c.id === classId)!.vacation_date!)
          : undefined,
        reopeningDate: classes.find((c) => c.id === classId)?.reopening_date
          ? new Date(classes.find((c) => c.id === classId)!.reopening_date!)
          : undefined,
        schoolLogo: school?.logo_url || "",
        region: school?.region || "",
        district: school?.district || "",
        schoolName: school?.name || "",
      }));

      setStudents(transformedStudents);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const createClass = async () => {
    if (!newClassName.trim() || !profile?.school_id) {
      toast.error("Please enter a class name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("classes")
        .insert({
          name: newClassName,
          school_id: profile.school_id,
          teacher_id: profile.id,
          term: "Term 1",
          year: new Date().getFullYear().toString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Class created successfully!");
      setNewClassName("");
      setShowNewClassDialog(false);
      loadClasses();
      setSelectedClassId(data.id);
    } catch (error: any) {
      console.error("Error creating class:", error);
      toast.error("Failed to create class: " + error.message);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!selectedClassId) {
      toast.error("Please select a class first");
      return;
    }

    setLoading(true);
    try {
      const parsedData = await parseExcelFile(file);

      // Insert students into database
      const studentsToInsert = parsedData.map((student) => ({
        class_id: selectedClassId,
        school_id: profile?.school_id,
        name: student.name,
        english_language: student.englishLanguage,
        mathematics: student.mathematics,
        natural_science: student.naturalScience,
        history: student.history,
        computing: student.computing,
        rme: student.rme,
        creative_arts: student.creativeArts,
        owop: student.owop,
        ghanaian_language: student.ghanaianLanguage,
        french: student.french,
        total_raw_score: student.totalRawScore,
        average_score: student.averageScore,
        total_aggregate: student.totalAggregate,
        position: student.position,
        remarks: student.remarks || {},
      }));

      const { error } = await supabase.from("students").insert(studentsToInsert);

      if (error) throw error;

      toast.success("Students uploaded successfully!", {
        description: `Added ${parsedData.length} students to the database`,
      });

      // Reload students
      loadStudents(selectedClassId);
    } catch (error: any) {
      toast.error("Failed to upload students", {
        description: error.message,
      });
      console.error("Error uploading students:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (studentName: string, updates: Partial<LearnerScore>) => {
    if (!selectedClassId) return;

    try {
      const dbUpdates: any = {};
      
      if (updates.teacherRemark !== undefined) dbUpdates.teacher_remark = updates.teacherRemark;
      if (updates.conduct !== undefined) dbUpdates.conduct = updates.conduct;
      if (updates.interest !== undefined) dbUpdates.interest = updates.interest;
      if (updates.attendance !== undefined) dbUpdates.attendance = updates.attendance;
      if (updates.attendanceOutOf !== undefined) dbUpdates.attendance_out_of = updates.attendanceOutOf;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      const { error } = await supabase
        .from("students")
        .update(dbUpdates)
        .eq("class_id", selectedClassId)
        .eq("name", studentName);

      if (error) throw error;

      // Update local state
      setStudents((prev) =>
        prev.map((s) => (s.name === studentName ? { ...s, ...updates } : s))
      );
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    }
  };

  const handleTeacherRemarkChange = (learnerName: string, remark: string) => {
    updateStudent(learnerName, { teacherRemark: remark });
  };

  const handleConductChange = (learnerName: string, conduct: string) => {
    updateStudent(learnerName, { conduct });
  };

  const handleInterestChange = (learnerName: string, interest: string) => {
    updateStudent(learnerName, { interest });
  };

  const handleAttendanceChange = (learnerName: string, attendance: number) => {
    updateStudent(learnerName, { attendance });
  };

  const handleStatusChange = (learnerName: string, status: string) => {
    updateStudent(learnerName, { status });
  };

  const updateClassSettings = async (updates: Partial<Class>) => {
    if (!selectedClassId) return;

    try {
      const { error } = await supabase
        .from("classes")
        .update(updates)
        .eq("id", selectedClassId);

      if (error) throw error;

      // Update local state
      setClasses((prev) =>
        prev.map((c) => (c.id === selectedClassId ? { ...c, ...updates } : c))
      );
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error("Failed to update class settings");
    }
  };

  const handleTermChange = (term: string) => {
    updateClassSettings({ term });
  };

  const handleYearChange = (year: string) => {
    updateClassSettings({ year });
  };

  const handleNumberOnRollChange = (numberOnRoll: string) => {
    updateClassSettings({ number_on_roll: parseInt(numberOnRoll) || null });
  };

  const handleVacationDateChange = (date: Date | undefined) => {
    updateClassSettings({ vacation_date: date ? date.toISOString().split('T')[0] : null });
  };

  const handleReopeningDateChange = (date: Date | undefined) => {
    updateClassSettings({ reopening_date: date ? date.toISOString().split('T')[0] : null });
  };

const handleSchoolLogoChange = async (logoBase64: string) => {
  if (!profile?.school_id) return;

  try {
    const { error } = await supabase
      .from("schools")
      .update({ logo_url: logoBase64 })
      .eq("id", profile.school_id);

    if (error) throw error;

    // Update school state and propagate to all loaded learners immediately
    setSchool((prev) => (prev ? { ...prev, logo_url: logoBase64 } : null));
    setStudents((prev) => prev.map((s) => ({ ...s, schoolLogo: logoBase64 })));

    toast.success("School logo updated successfully");
  } catch (error) {
    console.error("Error updating logo:", error);
    toast.error("Failed to update school logo");
  }
};

  const handleRegionChange = async (region: string) => {
    if (!profile?.school_id) return;

    try {
      const { error } = await supabase
        .from("schools")
        .update({ region })
        .eq("id", profile.school_id);

      if (error) throw error;

      setSchool((prev) => prev ? { ...prev, region } : null);
    } catch (error) {
      console.error("Error updating region:", error);
      toast.error("Failed to update region");
    }
  };

  const handleDistrictChange = async (district: string) => {
    if (!profile?.school_id) return;

    try {
      const { error } = await supabase
        .from("schools")
        .update({ district })
        .eq("id", profile.school_id);

      if (error) throw error;

      setSchool((prev) => prev ? { ...prev, district } : null);
    } catch (error) {
      console.error("Error updating district:", error);
      toast.error("Failed to update district");
    }
  };

  const handleSchoolNameChange = async (name: string) => {
    if (!profile?.school_id) return;

    try {
      const { error } = await supabase
        .from("schools")
        .update({ name })
        .eq("id", profile.school_id);

      if (error) throw error;

      setSchool((prev) => prev ? { ...prev, name } : null);
    } catch (error) {
      console.error("Error updating school name:", error);
      toast.error("Failed to update school name");
    }
  };

  const handleAttendanceOutOfChange = async (attendanceOutOf: number) => {
    if (!selectedClassId) return;

    try {
      // Update all students in the database with the new attendance_out_of value
      const { error } = await supabase
        .from("students")
        .update({ attendance_out_of: attendanceOutOf })
        .eq("class_id", selectedClassId);

      if (error) throw error;

      // Update local state
      setStudents((prev) =>
        prev.map((s) => ({ ...s, attendanceOutOf }))
      );

      toast.success("Attendance total updated for all students");
    } catch (error) {
      console.error("Error updating attendance out of:", error);
      toast.error("Failed to update attendance total");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    if (!selectedClassId || students.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      const fileName = `${school?.name || 'school'}-${selectedClass?.name || 'class'}-${selectedClass?.term || 'term'}-${selectedClass?.year || 'year'}.xlsx`;
      exportToExcel(students, fileName);
      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download Excel file");
      console.error("Error exporting Excel:", error);
    }
  };


  if (profileLoading) {
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
          <h2 className="text-2xl font-bold mb-2">Welcome to School Report System</h2>
          <p className="text-muted-foreground mb-4">
            You need to be assigned to a school before you can start managing classes.
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact your school administrator to assign you to a school.
          </p>
          <Button onClick={signOut} variant="outline" className="mt-6">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    );
  }

  const stats = calculateDashboardStats(students);
  const subjectPerformance = calculateSubjectPerformance(students);
  
  const aboveAverage = students.filter((l) => l.averageScore > stats.averageScore);
  const onAverage = students.filter(
    (l) => l.averageScore >= stats.averageScore - 5 && l.averageScore <= stats.averageScore + 5
  );
  const belowAverage = students.filter((l) => l.averageScore < stats.averageScore - 5);
  
  const topLearners = [...students]
    .sort((a, b) => b.totalRawScore - a.totalRawScore)
    .slice(0, 10)
    .map((l) => ({
      name: l.name,
      position: l.position,
      totalScore: l.totalRawScore,
      averageScore: l.averageScore,
    }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* System Title */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent tracking-wide">
                BASIC SCHOOLS LEARNING OUTCOME SYSTEM
              </h1>
            </div>
            
            {/* School Info and Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {school?.name || "School Report System"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {profile?.full_name || profile?.email}
                  </p>
                </div>
              </div>
              </div>
              <div className="flex items-center gap-4">
                <img 
                  src={kpsBrandLogo} 
                  alt="KPS Logo" 
                  className="h-16 w-16 object-contain"
                />
                <div className="flex items-center gap-2">
                  {hasRole("school_admin") && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/school-admin">
                        <Users className="w-4 h-4 mr-2" />
                        School Admin
                      </Link>
                    </Button>
                  )}
                  {hasRole("super_admin") && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/super-admin">
                        <Shield className="w-4 h-4 mr-2" />
                        Super Admin
                      </Link>
                    </Button>
                  )}
                  <Button onClick={signOut} variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-24">
        {/* Class Selection */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="class-select" className="mb-2 block">Select Class</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger id="class-select">
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} - {cls.term} {cls.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={showNewClassDialog} onOpenChange={setShowNewClassDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-6">
                <Plus className="w-4 h-4 mr-2" />
                New Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="class-name">Class Name</Label>
                  <Input
                    id="class-name"
                    placeholder="e.g., Grade 5A"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                  />
                </div>
                <Button onClick={createClass} className="w-full">
                  Create Class
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {selectedClassId && (
          <>
            {/* Upload Section */}
            <div className="flex justify-center mb-6 gap-4 flex-wrap">
              <FileUpload onFileSelect={handleFileSelect} />
              {students.length > 0 && (
                <>
                  <Button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-accent"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print All Reports
                  </Button>
                  <Button onClick={handleDownloadExcel} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Excel
                  </Button>
                </>
              )}
            </div>

            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Dashboard Content */}
            {!loading && students.length > 0 && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Report Card Settings - Moved to Top */}
                <TeacherRemarksSelector
                  learners={students}
                  onRemarkChange={handleTeacherRemarkChange}
                  onConductChange={handleConductChange}
                  onInterestChange={handleInterestChange}
                  onAttendanceChange={handleAttendanceChange}
                  onStatusChange={handleStatusChange}
                  term={classes.find((c) => c.id === selectedClassId)?.term || ""}
                  year={classes.find((c) => c.id === selectedClassId)?.year || ""}
                  numberOnRoll={classes.find((c) => c.id === selectedClassId)?.number_on_roll?.toString() || "0"}
                  vacationDate={
                    classes.find((c) => c.id === selectedClassId)?.vacation_date
                      ? new Date(classes.find((c) => c.id === selectedClassId)!.vacation_date!)
                      : undefined
                  }
                  reopeningDate={
                    classes.find((c) => c.id === selectedClassId)?.reopening_date
                      ? new Date(classes.find((c) => c.id === selectedClassId)!.reopening_date!)
                      : undefined
                  }
                  schoolLogo={school?.logo_url || ""}
                  region={school?.region || ""}
                  district={school?.district || ""}
                  schoolName={school?.name || ""}
                  onTermChange={handleTermChange}
                  onYearChange={handleYearChange}
                  onNumberOnRollChange={handleNumberOnRollChange}
                  onVacationDateChange={handleVacationDateChange}
                  onReopeningDateChange={handleReopeningDateChange}
                  onSchoolLogoChange={handleSchoolLogoChange}
                  onRegionChange={handleRegionChange}
                  onDistrictChange={handleDistrictChange}
                  onSchoolNameChange={handleSchoolNameChange}
                  attendanceOutOf={students[0]?.attendanceOutOf || 180}
                  onAttendanceOutOfChange={handleAttendanceOutOfChange}
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Learners" value={stats.totalLearners} icon={Users} gradient="primary" />
                  <StatCard title="Class Average" value={`${stats.averageScore}%`} icon={TrendingUp} gradient="success" />
                  <StatCard title="Top Performer" value={stats.topPerformer} icon={Trophy} gradient="accent" />
                  <StatCard title="Lowest Score" value={stats.lowestScore} icon={BarChart3} gradient="primary" />
                </div>

                {/* Charts */}
                <PerformanceChart data={subjectPerformance} />

                {/* Performance Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      Above Average ({aboveAverage.length})
                    </h3>
                    <LeaderboardTable
                      learners={aboveAverage
                        .sort((a, b) => b.totalRawScore - a.totalRawScore)
                        .slice(0, 5)
                        .map((l) => ({
                          name: l.name,
                          position: l.position,
                          totalScore: l.totalRawScore,
                          averageScore: l.averageScore,
                        }))}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5 text-warning" />
                      On Average ({onAverage.length})
                    </h3>
                    <LeaderboardTable
                      learners={onAverage
                        .sort((a, b) => b.totalRawScore - a.totalRawScore)
                        .slice(0, 5)
                        .map((l) => ({
                          name: l.name,
                          position: l.position,
                          totalScore: l.totalRawScore,
                          averageScore: l.averageScore,
                        }))}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-destructive" />
                      Below Average ({belowAverage.length})
                    </h3>
                    <LeaderboardTable
                      learners={belowAverage
                        .sort((a, b) => b.totalRawScore - a.totalRawScore)
                        .slice(0, 5)
                        .map((l) => ({
                          name: l.name,
                          position: l.position,
                          totalScore: l.totalRawScore,
                          averageScore: l.averageScore,
                        }))}
                    />
                  </div>
                </div>

                {/* Top Performers */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    Top 10 Performers
                  </h3>
                  <LeaderboardTable learners={topLearners} />
                </div>

                {/* Insights */}
                <InsightsPanel learners={students} subjectPerformance={subjectPerformance} stats={stats} />
              </div>
            )}

            {!loading && students.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Students Yet</h3>
                <p className="text-muted-foreground">Upload an Excel file to add students to this class</p>
              </div>
            )}
          </>
        )}

        {!selectedClassId && classes.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Classes Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first class to get started</p>
            <Button onClick={() => setShowNewClassDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          </div>
        )}

        {/* Hidden Print Reports */}
        {students.length > 0 && (
          <div ref={printRef} className="hidden print:block">
            <PrintReports learners={students} classAverage={stats.averageScore} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
