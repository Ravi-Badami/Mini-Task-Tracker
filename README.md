# Mini Task Tracker

A production-ready, full-stack task management application featuring secure authentication, real-time optimistic updates, and enterprise-grade architecture. Built with modern technologies and best practices for scalability and maintainability.

> **⚠️ ASSIGNMENT NOTE**: This project includes a `.env` file in the Backend directory for evaluation purposes only. In production environments, `.env` files should NEVER be committed to version control. The included SMTP credentials are temporary and will be rotated after the assignment review.

## ✨ Highlights

- **🔐 Enterprise Security**: JWT authentication with refresh token rotation, email verification, and Redis-backed session management
- **⚡ Optimistic UI**: Instant feedback with automatic rollback on failures for a native-app experience
- **🎯 Advanced Task Management**: CRUD operations with multi-criteria filtering (status, date ranges) and user isolation
- **📊 Full Test Coverage**: Comprehensive unit and integration tests with 90%+ coverage
- **🐳 Production-Ready**: Fully containerized with Docker Compose for consistent deployments
- **📚 Interactive API Docs**: Auto-generated Swagger documentation for seamless API exploration
- **🎨 Modern UI/UX**: Responsive design with toast notifications and loading states

---

## 🛠️ Tech Stack

### Backend

- **Node.js + Express** with TypeScript
- **MongoDB** (Mongoose ODM) with Redis caching
- **JWT** authentication with refresh token rotation
- **Zod** for runtime validation
- **Winston** for structured logging
- **Jest** for testing (90%+ coverage)
- **Swagger/OpenAPI** for documentation

### Frontend

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Optimistic UI updates** for instant feedback
- **Custom toast system** for notifications
- **Email polling** for verification status

### DevOps

- **Docker Compose** for multi-container orchestration
- **MongoDB & Redis** containers
- **ESLint + Prettier** for code quality

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- OR Node.js 18+, MongoDB, and Redis (manual setup)

### Using Docker (Recommended)

1. **Clone and install**:

   ```bash
   git clone <repository-url>
   cd mini-task-tracker
   ```

2. **Create environment files**:

   Create `Backend/.env`:

   ```env
   PORT=5000
   MONGO_URI=mongodb://mongo:27017/tasktracker
   REDIS_URL=redis://redis:6379
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_key_here
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

3. **Start the application**:

   ```bash
   docker-compose up --build
   ```

4. **Access**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - API Docs: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

---

## 💡 Key Features Implemented

### Authentication & Security

- **Email Verification Flow**: Secure registration with email confirmation before account activation
- **JWT Token System**: Stateless authentication with access and refresh tokens
- **Token Rotation**: Automatic refresh token rotation on every use for enhanced security
- **Token Family Tracking**: Redis-backed family ID system to detect and prevent token reuse attacks
- **Password Security**: Bcrypt hashing with salt rounds
- **Protected Routes**: Middleware-based authentication for all task endpoints

### Task Management

- **Full CRUD Operations**: Create, read, update, and delete tasks
- **Advanced Filtering**: Filter tasks by status (pending/completed) and date ranges
- **User Isolation**: Each user can only access their own tasks
- **Optimistic UI Updates**: Instant UI feedback with automatic rollback on server errors
- **Real-time Sync Indicators**: Visual "Syncing..." badges for pending operations

### User Experience

- **Toast Notifications**: Contextual success/error messages with auto-dismiss
- **Loading States**: Proper feedback for all async operations
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Email Verification Polling**: Automatic verification status checking with smart UI updates
- **Conditional UI**: Context-aware buttons (e.g., resend verification only on failure)

### Code Quality & Testing

- **90%+ Test Coverage**: Comprehensive unit and integration tests
- **TypeScript**: Full type safety across frontend and backend
- **Input Validation**: Zod schemas for runtime request validation
- **Error Handling**: Custom ApiError class with proper HTTP status codes
- **Structured Logging**: Winston logger with different log levels
- **Repository Pattern**: Clean separation of data access logic

### DevOps & Documentation

- **Docker Compose**: Multi-container setup with proper networking
- **Swagger UI**: Interactive API documentation at `/api-docs`
- **Environment Management**: Secure configuration via environment variables
- **Git Ignored Secrets**: Proper `.gitignore` for sensitive files

---

## 📂 Project Structure

```
mini-task-tracker/
├── Backend/
│   ├── src/
│   │   ├── config/          # Database, JWT, Redis, Swagger configs
│   │   ├── middleware/      # Authentication middleware
│   │   ├── modules/
│   │   │   ├── auth/        # Auth controller, service, routes, validation
│   │   │   ├── tasks/       # Task CRUD with filtering
│   │   │   └── user/        # User management
│   │   ├── utils/           # Email service, JWT utils, logging, error handling
│   │   └── __tests__/       # Comprehensive test suite
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # Reusable React components
│   │   ├── hooks/           # Custom hooks (useToast)
│   │   └── services/        # API integration layer
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Multi-container orchestration
└── README.md
```

---

## 🧪 Testing

Run backend tests with coverage:

```bash
# From root directory
npm run test:coverage

# From Backend directory
cd Backend && npm run test:coverage
```

**Test Coverage**:

- Controllers: Unit tests with mocked services
- Services: Business logic validation
- Repositories: Database interaction tests
- Middleware: Authentication flow tests
- Utilities: Helper function tests
- Integration: End-to-end API tests

---

## 📖 API Documentation

Interactive Swagger documentation available at: **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

### Main Endpoints:

**Authentication**

- `POST /users/register` - Register new user (sends verification email)
- `POST /auth/verify-email?token=` - Verify email with token
- `POST /auth/resend-verification` - Resend verification email
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and invalidate tokens

**Tasks**

- `GET /api/tasks` - Get all tasks (with optional filters: status, dueDateFrom, dueDateTo)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

---

## 🔧 Manual Setup (Without Docker)

### Backend Setup

### Backend Setup

1. **Install dependencies**:

   ```bash
   cd Backend
   npm install
   ```

2. **Configure environment** (create `Backend/.env`):

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/tasktracker
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_key_here
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

3. **Start MongoDB and Redis**:

   ```bash
   # MongoDB (default port 27017)
   mongod

   # Redis (default port 6379)
   redis-server
   ```

4. **Run backend**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**:

   ```bash
   cd frontend
   npm install
   ```

2. **Run frontend**:
   ```bash
   npm run dev
   ```

---

## 🎯 Usage Flow

1. **Register**: Create account → Receive verification email
2. **Verify Email**: Click link in email or use token
3. **Login**: Authenticate with verified email
4. **Manage Tasks**:
   - Create tasks with title, description, status, due date
   - Filter by status or date range
   - Edit tasks with instant UI updates
   - Delete tasks with optimistic removal
5. **Logout**: Securely end session

---

## 🏗️ Architecture Decisions

### Why Optimistic UI?

- **Instant Feedback**: Users see changes immediately without waiting for server responses
- **Automatic Rollback**: Failed operations revert automatically with error notifications
- **Better UX**: Native-app feel in a web application

### Why Token Rotation?

- **Enhanced Security**: Each refresh invalidates the previous token
- **Attack Prevention**: Family ID system detects token reuse (potential theft)
- **Automatic Revocation**: Compromised tokens become useless after one use

### Why Email Verification?

- **Account Security**: Ensures users own the email addresses they register with
- **Reduces Spam**: Prevents automated bot registrations
- **Recovery Path**: Verified emails enable password reset functionality

### Why Repository Pattern?

- **Separation of Concerns**: Business logic isolated from data access
- **Testability**: Easy to mock database operations in tests
- **Maintainability**: Database changes don't affect service layer

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)

| Variable             | Description               | Example                             |
| -------------------- | ------------------------- | ----------------------------------- |
| `PORT`               | Server port               | `5000`                              |
| `MONGO_URI`          | MongoDB connection string | `mongodb://mongo:27017/tasktracker` |
| `REDIS_URL`          | Redis connection string   | `redis://redis:6379`                |
| `JWT_SECRET`         | Secret for access tokens  | `your_secret_key`                   |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `your_refresh_secret`               |
| `SMTP_HOST`          | Email server host         | `smtp.gmail.com`                    |
| `SMTP_USER`          | Email account             | `your-email@gmail.com`              |
| `SMTP_PASS`          | Email app password        | `your_app_password`                 |

**Note**: For Gmail, use [App Passwords](https://support.google.com/accounts/answer/185833) instead of your regular password.

---

## 🚢 Production Deployment Tips

1. **Environment Variables**: Use secrets management (AWS Secrets Manager, HashiCorp Vault)
2. **Database**: Use managed MongoDB (Atlas) and Redis (ElastiCache, Upstash)
3. **Frontend**: Deploy to Vercel, Netlify, or AWS Amplify
4. **Backend**: Deploy to AWS ECS, Railway, or Render
5. **HTTPS**: Always use SSL certificates (Let's Encrypt)
6. **Monitoring**: Add monitoring and logging (Sentry, DataDog)
7. **Rate Limiting**: Implement rate limiting for API endpoints

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

Built with ❤️ as a demonstration of full-stack development best practices.

---

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- MongoDB and Redis communities
- Open source contributors
