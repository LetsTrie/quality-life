const mongoose = require("mongoose");
const { MODEL_NAME } = require("./model_name");
const { constants } = require("../utils/constants");
const Schema = mongoose.Schema;

const profNotificationSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.USER,
    },
    prof: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.PROFESSIONAL,
    },
    type: {
      type: String,
      enum: [constants.APPOINTMENT_REQUESTED, "SCALE_FILL_UP"],
    },
    hasSeen: {
      type: Boolean,
      default: false,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.APPOINTMENT,
    },
    assessmentResultId: String,
    assessmentId: String,
  },
  { timestamps: true }
);

const ProfNotification = mongoose.model(
  "qlife_profNotification",
  profNotificationSchema
);
module.exports = ProfNotification;
