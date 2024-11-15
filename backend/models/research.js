const mongoose = require("mongoose");

const researchSchema = new mongoose.Schema({
  userId: String,
  title: String,
  ongoingPublished: String,
  proposal: String,
  researchCond: String,
  publication: String,
});

const Research = mongoose.model("qlife_research", researchSchema);

module.exports = Research;
