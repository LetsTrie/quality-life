const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    // port: 587,
    // secure: false,
    port: 465,
    secure: true,
    auth: {
        user: '82bdf2001@smtp-brevo.com',
        pass: 'zRK94xOXYA1aEItB',
    },
});

const sendEmail = async (toAddress, subject, htmlBody) => {
    const mailOptions = {
        from: `"Tasnuva from Qlife" <${process.env.EMAIL_SENDER}>`,
        to: toAddress,
        subject: subject,
        html: htmlBody,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return {
            success: true,
            messageId: info.messageId,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

module.exports = { sendEmail };
