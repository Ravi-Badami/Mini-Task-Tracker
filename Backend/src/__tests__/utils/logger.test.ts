import winston from 'winston';
import logger from '../../utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    // Clear all transports before each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (logger as any).transports.forEach((transport: any) => {
      transport.silent = false;
    });
  });

  it('should be a winston logger instance', () => {
    expect(logger).toBeInstanceOf(winston.Logger);
  });

  it('should have console transport', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transports = (logger as any).transports;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const consoleTransport = transports.find((t: any) => t.name === 'console');
    expect(consoleTransport).toBeDefined();
  });

  it('should have file transports', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transports = (logger as any).transports;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileTransports = transports.filter((t: any) => t.name === 'file');
    expect(fileTransports.length).toBeGreaterThan(0);
  });

  it('should log info messages', () => {
    const spy = jest.spyOn(logger, 'info').mockReturnValue(logger);
    logger.info('Test message', { test: 'data' });

    expect(spy).toHaveBeenCalledWith('Test message', { test: 'data' });
    spy.mockRestore();
  });

  it('should log error messages', () => {
    const spy = jest.spyOn(logger, 'error').mockReturnValue(logger);
    const error = new Error('Test error');
    logger.error('Error occurred', { error: error.message });

    expect(spy).toHaveBeenCalledWith('Error occurred', { error: error.message });
    spy.mockRestore();
  });

  it('should log warning messages', () => {
    const spy = jest.spyOn(logger, 'warn').mockReturnValue(logger);
    logger.warn('Warning message');

    expect(spy).toHaveBeenCalledWith('Warning message');
    spy.mockRestore();
  });
});
