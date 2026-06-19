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

  async sendText(args: { to: string; subject: string; text: string; html?: string }) {
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
      html: args.html,
    });
  }

  /// Bilingual (Bangla-first) branded email. `body*` are arrays of paragraphs.
  /// Falls back to plain text for clients that don't render HTML.
  async sendBilingual(args: {
    to: string;
    subjectBn: string;
    bodyBn: string[];
    bodyEn: string[];
  }) {
    const esc = (s: string) =>
      s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string);
    const para = (s: string) => `<p style="margin:0 0 12px;line-height:1.6">${esc(s)}</p>`;
    const html = `<div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2933">
  <div style="font-size:18px;font-weight:700;color:#2A8C7D;margin-bottom:16px">QLife</div>
  ${args.bodyBn.map(para).join('')}
  <hr style="border:none;border-top:1px solid #e4e7eb;margin:16px 0"/>
  <div style="color:#7b8794;font-size:13px">${args.bodyEn.map(para).join('')}</div>
</div>`;
    const text = [...args.bodyBn, '', ...args.bodyEn].join('\n');
    await this.sendText({ to: args.to, subject: args.subjectBn, text, html });
  }
}

