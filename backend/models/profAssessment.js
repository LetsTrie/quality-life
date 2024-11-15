const mongoose = require("mongoose");
const { MODEL_NAME } = require("./model_name");
const Schema = mongoose.Schema;

const profAssessmentSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: MODEL_NAME.USER },
    prof: { type: Schema.Types.ObjectId, ref: MODEL_NAME.PROFESSIONAL },
    hasSeen: { type: Boolean, default: false },
    assessmentSlug: String,
    hasCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProfAssessment = mongoose.model(
  MODEL_NAME.PROFESSIONAL_ASSESSMENT,
  profAssessmentSchema
);
module.exports = ProfAssessment;
