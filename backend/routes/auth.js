const router = require('express').Router();
const AuthCtrl = require('../controllers/auth');
const validate = require('../middlewares/validate');
const authValidation = require('../validations/auth.validation');

router.post('/refresh-token', AuthCtrl.tokenRefresher);

router.get(
  '/verify-email',
  validate(authValidation.verifyEmail),
  AuthCtrl.verifyEmail,
);

router.get(
  '/verify-otp',
  validate(authValidation.verifyOtp),
  AuthCtrl.verifyOtp,
);

router.post(
  '/update-password-with-otp',
  validate(authValidation.updatePasswordWithOtp),
  AuthCtrl.updatePasswordWithOtp,
);

module.exports = router;
