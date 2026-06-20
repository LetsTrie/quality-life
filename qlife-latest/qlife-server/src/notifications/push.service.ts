import { Agent } from 'node:https';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

import { PrismaService } from '../prisma/prisma.service';

type PushData = Record<string, string>;

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private app: admin.app.App | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    if (admin.apps.length > 0) {
      this.app = admin.apps[0] ?? null;
      return;
    }

    const serviceAccount = this.loadServiceAccount();
    if (!serviceAccount) {
      this.logger.warn(
        'Firebase service account not configured — push notifications disabled. ' +
          'Set FIREBASE_SERVICE_ACCOUNT_B64 (or FIREBASE_SERVICE_ACCOUNT_JSON).',
      );
      return;
    }

    try {
      // firebase-admin fetches OAuth2 tokens via node-fetch, which injects a
      // `Connection: close` header when no agent is supplied. On Node 19+ that
      // collides with the default keep-alive socket pool and intermittently
      // aborts the googleapis.com/oauth2 response with "Premature close"
      // (node-fetch#1735 / nodejs/node#47130). Passing an explicit agent
      // suppresses that header and fixes the token fetch.
      const httpAgent = new Agent({ keepAlive: false });
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount, httpAgent),
        httpAgent,
      });
      this.logger.log(
        `Firebase Admin initialized (project: ${serviceAccount.project_id ?? serviceAccount.projectId ?? 'unknown'})`,
      );
    } catch (err) {
      this.logger.error('Failed to initialize Firebase Admin SDK', err as Error);
      this.app = null;
    }
  }

  /// Reads the service account from base64 (preferred) or raw JSON env vars.
  /// Firebase's `cert()` accepts both snake_case (file format) and camelCase keys.
  private loadServiceAccount(): (admin.ServiceAccount & { project_id?: string }) | null {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    let json: string | undefined;
    if (b64 && b64.trim()) {
      try {
        json = Buffer.from(b64.trim(), 'base64').toString('utf8');
      } catch (err) {
        this.logger.error('FIREBASE_SERVICE_ACCOUNT_B64 is not valid base64', err as Error);
        return null;
      }
    } else if (raw && raw.trim()) {
      json = raw.trim();
    }

    if (!json) return null;

    try {
      return JSON.parse(json) as admin.ServiceAccount & { project_id?: string };
    } catch (err) {
      this.logger.error('Firebase service account JSON could not be parsed', err as Error);
      return null;
    }
  }

  isEnabled() {
    return this.app != null;
  }

  async sendToAccount(args: {
    accountId: string;
    title: string;
    body: string;
    data?: PushData;
  }) {
    if (!this.app) return;

    const rows = await this.prisma.deviceToken.findMany({
      where: { accountId: args.accountId },
      select: { token: true },
    });
    const tokens = rows.map((row) => row.token);
    if (!tokens.length) return;

    await this.sendToTokens({
      tokens,
      title: args.title,
      body: args.body,
      data: args.data,
    });
  }

  async sendToTokens(args: {
    tokens: string[];
    title: string;
    body: string;
    data?: PushData;
  }) {
    if (!this.app || !args.tokens.length) return;

    // Data-only delivery (no `notification` key): the OS never auto-renders
    // these, so a logged-out device can't show a stale push. The client builds
    // the visible notification itself, but only while authenticated (see
    // PushNotificationService). title/body ride along as data so the client can
    // render them.
    const data: PushData = {
      ...(args.data ?? {}),
      title: args.title,
      body: args.body,
    };

    const result = await admin.messaging(this.app).sendEachForMulticast({
      tokens: args.tokens,
      data,
      android: {
        priority: 'high',
      },
    });

    const staleTokens: string[] = [];
    result.responses.forEach((response, index) => {
      if (response.success) return;
      const code = response.error?.code;
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token' ||
        code === 'messaging/invalid-argument'
      ) {
        staleTokens.push(args.tokens[index]!);
      } else {
        this.logger.warn(`FCM send failed: ${code ?? 'unknown'} — ${response.error?.message ?? ''}`);
      }
    });

    if (staleTokens.length) {
      await this.prisma.deviceToken.deleteMany({
        where: { token: { in: staleTokens } },
      });
    }
  }
}
