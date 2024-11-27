const router = require("express").Router();
const AuthCtrl = require("../controllers/auth");

router.post("/refresh-token", AuthCtrl.tokenRefresher);

module.exports = router;
