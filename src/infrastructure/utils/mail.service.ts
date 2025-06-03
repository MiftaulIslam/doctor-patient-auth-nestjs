/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendMail({email, subject, html}:any) {
    await this.transporter.sendMail({
      to: email,
      subject: subject,
      html: html,
    });
  }
  async sendVerificationEmail(email: string, token: string) {
    const url = `${process.env.APP_URL}/auth/verify?token=${token}`;
    await this.transporter.sendMail({
      to: email,
      subject: 'Verify your doctor account',
      html: `<p>Click to verify: <a href="${url}">${url}</a></p>`,
    });
  }
}
