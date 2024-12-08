const { capitalizeFirstLetter } = require('../../utils/string');

const accountApprovedEmailTemplate = username => {
  username = capitalizeFirstLetter(username);
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid #e8e8e8;
    }
    .header {
      background-color: #007BFF;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px 30px;
      color: #333333;
      line-height: 1.8;
    }
    .content p {
      margin: 15px 0;
      font-size: 16px;
      color: #555555;
    }
    .content p:first-of-type {
      font-weight: bold;
      color: #333333;
    }
    .content p:last-of-type {
      margin-top: 20px;
      font-style: italic;
      color: #666666;
    }
    .cta-button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #007BFF;
      color: #ffffff;
      text-decoration: none;
      font-size: 16px;
      border-radius: 4px;
      margin-top: 20px;
    }
    .footer {
      background-color: #f8f8f8;
      padding: 15px 30px;
      text-align: center;
      font-size: 14px;
      color: #666666;
    }
    .footer a {
      color: #007BFF;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Welcome to QLife</h1>
    </div>
    <div class="content">
      <p>Dear ${username},</p>
      <p>
        Congratulations! Your account has been successfully approved and activated. 
        You are now part of our professional network, and we are thrilled to have you onboard.
      </p>
      <p>
        You can now log in and start using QLife's features. If you have any questions or need assistance, 
        feel free to reach out to our support team.
      </p>
      <p>Best regards,<br />The QLife Team</p>
    </div>
    <div class="footer">
        <p>&copy; ${new Date().getFullYear()} QLife. All rights reserved.</p>
        <p>
        Need help? <a href="mailto:${
          process.env.SUPPORT_EMAIL
        }">Contact Support</a>
        </p>
    </div>
  </div>
</body>
</html>
`;
};

module.exports = {
  accountApprovedEmailTemplate,
};
