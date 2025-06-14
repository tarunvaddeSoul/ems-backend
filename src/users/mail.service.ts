import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transport: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('MAIL_ID'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendForgotPasswordEmail(email: string, resetToken: string) {
    try {
      const mailOptions = {
        from: this.configService.get<string>('MAIL_ID'),
        to: email,
        subject: 'Password Reset Request',
        text:
          `You recently requested to reset your password.\n\n` +
          `Please click on the following link to reset your password: \n\n` +
          `http://localhost:3000/users/reset-password?token=${resetToken}\n\n` +
          `This link will expire in 1 hour.\n\n` +
          `If you did not request a password reset, please ignore this email and your password will remain unchanged.\n`,
      };

      await this.transport.sendMail(mailOptions);
      this.logger.log(`Forgot password email sent to ${email}`);
    } catch (error) {
      this.logger.error('Error sending forgot password email:', error);
      throw error;
    }
  }
}
