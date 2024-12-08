const router = require('express').Router();
const AuthCtrl = require('../controllers/auth');
const validate = require('../middlewares/validate');
const authValidation = require('../validations/auth.validation');

router.post('/refresh-token', AuthCtrl.tokenRefresher);

// curl -X GET "http://localhost:3000/auth/verify-email?accountType=user&email=sakibkhan111296@gmail.com"
router.get(
  '/verify-email',
  validate(authValidation.verifyEmail),
  AuthCtrl.verifyEmail,
);

// curl -X GET "http://localhost:3000/auth/verify-otp?accountType=user&email=sakibkhan111296@gmail.com&otp=739998"
router.get(
  '/verify-otp',
  validate(authValidation.verifyOtp),
  AuthCtrl.verifyOtp,
);

// curl -X POST "http://localhost:3000/auth/update-password-with-otp" -H "Content-Type: application/json" -d '{"password": "1234qwer", "accountType": "user", "email": "sakibkhan111296@gmail.com"}'
router.post(
  '/update-password-with-otp',
  validate(authValidation.updatePasswordWithOtp),
  AuthCtrl.updatePasswordWithOtp,
);

module.exports = router;
