<div align="center">
  <img src="assets/teamSync.png" alt="TeamSync Logo" width="200"/>

# Project Management System

A production-ready RESTful API backend for a Project Management System built with Node.js, Express, and MongoDB. Features JWT authentication with refresh tokens, role-based authorization, and comprehensive project/task management capabilities.

</div>

## Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - HTTP-only cookie storage for enhanced security
  - Two-tier permission system (Platform-level + Workspace-level)
  - Workspace-based role management (Owner, Admin, Member, Viewer)
  - Secure password hashing with bcryptjs
  - Token refresh mechanism with rotation

- **Project Management**
  - Workspace-centric multi-tenancy architecture
  - Project CRUD operations with soft delete
  - Task management with auto-incrementing ticket numbers
  - Label/tag system for task categorization
  - File attachments (polymorphic design)
  - Comments and discussions
  - Activity logging and audit trails

- **Security**
  - Helmet.js for security headers
  - CORS configuration with credentials
  - Rate limiting on authentication endpoints
  - Input validation with express-validator

- **Developer Experience**
  - Basic Swagger/OpenAPI documentation
  - Centralized error handling
  - Soft delete pattern for data preservation
  - Comprehensive input validation

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Documentation:** Swagger (swagger-jsdoc, swagger-ui-express)
- **Security:** Helmet, CORS, bcryptjs
- **Development:** Nodemon

## Project Structure

```
TeamSync-Backend/
├── server.js                     # Application entry point
├── src/
│   ├── app.js                    # Express app configuration
│   ├── db.js                     # MongoDB connection
│   │
│   ├── config/
│   │   ├── envConfig.js          # Environment variables
│   │   ├── cookieConfig.js       # Cookie configuration
│   │   └── swagger.js            # Swagger documentation setup
│   │
│   ├── constants/                # Application constants
│   │   ├── index.js
│   │
│   ├── models/                   # MongoDB schemas
│   │   ├── userModel.js
│   │
│   ├── routes/                   # Endpoints
│   │   ├── authRoutes.js
│   │
│   ├── controllers/              # Controller - Business logic
│   │   ├── authController.js
│   │
│   ├── middlewares/              # Middlewares
│   │   ├── auth.js               # JWT verification
│   │   ├── authorize.js          # Role-based authorization
│   │   ├── error.js              # Error handler
│   │   └── validate.js           # Validation error handler
│   │
│   ├── validators/               # Input validations
│   │   ├── authValidators.js
│   │
│   └── utils/
│       ├── generateToken.js      # JWT utilities
│       ├── AppError.js           # Custom error class
│
├── package.json
├── .env                          # Environment variables (not in repo)
├── .env.example                  # Example Environment variables (in repo)
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository

```bash
git https://github.com/Adeel1069/teamsync-backend.git
cd teamsync-backend
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory

```bash
cp .env.example .env
```

4. Configure environment variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secrets
JWT_SECRET=your_access_token_secret_key_here
JWT_EXPIRE=1m
JWT_REFRESH_SECRET=your_refresh_token_secret_key_here
JWT_REFRESH_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

5. Start the development server

```bash
npm start
```

The server will start on `http://localhost:5000`

## Authentication Flow

### Token Strategy

1. **Access Token**
   - Stored in HTTP-only cookie
   - Short-lived (1 day in cookie, but can be configured shorter)
   - Contains: `{userId}`
   - Used for API authentication

2. **Refresh Token**
   - Stored in HTTP-only cookie
   - Long-lived (7 days)
   - Contains: `{userId}`
   - Used only for token refresh
   - Path restricted to `/api/auth/refresh`

### Authorization & Permission System

This system uses a **two-tier permission model** similar to Slack, Discord, and Notion:

#### **Platform Level** (User Account)

All registered users are equal at the platform level. There is only one special platform role:

- **Super Admin** (`isSuperAdmin: true`)
  - Single platform administrator (created via seed script)
  - Can view and access all workspaces
  - Manages platform-level operations and support
  - Regular users never interact with super-admin features

#### **Workspace Level** (Team Permissions)

When users create or join workspaces, they are assigned workspace-specific roles:

- **Owner**
  - User who created the workspace
  - Full control over workspace settings
  - Can manage all members and their roles
  - Can create and manage projects
  - Cannot be removed from the workspace

- **Admin**
  - Workspace administrator
  - Can manage workspace settings (except deletion)
  - Can invite/remove members and assign roles
  - Can create and manage projects
  - Full access to all workspace resources

- **Member**
  - Regular workspace member
  - Can create and manage tasks
  - Can comment on tasks and projects
  - Cannot create projects or manage workspace
  - Read/write access to assigned work

- **Viewer**
  - Read-only access
  - Can view projects and tasks
  - Can comment on tasks
  - Cannot create or modify resources
  - Ideal for stakeholders and clients |

### Workspace Creation

- **Any authenticated user** can create workspaces
- Upon creation, the user automatically becomes the **Owner** of that workspace
- Users can create multiple workspaces and be members of many workspaces
- Each workspace operates independently with its own team and permissions

## Error Handling

All errors return a consistent JSON format:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Development Guidelines

### Code Style

- ES6 modules (`import`/`export`)
- Async/await for asynchronous operations
- Descriptive variable and function names
- Centralized error handling with `AppError`

### Adding New Routes

1. Create validator in `src/validators/`
2. Create controller in `src/controllers/`
3. Create route in `src/routes/`
4. Apply middleware: `auth`, `authorize`, `validate`
5. Register route in [src/app.js](src/app.js)

### Database Patterns

- Use soft deletes (`deletedAt` field)
- Index frequently queried fields
- Use compound indexes for complex queries
- Implement pre-save hooks for auto-generated fields

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

Hafiz Muhammad Adeel - [Adeel1069](https://github.com/Adeel1069)
