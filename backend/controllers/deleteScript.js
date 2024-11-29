const ProfNotification = require("../models/profNotification");
const UserNotification = require("../models/userNotification");
const Appointment = require("../models/appointment");
const ProfAssessment = require("../models/profAssessment");
const MyClient = require("../models/myClient");
const AppointmentMeta = require("../models/appointmentMeta");

const deleteAll = async () => {
  await AppointmentMeta.deleteMany({});
  await Appointment.deleteMany({});
  await ProfNotification.deleteMany({});
  await ProfAssessment.deleteMany({});
  await MyClient.deleteMany({});
  await UserNotification.deleteMany({});
};

module.exports = deleteAll;
