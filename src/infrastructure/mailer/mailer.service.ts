/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT, // e.g., 587 for TLS, 465 for SSL, etc,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendMail(email:string, subject:string, html:string) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: subject,
      html: html,
    });
  }

  async sendPasswordResetEmail(email:string, token:string){
    const url = `${process.env.BASE_URL}/auth/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `Reset your password`,
      html: `<p>Click here to reset your password: <a href="${url}">${url}</a></p>`,
    });
  }

  async sendVerificationEmail(email: string, token: string, role: string) {
    const url = `${process.env.BASE_URL}/auth/verify?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `Verify your ${role} account`,
      html: `<p>Click to verify: <a href="${url}">${url}</a></p>`,
    });
  }
}
