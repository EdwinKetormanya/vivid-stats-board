import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  teacherEmail: string;
  teacherName?: string;
  schoolName: string;
  role: "teacher" | "school_admin";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { teacherEmail, teacherName, schoolName, role }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", teacherEmail);

    const roleTitle = role === "school_admin" ? "School Administrator" : "Teacher";
    const appUrl = Deno.env.get("SUPABASE_URL")?.replace("/rest/v1", "") || "https://your-app.com";
    
    const emailResponse = await resend.emails.send({
      from: "School Report System <onboarding@resend.dev>",
      to: [teacherEmail],
      subject: `Welcome to ${schoolName} - ${roleTitle} Access`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
              .info-box {
                background: white;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                font-size: 14px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">Welcome to ${schoolName}!</h1>
            </div>
            <div class="content">
              <p>Hello ${teacherName || "there"},</p>
              
              <p>You have been added as a <strong>${roleTitle}</strong> at <strong>${schoolName}</strong> in the School Report System.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">Your Access Details:</h3>
                <ul style="margin: 10px 0;">
                  <li><strong>School:</strong> ${schoolName}</li>
                  <li><strong>Role:</strong> ${roleTitle}</li>
                  <li><strong>Email:</strong> ${teacherEmail}</li>
                </ul>
              </div>

              <h3>Getting Started:</h3>
              <ol>
                <li>If you haven't already, <strong>sign up</strong> using this email address (${teacherEmail})</li>
                <li>After signing up, <strong>log in</strong> to access your dashboard</li>
                <li>${role === "school_admin" 
                  ? "As a School Administrator, you can manage teachers, view all classes, and oversee school operations" 
                  : "As a Teacher, you can create classes, upload student data, and generate reports"}</li>
              </ol>

              <div style="text-align: center;">
                <a href="${appUrl}/auth" class="button">Go to Login Page</a>
              </div>

              <div class="info-box">
                <h4 style="margin-top: 0;">💡 Next Steps:</h4>
                <p style="margin-bottom: 0;">
                  ${role === "school_admin" 
                    ? "Visit the School Admin Dashboard to manage your school's teachers and classes." 
                    : "Start by creating a new class and uploading your students' data via Excel file."}
                </p>
              </div>

              <p>If you have any questions or need assistance, please contact your school administrator.</p>

              <p>Best regards,<br>
              <strong>School Report System Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-teacher-welcome function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);
