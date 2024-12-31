const { SendEmailCommand } = require('@aws-sdk/client-ses');
const { sesClient } = require('./sesClient');

/**
 * Sends an email using Amazon SES.
 * @param {string} toAddress - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} htmlBody - HTML content of the email.
 * @returns {Promise<object>} - Result of the SES send command.
 */
const sendEmail = async (toAddress, subject, htmlBody) => {
    const sendEmailCommand = new SendEmailCommand({
        Destination: {
            ToAddresses: [toAddress],
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: htmlBody,
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            },
        },
        Source: `"Tasnuva from Qlife" <${process.env.EMAIL_SENDER}>`,
    });

    try {
        const response = await sesClient.send(sendEmailCommand);
        // console.log(response);
        return {
            success: true,
            messageId: response.MessageId,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

module.exports = { sendEmail };
