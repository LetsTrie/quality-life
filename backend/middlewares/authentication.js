const jwt = require('jsonwebtoken');
const Prof = require('../models/prof');
const User = require('../models/user');

exports.verifyToken = (role) => async (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (bearerHeader && bearerHeader.startsWith('Bearer')) {
    const accessToken = bearerHeader.split(' ')[1];
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'UnAuthorized',
      });
    }

    try {
      const decoded = await jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_TOKEN
      );
      let user;
      if (role === 'user') user = await User.findById(decoded.id);
      else if (role === 'prof') user = await Prof.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }
      req.user = user;
      next();
    } catch (err) {
      console.log(err);
      return res.status(401).json({
        success: false,
        message: 'Token Expired',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Please provide a token',
    });
  }
};
