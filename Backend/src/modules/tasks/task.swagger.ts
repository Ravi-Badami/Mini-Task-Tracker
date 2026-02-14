export const taskSwagger = {
  '/api/tasks': {
    get: {
      summary: 'Get all tasks for the authenticated user',
      tags: ['Tasks'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: ['pending', 'completed'] },
          description: 'Filter by task status',
        },
        {
          in: 'query',
          name: 'dueDateFrom',
          schema: { type: 'string', format: 'date' },
          description: 'Filter tasks with due date >= this date (ISO 8601 format)',
        },
        {
          in: 'query',
          name: 'dueDateTo',
          schema: { type: 'string', format: 'date' },
          description: 'Filter tasks with due date <= this date (ISO 8601 format)',
        },
      ],
      responses: {
        200: {
          description: 'Tasks retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'completed'] },
                    dueDate: { type: 'string', format: 'date-time' },
                    userId: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized - Invalid or missing token' },
      },
    },
    post: {
      summary: 'Create a new task',
      tags: ['Tasks'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Task title' },
                description: { type: 'string', description: 'Task description' },
                status: {
                  type: 'string',
                  enum: ['pending', 'completed'],
                  description: 'Task status',
                  default: 'pending',
                },
                dueDate: { type: 'string', format: 'date-time', description: 'Task due date' },
              },
              required: ['title'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Task created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['pending', 'completed'] },
                  dueDate: { type: 'string', format: 'date-time' },
                  userId: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized - Invalid or missing token' },
      },
    },
  },
  '/api/tasks/{id}': {
    put: {
      summary: 'Update a task',
      tags: ['Tasks'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Task ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Task title' },
                description: { type: 'string', description: 'Task description' },
                status: {
                  type: 'string',
                  enum: ['pending', 'completed'],
                  description: 'Task status',
                },
                dueDate: { type: 'string', format: 'date-time', description: 'Task due date' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Task updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['pending', 'completed'] },
                  dueDate: { type: 'string', format: 'date-time' },
                  userId: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized - Invalid or missing token' },
        404: { description: 'Task not found' },
      },
    },
    delete: {
      summary: 'Delete a task',
      tags: ['Tasks'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Task ID',
        },
      ],
      responses: {
        200: {
          description: 'Task deleted successfully',
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
        401: { description: 'Unauthorized - Invalid or missing token' },
        404: { description: 'Task not found' },
      },
    },
  },
};
