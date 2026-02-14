import dotenv from 'dotenv';

dotenv.config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
  accessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
  refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  refreshExpiryMs: parseInt(process.env.JWT_REFRESH_EXPIRY_MS || String(7 * 24 * 60 * 60 * 1000), 10),
};

export default jwtConfig;
