import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import { useState } from "react";

interface InsightsPanelProps {
  learners: any[];
  subjectPerformance: any[];
  stats: any;
}

export const InsightsPanel = ({ learners, subjectPerformance, stats }: InsightsPanelProps) => {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const generateInsights = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-performance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            learners,
            subjectPerformance,
            stats,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const data = await response.json();
      setInsights(data.insights);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const formatInsights = (text: string) => {
    const sections = text.split('\n\n');
    return sections.map((section, idx) => {
      const lines = section.split('\n');
      const heading = lines[0];
      const content = lines.slice(1);

      // Determine icon based on heading keywords
      let Icon = Lightbulb;
      if (heading.toLowerCase().includes('concern') || heading.toLowerCase().includes('weakness')) {
        Icon = AlertCircle;
      } else if (heading.toLowerCase().includes('success') || heading.toLowerCase().includes('strength')) {
        Icon = CheckCircle;
      } else if (heading.toLowerCase().includes('recommendation')) {
        Icon = TrendingUp;
      }

      return (
        <div key={idx} className="mb-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="mt-1 p-2 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground mb-2">{heading}</h4>
              <div className="space-y-2">
                {content.map((line, lineIdx) => {
                  if (!line.trim()) return null;
                  
                  // Check if it's a bullet point
                  if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                    return (
                      <div key={lineIdx} className="flex items-start gap-2 ml-4">
                        <span className="text-accent mt-1.5">•</span>
                        <p className="text-muted-foreground flex-1">{line.replace(/^[-•]\s*/, '')}</p>
                      </div>
                    );
                  }
                  
                  // Check if it's a numbered list
                  if (/^\d+\./.test(line.trim())) {
                    return (
                      <div key={lineIdx} className="flex items-start gap-2 ml-4">
                        <span className="text-primary font-semibold">{line.match(/^\d+\./)?.[0]}</span>
                        <p className="text-muted-foreground flex-1">{line.replace(/^\d+\.\s*/, '')}</p>
                      </div>
                    );
                  }
                  
                  return (
                    <p key={lineIdx} className="text-muted-foreground">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">AI-Powered Insights & Recommendations</h3>
            <p className="text-sm text-muted-foreground">Detailed analysis for management decision-making</p>
          </div>
        </div>
        
        <Button
          onClick={generateInsights}
          disabled={loading}
          className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300"
        >
          {loading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Error generating insights</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {insights && !loading && (
        <div className="prose prose-sm max-w-none">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border border-border">
            {formatInsights(insights)}
          </div>
        </div>
      )}

      {!insights && !loading && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground mb-2">Click "Generate Insights" to get detailed AI-powered analysis</p>
          <p className="text-sm text-muted-foreground">
            Get comprehensive recommendations based on student performance data
          </p>
        </div>
      )}
    </Card>
  );
};
