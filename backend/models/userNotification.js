const mongoose = require("mongoose");
const { MODEL_NAME } = require("./model_name");
const { constants } = require("../utils");
const Schema = mongoose.Schema;

const userNotificationSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: MODEL_NAME.USER },
    prof: { type: Schema.Types.ObjectId, ref: MODEL_NAME.PROFESSIONAL },
    type: {
      type: String,
      enum: [
        constants.APPOINTMENT_ACCEPTED,
        "SUGGESTED_SCALE",
        "ADDED_AS_CLIENT",
      ],
    }, // SUGGESTED_SCALE, ADDED_AS_CLIENT
    hasSeen: { type: Boolean, default: false },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.APPOINTMENT,
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.PROFESSIONAL_ASSESSMENT,
    },
  },
  { timestamps: true }
);

const UserNotification = mongoose.model(
  "qlife_userNotification",
  userNotificationSchema
);
module.exports = UserNotification;
