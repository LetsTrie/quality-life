const mongoose = require("mongoose");
const { MODEL_NAME } = require("./model_name");
const Schema = mongoose.Schema;

const profAssessmentSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: MODEL_NAME.USER },
    prof: { type: Schema.Types.ObjectId, ref: MODEL_NAME.PROFESSIONAL },
    assessmentId: String,
    totalWeight: String,
    stage: String,
    maxWeight: String,
    answers: [String],
    notificationId: String,
  },
  { timestamps: true }
);

const ProfAssessment = mongoose.model(
  "qlife_profAssessmentResult",
  profAssessmentSchema
);
module.exports = ProfAssessment;
