import nodemailer from "nodemailer";

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send teacher approval email
 * @param {string} teacherEmail - Teacher's email address
 * @param {string} teacherName - Teacher's full name
 * @returns {Promise<object>} Mail response
 */
export const sendApprovalEmail = async (teacherEmail, teacherName) => {
  try {
    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 5px 0 0 0; opacity: 0.9; }
            .content { background: white; padding: 40px 20px; border: 1px solid #e0e0e0; border-top: none; }
            .content p { margin: 0 0 15px 0; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
            .highlight { background: #f0f7ff; border-left: 4px solid #667eea; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Application Approved!</h1>
              <p>Welcome to OpenLesson Teacher Community</p>
            </div>
            <div class="content">
              <p>Hi <strong>${teacherName}</strong>,</p>
              
              <p>We are thrilled to inform you that your teacher application has been <strong style="color: #667eea;">APPROVED</strong>!</p>
              
              <div class="highlight">
                <p><strong>Your application has been reviewed and approved.</strong> You can now log in to your teacher account and start creating study materials, managing students, and conducting study sessions.</p>
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Log in to your account</li>
                <li>Complete your profile information</li>
                <li>Select subjects and grades you teach</li>
                <li>Upload study materials</li>
                <li>Start creating quizzes and announcements</li>
                <li>Schedule study sessions</li>
              </ul>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br><strong>OpenLesson Admin Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2024 OpenLesson. All rights reserved.</p>
              <p style="opacity: 0.8;">This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: teacherEmail,
      subject: "Your Teacher Application Has Been Approved! 🎉",
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${teacherEmail}`);
    return result;
  } catch (error) {
    console.error(`❌ Error sending approval email to ${teacherEmail}:`, error.message);
    throw error;
  }
};

/**
 * Send teacher rejection email
 * @param {string} teacherEmail - Teacher's email address
 * @param {string} teacherName - Teacher's full name
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<object>} Mail response
 */
export const sendRejectionEmail = async (teacherEmail, teacherName, rejectionReason = "") => {
  try {
    const transporter = createTransporter();

    const reasonSection = rejectionReason 
      ? `
        <div class="highlight">
          <p><strong>Reason for Rejection:</strong></p>
          <p>${rejectionReason}</p>
        </div>
      ` 
      : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 5px 0 0 0; opacity: 0.9; }
            .content { background: white; padding: 40px 20px; border: 1px solid #e0e0e0; border-top: none; }
            .content p { margin: 0 0 15px 0; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
            .highlight { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
            a { color: #f5576c; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Status Update</h1>
              <p>We appreciate your interest in joining OpenLesson</p>
            </div>
            <div class="content">
              <p>Hi <strong>${teacherName}</strong>,</p>
              
              <p>Thank you for your interest in becoming a teacher at OpenLesson. We have carefully reviewed your application.</p>
              
              <p>Unfortunately, we regret to inform you that your application has not been approved at this time.</p>
              
              ${reasonSection}
              
              <p><strong>What Can You Do?</strong></p>
              <ul>
                <li>Review the feedback provided above</li>
                <li>Address the areas mentioned in the rejection reason</li>
                <li>Enhance your qualifications and experience</li>
                <li>Consider reapplying after improvements</li>
                <li>Contact our support team if you have questions</li>
              </ul>
              
              <p>We appreciate your understanding and encourage you to reach out if you'd like to discuss your application or have any questions.</p>
              
              <p>Email: <strong>${process.env.ADMIN_EMAIL || "support@openlesson.com"}</strong></p>
              
              <p>Best regards,<br><strong>OpenLesson Admin Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2024 OpenLesson. All rights reserved.</p>
              <p style="opacity: 0.8;">This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: teacherEmail,
      subject: "Your Teacher Application Status Update",
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Rejection email sent to ${teacherEmail}`);
    return result;
  } catch (error) {
    console.error(`❌ Error sending rejection email to ${teacherEmail}:`, error.message);
    throw error;
  }
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} True if connection successful
 */
export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email service configured correctly");
    return true;
  } catch (error) {
    console.error("❌ Email service configuration error:", error.message);
    return false;
  }
};
