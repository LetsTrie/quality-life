const { capitalizeFirstLetter } = require('../../utils/string');

const otpVerificationEmailTemplate = (username, otp) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #007BFF;
      color: #ffffff;
      padding: 20px;
      text-align: left;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px 30px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
      color: #555555;
      margin: 10px 0;
    }
    .otp {
      display: block;
      background: #f9f9f9;
      font-size: 20px;
      font-weight: bold;
      color: #333333;
      padding: 10px 15px;
      border-radius: 4px;
      border: 1px dashed #007BFF;
      width: fit-content;
      margin: 15px 0;
    }
    .footer {
      background-color: #f8f8f8;
      padding: 20px;
      color: #aaaaaa;
      font-size: 14px;
      text-align: left;
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
      <h1>Your OTP Code</h1>
    </div>
    <div class="content">
      <p>Hello ${capitalizeFirstLetter(username)},</p>
      <p>Use the following One-Time Password (OTP) to complete the verification process. The OTP is valid for the next 10 minutes:</p>
      <span class="otp">${otp}</span>
      <p>If you did not request this, please ignore this email or contact support if you have any concerns.</p>
      <p>Thank you!</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Qlife. All rights reserved.</p>
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

module.exports = {
  otpVerificationEmailTemplate,
};
