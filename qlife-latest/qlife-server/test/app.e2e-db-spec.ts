import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { CognitoJwtService } from '../src/auth/cognito-jwt.service';
import { resetDb } from './db-reset';

describe('DB-backed flows (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CognitoJwtService)
      .useValue({
        verifyBearerToken: async (token: string) => ({
          sub: token,
          iss: 'issuer',
          aud: 'aud',
          email: `${token}@example.com`,
          email_verified: true,
        }),
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Minimal instruments for e2e flows.
    async function upsertInstrument(slug: string, name: string) {
      const instrument = await prisma.instrument.upsert({
        where: { slug },
        update: { name, category: 'PRIMARY_SCREENING', isActive: true },
        create: { slug, name, category: 'PRIMARY_SCREENING', isActive: true },
      });
      const version = await prisma.instrumentVersion.upsert({
        where: {
          instrumentId_versionNumber_locale: {
            instrumentId: instrument.id,
            versionNumber: 1,
            locale: 'bn',
          },
        },
        update: { status: 'PUBLISHED', scoringMethod: 'WEIGHTED_SUM', publishedAt: new Date() },
        create: {
          instrumentId: instrument.id,
          versionNumber: 1,
          locale: 'bn',
          status: 'PUBLISHED',
          scoringMethod: 'WEIGHTED_SUM',
          publishedAt: new Date(),
        },
      });

      await prisma.answerOption.deleteMany({ where: { question: { instrumentVersionId: version.id } } });
      await prisma.question.deleteMany({ where: { instrumentVersionId: version.id } });
      await prisma.scoringBand.deleteMany({ where: { instrumentVersionId: version.id } });

      const q = await prisma.question.create({
        data: {
          instrumentVersionId: version.id,
          position: 1,
          prompt: 'How are you?',
          type: 'SINGLE_CHOICE',
          isRequired: true,
        },
      });
      await prisma.answerOption.createMany({
        data: [
          { questionId: q.id, position: 1, label: 'OK', value: 0, weight: '0' },
          { questionId: q.id, position: 2, label: 'Bad', value: 1, weight: '1' },
        ],
      });
      await prisma.scoringBand.createMany({
        data: [
          {
            instrumentVersionId: version.id,
            position: 1,
            severityRank: 0,
            label: 'LOW',
            minScore: '0',
            maxScore: '0',
            recommendedAction: 'SHOW_RESULT',
          },
          {
            instrumentVersionId: version.id,
            position: 2,
            severityRank: 1,
            label: 'HIGH',
            minScore: '1',
            maxScore: '1',
            recommendedAction: 'SHOW_RESULT',
          },
        ],
      });

      return { instrument, version };
    }

    await upsertInstrument('e2e-scale-1', 'E2E Scale 1');
    await upsertInstrument('e2e-scale-2', 'E2E Scale 2');
  });

  beforeEach(async () => {
    await resetDb(prisma);
  });

  afterAll(async () => {
    await resetDb(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  it('creates account on /v1/me and lists instruments', async () => {
    await request(app.getHttpServer())
      .get('/v1/me')
      .set('Authorization', 'Bearer user-1')
      .expect(200);

    // Seeded instruments exist.
    await request(app.getHttpServer())
      .get('/v1/instruments')
      .set('Authorization', 'Bearer user-1')
      .expect(200);
  });

  it('runs full flow: request → accept → careRelationship → multi-assign → submit → notifications', async () => {
    // Create a PROFESSIONAL account/profile bound to a token sub.
    const pro = await prisma.account.create({
      data: {
        email: 'pro@example.com',
        role: 'PROFESSIONAL',
        status: 'ACTIVE',
        cognitoSub: 'pro-1',
        authProvider: 'cognito',
      },
    });
    const proProfile = await prisma.professionalProfile.create({
      data: {
        accountId: pro.id,
        fullName: 'Dr Pro',
        professionType: 'COUNSELOR',
        isOnboardingComplete: true,
        isVisible: true,
        acceptingNewClients: true,
      },
    });

    // User requests appointment.
    const apptRes = await request(app.getHttpServer())
      .post('/v1/appointments')
      .set('Authorization', 'Bearer user-1')
      .send({
        professionalProfileId: proProfile.id,
        requestedStartAt: new Date().toISOString(),
        requestMessage: 'Need help',
        profileShareGranted: true,
      })
      .expect(201);
    const appointmentId = apptRes.body?.data?.appointmentId as string;
    expect(typeof appointmentId).toBe('string');

    // Professional marks seen + accepts.
    await request(app.getHttpServer())
      .post(`/v1/appointments/${appointmentId}/seen`)
      .set('Authorization', 'Bearer pro-1')
      .expect(201);

    const acceptRes = await request(app.getHttpServer())
      .post(`/v1/appointments/${appointmentId}/respond`)
      .set('Authorization', 'Bearer pro-1')
      .send({
        action: 'ACCEPTED',
        scheduledStartAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        professionalMessage: 'Confirmed',
        meetingLink: 'https://example.com/meet',
      })
      .expect(201);
    const careRelationshipId = acceptRes.body?.data?.appointment?.careRelationshipId as string;
    expect(typeof careRelationshipId).toBe('string');

    // Professional sees client relationship.
    const clientsRes = await request(app.getHttpServer())
      .get('/v1/clients')
      .set('Authorization', 'Bearer pro-1')
      .expect(200);
    const clients = clientsRes.body?.data?.clients as any[];
    expect(clients.some((c) => c.id === careRelationshipId)).toBe(true);

    // Multi-assign two scales.
    const assignedRes = await request(app.getHttpServer())
      .post(`/v1/assessments/assign/${careRelationshipId}`)
      .set('Authorization', 'Bearer pro-1')
      .send({ instrumentSlugs: ['e2e-scale-1', 'e2e-scale-2'] })
      .expect(201);
    const assessments = assignedRes.body?.data?.assessments as any[];
    expect(assessments).toHaveLength(2);

    // User receives in-app notifications for assignment.
    const userNotifs = await request(app.getHttpServer())
      .get('/v1/notifications?page=1')
      .set('Authorization', 'Bearer user-1')
      .expect(200);
    expect((userNotifs.body?.data?.notifications as any[]).length).toBeGreaterThan(0);

    // Submit each assigned assessment (allowed for ASSIGNED).
    const v1 = await prisma.instrumentVersion.findFirstOrThrow({
      where: { instrument: { slug: 'e2e-scale-1' }, status: 'PUBLISHED' },
      select: { id: true, questions: { select: { id: true, options: { select: { id: true } } } } },
    });
    const v2 = await prisma.instrumentVersion.findFirstOrThrow({
      where: { instrument: { slug: 'e2e-scale-2' }, status: 'PUBLISHED' },
      select: { id: true, questions: { select: { id: true, options: { select: { id: true } } } } },
    });

    const byVersion: Record<string, { qid: string; oid: string }> = {
      [v1.id]: { qid: v1.questions[0]!.id, oid: v1.questions[0]!.options[0]!.id },
      [v2.id]: { qid: v2.questions[0]!.id, oid: v2.questions[0]!.options[0]!.id },
    };

    for (const a of assessments) {
      const ids = byVersion[a.instrumentVersionId];
      expect(ids).toBeTruthy();
      await request(app.getHttpServer())
        .post(`/v1/assessments/${a.id}/answers`)
        .set('Authorization', 'Bearer user-1')
        .send({ answers: [{ questionId: ids.qid, selectedOptionId: ids.oid }] })
        .expect(201);
    }

    // Professional gets completion notifications.
    const proNotifs = await request(app.getHttpServer())
      .get('/v1/notifications?page=1')
      .set('Authorization', 'Bearer pro-1')
      .expect(200);
    const proItems = proNotifs.body?.data?.notifications as any[];
    expect(proItems.some((n) => n.type === 'ASSESSMENT_COMPLETED')).toBe(true);
  });
});

