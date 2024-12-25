const isProdEnvironment = () => {
    return process.env.NODE_ENV === 'production';
};

const isDevEnvironment = () => {
    return process.env.NODE_ENV === 'development';
};

module.exports = {
    isProdEnvironment,
    isDevEnvironment,
};
