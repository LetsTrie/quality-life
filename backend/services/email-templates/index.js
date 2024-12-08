const otpVerificationEmailTemplate = require('./otp-verification');
const accountApprovedEmailTemplate = require('./account-approved');

return {
  ...otpVerificationEmailTemplate,
  ...accountApprovedEmailTemplate,
};
