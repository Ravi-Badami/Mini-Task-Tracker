import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger';
import { connectMongoDB, connectRedis, redisClient } from './config/db';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Initialize database connections
connectMongoDB();
connectRedis();

app.get('/', async (req, res) => {
  try {
    const visits = await redisClient.incr('visits');
    res.send(`Hello! Number of visits: ${visits}`);
  } catch {
    res.status(500).send('Error incrementing visits');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
