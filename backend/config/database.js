const mongoose = require('mongoose');
const logger = require('./winston');

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            maxPoolSize: 10,
        });
        logger.info('Database connected successfully');
    } catch (error) {
        logger.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

connectToDatabase();

module.exports = mongoose;
