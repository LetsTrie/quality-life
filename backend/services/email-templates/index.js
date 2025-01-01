const otpVerificationEmailTemplate = require('./otp-verification');
const accountApprovedEmailTemplate = require('./account-approved');
const profRegStep1EmailTemplate = require('./prof-reg-step1-verification');
const generateAppointmentRequestEmailTemplate = require('./generateAppointmentRequestEmail');
const generateAppointmentResponseEmailTemplate = require('./generateAppointmentResponseEmail');
const generateScaleSuggestionEmailTemplate = require('./generateScaleSuggestionEmail');
const generateScaleSubmissionEmailTemplate = require('./generateScaleSubmissionEmail');

module.exports = {
    ...otpVerificationEmailTemplate,
    ...accountApprovedEmailTemplate,
    ...profRegStep1EmailTemplate,
    ...generateAppointmentRequestEmailTemplate,
    ...generateAppointmentResponseEmailTemplate,
    ...generateScaleSuggestionEmailTemplate,
    ...generateScaleSubmissionEmailTemplate,
};
