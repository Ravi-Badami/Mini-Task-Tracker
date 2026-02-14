import { authSwagger } from '../modules/auth/auth.swagger';
import { userSwagger } from '../modules/user/user.swagger';
import { taskSwagger } from '../modules/tasks/task.swagger';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Task Tracker API',
    version: '1.0.0',
    description: 'API documentation for the Task Tracker application with secure authentication and task management',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
    },
  },
  paths: {
    ...authSwagger,
    ...userSwagger,
    ...taskSwagger,
  },
};

export default swaggerSpec;
