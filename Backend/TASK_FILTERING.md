# Task Filtering Feature

## Overview
The task API now supports filtering tasks by status and due date using query parameters.

## API Endpoint
```
GET /api/tasks
```

## Query Parameters

### Status Filter
Filter tasks by their completion status:
- **Parameter**: `status`
- **Values**: `pending` | `completed`
- **Example**: `/api/tasks?status=pending`

### Due Date Filters
Filter tasks by due date range:

#### Due Date From
- **Parameter**: `dueDateFrom`
- **Format**: ISO 8601 date string (YYYY-MM-DD or full ISO)
- **Description**: Returns tasks with due date >= specified date
- **Example**: `/api/tasks?dueDateFrom=2026-02-01`

#### Due Date To
- **Parameter**: `dueDateTo`
- **Format**: ISO 8601 date string (YYYY-MM-DD or full ISO)
- **Description**: Returns tasks with due date <= specified date
- **Example**: `/api/tasks?dueDateTo=2026-02-28`

#### Date Range
- **Example**: `/api/tasks?dueDateFrom=2026-02-01&dueDateTo=2026-02-28`

## Combined Filters
You can combine multiple filters:

```
# Pending tasks due in February 2026
GET /api/tasks?status=pending&dueDateFrom=2026-02-01&dueDateTo=2026-02-28

# Completed tasks due before today
GET /api/tasks?status=completed&dueDateTo=2026-02-14

# All tasks due after a specific date
GET /api/tasks?dueDateFrom=2026-02-15
```

## Usage Examples

### cURL Examples

```bash
# Get all pending tasks
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/tasks?status=pending"

# Get tasks due in February 2026
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/tasks?dueDateFrom=2026-02-01&dueDateTo=2026-02-28"

# Get pending tasks due this week
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/tasks?status=pending&dueDateFrom=2026-02-14&dueDateTo=2026-02-21"
```

### JavaScript/Fetch Example

```javascript
// Get pending tasks
const response = await fetch('/api/tasks?status=pending', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const tasks = await response.json();

// Get tasks due in a specific date range
const params = new URLSearchParams({
  dueDateFrom: '2026-02-01',
  dueDateTo: '2026-02-28'
});
const response = await fetch(`/api/tasks?${params}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Axios Example

```javascript
import axios from 'axios';

// Get completed tasks
const { data } = await axios.get('/api/tasks', {
  params: { status: 'completed' },
  headers: { Authorization: `Bearer ${token}` }
});

// Get pending tasks due this month
const { data } = await axios.get('/api/tasks', {
  params: {
    status: 'pending',
    dueDateFrom: '2026-02-01',
    dueDateTo: '2026-02-29'
  },
  headers: { Authorization: `Bearer ${token}` }
});
```

## Implementation Details

### Caching
- Each unique filter combination is cached separately
- Cache keys include filter parameters to ensure correct results
- Cache is automatically invalidated when tasks are created, updated, or deleted

### Performance
- Database indexes are optimized for:
  - Owner + status queries
  - Owner + dueDate queries
  - Individual status and dueDate queries

### Response Format
Filtering returns the same response format as the standard GET /api/tasks endpoint:

```json
[
  {
    "_id": "65abc123...",
    "title": "Task Title",
    "description": "Task description",
    "status": "pending",
    "dueDate": "2026-02-15T00:00:00.000Z",
    "owner": "user123",
    "createdAt": "2026-02-01T10:30:00.000Z"
  }
]
```

## Notes
- All filters are optional - omitting them returns all tasks
- Invalid status values are ignored (only 'pending' and 'completed' are accepted)
- Date filters support any valid JavaScript Date format
- Filters are applied at the database level for optimal performance
- Results are always sorted by creation date (newest first)
