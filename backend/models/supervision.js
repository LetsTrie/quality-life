const mongoose = require("mongoose");

const supervisionSchema = new mongoose.Schema({
  userId: String,
  supervisionR_F: String,
  duration: String,
  dates: String,
});

const Supervision = mongoose.model("qlife_supervision", supervisionSchema);

module.exports = Supervision;
