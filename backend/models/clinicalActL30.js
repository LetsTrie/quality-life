const mongoose = require("mongoose");

const clinicalActL30Schema = new mongoose.Schema({
  userId: String,
  date: String,
  nClients: Number,
  tSession: String,
  nDna: Number,
  nTermination: Number,
  nFollowup: Number,
});

const ClinicalActL30 = mongoose.model(
  "qlife_clinicalActL30",
  clinicalActL30Schema
);

module.exports = ClinicalActL30;
