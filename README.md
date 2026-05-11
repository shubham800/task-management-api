# Task Management API

A production-ready REST API built with Node.js, Express, and MongoDB.
Implements multi-tenant architecture with role-based access control.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (HttpOnly Cookies)
- **Security:** Helmet, CORS, Rate Limiting, bcrypt

## Project Status
- [x] Milestone 1 — Authentication System
- [x] Milestone 2 — Organizations
- [x] Milestone 3 — Projects
- [ ] Milestone 4 — Tasks & Comments

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB

### Installation
```bash
git clone https://github.com/shubham800/task-management-api
cd task-management-api
npm install
cp .env.example .env
# .env mein apni values fill karo
npm run dev
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login |
| POST | /api/auth/logout | Protected | Logout |
| POST | /api/auth/refresh-token | Public | Refresh access token |
| GET | /api/auth/me | Protected | Get profile |

## Security Features
- JWT stored in HttpOnly cookies — XSS protected
- bcrypt password hashing (12 rounds)
- Refresh token rotation
- Rate limiting on auth routes
- Password never returned in responses

## Folder Structure
```
src/
├── config/         # DB, email config
├── controllers/    # Business logic
├── middleware/     # Auth, rate limit
├── models/         # MongoDB schemas
├── routes/         # API routes
└── utils/          # Helpers
```

## API Testing

Postman collection is available in the `/postman` directory.

**Setup:**
1. Import `TaskManager.postman_collection.json` into Postman
2. Import `TaskManager.postman_environment.json` and select it
3. Run **Login** request first — token auto-sets via test script
4. All subsequent requests use the token automatically