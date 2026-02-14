import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize the transporter.
   * Uses Ethereal (fake SMTP) in dev, or real SMTP in production.
   */
  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Production: use real SMTP credentials from env
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Development: use Ethereal (fake SMTP for testing)
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('[Email] Using Ethereal test account:', testAccount.user);
    }

    return this.transporter;
  }

  /**
   * Send an email
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    const transporter = await this.getTransporter();
    const from = process.env.SMTP_FROM || '"Task Tracker" <noreply@tasktracker.dev>';

    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    // In dev, log the Ethereal preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('[Email] Preview URL:', previewUrl);
    }

    console.log(`[Email] Sent to ${options.to} | messageId: ${info.messageId}`);
  }

  /**
   * Send a verification email with a token link
   */
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    await this.sendEmail({
      to,
      subject: 'Verify your email - Task Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p>Thank you for registering! Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; 
                    text-decoration: none; border-radius: 6px; margin: 16px 0; font-weight: bold;">
            Verify Email
          </a>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br/>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
      `,
    });
  }
}

export default new EmailService();
