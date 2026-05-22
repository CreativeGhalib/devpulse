# DevPulse

DevPulse is a backend API for a small internal issue tracker. It lets contributors report bugs or feature requests, while maintainers can manage issues, update workflow status, and check simple system metrics.

Live API: `https://devpulse-api-orpin.vercel.app`

## Main Features

- Register and log in as a contributor or maintainer.
- Create bug reports and feature requests.
- Browse issues publicly with optional filtering and sorting.
- View reporter details without using SQL joins.
- Let contributors update only their own open issues.
- Let maintainers update, delete, and change status for any issue.
- Expose maintainer-only system metrics.
- Store data in PostgreSQL using raw `pool.query()` calls.

## Packages Used

| Package | Why it is used |
| --- | --- |
| `express` | API server and route handling |
| `pg` | Native PostgreSQL driver |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT creation and verification |
| `cors` | Cross-origin API access |
| `dotenv` | Environment variable loading |
| `http-status-codes` | Named HTTP status codes |
| `tsx` | Local TypeScript development runner |
| `typescript` | Strict TypeScript support |

## Local Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```bash
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/devpulse
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=*
```

Run the schema:

```bash
npm run db:init
```

Start development:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Start production build:

```bash
npm start
```

## API Routes

### Auth

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Public | Register user |
| POST | `/api/auth/login` | Public | Log in and receive token |

### Issues

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/issues` | Authenticated | Create issue |
| GET | `/api/issues` | Public | List issues |
| GET | `/api/issues/:id` | Public | Get one issue |
| PATCH | `/api/issues/:id` | Maintainer or owner of open issue | Update issue details |
| PATCH | `/api/issues/:id/status` | Maintainer | Change workflow status |
| DELETE | `/api/issues/:id` | Maintainer | Delete issue |

Supported issue query values:

```text
sort=newest | oldest
type=bug | feature_request
status=open | in_progress | resolved
```

### Metrics

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/metrics` | Maintainer | View system counts |

## Database Tables

### users

| Field | Notes |

🚼 **DevPulse – Assignment Requirements Specification**

Internal Tech Issue & Feature Tracker

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

---

## 🛠️ Technology Stack

| Technology    | Note                                                      |
|--------------|-----------------------------------------------------------|
| Node.js      | LTS runtime (24.x or higher)                              |
| TypeScript   | Latest stable version, strict typing                      |
| Express.js   | Modular router architecture                               |
| PostgreSQL   | Relational database, native pg driver only                |
| Raw SQL      | Direct pool.query() calls, no query builders/ORMs/JOINS   |
| bcrypt       | Password hashing, salt rounds 8–12                        |
| jsonwebtoken | JWT generation & verification (standard tokens)           |

---

## 👥 User Roles & Permissions

| Role        | Allowed Actions                                                                                 |
|-------------|-----------------------------------------------------------------------------------------------|
| contributor | Register, log in, create issues, view all issues                                              |
| maintainer  | All contributor actions, update/delete any issue, change status, access system metrics         |

---

## 🔐 Authentication & Authorization System

- JWT flow: Credentials → Server validates & hashes → Returns signed JWT → Client attaches to Authorization header → Server verifies signature & expiry
- Passwords are never exposed in responses/logs
- Protected endpoints require valid JWT
- Role verification before privileged operations

---

## 🗄️ Database Schema Design

### users

| Field      | Requirement                                                                 |
|------------|-----------------------------------------------------------------------------|
| id         | Auto-incrementing unique identifier                                         |
| name       | Full display name, required                                                 |
| email      | Unique, required                                                            |
| password   | Encrypted, required, never returned                                         |
| role       | contributor or maintainer, defaults to contributor                          |
| created_at | Timestamp, auto-generated                                                   |
| updated_at | Timestamp, auto-updated                                                     |

### issues

| Field        | Requirement                                                               |
|--------------|---------------------------------------------------------------------------|
| id           | Auto-incrementing unique identifier                                       |
| title        | Required, max 150 chars                                                   |
| description  | Required, min 20 chars                                                    |
| type         | bug or feature_request                                                    |
| status       | open (default), in_progress, resolved                                     |
| reporter_id  | References user (no FK constraint; validated in app logic)                |
| created_at   | Timestamp, auto-generated                                                 |
| updated_at   | Timestamp, auto-updated                                                   |

---

## 🌐 API Endpoints Specification

### Authentication Module

#### 1. User Registration

- **POST** `/api/auth/signup` (Public)
	- Request: `{ "name": "John Doe", "email": "john.doe@devpulse.com", "password": "securePassword123", "role": "contributor" }`
	- Response: 201 Created, user info (no password)

#### 2. User Login

- **POST** `/api/auth/login` (Public)
	- Request: `{ "email": "john.doe@devpulse.com", "password": "securePassword123" }`
	- Response: 200 OK, JWT token + user info

### Issues Module

#### 3. Create Issue

- **POST** `/api/issues` (Authenticated)
	- Request: `{ "title": "...", "description": "...", "type": "bug" }`
	- Response: 201 Created, issue info

#### 4. Get All Issues

- **GET** `/api/issues?sort=newest&type=bug&status=open` (Public)
	- Response: 200 OK, array of issues (with reporter details)

#### 5. Get Single Issue

- **GET** `/api/issues/:id` (Public)
	- Response: 200 OK, issue details (with reporter)

#### 6. Update Issue

- **PATCH** `/api/issues/:id` (Maintainer or contributor/own open issue)
	- Request: `{ "title": "...", "description": "...", "type": "bug" }`
	- Response: 200 OK, updated issue info

#### 7. Delete Issue

- **DELETE** `/api/issues/:id` (Maintainer only)
	- Response: 200 OK, success message

---

## 🚦 Response Patterns & Status Codes

- **Success:**
	```json
	{ "success": true, "message": "Operation description", "data": "Response data" }
	```
- **Error:**
	```json
	{ "success": false, "message": "Error description", "errors": "Error details" }
	```

| Code | Reason Phrase         | Usage                                      |
|------|----------------------|---------------------------------------------|
| 200  | OK                   | Successful GET, PATCH, DELETE               |
| 201  | Created              | Successful POST (resource created)          |
| 204  | No Content           | Successful DELETE (no response body)        |
| 400  | Bad Request          | Validation errors, invalid input            |
| 401  | Unauthorized         | Missing/expired/invalid JWT                 |
| 403  | Forbidden            | Valid token, insufficient permissions       |
| 404  | Not Found            | Resource does not exist                     |
| 409  | Conflict             | Business logic conflict                     |
| 500  | Internal Server Error| Unexpected server/database error            |

---

## 🚀 Setup & Deployment

1. **Clone & install:**
	 ```bash
	 git clone https://github.com/yourusername/devpulse.git
	 cd devpulse
	 npm install
	 ```
2. **Configure environment:**
	 Create a `.env` file:
	 ```env
	 PORT=5000
	 DATABASE_URL=postgresql://postgres:password@localhost:5432/devpulse
	 JWT_SECRET=replace-with-a-strong-secret
	 JWT_EXPIRES_IN=7d
	 BCRYPT_SALT_ROUNDS=10
	 CORS_ORIGIN=*
	 ```
3. **Initialize DB:**
	 ```bash
	 npm run db:init
	 ```
4. **Start development:**
	 ```bash
	 npm run dev
	 ```
5. **Build for production:**
	 ```bash
	 npm run build && npm start
	 ```

---

## 📦 Live Deployment

- **API:** https://devpulse-api-orpin.vercel.app
- **Database:** NeonDB (PostgreSQL)
- **Secrets:** Managed in Vercel project settings

---

## 📋 Submission Checklist

- [x] Project name, live URL, features, tech stack
- [x] Setup steps, API endpoint list, database schema summary
- [x] Clear, professional, human-like README

---

**Pro Tip:** Double-check that all requirements are fulfilled. If you need to update or clarify anything, let me know before making changes.
