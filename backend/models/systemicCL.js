const mongoose = require("mongoose");

const systemicCLSchema = new mongoose.Schema({
  userId: String,
  client: String,
  dateSeen: String,
  issueProblem: String,
  therapistTeam: String,
});

const SystemicCL = mongoose.model("qlife_systemicCL", systemicCLSchema);

module.exports = SystemicCL;
