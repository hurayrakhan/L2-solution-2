# DevPulse – Internal Tech Issue & Feature Tracker

DevPulse is a collaborative backend platform for software development teams to report bugs, suggest new feature requests, and coordinate resolutions.

**Live Deployment URL:** [https://l2-a2-flax.vercel.app](https://l2-a2-flax.vercel.app)

## 🛠️ Technology Stack
- **Runtime Environment:** Node.js (LTS v24.x)
- **Programming Language:** TypeScript
- **Web Framework:** Express.js (Modular router architecture)
- **Database:** PostgreSQL (Connected via native `pg` client driver)
- **Database Access:** Raw SQL queries (Direct `pool.query()` calls, no ORMs/Query builders, no SQL `JOIN`s)
- **Security & Authentication:** `bcrypt` (password hashing) and `jsonwebtoken` (JWT signature & verification)

---

## 👥 User Roles & Permissions
- **Contributor:**
  - Register and login.
  - Create issues (bugs or feature requests).
  - View all issues and single issue details.
  - Update their own issues only when the status is `open`.
- **Maintainer:**
  - All Contributor permissions.
  - Update any issue fields (including changing status independently).
  - Delete any issue.

---

## 🗄️ Database Schema Design

### 1. `users` Table
- `id` (SERIAL, PRIMARY KEY) - Auto-incrementing unique user identifier.
- `name` (VARCHAR(255), NOT NULL) - Display name.
- `email` (VARCHAR(255), UNIQUE, NOT NULL) - Unique email address for registration/login.
- `password` (VARCHAR(255), NOT NULL) - Securely hashed password.
- `role` (VARCHAR(50), DEFAULT 'contributor', NOT NULL) - Must be 'contributor' or 'maintainer'.
- `created_at` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP) - Automatically generated insertion timestamp.
- `updated_at` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP) - Automatically refreshed update timestamp.

### 2. `issues` Table
- `id` (SERIAL, PRIMARY KEY) - Auto-incrementing unique issue identifier.
- `title` (VARCHAR(150), NOT NULL) - Issue title (max 150 characters).
- `description` (TEXT, NOT NULL) - Details (min 20 characters).
- `type` (VARCHAR(50), NOT NULL) - Must be 'bug' or 'feature_request'.
- `status` (VARCHAR(50), DEFAULT 'open', NOT NULL) - Must be 'open', 'in_progress', or 'resolved'.
- `reporter_id` (INTEGER, NOT NULL) - References `users.id` (validated in application logic).
- `created_at` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP) - Automatically generated insertion timestamp.
- `updated_at` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP) - Automatically refreshed update timestamp.

---

## 🚀 Setup and Installation

### Prerequisites
- Node.js LTS (v24.x or higher)
- npm (v11.x or higher)
- PostgreSQL database instance

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_rUGt1LB5WqxO@ep-nameless-block-aosf5x56-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

### 3. Initialize Database Tables and Triggers
Create tables and triggers automatically:
```bash
npm run db:init
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run Integration Tests
Verify endpoint behaviors, validation errors, and permission rules:
```bash
npm run test
```

---

## 🌐 API Endpoints Specification

### Authentication Module

- **POST `/api/auth/signup`** (Public)
  - Registers a new account.
- **POST `/api/auth/login`** (Public)
  - Authenticates credentials and returns a JWT token.

### Issues Module

- **POST `/api/issues`** (Authenticated: `contributor`, `maintainer`)
  - Submits a new bug or feature request.
- **GET `/api/issues`** (Public)
  - Fetches all issues.
  - Supports query filters: `type` (bug, feature_request), `status` (open, in_progress, resolved), and `sort` (newest, oldest).
- **GET `/api/issues/:id`** (Public)
  - Retrieves a specific issue by its ID.
- **PATCH `/api/issues/:id`** (Authenticated: `contributor`, `maintainer`)
  - Updates the issue details (contributors can only update title/description/type of their own open issues).
- **DELETE `/api/issues/:id`** (Authenticated: `maintainer` only)
  - Deletes an issue.
