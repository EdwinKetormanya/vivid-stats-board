import { useState, useEffect } from "react";
import { LearnerScore } from "@/types/learner";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Upload, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { regions, ghanaRegionsDistricts } from "@/data/ghanaRegionsDistricts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeacherRemarksSelectorProps {
  learners: LearnerScore[];
  onRemarkChange: (learnerName: string, remark: string) => void;
  onConductChange: (learnerName: string, conduct: string) => void;
  onInterestChange: (learnerName: string, interest: string) => void;
  term: string;
  year: string;
  numberOnRoll: string;
  vacationDate: Date | undefined;
  reopeningDate: Date | undefined;
  schoolLogo: string;
  region: string;
  district: string;
  schoolName: string;
  onTermChange: (term: string) => void;
  onYearChange: (year: string) => void;
  onNumberOnRollChange: (number: string) => void;
  onVacationDateChange: (date: Date | undefined) => void;
  onReopeningDateChange: (date: Date | undefined) => void;
  onSchoolLogoChange: (logo: string) => void;
  onRegionChange: (region: string) => void;
  onDistrictChange: (district: string) => void;
  onSchoolNameChange: (schoolName: string) => void;
  onAttendanceChange: (learnerName: string, attendance: number) => void;
  onAttendanceOutOfChange: (attendanceOutOf: number) => void;
  attendanceOutOf: number;
  onStatusChange: (learnerName: string, status: string) => void;
}

const TEACHER_REMARKS = [
  "Excellent performance, keep it up!",
  "Very good work, continue the effort.",
  "Good progress shown this term.",
  "Satisfactory work, can do better.",
  "Fair performance, needs improvement.",
  "Needs to work harder and be more focused.",
  "Requires extra attention in weak subjects.",
  "Good conduct and attitude towards learning.",
  "Excellent attitude but needs academic improvement.",
  "Shows great potential, keep working hard.",
  "Improve class participation and homework submission.",
  "Needs to improve attendance and punctuality.",
  "Outstanding performance in all subjects.",
  "Consistent effort throughout the term.",
  "More practice needed in core subjects.",
];

const CONDUCT_OPTIONS = [
  "Excellent",
  "Very Good",
  "Good",
  "Satisfactory",
  "Fair",
  "Needs Improvement",
];

const INTEREST_OPTIONS = [
  "Sports",
  "Music",
  "Art",
  "Drama",
  "Reading",
  "Science",
  "Mathematics",
  "Technology",
  "Dance",
  "Leadership",
];

export const TeacherRemarksSelector = ({ 
  learners, 
  onRemarkChange, 
  onConductChange, 
  onInterestChange,
  term,
  year,
  numberOnRoll,
  vacationDate,
  reopeningDate,
  schoolLogo,
  region,
  district,
  schoolName,
  onTermChange,
  onYearChange,
  onNumberOnRollChange,
  onVacationDateChange,
  onReopeningDateChange,
  onSchoolLogoChange,
  onRegionChange,
  onDistrictChange,
  onSchoolNameChange,
  onAttendanceChange,
  onAttendanceOutOfChange,
  attendanceOutOf,
  onStatusChange
}: TeacherRemarksSelectorProps) => {
  const [availableSchools, setAvailableSchools] = useState<Array<{ id: string; name: string }>>([]);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - 5 + i).toString());
  const rollNumbers = Array.from({ length: 100 }, (_, i) => (i + 1).toString());
  const attendanceNumbers = Array.from({ length: 201 }, (_, i) => i.toString());

  const statusOptions = [
    "Promoted to KG1",
    "Promoted to KG2",
    "Promoted to Basic 1",
    "Promoted to Basic 2",
    "Promoted to Basic 3",
    "Promoted to Basic 4",
    "Promoted to Basic 5",
    "Promoted to Basic 6",
    "Promoted to Basic 7",
    "Promoted to Basic 8",
    "Promoted to Basic 9",
    "Repeated KG1",
    "Repeated KG2",
    "Repeated Basic 1",
    "Repeated Basic 2",
    "Repeated Basic 3",
    "Repeated Basic 4",
    "Repeated Basic 5",
    "Repeated Basic 6",
    "Repeated Basic 7",
    "Repeated Basic 8",
    "Repeated Basic 9",
  ];


  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    const { data, error } = await supabase
      .from("schools")
      .select("id, name")
      .order("name");

    if (error) {
      toast.error("Failed to load schools");
      console.error(error);
      return;
    }

    setAvailableSchools(data || []);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSchoolLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    onSchoolLogoChange("");
  };

  const districts = region ? ghanaRegionsDistricts[region] || [] : [];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Report Card Settings</h2>
      
      {/* School Information Section */}
      <div className="mb-6 pb-6 border-b">
        <h3 className="text-lg font-semibold mb-4">School Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Region</label>
            <Select value={region} onValueChange={onRegionChange}>
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
            <label className="text-sm font-medium mb-2 block">District</label>
            <Select 
              value={district} 
              onValueChange={onDistrictChange}
              disabled={!region}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={region ? "Select District" : "Select Region First"} />
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

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">School Name</label>
          <Select 
            value={schoolName} 
            onValueChange={onSchoolNameChange}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select School" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {availableSchools.map((school) => (
                <SelectItem key={school.id} value={school.name}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Contact developer to add more schools
          </p>
        </div>
      </div>
      
      {/* School Logo Upload */}
      <div className="mb-6 pb-6 border-b">
        <h3 className="text-lg font-semibold mb-4">School Logo</h3>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Upload School Logo</label>
            <div className="flex items-center gap-2">
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('logo-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Choose Logo
              </Button>
              {schoolLogo && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveLogo}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upload your school logo (PNG, JPG, or SVG recommended)
            </p>
          </div>
          {schoolLogo && (
            <div className="flex-shrink-0">
              <img 
                src={schoolLogo} 
                alt="School Logo" 
                className="w-20 h-20 object-contain border rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Global Settings */}
      <div className="mb-6 pb-6 border-b">
        <h3 className="text-lg font-semibold mb-4">Term Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Term</label>
            <Select value={term} onValueChange={onTermChange}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="Term 1">Term 1</SelectItem>
                <SelectItem value="Term 2">Term 2</SelectItem>
                <SelectItem value="Term 3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Year</label>
            <Select value={year} onValueChange={onYearChange}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">No. on Roll</label>
            <Select value={numberOnRoll} onValueChange={onNumberOnRollChange}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select number" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {rollNumbers.map((num) => (
                  <SelectItem key={num} value={num}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Vacation Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !vacationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {vacationDate ? format(vacationDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={vacationDate}
                  onSelect={onVacationDateChange}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Reopening Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !reopeningDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {reopeningDate ? format(reopeningDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={reopeningDate}
                  onSelect={onReopeningDateChange}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Attendance Out Of (applies to all students)</label>
            <Select value={attendanceOutOf.toString()} onValueChange={(value) => onAttendanceOutOfChange(Number(value))}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select total days" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {attendanceNumbers.map((num) => (
                  <SelectItem key={num} value={num}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-4">Class Teacher Remarks, Conduct & Attendance</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select remarks, conduct, interest, and attendance for each student. These will appear on their printed report card.
      </p>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {learners.map((learner, index) => (
            <div key={index} className="p-3 bg-muted/30 rounded-lg space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{learner.name}</p>
                  <p className="text-xs text-muted-foreground">Position: {learner.position}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Teacher Remark</label>
                  <Select
                    value={learner.teacherRemark || ""}
                    onValueChange={(value) => onRemarkChange(learner.name, value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select remark..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {TEACHER_REMARKS.map((remark, idx) => (
                        <SelectItem key={idx} value={remark} className="cursor-pointer">
                          {remark}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Conduct</label>
                  <Select
                    value={learner.conduct || ""}
                    onValueChange={(value) => onConductChange(learner.name, value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select conduct..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {CONDUCT_OPTIONS.map((conduct, idx) => (
                        <SelectItem key={idx} value={conduct} className="cursor-pointer">
                          {conduct}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Interest</label>
                  <Select
                    value={learner.interest || ""}
                    onValueChange={(value) => onInterestChange(learner.name, value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select interest..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {INTEREST_OPTIONS.map((interest, idx) => (
                        <SelectItem key={idx} value={interest} className="cursor-pointer">
                          {interest}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Total Attendance</label>
                  <Select
                    value={learner.attendance?.toString() || ""}
                    onValueChange={(value) => onAttendanceChange(learner.name, Number(value))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select days..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {attendanceNumbers.map((num) => (
                        <SelectItem key={num} value={num} className="cursor-pointer">
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                  <Select
                    value={learner.status || ""}
                    onValueChange={(value) => onStatusChange(learner.name, value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {statusOptions.map((status, idx) => (
                        <SelectItem key={idx} value={status} className="cursor-pointer">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
