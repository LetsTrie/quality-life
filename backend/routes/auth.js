const router = require("express").Router();
const AuthCtrl = require("../controllers/auth");

router.post("/sign-in", AuthCtrl.signIn);
router.post("/sign-up", AuthCtrl.signUp);

module.exports = router;
