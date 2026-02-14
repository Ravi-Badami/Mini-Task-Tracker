export const authSwagger = {
  '/auth/login': {
    post: {
      summary: 'Login and get access + refresh tokens',
      tags: ['Auth'],
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
                      accessToken: { type: 'string', description: 'Short-lived JWT access token' },
                      refreshToken: { type: 'string', description: 'Long-lived JWT refresh token' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          email: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: 'Validation error' },
        401: { description: 'Invalid credentials' },
      },
    },
  },
  '/auth/refresh': {
    post: {
      summary: 'Refresh access and refresh tokens (token rotation)',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                refreshToken: { type: 'string', description: 'Current refresh token' },
              },
              required: ['refreshToken'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Tokens refreshed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string', description: 'New short-lived JWT access token' },
                      refreshToken: { type: 'string', description: 'New long-lived JWT refresh token' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Invalid, expired, or reused refresh token' },
      },
    },
  },
  '/auth/logout': {
    post: {
      summary: 'Logout and revoke the token family',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                refreshToken: { type: 'string', description: 'Refresh token to revoke' },
              },
              required: ['refreshToken'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Logged out successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/auth/verify-email': {
    get: {
      summary: 'Verify email using token from verification link',
      tags: ['Auth'],
      parameters: [
        {
          in: 'query',
          name: 'token',
          required: true,
          schema: { type: 'string' },
          description: 'Email verification token',
        },
      ],
      responses: {
        200: {
          description: 'Email verified successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        400: { description: 'Invalid or expired verification token' },
      },
    },
  },
  '/auth/resend-verification': {
    post: {
      summary: 'Resend verification email',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email', description: 'User email' },
              },
              required: ['email'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Verification email sent if user exists and is unverified',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        400: { description: 'Email already verified or validation error' },
      },
    },
  },
};
