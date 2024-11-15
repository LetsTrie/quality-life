const router = require("express").Router();
const AuthCtrl = require("./auth.controller");

// u: User
// p: Professional

router.post("/u/sign-in", AuthCtrl.userSignIn);
router.post("/u/sign-up", AuthCtrl.userSignUp);

module.exports = router;
