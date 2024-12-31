// const nodemailer = require('nodemailer');

const { Resend } = require('resend');
const resend = new Resend('re_bCfxV6zg_4QA3s9kfXNdDZS5mQekADSeK');

const sendEmail = async (toAddress, subject, htmlBody) => {
    // let transporter = nodemailer.createTransport({
    //     host: process.env.SMTP_SERVER,
    //     port: process.env.SMTP_PORT,
    //     secure: false, // true for 465, false for other ports
    //     auth: {
    //         user: process.env.SMTP_LOGIN,
    //         pass: process.env.SMTP_PASSWORD,
    //     },
    // });

    try {
        const r = await resend.emails.send({
            from: 'qlife2025@gmail.com',
            to: toAddress,
            subject: subject,
            html: htmlBody,
        });

        // let info = await transporter.sendMail({
        //     from: `"Tasnuva from Qlife" <${process.env.EMAIL_SENDER}>`,
        //     to: toAddress,
        //     subject: subject,
        //     html: htmlBody,
        // });

        // console.log('Message sent: %s', info.messageId);

        return {
            success: true,
            messageId: r,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

module.exports = { sendEmail };
