const router = require("express").Router();

router.use("/auth", require("./routes/auth"));
router.use("/user", require("./routes/user"));
router.use("/prof", require("./routes/prof"));

module.exports = router;
