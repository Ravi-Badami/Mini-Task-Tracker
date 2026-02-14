# Mini Task Tracker

A robust, full-stack Task Management Application designed to help users organize their daily tasks efficiently. Built with modern web technologies, it features secure authentication, real-time updates, and a responsive user interface.

## 🚀 Key Features

### Backend (Node.js & Express)

- **Secure Authentication**:
  - User Registration with **Email Verification**.
  - Login with **JWT (JSON Web Tokens)**.
  - **Refresh Token** mechanism for seamless sessions.
  - Secure Logout functionality.
  - Password hashing using `bcryptjs`.
- **Task Management API**:
  - Create, Read, Update, and Delete (CRUD) tasks.
  - Tasks are privately scoped to the authenticated user.
- **Advanced Technical Features**:
  - **Redis Caching**: Optimized performance for data retrieval.
  - **API Documentation**: Integrated **Swagger UI** for exploring API endpoints.
  - **Input Validation**: Strong request validation using **Zod**.
  - **Logging**: Structured logging with `winston`.
  - **Containerization**: Fully Dockerized for consistent deployment.

### Frontend (Next.js)

- **Modern UI**: Built with **Next.js 14** (App Router) and **Tailwind CSS**.
- **Responsive Design**: Fully responsive layout for desktop and mobile.
- **Interactive Components**:
  - Task Creation Modal.
  - Task List with status management.
  - Email Verification pages with visual feedback.
- **State Management**: efficient interaction with backend APIs.

---

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Caching**: Redis
- **Documentation**: Swagger (OpenAPI 3.0)
- **Testing**: Jest

### Frontend

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

### DevOps

- **Containerization**: Docker, Docker Compose
- **Package Management**: npm Workspaces (Monorepo setup)
- **Linting/Formatting**: ESLint, Prettier

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/) & Docker Compose (for Docker setup)
- [MongoDB](https://www.mongodb.com/) (for manual setup)
- [Redis](https://redis.io/) (for manual setup)

---

## ⚙️ Installation & Setup

You can run this project in two ways: using **Docker** (recommended) or **Manually**.

### Option 1: Using Docker (Recommended)

This method automatically sets up Backend, Frontend, MongoDB, and Redis containers.

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install workspace dependencies** (one-time setup):

    ```bash
    npm install
    ```

3.  **Start the application**:

    ```bash
    docker-compose up --build
    ```

4.  **Access the application**:
    - **Frontend**: [http://localhost:3000](http://localhost:3000)
    - **Backend API**: [http://localhost:5000](http://localhost:5000)
    - **API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

### Option 2: Manual Installation

This project uses **npm workspaces** for managing both Backend and frontend from the root directory.

#### Quick Start (From Root Directory)

1.  **Install all dependencies**:

    ```bash
    npm install
    ```

2.  **Start Backend** (in one terminal):

    ```bash
    npm run dev:backend
    ```

3.  **Start Frontend** (in another terminal):
    ```bash
    npm run dev:frontend
    ```

#### Individual Setup

If you prefer running services locally without Docker.

#### 1. Backend Setup

1.  Navigate to the backend directory:

    ```bash
    cd Backend
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    - Create a `.env` file in the `Backend` directory.
    - Copy the contents from `.env.example` or use the reference below:

    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/tasktracker
    REDIS_URL=redis://localhost:6379
    JWT_SECRET=your_super_secret_key
    JWT_REFRESH_SECRET=your_refresh_secret
    SMTP_HOST=smtp.gmail.com
    SMTP_USER=your_email@gmail.com
    SMTP_PASS=your_app_password
    ```

4.  Start the Backend server:
    ```bash
    npm run dev
    ```
    _Server will run at `http://localhost:5000`_

#### 2. Frontend Setup

1.  Navigate to the frontend directory:

    ```bash
    cd ../frontend
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Start the Frontend development server:
    ```bash
    npm run dev
    ```
    _App will run at `http://localhost:3000`_

---

## 📚 API Documentation

The backend includes a fully interactive Swagger documentation.

1.  Ensure the backend is running.
2.  Visit: **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

This provides detailed information about all available endpoints, request bodies, and responses.

---

## 🧪 Running Tests

### From Root Directory (Recommended)

Run backend tests with coverage from the root:

```bash
npm run test:coverage
```

Or run tests without coverage:

```bash
npm test
```

### From Backend Directory

Alternatively, navigate to Backend and run tests:

```bash
cd Backend
npm test
```

For coverage report:

```bash
cd Backend
npm run test:coverage
```

---

## 📦 Available NPM Scripts

This project uses **npm workspaces** to manage both Backend and frontend from the root directory.

### Root Directory Commands

Run these commands from the project root:

#### Testing

- `npm test` - Run backend tests
- `npm run test:coverage` - Run backend tests with coverage report

#### Development

- `npm run dev:backend` - Start backend development server
- `npm run dev:frontend` - Start frontend development server

#### Build

- `npm run build:backend` - Build backend for production
- `npm run build:frontend` - Build frontend for production

#### Linting

- `npm run lint:backend` - Lint backend code
- `npm run lint:frontend` - Lint frontend code

### Individual Workspace Commands

You can also navigate to Backend or frontend directories and run their scripts directly:

```bash
cd Backend
npm run dev          # Start backend server
npm test             # Run tests
npm run lint         # Lint code
```

```bash
cd frontend
npm run dev          # Start frontend server
npm run build        # Build for production
npm run lint         # Lint code
```
