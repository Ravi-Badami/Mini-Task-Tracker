export const userSwagger = {
  '/users/register': {
    post: {
      summary: 'Register a new user',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'User name' },
                email: { type: 'string', format: 'email', description: 'User email' },
                password: { type: 'string', description: 'User password' },
              },
              required: ['name', 'email', 'password'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: 'Bad request' },
        409: { description: 'User already exists' },
      },
    },
  },
  '/users/login': {
    post: {
      summary: 'Login user',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email', description: 'User email' },
                password: { type: 'string', description: 'User password' },
              },
              required: ['email', 'password'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      user: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          name: { type: 'string' },
                          email: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                      },
                      token: { type: 'string', description: 'JWT token' },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: 'Bad request' },
        401: { description: 'Invalid credentials' },
      },
    },
  },
};
