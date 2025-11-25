# CLAUDE.md - YouTube Backend Project Guide

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

- **Runtime**: Node.js with ES6 modules (`"type": "module"`)
- **Framework**: Express v5.1.0
- **Database**: MongoDB with Mongoose v8.15.1
- **Authentication**: JWT (jsonwebtoken v9.0.2) with bcrypt v6.0.0
- **File Upload**: Multer v2.0.1
- **Cloud Storage**: Cloudinary v2.6.1
- **Security**: CORS, cookie-parser, httpOnly cookies
- **Dev Tools**: Nodemon, Prettier
- **Pagination**: mongoose-aggregate-paginate-v2

### Architecture Patterns

#### 1. **MVC Pattern**
- **Models** (`src/models/`): Mongoose schemas with business logic
- **Controllers** (`src/controllers/`): Request handlers with business logic
- **Routes** (`src/routes/`): API endpoint definitions

#### 2. **Error Handling Pattern**
```javascript
// Custom error class
class ApiError extends Error {
  constructor(statusCode, message) { ... }
}

// Async handler wrapper for controllers
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
  }
}
```

#### 3. **Response Standardization**
```javascript
class ApiResponse {
  constructor(statusCode, data, message) {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = statusCode < 400
  }
}
```

#### 4. **Middleware Chain Pattern**
Routes use middleware chaining for file uploads and authentication:
```javascript
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/register").post(upload.fields([...]), registerUser)
```

---

## Code Conventions

### Style Guide (.prettierrc)
```json
{
  "singleQuote": false,
  "bracketSpacing": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "semi": true
}
```

### Naming Conventions
- **Files**: camelCase with descriptive suffixes
  - Models: `user.model.js`, `video.model.js`
  - Controllers: `user.contoller.js` (note: typo in original)
  - Routes: `user.routes.js`
  - Middleware: `auth.middleware.js`
  - Utils: `ApiError.js`, `asyncHandler.js`

- **Functions**: camelCase, descriptive names
  - Controllers: `registerUser`, `loginUser`, `updateUserAvatar`
  - Utilities: `generateAccessAndRefreshTokens`, `uploadOnCloudinary`

- **Constants**: UPPER_SNAKE_CASE
  - Example: `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRY`

- **Models**: PascalCase
  - Example: `User`, `Video`, `Subscription`

### Import/Export Pattern
```javascript
// ES6 module syntax throughout
import express from "express";
import { User } from "../models/user.model.js";

export { registerUser, loginUser };
export const verifyJWT = asyncHandler(async (req, res, next) => { ... });
```

---

## Database Models

### User Model (`user.model.js`)
```javascript
{
  username: String (unique, indexed, lowercase),
  email: String (unique, lowercase),
  fullName: String,
  avatar: String (Cloudinary URL),
  coverImage: String (Cloudinary URL),
  watchHistory: [ObjectId] (ref: "Video"),
  password: String (hashed with bcrypt),
  refreshToken: String,
  timestamps: true
}

// Methods:
- isPasswordCorrect(password): Compare passwords
- generateAccessToken(): Generate JWT access token
- generateRefreshToken(): Generate JWT refresh token

// Hooks:
- pre("save"): Hash password before saving
```

### Video Model (`video.model.js`)
```javascript
{
  videoFile: String (Cloudinary URL),
  thumbnail: String (Cloudinary URL),
  title: String,
  description: String,
  duration: Number,
  views: Number (default: 0),
  isPublished: Boolean (default: true),
  owner: ObjectId (ref: "User"),
  timestamps: true
}

// Plugins:
- mongooseAggregatePaginate for pagination
```

### Subscription Model (`subscription.model.js`)
```javascript
{
  subscriber: ObjectId (ref: "User"),
  channel: ObjectId (ref: "User"),
  timestamps: true
}
```

---

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

```javascript
// Cookie options
const options = {
  httpOnly: true,  // Prevent XSS
  secure: true     // HTTPS only (production)
}
```

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

### Usage Example
```javascript
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
)
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

## Common Patterns and Best Practices

### Controller Pattern
```javascript
const controllerName = asyncHandler(async (req, res) => {
  // 1. Extract data from request
  const { field1, field2 } = req.body;

  // 2. Validate input
  if (!field1) {
    throw new ApiError(400, "Field is required");
  }

  // 3. Business logic
  const result = await Model.findOne({ field1 });

  // 4. Return response
  return res.status(200).json(
    new ApiResponse(200, result, "Success message")
  );
});
```

### Aggregate Pipeline Pattern (MongoDB)
Used for complex queries like getting channel profile with subscriber counts:
```javascript
const channel = User.aggregate([
  { $match: { username: username?.toLowerCase() } },
  { $lookup: { from: "subscriptions", localField: "_id", foreignField: "channel", as: "subscribers" } },
  { $addFields: { subscribersCount: { $size: "$subscribers" } } },
  { $project: { fullName: 1, username: 1, subscribersCount: 1 } }
])
```

### Error Handling
- Use `throw new ApiError(statusCode, message)` for expected errors
- `asyncHandler` wrapper catches all errors and passes to Express error handler
- Never expose sensitive error details to client

---

## Database Connection Pattern

```javascript
// src/db/index.js
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`)
  } catch (error) {
    console.log("MongoDB connection error:", error)
    process.exit(1)
  }
}
```

---

## TODO Items and Known Issues

### Known Issues in Code
1. **Typo in controller filename**: `user.contoller.js` should be `user.controller.js`
2. **Missing import in controller**: Line 187 in user.controller.js references `jwt` but needs explicit import
3. **Incomplete getWatchHistory function**: Implementation not finished (line 374-383)
4. **Missing coverImage upload**: Line 295 references undefined `coverImage` variable
5. **Logout function issue**: Line 158-159 has duplicate `req.user._id` parameter

### Improvement Opportunities (marked as TODO in code)
- **Delete old images from Cloudinary** when updating avatar/cover image (line 269, 294)
- **Frontend error handling discussion** needed (line 16 in auth.middleware.js)

---

## MongoDB Aggregation Patterns

### User Channel Profile
The application uses MongoDB aggregation pipelines for complex queries:
- `$match`: Filter users
- `$lookup`: Join with subscriptions collection
- `$addFields`: Calculate subscriber counts
- `$cond`: Conditional logic for isSubscribed field
- `$project`: Select fields to return

This pattern is used extensively for analytics and relationship queries.

---

## Testing Approach

### Manual Testing
Use tools like Postman or Thunder Client to test endpoints:

1. **Register**: POST with multipart form data
2. **Login**: POST with credentials, save tokens
3. **Protected Routes**: Include access token in cookies or Authorization header
4. **File Uploads**: Test with actual image files

### Testing Tips
- Start MongoDB before running the application
- Check `public/temp/` for uploaded files
- Verify Cloudinary uploads in dashboard
- Monitor console logs for debugging

---

## AI Assistant Guidelines

### When Modifying This Codebase

1. **File Organization**: Keep the existing structure (controllers, models, routes, etc.)
2. **Naming Patterns**: Follow existing naming conventions
3. **Error Handling**: Always use `ApiError` and `asyncHandler`
4. **Response Format**: Use `ApiResponse` class for all API responses
5. **Authentication**: Use `verifyJWT` middleware for protected routes
6. **File Uploads**: Follow the Multer → Cloudinary → Database pattern
7. **ES6 Modules**: Use `import/export`, never `require/module.exports`
8. **Async/Await**: Always use async/await, avoid callbacks

### Code Review Checklist
- [ ] All async functions wrapped in `asyncHandler`
- [ ] Input validation present
- [ ] Errors thrown as `ApiError` instances
- [ ] Responses use `ApiResponse` class
- [ ] Passwords excluded from responses
- [ ] File paths properly handled
- [ ] Environment variables used for secrets
- [ ] Mongoose models properly referenced

### Adding New Features

1. **Model**: Create in `src/models/` with proper schema and methods
2. **Controller**: Create in `src/controllers/` with business logic
3. **Routes**: Define in `src/routes/` and mount in `app.js`
4. **Middleware**: Add custom middleware in `src/middlewares/` if needed
5. **Utils**: Add reusable utilities in `src/utils/`

### Common Operations

#### Add New API Endpoint
```javascript
// 1. Add controller function
export const newFunction = asyncHandler(async (req, res) => { ... })

// 2. Add route
router.route("/new-endpoint").post(verifyJWT, newFunction)

// 3. Export controller and import in routes
```

#### Add New Model Field
```javascript
// 1. Update model schema
fieldName: { type: String, required: true }

// 2. Update controllers that use the model
// 3. Update validation logic
```

#### Add Middleware
```javascript
// 1. Create in middlewares/ folder
export const middlewareName = asyncHandler(async (req, res, next) => {
  // Logic here
  next()
})

// 2. Apply to routes
router.route("/path").method(middlewareName, controller)
```

---

## Git Workflow

### Current Branch
- Main development branch: `claude/claude-md-mieet1x70ey5nuqi-018FeaVeuss4TaY84FfRxS56`
- Base branch: (main/master)

### Recent Commits
- `fe637fd` - Change folder name from backend project to youtube backend
- `24a13f6` - Added user channel profile
- `8e0c5e9` - Updated account details
- `88b7685` - Added subscription model and change password
- `8b54639` - Added refresh token

### Commit Message Pattern
- Use descriptive, lowercase commit messages
- Focus on what changed, not how (code shows how)
- Examples: "added subscription model", "updated account details"

---

## Environment-Specific Notes

### Development
- Use `nodemon` for auto-reload
- Set `NODE_ENV=development` for verbose logging
- Use local MongoDB or development cluster

### Production Considerations
- Set `secure: true` for cookies (HTTPS)
- Use environment-specific CORS origins
- Enable MongoDB connection pooling
- Use production Cloudinary account
- Set proper token expiry times
- Enable rate limiting (not yet implemented)
- Add request logging middleware

---

## Dependencies Overview

### Production Dependencies
- `express@5.1.0` - Web framework
- `mongoose@8.15.1` - MongoDB ODM
- `bcrypt@6.0.0` - Password hashing
- `jsonwebtoken@9.0.2` - JWT tokens
- `cloudinary@2.6.1` - Media storage
- `multer@2.0.1` - File uploads
- `cors@2.8.5` - Cross-origin requests
- `cookie-parser@1.4.7` - Cookie handling
- `dotenv@16.5.0` - Environment variables
- `mongoose-aggregate-paginate-v2@1.1.4` - Pagination

### Dev Dependencies
- `nodemon@3.1.10` - Development server
- `prettier@3.5.3` - Code formatting

---

## Quick Reference Commands

```bash
# Development
npm run dev                           # Start dev server with nodemon

# Database
mongosh                               # Connect to MongoDB shell
use youtube_backend                   # Switch to database

# Git
git status                            # Check status
git add .                             # Stage changes
git commit -m "message"               # Commit changes
git push -u origin <branch-name>      # Push to remote

# Formatting
npx prettier --write .                # Format all files
npx prettier --check .                # Check formatting

# File Operations
ls -la public/temp/                   # Check uploaded files
rm -rf public/temp/*                  # Clear temp files
```

---

## Troubleshooting

### Common Issues

1. **"Module not found"**: Check import paths include `.js` extension
2. **MongoDB connection failed**: Verify MONGO_URI in environment
3. **JWT verification failed**: Check token secrets match
4. **File upload fails**: Verify `public/temp/` directory exists
5. **Cloudinary error**: Check API credentials in environment

### Debug Tips
- Enable verbose mongoose logging: `mongoose.set('debug', true)`
- Log request body: `console.log(req.body)`
- Check middleware execution order
- Verify environment variables loaded: `console.log(process.env.PORT)`

---

## Additional Projects in Repository

### DataModelling
Reference implementations of data models for:
- **Todo System**: User, Todo, SubTodo models
- **Hospital Management**: Patient, Doctor, Hospital, MedicalStatus models
- **E-commerce**: User, Product, Order models

These serve as learning examples for Mongoose schema design.

### connect_FE-BE
Sample project demonstrating frontend-backend integration patterns.

### backendProject
Duplicate/backup of Youtube_backend with identical structure.

---

## Contact & Resources

- **Author**: Harsh Sharma
- **Project Type**: Educational/Portfolio project
- **License**: ISC

---

*Last Updated: 2025-11-25*
*For AI assistants: This document should be updated whenever significant architectural changes are made to the codebase.*
