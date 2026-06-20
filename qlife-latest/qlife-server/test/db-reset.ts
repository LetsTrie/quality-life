import { PrismaClient } from '@prisma/client';

export async function resetDb(prisma: PrismaClient) {
  // Truncate tables that tests touch. Keep it explicit and safe.
  await prisma.notification.deleteMany();
  await prisma.deviceToken.deleteMany();
  await prisma.appointmentEvent.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.careRelationship.deleteMany();
  await prisma.assessmentAnswer.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.professionalVerification.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.account.deleteMany();
}

