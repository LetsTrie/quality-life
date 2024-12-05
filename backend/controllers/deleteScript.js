const { Notification } = require("../models");
const Appointment = require("../models/appointment");
const ProfAssessment = require("../models/profAssessment");
const MyClient = require("../models/myClient");

const deleteAll = async () => {
  await Appointment.deleteMany({});
  await Notification.deleteMany({});
  await ProfAssessment.deleteMany({});
  await MyClient.deleteMany({});
};

module.exports = deleteAll;
