const { SESClient } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
    region: process.env.AWS_SES_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

module.exports = { sesClient };
