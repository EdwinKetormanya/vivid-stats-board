import { useState, useEffect, useRef } from "react";
import { FileUpload } from "@/components/FileUpload";
import { StatCard } from "@/components/StatCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { InsightsPanel } from "@/components/InsightsPanel";
import { PrintReports } from "@/components/PrintReports";
import { TeacherRemarksSelector } from "@/components/TeacherRemarksSelector";
import { SchoolManager } from "@/components/SchoolManager";
import { Footer } from "@/components/Footer";
import kpsLogo from "@/assets/kps-logo.png";
import { Users, TrendingUp, Trophy, BarChart3, Printer, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseExcelFile, calculateSubjectPerformance, calculateDashboardStats } from "@/utils/dataParser";
import { exportToExcel } from "@/utils/excelExporter";
import { LearnerScore } from "@/types/learner";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [learners, setLearners] = useState<LearnerScore[]>([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState<string>("Term 1");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [numberOnRoll, setNumberOnRoll] = useState<string>("30");
  const [vacationDate, setVacationDate] = useState<Date | undefined>();
  const [reopeningDate, setReopeningDate] = useState<Date | undefined>();
  const [schoolLogo, setSchoolLogo] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [schoolName, setSchoolName] = useState<string>("");

  const handlePrint = () => {
    window.print();
  };

  const handleTeacherRemarkChange = (learnerName: string, remark: string) => {
    setLearners((prevLearners) =>
      prevLearners.map((learner) =>
        learner.name === learnerName ? { 
          ...learner, 
          teacherRemark: remark,
          term,
          year,
          numberOnRoll,
          vacationDate,
          reopeningDate,
          schoolLogo,
          region,
          district,
          schoolName,
        } : learner
      )
    );
  };

  const handleConductChange = (learnerName: string, conduct: string) => {
    setLearners((prevLearners) =>
      prevLearners.map((learner) =>
        learner.name === learnerName ? { 
          ...learner, 
          conduct,
          term,
          year,
          numberOnRoll,
          vacationDate,
          reopeningDate,
          schoolLogo,
          region,
          district,
          schoolName,
        } : learner
      )
    );
  };

  const handleInterestChange = (learnerName: string, interest: string) => {
    setLearners((prevLearners) =>
      prevLearners.map((learner) =>
        learner.name === learnerName ? { 
          ...learner, 
          interest,
          term,
          year,
          numberOnRoll,
          vacationDate,
          reopeningDate,
          schoolLogo,
          region,
          district,
          schoolName,
        } : learner
      )
    );
  };

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    try {
      const parsedData = await parseExcelFile(file);
      setLearners(parsedData);
      toast.success("File uploaded successfully!", {
        description: `Loaded ${parsedData.length} learner records`,
      });
    } catch (error) {
      toast.error("Failed to parse file", {
        description: "Please ensure the file format matches the expected structure",
      });
      console.error("Error parsing file:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    setDistrict(""); // Reset district when region changes
    setLearners((prevLearners) =>
      prevLearners.map((learner) => ({ ...learner, region: newRegion, district: "" }))
    );
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setLearners((prevLearners) =>
      prevLearners.map((learner) => ({ ...learner, district: newDistrict }))
    );
  };

  const handleSchoolNameChange = (name: string) => {
    setSchoolName(name);
    setLearners((prevLearners) =>
      prevLearners.map((learner) => ({ ...learner, schoolName: name }))
    );
  };

  const handleDownloadExcel = () => {
    try {
      const fileName = `learner-reports-${schoolName || 'school'}-${term || 'term'}-${year || 'year'}.xlsx`;
      exportToExcel(learners, fileName);
      toast.success("Excel file downloaded successfully!", {
        description: "Your updated learner data has been exported",
      });
    } catch (error) {
      toast.error("Failed to download Excel file", {
        description: "Please try again",
      });
      console.error("Error exporting Excel:", error);
    }
  };

  const stats = calculateDashboardStats(learners);
  const subjectPerformance = calculateSubjectPerformance(learners);
  useEffect(() => {
    console.log("Subject Performance:", subjectPerformance);
    console.log("Has Science:", subjectPerformance.some((s) => s.subject.toLowerCase().includes("science")));
    console.log("Has Creative Arts:", subjectPerformance.some((s) => s.subject.toLowerCase().includes("creative")));
  }, [subjectPerformance]);
  
  // Categorize learners by performance level
  const aboveAverage = learners.filter(l => l.averageScore > stats.averageScore);
  const onAverage = learners.filter(l => 
    l.averageScore >= stats.averageScore - 5 && l.averageScore <= stats.averageScore + 5
  );
  const belowAverage = learners.filter(l => l.averageScore < stats.averageScore - 5);
  
  const topLearners = [...learners]
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Learner Performance Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">Track and analyze student academic progress</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img src={kpsLogo} alt="Keep Premium Solutions" className="h-20 w-20 object-contain" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-24">
        {/* Upload Section - Show before any data is loaded */}
        {learners.length === 0 && (
          <div className="max-w-2xl mx-auto mb-12">
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        )}

        {/* Tabs - Only show when data is loaded */}
        {learners.length > 0 && (
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                School Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Learners"
                    value={stats.totalLearners}
                    icon={Users}
                    gradient="primary"
                  />
                  <StatCard
                    title="Class Average"
                    value={`${stats.averageScore}%`}
                    icon={TrendingUp}
                    gradient="success"
                  />
                  <StatCard
                    title="Top Performer"
                    value={stats.topPerformer}
                    icon={Trophy}
                    gradient="accent"
                  />
                  <StatCard
                    title="Lowest Score"
                    value={stats.lowestScore}
                    icon={BarChart3}
                    gradient="primary"
                  />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  <PerformanceChart data={subjectPerformance} />
                </div>

                {/* Performance Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
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
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
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
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
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
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    Top 10 Performers
                  </h3>
                  <LeaderboardTable learners={topLearners} />
                </div>

                {/* Teacher Remarks Section */}
                <div className="space-y-4">
                  <TeacherRemarksSelector 
                    learners={learners} 
                    onRemarkChange={handleTeacherRemarkChange}
                    onConductChange={handleConductChange}
                    onInterestChange={handleInterestChange}
                    term={term}
                    year={year}
                    numberOnRoll={numberOnRoll}
                    vacationDate={vacationDate}
                    reopeningDate={reopeningDate}
                    schoolLogo={schoolLogo}
                    region={region}
                    district={district}
                    schoolName={schoolName}
                    onTermChange={setTerm}
                    onYearChange={setYear}
                    onNumberOnRollChange={setNumberOnRoll}
                    onVacationDateChange={setVacationDate}
                    onReopeningDateChange={setReopeningDate}
                    onSchoolLogoChange={setSchoolLogo}
                    onRegionChange={handleRegionChange}
                    onDistrictChange={handleDistrictChange}
                    onSchoolNameChange={handleSchoolNameChange}
                  />
                </div>

                {/* Insights and Recommendations */}
                <InsightsPanel
                  learners={learners}
                  subjectPerformance={subjectPerformance}
                  stats={stats}
                />
                
                {/* Upload New File, Download, and Print Buttons */}
                <div className="flex justify-center gap-4 no-print flex-wrap">
                  <Button
                    onClick={handleDownloadExcel}
                    className="px-8 py-3 bg-gradient-to-r from-success to-success/80 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Excel
                  </Button>
                  <Button
                    onClick={handlePrint}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    Print All Reports
                  </Button>
                  <label
                    htmlFor="new-file-upload"
                    className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center"
                  >
                    Upload New File
                    <input
                      id="new-file-upload"
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <SchoolManager />
            </TabsContent>
          </Tabs>
        )}

        {/* Hidden Print Reports */}
        {learners.length > 0 && (
          <div ref={printRef} className="hidden print:block">
            <PrintReports learners={learners} classAverage={stats.averageScore} />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
