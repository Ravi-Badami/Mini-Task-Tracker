import nodemailer from 'nodemailer';
import EmailService from '../../utils/email.service';

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let sendMailMock: jest.Mock;

  beforeEach(() => {
    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
    jest.clearAllMocks();
    // Reset the singleton transporter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (EmailService as any).transporter = null;
  });

  describe('EmailService', () => {
    let sendMailMock: jest.Mock;

    beforeEach(() => {
      sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' });
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: sendMailMock,
      });
      jest.clearAllMocks();
    });

    it('should send verification email successfully', async () => {
      const to = 'test@example.com';
      const token = 'verification-token-123';

      await EmailService.sendVerificationEmail(to, token);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'Verify your email - Task Tracker',
          html: expect.stringContaining(token),
        }),
      );
    });

    it('should throw error if email sending fails', async () => {
      sendMailMock.mockRejectedValue(new Error('SMTP Error'));

      await expect(EmailService.sendVerificationEmail('test@example.com', 'token')).rejects.toThrow('SMTP Error');
    });
  });
});
