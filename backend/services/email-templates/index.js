const otpVerificationEmailTemplate = require('./otp-verification');
const accountApprovedEmailTemplate = require('./account-approved');
const profRegStep1EmailTemplate = require('./prof-reg-step1-verification');

return {
    ...otpVerificationEmailTemplate,
    ...accountApprovedEmailTemplate,
    ...profRegStep1EmailTemplate,
};
