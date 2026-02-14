import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Tracker API',
      version: '1.0.0',
      description: 'API documentation for the Task Tracker backend',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/**/*.ts'], // Paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

export default specs;
