import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger';
import { connectMongoDB, connectRedis } from './config/db';
import userRoutes from './modules/user/user.routes';
import authRouter from './modules/auth/auth.routes';
import logger from './utils/logger';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/users', userRoutes);
app.use('/auth', authRouter);

// Handle old/misconfigured verification links
app.get('/verify-email', (req, res) => {
  const { token } = req.query;
  if (!token) {
    res.status(400).send('Invalid link');
    return;
  }
  res.redirect(`/auth/verify-email?token=${token}`);
});

// Initialize database connections
(async () => {
  try {
    await connectMongoDB();
    await connectRedis();

    app.listen(port, () => {
      logger.info('Server started successfully', { port, environment: process.env.NODE_ENV || 'development' });
    });
  } catch (error) {
    logger.error('Failed to start server due to connection error', { error });
    process.exit(1);
  }
})();
