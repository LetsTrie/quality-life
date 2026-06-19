import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { CognitoJwtService } from '../src/auth/cognito-jwt.service';
import { resetDb } from './db-reset';

// The mock CognitoJwtService treats the bearer token value as the Cognito sub.
// This lets tests control which "user" they are by simply switching the header.
const mockCognito = {
  verifyBearerToken: async (token: string) => ({
    sub: token,
    iss: 'issuer',
    aud: 'aud',
    email: `${token}@example.com`,
    email_verified: true,
  }),
};

async function ensureTestDistrict(prisma: PrismaClient) {
  const existing = await prisma.district.findFirst();
  if (existing) return existing;

  const division = await prisma.division.create({
    data: { code: 'test-div', nameEn: 'Test Division', nameBn: 'Test Division' },
  });
  return prisma.district.create({
    data: {
      code: 'test-dist',
      nameEn: 'Test District',
      nameBn: 'Test District',
      divisionId: division.id,
    },
  });
}

function completeProfileBody(districtId: string) {
  return {
    displayName: 'Rahim Uddin',
    gender: 'MALE',
    marital: 'SINGLE',
    dateOfBirth: '1998-06-15',
    districtId,
  };
}

describe('User / Professional / Admin flows (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CognitoJwtService)
      .useValue(mockCognito)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => resetDb(prisma));

  afterAll(async () => {
    await resetDb(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  // ─── User flows ────────────────────────────────────────────────────────────

  describe('User profile completion', () => {
    it('GET /v1/me creates an account on first visit', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', 'Bearer user-profile-1')
        .expect(200);

      expect(res.body.data.account).toMatchObject({
        email: 'user-profile-1@example.com',
        role: 'USER',
        status: 'ACTIVE',
      });
    });

    it('GET /v1/users/me returns isProfileComplete: false for new user', async () => {
      await request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', 'Bearer user-profile-1')
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', 'Bearer user-profile-1')
        .expect(200);

      expect(res.body.data.isProfileComplete).toBe(false);
    });

    it('PATCH /v1/users/me completes the profile', async () => {
      const district = await ensureTestDistrict(prisma);

      await request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', 'Bearer user-profile-1')
        .expect(200);

      const res = await request(app.getHttpServer())
        .patch('/v1/users/me')
        .set('Authorization', 'Bearer user-profile-1')
        .send(completeProfileBody(district.id))
        .expect(200);

      expect(res.body.data.isProfileComplete).toBe(true);
      expect(res.body.data.user.displayName).toBe('Rahim Uddin');
    });

    it('GET /v1/users/me reflects profile after update', async () => {
      const district = await ensureTestDistrict(prisma);

      await request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', 'Bearer user-profile-1')
        .expect(200);

      await request(app.getHttpServer())
        .patch('/v1/users/me')
        .set('Authorization', 'Bearer user-profile-1')
        .send(completeProfileBody(district.id))
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', 'Bearer user-profile-1')
        .expect(200);

      expect(res.body.data.isProfileComplete).toBe(true);
    });
  });

  // ─── Professional flows ────────────────────────────────────────────────────

  describe('Professional onboarding', () => {
    it('POST /v1/professionals/register converts a USER account to PROFESSIONAL', async () => {
      // Ensure account exists.
      await request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', 'Bearer pro-flow-1')
        .expect(200);

      const res = await request(app.getHttpServer())
        .post('/v1/professionals/register')
        .set('Authorization', 'Bearer pro-flow-1')
        .send({ fullName: 'Dr. Nusrat Jahan', professionType: 'COUNSELOR' })
        .expect(201);

      expect(res.body.data).toBeDefined();
    });

    it('role changes to PROFESSIONAL after registration', async () => {
      await request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', 'Bearer pro-flow-1')
        .expect(200);

      await request(app.getHttpServer())
        .post('/v1/professionals/register')
        .set('Authorization', 'Bearer pro-flow-1')
        .send({ fullName: 'Dr. Nusrat Jahan', professionType: 'COUNSELOR' })
        .expect(201);

      const meRes = await request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', 'Bearer pro-flow-1')
        .expect(200);

      expect(meRes.body.data.account.role).toBe('PROFESSIONAL');
    });

    it('GET /v1/professionals/me returns the newly created profile', async () => {
      await request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', 'Bearer pro-flow-1')
        .expect(200);

      await request(app.getHttpServer())
        .post('/v1/professionals/register')
        .set('Authorization', 'Bearer pro-flow-1')
        .send({ fullName: 'Dr. Nusrat Jahan', professionType: 'COUNSELOR' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/v1/professionals/me')
        .set('Authorization', 'Bearer pro-flow-1')
        .expect(200);

      expect(res.body.data.professional).toMatchObject({
        fullName: 'Dr. Nusrat Jahan',
        professionType: 'COUNSELOR',
      });
    });

    it('PATCH /v1/professionals/me updates the professional profile', async () => {
      await request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', 'Bearer pro-flow-1')
        .expect(200);
      await request(app.getHttpServer())
        .post('/v1/professionals/register')
        .set('Authorization', 'Bearer pro-flow-1')
        .send({ fullName: 'Dr. Nusrat Jahan', professionType: 'COUNSELOR' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch('/v1/professionals/me')
        .set('Authorization', 'Bearer pro-flow-1')
        .send({ designation: 'Senior Counselor', acceptingNewClients: true })
        .expect(200);

      expect(res.body.data.professional.designation).toBe('Senior Counselor');
    });

    it('professional is not listed in directory before verification', async () => {
      await request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', 'Bearer pro-flow-1')
        .expect(200);
      await request(app.getHttpServer())
        .post('/v1/professionals/register')
        .set('Authorization', 'Bearer pro-flow-1')
        .send({ fullName: 'Dr. Nusrat Jahan', professionType: 'COUNSELOR' })
        .expect(201);

      // Create a user to browse the directory.
      await request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', 'Bearer user-dir-1')
        .expect(200);

      const dirRes = await request(app.getHttpServer())
        .get('/v1/professionals')
        .set('Authorization', 'Bearer user-dir-1')
        .expect(200);

      const items = dirRes.body.data?.items ?? dirRes.body.data?.professionals ?? [];
      // New unverified professional should not be visible.
      expect(items.some((p: { fullName: string }) => p.fullName === 'Dr. Nusrat Jahan')).toBe(false);
    });
  });

  // ─── Admin flows ───────────────────────────────────────────────────────────

  describe('Admin verification review', () => {
    async function setupProWithVerification() {
      await request(app.getHttpServer())
        .get('/v1/me')
        .set('Authorization', 'Bearer pro-admin-test')
        .expect(200);
      await request(app.getHttpServer())
        .post('/v1/professionals/register')
        .set('Authorization', 'Bearer pro-admin-test')
        .send({ fullName: 'Dr. Karim', professionType: 'CLINICAL_PSYCHOLOGIST' })
        .expect(201);

      const proAccount = await prisma.account.findFirstOrThrow({
        where: { cognitoSub: 'pro-admin-test' },
        include: { professionalProfile: { include: { verifications: true } } },
      });
      const verification = proAccount.professionalProfile!.verifications[0]!;

      // Create admin account.
      await prisma.account.create({
        data: {
          email: 'admin@example.com',
          role: 'ADMIN',
          status: 'ACTIVE',
          cognitoSub: 'admin-1',
          authProvider: 'cognito',
        },
      });

      return { verificationId: verification.id };
    }

    it('admin can approve a pending verification', async () => {
      const { verificationId } = await setupProWithVerification();

      const res = await request(app.getHttpServer())
        .post(`/v1/professionals/verifications/${verificationId}/review`)
        .set('Authorization', 'Bearer admin-1')
        .send({ decision: 'APPROVED', decisionNote: 'Documents look good' })
        .expect(201);

      expect(res.body.data.verification.status).toBe('APPROVED');
    });

    it('admin can reject a pending verification', async () => {
      const { verificationId } = await setupProWithVerification();

      const res = await request(app.getHttpServer())
        .post(`/v1/professionals/verifications/${verificationId}/review`)
        .set('Authorization', 'Bearer admin-1')
        .send({ decision: 'REJECTED', decisionNote: 'Missing documents' })
        .expect(201);

      expect(res.body.data.verification.status).toBe('REJECTED');
    });

    it('non-admin cannot access verifications endpoint', async () => {
      const { verificationId } = await setupProWithVerification();

      // Regular user token.
      await request(app.getHttpServer())
        .post(`/v1/professionals/verifications/${verificationId}/review`)
        .set('Authorization', 'Bearer pro-admin-test')
        .send({ decision: 'APPROVED' })
        .expect(403);
    });
  });
});
