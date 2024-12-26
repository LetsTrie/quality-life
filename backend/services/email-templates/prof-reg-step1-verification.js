const profRegStep1EmailTemplate = ({
    name,
    email,
    profession,
    designation,
    workplace,
    batch,
    gender,
    bmdc,
    union,
    upazila,
    zila,
    approvalLink,
}) => `
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
      }
      .content p {
        margin: 10px 0;
        font-size: 16px;
        color: #555555;
      }
      .details-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      .details-table th,
      .details-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      .details-table th {
        background-color: #f9f9f9;
        font-weight: bold;
      }
      .cta-button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #007BFF;
        color: #ffffff !important;
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
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>New Account Registration</h1>
      </div>
      <div class="content">
        <p>Dear Admin,</p>
        <p>A new professional has registered on the platform. Below are the details:</p>
        <table class="details-table">
          <tr>
            <th>Name</th>
            <td>${name}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>${email}</td>
          </tr>
          <tr>
            <th>Profession</th>
            <td>${profession}</td>
          </tr>
          <tr>
            <th>Designation</th>
            <td>${designation}</td>
          </tr>
          <tr>
            <th>Workplace</th>
            <td>${workplace}</td>
          </tr>
          <tr>
            <th>Batch</th>
            <td>${batch || '-'}</td>
          </tr>
          <tr>
            <th>Gender</th>
            <td>${gender}</td>
          </tr>
          <tr>
            <th>BMDC</th>
            <td>${bmdc || '-'}</td>
          </tr>
          <tr>
            <th>Union</th>
            <td>${union}</td>
          </tr>
          <tr>
            <th>Upazila</th>
            <td>${upazila}</td>
          </tr>
          <tr>
            <th>Zila</th>
            <td>${zila}</td>
          </tr>
        </table>
        <a class="cta-button" href="${approvalLink}" target="_blank">Approve Account</a>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} QLife. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

module.exports = {
    profRegStep1EmailTemplate,
};
