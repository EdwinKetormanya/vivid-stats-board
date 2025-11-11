import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { StatCard } from "@/components/StatCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { Users, TrendingUp, Trophy, BarChart3 } from "lucide-react";
import { parseExcelFile, calculateSubjectPerformance, calculateDashboardStats } from "@/utils/dataParser";
import { LearnerScore } from "@/types/learner";
import { toast } from "sonner";

const Index = () => {
  const [learners, setLearners] = useState<LearnerScore[]>([]);
  const [loading, setLoading] = useState(false);

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

  const stats = calculateDashboardStats(learners);
  const subjectPerformance = calculateSubjectPerformance(learners);
  const topLearners = [...learners]
    .sort((a, b) => b.totalRawScore - a.totalRawScore)
    .slice(0, 5)
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        {learners.length === 0 && (
          <div className="max-w-2xl mx-auto mb-12">
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        )}

        {/* Dashboard Content */}
        {learners.length > 0 && (
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

            {/* Leaderboard */}
            <LeaderboardTable learners={topLearners} />

            {/* Upload New File Button */}
            <div className="flex justify-center">
              <label
                htmlFor="new-file-upload"
                className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
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
        )}
      </main>
    </div>
  );
};

export default Index;
