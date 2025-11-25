# YouTube Backend Project 

 

## Overview

 

This is a comprehensive YouTube-like backend application built with Node.js, Express, and MongoDB. The repository is structured as a monorepo containing multiple projects including the main YouTube backend, data modeling examples, and frontend-backend connection samples.

 

**Author**: Harsh Sharma

**Tech Stack**: Node.js, Express, MongoDB, Cloudinary, JWT

**Project Type**: Video streaming platform backend with authentication, file uploads, and user management

 

---

 

## Repository Structure

 

```

Youtube-Backend/

├── Youtube_backend/          # Main YouTube-like backend (ES6 modules)
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API route definitions
│   │   ├── middlewares/      # Custom middleware (auth, multer)
│   │   ├── utils/            # Utility functions and helpers
│   │   ├── db/               # Database connection
│   │   ├── app.js            # Express app configuration
│   │   ├── index.js          # Application entry point
│   │   └── constant.js       # Application constants
│   ├── public/temp/          # Temporary file storage for uploads
│   └── package.json
│
├── backendProject/           # Similar structure to Youtube_backend (duplicate/backup)
│
├── DataModelling/            # Data model examples for learning
│   └── model/
│       ├── todos/            # Todo app models
│       ├── hospitalMangement/# Hospital system models
│       └── ecommerce/        # E-commerce models
│
├── connect_FE-BE/            # Frontend-backend connection examples
│   ├── frontend/
│   └── backend/
│
└── deploy backend/           # Deployment-related files

```

 

---

 

## Main Project: Youtube_backend

 

### Technology Stack

 

- **Framework**: Express v5.1.0

- **Database**: MongoDB with Mongoose v8.15.1

- **Authentication**: JWT (jsonwebtoken v9.0.2) with bcrypt v6.0.0

- **File Upload**: Multer v2.0.1

- **Cloud Storage**: Cloudinary v2.6.1

- **Security**: CORS, cookie-parser, httpOnly cookies

- **Dev Tools**: Nodemon, Prettier

- **Pagination**: mongoose-aggregate-paginate-v2

 



## API Structure

 

### Base URL Pattern

```

http://localhost:8000/api/v1/{resource}

```

 

### Authentication Flow

 

#### Public Routes

- `POST /api/v1/users/register` - User registration with file upload

- `POST /api/v1/users/login` - User login

- `POST /api/v1/users/refresh-token` - Refresh access token

 

#### Protected Routes (require JWT)

- `POST /api/v1/users/logout` - User logout

- `GET /api/v1/users/current` - Get current user

- `POST /api/v1/users/change-password` - Change password

- `PATCH /api/v1/users/update-account` - Update account details

- `PATCH /api/v1/users/avatar` - Update avatar

- `PATCH /api/v1/users/cover-image` - Update cover image

- `GET /api/v1/users/channel/:username` - Get user channel profile

 

### Authentication Mechanism

 

1. **Access Token**: Short-lived, contains user info (id, email, username, fullName)

2. **Refresh Token**: Long-lived, contains only user id

3. **Storage**: HTTPOnly secure cookies + response body

4. **Verification**: JWT middleware checks `req.cookies.accessToken` or `Authorization` header



 

---

 

## File Upload Pattern

 

### Multer Configuration (`multer.middleware.js`)

1. Files uploaded to `./public/temp/` directory

2. Middleware processes multipart form data

3. Local files then uploaded to Cloudinary

4. Cloudinary URLs stored in database

 

### Upload Flow

```

Client → Multer (temp storage) → Cloudinary → Database (URL)

```

 
 

---

 

## Security Patterns

 

### Password Security

- Bcrypt hashing with 10 rounds

- Pre-save hook automatically hashes passwords

- Only hashes when password is modified

- Passwords excluded from responses (`.select("-password")`)

 

### Token Security

- JWT tokens with secret keys from environment variables

- Access tokens expire quickly (configurable)

- Refresh tokens stored in database for validation

- HTTPOnly cookies prevent XSS attacks

- Tokens cleared on logout

 

### Request Validation

- Input validation in controllers

- Check for empty/missing fields

- Verify user existence before operations

- Validate file uploads

 

### CORS Configuration

```javascript

app.use(cors({

  origin: process.env.CORS_ORIGIN,

  credentials: true

}))

```

 

---

 

## Development Workflow

 

### Environment Setup

 

1. **Environment Variables** (create `.env` or `./env` file):

```env

PORT=8000

MONGO_URI=mongodb://localhost:27017

CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=your-secret-key

ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your-refresh-secret

REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your-cloud-name

CLOUDINARY_API_KEY=your-api-key

CLOUDINARY_API_SECRET=your-api-secret

```

 

2. **Install Dependencies**:

```bash

cd Youtube_backend

npm install

```

 

3. **Start Development Server**:

```bash

npm run dev

```

 

### Development Commands

 

```bash

# Start development server with auto-reload

npm run dev

 

# Format code with Prettier

npx prettier --write .

 

# Check for syntax errors

node --check src/index.js

```

 

---

 

## Key Files and Their Purpose

 

### Entry Points

- **`src/index.js`**: Application entry point, connects to database, starts server

- **`src/app.js`**: Express app configuration, middleware setup, route mounting

 

### Configuration

- **`src/constant.js`**: Application-wide constants (e.g., DB_NAME)

- **`package.json`**: Dependencies and scripts

- **`.prettierrc`**: Code formatting rules

 

### Database

- **`src/db/index.js`**: MongoDB connection logic with error handling

 

### Utilities

- **`src/utils/ApiError.js`**: Custom error class for consistent error handling

- **`src/utils/ApiResponse.js`**: Standardized API response format

- **`src/utils/asyncHandler.js`**: Wrapper for async route handlers

- **`src/utils/cloudinary.js`**: Cloudinary upload configuration

 

### Middleware

- **`src/middlewares/auth.middleware.js`**: JWT verification for protected routes

- **`src/middlewares/multer.middleware.js`**: File upload handling

 

---

 
