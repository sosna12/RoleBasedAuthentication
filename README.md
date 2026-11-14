# Role-Based User Authentication & JWT Microservice

A full-stack authentication and authorization system built with **React, Node.js, Express.js, MongoDB, and JSON Web Tokens (JWT)**.

The application provides secure user registration and login, role-based access control, protected routes, and separate dashboards for Admin, Manager, and regular User accounts.

## Live Demo

- **Frontend:** https://role-basedauthentication.vercel.app/
- **Backend API:** https://rolebasedauthentication-qd6f.onrender.com
- **GitHub Repository:** https://github.com/sosna12/RoleBasedAuthentication

## Project Overview

This project demonstrates how to build a role-based authentication system using a REST API and JWT authentication.

Users can register and log in, while authorization middleware controls access to protected resources according to their assigned roles.

## Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- REST API
- JSON Web Token (JWT)
- bcryptjs
- CORS

### Database
- MongoDB
- MongoDB Atlas
- Mongoose

### Deployment
- Vercel – Frontend hosting
- Render – Backend hosting
- MongoDB Atlas – Cloud database

## Main Features

### Authentication
- User registration
- User login and logout
- Password hashing using bcrypt
- JWT-based authentication
- Protected API routes

### Role-Based Authorization

The application supports three user roles:

| Role | Permissions |
|---|---|
| Admin | Manage users, view users, update user roles, and access administrative features |
| Manager | Access manager dashboard and authorized user information |
| User | Access personal profile and user dashboard |

### User Management
- View registered users (authorized roles only)
- View personal profile
- Update user roles (Admin only)
- Prevent unauthorized access to protected endpoints

### Security
- Passwords are stored as bcrypt hashes
- JWT verification middleware
- Role-based authorization middleware
- Environment variables for sensitive configuration
- Protection against unauthorized role changes

### Audit Logging
- Record important user activities
- Store actor and target information
- Record action details and timestamps

## Project Structure

```text
RoleBasedAuthentication/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── ...
│   │   └── ...
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── user.js
│   │   └── auditLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   └── auditService.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── README.md
```

*The structure above summarizes the main application folders. Your actual repository may contain additional files.*

## Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js and npm
- MongoDB or a MongoDB Atlas account
- Git
- Visual Studio Code (recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/sosna12/RoleBasedAuthentication.git
```

```bash
cd RoleBasedAuthentication
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_private_jwt_secret
JWT_EXPIRES_IN=1d
```

Start the backend:

```bash
npm run dev
```

The backend will run locally at:

`http://localhost:5000`

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local development URL displayed by Vite, usually:

`http://localhost:5173`

## API Endpoints

Base URL:

`/api`

### Authentication Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |

### User Routes

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users/profile` | Authenticated users |
| GET | `/api/users` | Admin and Manager |
| PATCH | `/api/users/:id/role` | Admin only |

Protected endpoints require a valid JWT Bearer token.

Example:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Environment Variables

Never upload real `.env` files, database credentials, JWT secrets, or access tokens to GitHub.

Use the provided `.env.example` files as templates and configure production environment variables through your hosting providers.

## Testing

Test the following functionality:

- User registration
- User login with valid credentials
- Login rejection with invalid credentials
- Access to protected routes
- Admin permissions
- Manager permissions
- Regular user permissions
- Unauthorized role-change attempts
- Audit log creation

## Deployment

The application is deployed using:

- **Vercel:** React frontend
- **Render:** Express.js backend
- **MongoDB Atlas:** Cloud database

The frontend communicates with the deployed backend through the `VITE_API_URL` environment variable.

## Learning Objectives

This project demonstrates practical understanding of:

- Full-stack web application development
- RESTful API development
- Authentication and authorization
- JWT implementation
- Password hashing
- MongoDB database integration
- Role-based access control
- Backend middleware
- Cloud deployment

## Author

**Sosna Adugna**

Software Engineering Student

- GitHub: https://github.com/sosna12
- LinkedIn: https://linkedin.com/in/sosna-adugna-69354a441

---

**Project:** Role-Based User Authentication & JWT Microservice

**Purpose:** Arrowstack Internship Project – Task 1