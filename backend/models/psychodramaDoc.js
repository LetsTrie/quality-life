const mongoose = require("mongoose");

const psychodramaDocSchema = new mongoose.Schema({
  userId: String,
  sL: Number,
  date: String,
  title: String,
  specificSS: String,
  trainerSupervisor: String,
  trainingH: String,
  supervisionH: String,
});

const PsychodramaDoc = mongoose.model(
  "qlife_psychodramaDoc",
  psychodramaDocSchema
);

module.exports = PsychodramaDoc;
