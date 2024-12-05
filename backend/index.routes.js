const router = require("express").Router();

router.use("/auth", require("./routes/auth"));
router.use("/user", require("./routes/user"));
router.use("/prof", require("./routes/prof"));

router.use("/notifications", require("./routes/notifications"));

module.exports = router;
