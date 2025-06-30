# GitHub Integration Backend

This is the backend for the GitHub Integration App, built with Node.js, Express, MongoDB, and Passport.js for GitHub OAuth2 authentication. It provides robust endpoints for syncing, storing, and querying GitHub organizations, repositories, commits, pull requests, issues, changelogs, and users.

---

## Features

- **GitHub OAuth2 Authentication** (via `passport-github2`)
- **Sync and Store GitHub Data**: Organizations, Repositories, Commits, Pull Requests, Issues, Changelogs, Users
- **Comprehensive REST API** with:
  - Pagination, filtering, search, and sorting for all collections
  - Collection metadata and column definitions for frontend data grids
- **Swagger API Documentation** (`/api-docs`)
- **CORS** enabled for frontend integration
- **Session-based authentication**

---

## Project Structure

```
backend/
  app.js                # Main Express app
  package.json          # Dependencies and scripts
  controllers/          # Route logic (auth, github)
  helpers/              # Helper functions (GitHub API)
  models/               # Mongoose models for all entities
  routes/               # Express route definitions
  swagger.json          # OpenAPI/Swagger docs
  COLLECTIONS_API.md    # Detailed API usage and examples
  test-collections.js   # Example/test script for API
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```
MONGO_URI=mongodb://localhost:27017/github-integration
SESSION_SECRET=your_session_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
FRONTEND_URL=http://localhost:4200
```

- `MONGO_URI`: MongoDB connection string
- `SESSION_SECRET`: Secret for session encryption
- `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`: From your GitHub OAuth App
- `GITHUB_CALLBACK_URL`: Should match your GitHub OAuth App settings
- `FRONTEND_URL`: Where to redirect after auth (Angular frontend)

### 4. Start the Server

```bash
# For development (with auto-reload)
npm run dev

# For production
npm start
```

The server will run on [http://localhost:3000](http://localhost:3000) by default.

---

## API Documentation

- **Swagger UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Collections API:** See [`COLLECTIONS_API.md`](./COLLECTIONS_API.md) for detailed usage, query parameters, and response formats.

---

## Example Usage

### Sync GitHub Data

```http
GET /api/github/sync
```

### Get All Collections (with column definitions)

```http
GET /api/github/collections
```

### Paginated Query Example

```http
GET /api/github/repositories?page=1&limit=20&search=api&sortBy=name&sortOrder=asc
```

### Run API Test Script

```bash
node test-collections.js
```

---

## Development Notes

- All endpoints require authentication via GitHub OAuth2.
- Use `withCredentials: true` in frontend HTTP requests to send session cookies.
- CORS is enabled for `http://localhost:4200` by default.
- MongoDB must be running locally or accessible via `MONGO_URI`.
- For full API details, see [`COLLECTIONS_API.md`](./COLLECTIONS_API.md).

---

## License

MIT 