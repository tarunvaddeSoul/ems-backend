import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transport: nodemailer.Transporter;
  private readonly frontendUrl: string;

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
    // Get frontend URL from environment variable, default to localhost for development
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('APP_URL') ||
      'http://localhost:3000';
  }

  async sendForgotPasswordEmail(email: string, resetToken: string) {
    try {
      const resetLink = `${this.frontendUrl}/users/reset-password?token=${resetToken}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            <p>You recently requested to reset your password for your account.</p>
            <p>Please click on the following link to reset your password:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p style="font-size: 12px; color: #666;">
              Or copy and paste this link into your browser:<br>
              <a href="${resetLink}" style="color: #007bff; word-break: break-all;">${resetLink}</a>
            </p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p style="color: #666; font-size: 14px;">
              If you did not request a password reset, please ignore this email and your password will remain unchanged.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </body>
        </html>
      `;

      const textContent = `You recently requested to reset your password.\n\nPlease click on the following link to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email and your password will remain unchanged.`;

      const mailOptions = {
        from: this.configService.get<string>('MAIL_ID'),
        to: email,
        subject: 'Password Reset Request - Tulsyan Security Services',
        text: textContent,
        html: htmlContent,
      };

      await this.transport.sendMail(mailOptions);
      this.logger.log(`Forgot password email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Error sending forgot password email to ${email}:`,
        error,
      );
      throw error;
    }
  }

  async sendPasswordResetConfirmationEmail(email: string, userName?: string) {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
            <h2 style="color: #28a745; margin-top: 0;">Password Reset Successful</h2>
            <p>Hello${userName ? ` ${userName}` : ''},</p>
            <p>Your password has been successfully reset.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </body>
        </html>
      `;

      const textContent = `Hello${
        userName ? ` ${userName}` : ''
      },\n\nYour password has been successfully reset.\n\nIf you did not make this change, please contact our support team immediately.`;

      const mailOptions = {
        from: this.configService.get<string>('MAIL_ID'),
        to: email,
        subject: 'Password Reset Successful - Tulsyan Security Services',
        text: textContent,
        html: htmlContent,
      };

      await this.transport.sendMail(mailOptions);
      this.logger.log(
        `Password reset confirmation email sent successfully to ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending password reset confirmation email to ${email}:`,
        error,
      );
      // Don't throw error here - password reset was successful, email is just a notification
    }
  }
}
