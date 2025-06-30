# GitHub Integration Collections API

This document describes the enhanced collection fetching capabilities for the GitHub Integration API.

## Overview

The API now provides comprehensive collection fetching with:
- **Pagination**: Control the number of items per page and navigate through pages
- **Search**: Case-insensitive search across relevant fields
- **Filtering**: Filter by specific criteria (organization, repository, state, etc.)
- **Sorting**: Sort by any field in ascending or descending order
- **Collection Summary**: Get counts of all available collections

## Base URL

```
http://localhost:3000/api/github
```

## Endpoints

### 1. Get All Collections

Returns a summary of all available collections with their item counts.

**Endpoint:** `GET /collections`

**Response:**
```json
{
  "success": true,
  "data": {
    "organizations": { 
      "count": 5, 
      "name": "Organizations",
      "columns": [
        { "field": "orgId", "headerName": "ID", "type": "string", "width": 120, "sortable": true },
        { "field": "login", "headerName": "Login", "type": "string", "width": 150, "sortable": true, "searchable": true },
        { "field": "name", "headerName": "Name", "type": "string", "width": 200, "sortable": true, "searchable": true },
        { "field": "description", "headerName": "Description", "type": "string", "width": 300, "sortable": false, "searchable": true },
        { "field": "url", "headerName": "URL", "type": "string", "width": 250, "sortable": false },
        { "field": "avatarUrl", "headerName": "Avatar", "type": "image", "width": 100, "sortable": false }
      ]
    },
    "repositories": { 
      "count": 25, 
      "name": "Repositories",
      "columns": [
        { "field": "repoId", "headerName": "ID", "type": "string", "width": 120, "sortable": true },
        { "field": "orgId", "headerName": "Org ID", "type": "string", "width": 120, "sortable": true, "filterable": true },
        { "field": "name", "headerName": "Name", "type": "string", "width": 150, "sortable": true, "searchable": true },
        { "field": "fullName", "headerName": "Full Name", "type": "string", "width": 200, "sortable": true, "searchable": true },
        { "field": "description", "headerName": "Description", "type": "string", "width": 300, "sortable": false, "searchable": true },
        { "field": "url", "headerName": "URL", "type": "string", "width": 250, "sortable": false }
      ]
    },
    "commits": { 
      "count": 150, 
      "name": "Commits",
      "columns": [
        { "field": "commitId", "headerName": "Commit ID", "type": "string", "width": 120, "sortable": true },
        { "field": "repoId", "headerName": "Repo ID", "type": "string", "width": 120, "sortable": true, "filterable": true },
        { "field": "message", "headerName": "Message", "type": "string", "width": 400, "sortable": false, "searchable": true },
        { "field": "author.login", "headerName": "Author", "type": "string", "width": 150, "sortable": false, "searchable": true, "filterable": true },
        { "field": "author.avatar_url", "headerName": "Author Avatar", "type": "image", "width": 100, "sortable": false },
        { "field": "date", "headerName": "Date", "type": "date", "width": 150, "sortable": true }
      ]
    },
    "pulls": { 
      "count": 30, 
      "name": "Pull Requests",
      "columns": [
        { "field": "pullId", "headerName": "PR ID", "type": "string", "width": 120, "sortable": true },
        { "field": "repoId", "headerName": "Repo ID", "type": "string", "width": 120, "sortable": true, "filterable": true },
        { "field": "title", "headerName": "Title", "type": "string", "width": 300, "sortable": false, "searchable": true },
        { "field": "user.login", "headerName": "Author", "type": "string", "width": 150, "sortable": false, "searchable": true },
        { "field": "user.avatar_url", "headerName": "Author Avatar", "type": "image", "width": 100, "sortable": false },
        { "field": "state", "headerName": "State", "type": "string", "width": 100, "sortable": true, "filterable": true },
        { "field": "createdAt", "headerName": "Created", "type": "date", "width": 150, "sortable": true },
        { "field": "mergedAt", "headerName": "Merged", "type": "date", "width": 150, "sortable": true }
      ]
    },
    "issues": { 
      "count": 45, 
      "name": "Issues",
      "columns": [
        { "field": "issueId", "headerName": "Issue ID", "type": "string", "width": 120, "sortable": true },
        { "field": "repoId", "headerName": "Repo ID", "type": "string", "width": 120, "sortable": true, "filterable": true },
        { "field": "title", "headerName": "Title", "type": "string", "width": 300, "sortable": false, "searchable": true },
        { "field": "user.login", "headerName": "Author", "type": "string", "width": 150, "sortable": false, "searchable": true },
        { "field": "user.avatar_url", "headerName": "Author Avatar", "type": "image", "width": 100, "sortable": false },
        { "field": "state", "headerName": "State", "type": "string", "width": 100, "sortable": true, "filterable": true },
        { "field": "createdAt", "headerName": "Created", "type": "date", "width": 150, "sortable": true },
        { "field": "closedAt", "headerName": "Closed", "type": "date", "width": 150, "sortable": true }
      ]
    },
    "changelogs": { 
      "count": 200, 
      "name": "Changelogs",
      "columns": [
        { "field": "changelogId", "headerName": "Changelog ID", "type": "string", "width": 120, "sortable": true },
        { "field": "issueId", "headerName": "Issue ID", "type": "string", "width": 120, "sortable": true, "filterable": true },
        { "field": "changes.event", "headerName": "Event", "type": "string", "width": 150, "sortable": false },
        { "field": "changes.actor.login", "headerName": "Actor", "type": "string", "width": 150, "sortable": false },
        { "field": "changes.actor.avatar_url", "headerName": "Actor Avatar", "type": "image", "width": 100, "sortable": false },
        { "field": "createdAt", "headerName": "Created", "type": "date", "width": 150, "sortable": true }
      ]
    },
    "users": { 
      "count": 10, 
      "name": "Users",
      "columns": [
        { "field": "userId", "headerName": "User ID", "type": "string", "width": 120, "sortable": true },
        { "field": "login", "headerName": "Login", "type": "string", "width": 150, "sortable": true, "searchable": true },
        { "field": "name", "headerName": "Name", "type": "string", "width": 200, "sortable": true, "searchable": true },
        { "field": "email", "headerName": "Email", "type": "string", "width": 250, "sortable": false, "searchable": true },
        { "field": "avatarUrl", "headerName": "Avatar", "type": "image", "width": 100, "sortable": false }
      ]
    }
  },
  "totalCollections": 7
}
```

### 2. Get Organizations

**Endpoint:** `GET /organizations`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in name, login, or description
- `sortBy` (optional): Field to sort by (default: 'name')
- `sortOrder` (optional): Sort order - 'asc' or 'desc' (default: 'asc')

**Example:**
```
GET /organizations?page=1&limit=5&search=test&sortBy=name&sortOrder=asc
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3. Get Repositories

**Endpoint:** `GET /repositories`

**Query Parameters:**
- All standard parameters (page, limit, search, sortBy, sortOrder)
- `orgId` (optional): Filter by organization ID

**Example:**
```
GET /repositories?page=1&limit=10&orgId=123&search=api&sortBy=name&sortOrder=asc
```

### 4. Get Commits

**Endpoint:** `GET /commits`

**Query Parameters:**
- All standard parameters (page, limit, search, sortBy, sortOrder)
- `repoId` (optional): Filter by repository ID
- `author` (optional): Filter by author login

**Example:**
```
GET /commits?page=1&limit=20&repoId=456&author=john&sortBy=date&sortOrder=desc
```

### 5. Get Pull Requests

**Endpoint:** `GET /pulls`

**Query Parameters:**
- All standard parameters (page, limit, search, sortBy, sortOrder)
- `repoId` (optional): Filter by repository ID
- `state` (optional): Filter by state ('open', 'closed', 'all')

**Example:**
```
GET /pulls?page=1&limit=15&repoId=456&state=open&sortBy=createdAt&sortOrder=desc
```

### 6. Get Issues

**Endpoint:** `GET /issues`

**Query Parameters:**
- All standard parameters (page, limit, search, sortBy, sortOrder)
- `repoId` (optional): Filter by repository ID
- `state` (optional): Filter by state ('open', 'closed', 'all')

**Example:**
```
GET /issues?page=1&limit=10&repoId=456&state=open&search=bug&sortBy=createdAt&sortOrder=desc
```

### 7. Get Changelogs

**Endpoint:** `GET /changelogs`

**Query Parameters:**
- All standard parameters (page, limit, sortBy, sortOrder)
- `issueId` (optional): Filter by issue ID

**Example:**
```
GET /changelogs?page=1&limit=50&issueId=789&sortBy=createdAt&sortOrder=desc
```

### 8. Get Users

**Endpoint:** `GET /users`

**Query Parameters:**
- All standard parameters (page, limit, search, sortBy, sortOrder)

**Example:**
```
GET /users?page=1&limit=10&search=john&sortBy=login&sortOrder=asc
```

## Standard Query Parameters

All collection endpoints support these standard parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (minimum: 1) |
| `limit` | integer | 10 | Items per page (minimum: 1, maximum: 100) |
| `search` | string | - | Case-insensitive search term |
| `sortBy` | string | varies | Field to sort by |
| `sortOrder` | string | varies | Sort order: 'asc' or 'desc' |

## Column Definitions

Each collection includes column definitions for data grid configuration:

### Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `field` | string | Field name in the data (supports dot notation for nested objects) |
| `headerName` | string | Display name for the column header |
| `type` | string | Data type: 'string', 'date', 'image' |
| `width` | integer | Column width in pixels |
| `sortable` | boolean | Whether the column can be sorted |
| `searchable` | boolean | Whether the column can be searched |
| `filterable` | boolean | Whether the column can be filtered |

### Column Types

- **string**: Text data, supports search and filtering
- **date**: Date/time data, supports sorting and formatting
- **image**: Image URLs, typically avatars or icons

### Field Naming

- Simple fields: `name`, `login`, `title`
- Nested fields: `author.login`, `user.avatar_url`, `changes.event`
- Date fields: `createdAt`, `date`, `mergedAt`

## Pagination Response Format

All collection endpoints return pagination metadata:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (invalid parameters)
- `401`: Not authenticated
- `500`: Internal server error

Error responses include a message:

```json
{
  "error": "Error description"
}
```

## Usage Examples

### Frontend Integration

```javascript
// Get all collections with column definitions
const collections = await fetch('/api/github/collections').then(r => r.json());

// Use column definitions for data grid configuration
const orgColumns = collections.data.organizations.columns;
const repoColumns = collections.data.repositories.columns;

// Get paginated repositories with search
const repos = await fetch('/api/github/repositories?page=1&limit=20&search=api&sortBy=name&sortOrder=asc')
  .then(r => r.json());

// Get commits for a specific repository
const commits = await fetch('/api/github/commits?repoId=123&page=1&limit=50&sortBy=date&sortOrder=desc')
  .then(r => r.json());
```

### Data Grid Configuration

```javascript
// Example: Configure AG Grid with column definitions
const gridOptions = {
  columnDefs: collections.data.organizations.columns.map(col => ({
    field: col.field,
    headerName: col.headerName,
    width: col.width,
    sortable: col.sortable,
    filter: col.filterable ? 'agTextColumnFilter' : false,
    cellRenderer: col.type === 'image' ? 'agImageCellRenderer' : undefined
  })),
  rowData: data,
  pagination: true,
  paginationPageSize: 10
};
```

### Testing

Run the test script to see all endpoints in action:

```bash
node test-collections.js
```

## Authentication

All endpoints require authentication via GitHub OAuth. Make sure to include credentials in requests:

```javascript
fetch('/api/github/collections', {
  credentials: 'include'
})
```

## Performance Notes

- Pagination is implemented using MongoDB's `skip()` and `limit()` methods
- Search uses case-insensitive regex matching
- All queries are optimized with proper indexing
- Maximum limit is 100 items per page to prevent performance issues 