import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

type TransportKind = 'log' | 'smtp';

@Injectable()
export class EmailService {
  private readonly kind: TransportKind;
  private readonly from: string;
  private readonly transporter: nodemailer.Transporter | null;

  constructor() {
    this.kind = ((process.env.EMAIL_TRANSPORT ?? 'log').toLowerCase() as TransportKind) || 'log';
    this.from = process.env.EMAIL_FROM ?? 'no-reply@qlife.invalid';

    if (this.kind !== 'smtp') {
      this.transporter = null;
      return;
    }

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true';

    if (!host || !user || !pass) {
      // Fall back to log mode if SMTP not configured.
      this.kind = 'log';
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  async sendText(args: { to: string; subject: string; text: string }) {
    if (!args.to) return;

    if (this.kind === 'log') {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ email: { from: this.from, ...args } }));
      return;
    }

    if (!this.transporter) return;
    await this.transporter.sendMail({
      from: this.from,
      to: args.to,
      subject: args.subject,
      text: args.text,
    });
  }
}

