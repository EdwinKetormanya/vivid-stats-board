import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, TrendingUp, TrendingDown, Lightbulb, Users, BookOpen, Award } from "lucide-react";
import { LearnerScore, SubjectPerformance, DashboardStats } from "@/types/learner";

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
