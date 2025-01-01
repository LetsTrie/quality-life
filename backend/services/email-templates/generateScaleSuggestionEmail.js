const generateScaleSuggestionEmail = ({
    userName,
    profName,
    assessmentName,
}) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; padding: 20px; }
      .header { background-color: #007BFF; color: #ffffff; padding: 20px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { padding: 20px 30px; }
      .content p { font-size: 16px; line-height: 1.8; color: #555555; }
      .footer { background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 14px; color: #666666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Scale Suggested</h1>
      </div>
      <div class="content">
        <p>Dear ${userName},</p>
        <p>
          <strong>${profName}</strong> has suggested a scale for you: 
          <em>${assessmentName}</em>.
        </p>
        <p>Please log in to the app to review and complete the assessment.</p>
        <p>We encourage you to complete the scale at your earliest convenience for better insights.</p>
        <p>Best regards,<br>The Appointments Team</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Qlife. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

module.exports = {
    generateScaleSuggestionEmail,
};
