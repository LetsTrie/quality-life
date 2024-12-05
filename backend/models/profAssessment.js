const mongoose = require("mongoose");
const { MODEL_NAME } = require("./model_name");
const Schema = mongoose.Schema;

const profAssessmentSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.USER,
    },
    prof: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.PROFESSIONAL,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.PROFESSIONALS_CLIENT,
    },
    assessmentSlug: String,

    hasCompleted: {
      type: Boolean,
      default: false,
    },
    totalWeight: String,
    stage: String,
    maxWeight: String,
    questionAnswers: [
      {
        question: String,
        answer: String,
      },
    ],
    completedAt: Date,
  },
  { timestamps: true }
);

const ProfAssessment = mongoose.model(
  MODEL_NAME.PROFESSIONAL_ASSESSMENT,
  profAssessmentSchema
);

module.exports = ProfAssessment;
