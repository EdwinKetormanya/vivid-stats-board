import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, TrendingUp, TrendingDown, Lightbulb, Users, BookOpen, Award, BarChart3, ScatterChart as ScatterIcon, Filter } from "lucide-react";
import { LearnerScore, SubjectPerformance, DashboardStats } from "@/types/learner";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface InsightsPanelProps {
  learners: LearnerScore[];
  subjectPerformance: SubjectPerformance[];
  stats: DashboardStats;
}

interface Insight {
  type: "success" | "warning" | "info" | "concern";
  title: string;
  description: string;
  icon: any;
}

interface Recommendation {
  priority: "high" | "medium" | "low";
  category: string;
  action: string;
  rationale: string;
}

export const InsightsPanel = ({ learners, subjectPerformance, stats }: InsightsPanelProps) => {
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    // Overall performance insights
    if (stats.averageScore >= 40) {
      insights.push({
        type: "success",
        title: "Strong Performance",
        description: `Class average: ${stats.averageScore}%. Solid academic foundation.`,
        icon: CheckCircle
      });
    } else if (stats.averageScore >= 30) {
      insights.push({
        type: "warning",
        title: "Moderate Performance",
        description: `Class average: ${stats.averageScore}%. Room for improvement.`,
        icon: AlertCircle
      });
    } else {
      insights.push({
        type: "concern",
        title: "Low Performance",
        description: `Class average: ${stats.averageScore}%. Immediate action needed.`,
        icon: TrendingDown
      });
    }

    // Subject performance analysis
    const weakSubjects = subjectPerformance.filter(s => s.average < 30);
    const strongSubjects = subjectPerformance.filter(s => s.average >= 40);
    
    if (weakSubjects.length > 0) {
      insights.push({
        type: "concern",
        title: "Weak Subjects",
        description: `${weakSubjects.map(s => s.subject).join(", ")} below 30%. Need intervention.`,
        icon: BookOpen
      });
    }

    if (strongSubjects.length > 0) {
      insights.push({
        type: "success",
        title: "Strong Subjects",
        description: `${strongSubjects.map(s => s.subject).join(", ")} above 40%. Share best practices.`,
        icon: Award
      });
    }

    // Student distribution analysis
    const highPerformers = learners.filter(l => l.averageScore >= 40).length;
    const strugglingStudents = learners.filter(l => l.averageScore < 30).length;
    const percentStruggling = (strugglingStudents / learners.length * 100).toFixed(1);
    
    if (strugglingStudents > learners.length * 0.3) {
      insights.push({
        type: "concern",
        title: "Many Struggling Students",
        description: `${percentStruggling}% (${strugglingStudents}/${learners.length}) below 30%. Systemic intervention needed.`,
        icon: Users
      });
    }

    if (highPerformers > 0) {
      const percentHigh = (highPerformers / learners.length * 100).toFixed(1);
      insights.push({
        type: "success",
        title: "High Achievers",
        description: `${percentHigh}% (${highPerformers}/${learners.length}) above 40%. Effective learning outcomes.`,
        icon: TrendingUp
      });
    }

    // Performance gap analysis
    const topScore = Math.max(...learners.map(l => l.averageScore));
    const bottomScore = Math.min(...learners.map(l => l.averageScore));
    const gap = topScore - bottomScore;
    
    if (gap > 20) {
      insights.push({
        type: "warning",
        title: "Wide Performance Gap",
        description: `${gap.toFixed(1)}% gap between top/bottom. Use differentiated instruction.`,
        icon: AlertCircle
      });
    }

    return insights;
  };

  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // Subject-based recommendations
    const weakSubjects = subjectPerformance.filter(s => s.average < 30);
    weakSubjects.forEach(subject => {
      recommendations.push({
        priority: "high",
        category: "Academic Intervention",
        action: `Intensive remedial program for ${subject.subject}`,
        rationale: `Average ${subject.average}% critically low. Add teaching hours and tutoring.`
      });
    });

    // Student support recommendations
    const strugglingStudents = learners.filter(l => l.averageScore < 30);
    if (strugglingStudents.length > 0) {
      recommendations.push({
        priority: "high",
        category: "Student Support",
        action: `Create support plans for ${strugglingStudents.length} struggling students`,
        rationale: `Students below 30% need one-on-one attention and tailored strategies.`
      });
    }

    // Teaching quality recommendations
    const consistentlyLowSubjects = subjectPerformance.filter(s => s.average < 35 && s.highest < 50);
    if (consistentlyLowSubjects.length > 0) {
      recommendations.push({
        priority: "high",
        category: "Teaching Quality",
        action: `Review teaching methods for ${consistentlyLowSubjects.map(s => s.subject).join(", ")}`,
        rationale: `Low averages + low highest scores suggest curriculum delivery issues.`
      });
    }

    // Performance monitoring
    recommendations.push({
      priority: "medium",
      category: "Performance Monitoring",
      action: "Bi-weekly progress assessments",
      rationale: "Regular monitoring identifies struggling students early."
    });

    // Resource allocation
    const subjectsNeedingResources = subjectPerformance.filter(s => s.average < stats.averageScore - 5);
    if (subjectsNeedingResources.length > 0) {
      recommendations.push({
        priority: "medium",
        category: "Resource Allocation",
        action: `Add resources to ${subjectsNeedingResources.map(s => s.subject).join(", ")}`,
        rationale: "Below-average subjects need more teaching materials and aids."
      });
    }

    // Parent engagement
    const criticalStudents = learners.filter(l => l.averageScore < 25);
    if (criticalStudents.length > 0) {
      recommendations.push({
        priority: "high",
        category: "Parent Engagement",
        action: `Parent-teacher conferences for ${criticalStudents.length} at-risk students`,
        rationale: "Students below 25% need collaborative parent-teacher-counselor intervention."
      });
    }

    // Success replication
    const strongSubjects = subjectPerformance.filter(s => s.average >= 40);
    if (strongSubjects.length > 0) {
      recommendations.push({
        priority: "low",
        category: "Best Practices",
        action: `Share teaching strategies from ${strongSubjects.map(s => s.subject).join(", ")}`,
        rationale: "High-performing subjects have practices that benefit other areas."
      });
    }

    // Peer learning
    const topPerformers = learners.filter(l => l.averageScore >= 40);
    if (topPerformers.length >= 2) {
      recommendations.push({
        priority: "medium",
        category: "Peer Learning",
        action: "Peer tutoring program with top students",
        rationale: `${topPerformers.length} high achievers can mentor struggling peers.`
      });
    }

    return recommendations;
  };

  const insights = generateInsights();
  const recommendations = generateRecommendations();

  // Performance distribution data for scatter plot
  const performanceDistribution = learners.map((learner, idx) => ({
    name: learner.name,
    score: learner.averageScore,
    studentIndex: idx + 1,
    category: learner.averageScore >= stats.averageScore + 5 
      ? "Above Average" 
      : learner.averageScore <= stats.averageScore - 5 
      ? "Below Average" 
      : "Average"
  }));

  // Grade distribution
  const gradeRanges = [
    { range: "0-20%", count: 0, color: "hsl(var(--destructive))" },
    { range: "21-30%", count: 0, color: "hsl(var(--warning))" },
    { range: "31-40%", count: 0, color: "hsl(var(--chart-3))" },
    { range: "41-50%", count: 0, color: "hsl(var(--chart-4))" },
    { range: "51-60%", count: 0, color: "hsl(var(--success))" },
    { range: "61-100%", count: 0, color: "hsl(var(--primary))" }
  ];

  learners.forEach(learner => {
    const score = learner.averageScore;
    if (score <= 20) gradeRanges[0].count++;
    else if (score <= 30) gradeRanges[1].count++;
    else if (score <= 40) gradeRanges[2].count++;
    else if (score <= 50) gradeRanges[3].count++;
    else if (score <= 60) gradeRanges[4].count++;
    else gradeRanges[5].count++;
  });

  // Subject name to database column mapping
  const subjectKeyMap: Record<string, string> = {
    'mathematics': 'mathematics',
    'english language': 'english_language',
    'natural science': 'natural_science',
    'history': 'history',
    'rme': 'rme',
    'creative arts': 'creative_arts',
    'owop': 'owop',
    'ghanaian language': 'ghanaian_language',
    'french': 'french',
    'computing': 'computing'
  };

  // Subject-wise detailed breakdown
  const subjectBreakdown = subjectPerformance.map(subject => {
    const dbColumnKey = subjectKeyMap[subject.subject.toLowerCase()];
    
    const subjectScores = learners.map(l => {
      return dbColumnKey && l[dbColumnKey as keyof LearnerScore] 
        ? Number(l[dbColumnKey as keyof LearnerScore]) 
        : 0;
    }).filter(score => score > 0);

    const passing = subjectScores.filter(s => s >= 30).length;
    const excellent = subjectScores.filter(s => s >= 50).length;
    const failing = subjectScores.filter(s => s < 30).length;

    const passRate = subjectScores.length > 0 ? (passing / subjectScores.length) * 100 : 0;
    const excellenceRate = subjectScores.length > 0 ? (excellent / subjectScores.length) * 100 : 0;

    console.log(`Subject: ${subject.subject}, DB Key: ${dbColumnKey}, Total Scores: ${subjectScores.length}, Passing: ${passing}, Pass Rate: ${passRate}`);

    return {
      ...subject,
      passing,
      excellent,
      failing,
      passRate: passRate,
      excellenceRate: excellenceRate
    };
  });

  // Filter subjects based on selected criteria
  const filteredSubjects = subjectBreakdown.filter(subject => {
    switch (subjectFilter) {
      case "low-pass":
        return subject.passRate < 50;
      case "critical":
        return subject.passRate < 30;
      case "high-fail":
        return subject.failing > 5;
      case "excellent":
        return subject.average >= 40;
      case "weak":
        return subject.average < 30;
      case "all":
      default:
        return true;
    }
  });

  const getInsightStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-success/30 bg-success/5";
      case "warning":
        return "border-warning/30 bg-warning/5";
      case "concern":
        return "border-destructive/30 bg-destructive/5";
      default:
        return "border-info/30 bg-info/5";
    }
  };

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "concern":
        return "text-destructive";
      default:
        return "text-info";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Distribution Scatter Plot */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-purple-500">
            <ScatterIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Performance Distribution</h3>
            <p className="text-sm text-muted-foreground">Visual analysis of student performance relative to class average</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="studentIndex" 
              name="Student #" 
              label={{ value: 'Student Number', position: 'insideBottom', offset: -10 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              dataKey="score" 
              name="Score" 
              label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
              stroke="hsl(var(--muted-foreground))"
              domain={[0, 100]}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                      <p className="font-semibold text-foreground">{data.name}</p>
                      <p className="text-sm text-muted-foreground">Score: {data.score.toFixed(1)}%</p>
                      <p className="text-sm font-medium" style={{ color: payload[0].fill }}>
                        {data.category}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              content={(props) => {
                const { payload } = props;
                return (
                  <div className="flex justify-center gap-6 flex-wrap">
                    {payload?.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-muted-foreground">{entry.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-0.5 bg-primary" />
                      <span className="text-sm text-muted-foreground">Class Average</span>
                    </div>
                  </div>
                );
              }}
            />
            <Scatter 
              name="Above Average" 
              data={performanceDistribution.filter(d => d.category === "Above Average")} 
              fill="hsl(var(--success))"
              shape="circle"
            />
            <Scatter 
              name="Average" 
              data={performanceDistribution.filter(d => d.category === "Average")} 
              fill="hsl(var(--chart-4))"
              shape="circle"
            />
            <Scatter 
              name="Below Average" 
              data={performanceDistribution.filter(d => d.category === "Below Average")} 
              fill="hsl(var(--destructive))"
              shape="circle"
            />
            {/* Average line */}
            <Scatter 
              data={[
                { studentIndex: 0, score: stats.averageScore },
                { studentIndex: learners.length + 1, score: stats.averageScore }
              ]}
              line={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
              shape={() => null}
            />
          </ScatterChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-sm text-muted-foreground mb-1">Above Average</p>
            <p className="text-2xl font-bold text-success">
              {performanceDistribution.filter(d => d.category === "Above Average").length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/20">
            <p className="text-sm text-muted-foreground mb-1">Average</p>
            <p className="text-2xl font-bold" style={{ color: "hsl(var(--chart-4))" }}>
              {performanceDistribution.filter(d => d.category === "Average").length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-muted-foreground mb-1">Below Average</p>
            <p className="text-2xl font-bold text-destructive">
              {performanceDistribution.filter(d => d.category === "Below Average").length}
            </p>
          </div>
        </div>
      </Card>

      {/* Grade Distribution */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-orange-500">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Grade Distribution</h3>
            <p className="text-sm text-muted-foreground">Student count across performance bands</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gradeRanges} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="range" 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Score Range', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  const percentage = ((data.count / learners.length) * 100).toFixed(1);
                  return (
                    <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                      <p className="font-semibold text-foreground">{data.range}</p>
                      <p className="text-sm text-muted-foreground">Students: {data.count}</p>
                      <p className="text-sm text-muted-foreground">Percentage: {percentage}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {gradeRanges.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Subject-wise Detailed Breakdown */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Subject-wise Analysis</h3>
              <p className="text-sm text-muted-foreground">Detailed performance metrics by subject</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects ({subjectBreakdown.length})</SelectItem>
                <SelectItem value="critical">Critical (&lt;30% pass rate)</SelectItem>
                <SelectItem value="low-pass">Low Pass Rate (&lt;50%)</SelectItem>
                <SelectItem value="high-fail">High Failing Count (&gt;5)</SelectItem>
                <SelectItem value="weak">Weak Performance (&lt;30% avg)</SelectItem>
                <SelectItem value="excellent">Excellent (&ge;40% avg)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Subject</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Average</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Highest</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Pass Rate</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Excellence Rate</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Failing</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No subjects match the selected filter criteria
                  </td>
                </tr>
              ) : (
                filteredSubjects
                .sort((a, b) => b.average - a.average)
                .map((subject, idx) => (
                  <tr 
                    key={idx}
                    className="border-b border-border hover:bg-accent/5 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-foreground">{subject.subject}</td>
                    <td className="text-center py-4 px-4">
                      <span className={`font-semibold ${
                        subject.average >= 40 ? 'text-success' : 
                        subject.average >= 30 ? 'text-warning' : 
                        'text-destructive'
                      }`}>
                        {subject.average.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-4 px-4 text-muted-foreground">
                      {subject.highest.toFixed(1)}%
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min(subject.passRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {subject.passRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-sm font-medium text-success">
                        {subject.excellenceRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        subject.failing === 0 ? 'bg-success/10 text-success' :
                        subject.failing <= 3 ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {subject.failing}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {subject.average >= 40 ? (
                        <div className="flex items-center gap-1 text-success">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs font-medium">Strong</span>
                        </div>
                      ) : subject.average >= 30 ? (
                        <div className="flex items-center gap-1 text-warning">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Moderate</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-destructive">
                          <TrendingDown className="w-4 h-4" />
                          <span className="text-xs font-medium">Needs Help</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Key Insights */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Key Insights</h3>
            <p className="text-sm text-muted-foreground">Data-driven analysis of student performance</p>
          </div>
        </div>

        <div className="space-y-4">
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${getInsightStyles(insight.type)} transition-all duration-300 hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${getInsightIconColor(insight.type)}`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-orange-500">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Management Recommendations</h3>
            <p className="text-sm text-muted-foreground">Actionable strategies for improvement</p>
          </div>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getPriorityBadge(rec.priority)}`}>
                    {rec.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                    {rec.category}
                  </span>
                </div>
              </div>
              <h4 className="font-semibold text-foreground mb-2">{rec.action}</h4>
              <p className="text-sm text-muted-foreground">{rec.rationale}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
