import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { learners, subjectPerformance, stats } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create a comprehensive data summary for AI analysis
    const dataSummary = `
LEARNER PERFORMANCE DATA ANALYSIS REQUEST

Total Learners: ${stats.totalLearners}
Class Average Score: ${stats.averageScore}%
Top Performer: ${stats.topPerformer}
Lowest Score: ${stats.lowestScore}

SUBJECT PERFORMANCE BREAKDOWN:
${subjectPerformance.map((subject: any) => 
  `- ${subject.subject}: Average ${subject.average}, Highest ${subject.highest}`
).join('\n')}

TOP STUDENTS:
${learners.slice(0, 5).map((student: any, idx: number) => 
  `${idx + 1}. ${student.name} - Total: ${student.totalRawScore}, Average: ${student.averageScore.toFixed(2)}, Position: ${student.position}`
).join('\n')}

BOTTOM PERFORMERS:
${learners.slice(-3).map((student: any) => 
  `${student.name} - Total: ${student.totalRawScore}, Average: ${student.averageScore.toFixed(2)}`
).join('\n')}

Please provide a comprehensive analysis with:
1. Overall Performance Summary (2-3 paragraphs)
2. Subject-Specific Insights (identify strengths and weaknesses)
3. Student Performance Patterns (top performers vs struggling students)
4. Actionable Recommendations for Management (at least 5 specific recommendations)
5. Areas of Concern (if any)
6. Success Indicators (positive trends)

Format the response in a structured way with clear headings and bullet points where appropriate.
`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an educational data analyst specializing in student performance analysis. Provide detailed, actionable insights for school management to make informed decisions. Be specific with numbers and percentages. Focus on practical, implementable recommendations.'
          },
          {
            role: 'user',
            content: dataSummary
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-performance function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to generate performance insights'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
