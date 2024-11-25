const router = require("express").Router();
const AuthCtrl = require("../controllers/auth");

router.post("/sign-in", AuthCtrl.signIn);
router.post("/sign-up", AuthCtrl.signUp);
router.post("/refresh-token", AuthCtrl.tokenRefresher);

module.exports = router;
