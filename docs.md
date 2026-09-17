# Team Management SaaS — Backend Context

## 1. Project Goal

Build a resume-level MERN team management application focused on:

- Organization management
- Admin/team/employee hierarchy
- Task management
- Team chat
- RBAC
- Multi-tenant organization isolation
- Analytics later

Keep the product focused: **task management + team chat**, not a huge all-in-one platform.

---

## 2. Core Hierarchy

The Owner is the **Super Admin** and can create/manage multiple organizations.

```text
OWNER (SUPER ADMIN)
│
├── ORGANIZATION A
│   ├── ADMIN
│   │   ├── TEAM
│   │   │   ├── EMPLOYEE
│   │   │   └── EMPLOYEE
│   │   └── TEAM
│   │       └── EMPLOYEE
│   └── ADMIN
│       └── TEAM
│           └── EMPLOYEE
│
├── ORGANIZATION B
│   └── ...
│
└── ORGANIZATION C
    └── ...
```

Important:

- Owner is global and is **not tied to an organization**.
- An Admin belongs to one organization.
- A Team belongs to one organization and is managed by an Admin.
- An Employee belongs to one organization and one team.
- Tasks belong to an organization/team and are assigned to employees.
- Chat is team-based.

---

## 3. Roles

### Owner / Super Admin

Global platform-level role.

Can:

- Create organizations
- View organizations
- Update/deactivate organizations
- Create admins inside an organization
- Manage admins
- View organization-wide information/analytics
- Have global visibility

Owner should generally NOT manage individual day-to-day tasks.

### Admin

Organization-level manager.

Can:

- Manage teams belonging to their organization
- Create/remove employees
- Assign employees to teams
- Create and manage tasks
- Assign tasks to employees
- View team tasks
- Use team chat
- View team analytics

An Admin must never access another organization's data.

### Employee

Team-level user.

Can:

- View assigned tasks
- Update permitted task fields, especially status
- Participate in team chat
- View their team
- View relevant team information

Employees should not be able to change organization/team ownership fields or arbitrarily reassign tasks.

---

## 4. Initial MongoDB Schemas

Start with these models:

```text
User
Organization
Team
Task
Message
```

Potential later models:

```text
RefreshToken
Notification
Invitation
```

Don't add these until required.

### User

One User model handles all roles.

```js
{
  _id,
  name,
  email,
  password,

  role: "owner" | "admin" | "employee",

  organizationId,
  teamId,

  isActive,

  createdAt,
  updatedAt
}
```

Relationship:

- Owner: `organizationId = null`, `teamId = null`
- Admin: `organizationId = Organization._id`
- Employee: `organizationId = Organization._id`, `teamId = Team._id`

### Organization

```js
{
  _id,
  name,
  createdBy, // Owner's User._id
  isActive,
  createdAt,
  updatedAt,
}
```

Do NOT maintain arrays such as `admins`, `teams`, or `employees` unless there is a concrete reason. Relationships can be queried using IDs.

### Team

```js
{
  _id,
  name,
  organizationId,
  adminId,
  createdAt,
  updatedAt
}
```

An Admin can manage multiple teams.

Example:

```text
Organization
├── Admin A
│   ├── Backend Team
│   └── Frontend Team
└── Admin B
    └── HR Team
```

### Task

Initial design:

```js
{
  _id,

  title,
  description,

  status: "todo" | "in-progress" | "completed",

  priority: "low" | "medium" | "high",

  organizationId,
  teamId,

  assignedTo, // Employee User._id
  createdBy,  // Admin User._id

  dueDate,

  createdAt,
  updatedAt
}
```

Store `organizationId` directly on Task even though it can be derived through Team. This makes tenant filtering/indexing straightforward. The backend must ensure the organization/team relationship remains consistent.

A task initially has one primary assignee.

Later, subtasks or task collaboration can be introduced instead of immediately supporting many assignees.

### Message

For team chat:

```js
{
  _id,

  senderId,
  teamId,
  organizationId,

  content,

  createdAt
}
```

Later additions can include:

```text
attachments
messageType
editedAt
deletedAt
```

---

## 5. Authentication

Initial APIs:

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Owner creation can initially be handled by a seed/manual process rather than public registration.

Admins are created by Owners.

Employees are created by Admins.

Recommended authentication stack:

```text
JWT
bcrypt
HTTP-only cookies
```

Use an `authenticate` middleware to populate the current user.

---

## 6. Authorization / RBAC

Core middleware:

```text
authenticate
authorize
validateOrganization
validateTeamAccess
```

Typical route:

```js
router.post(
  "/organizations/:organizationId/admins",
  authenticate,
  authorize("owner"),
  createAdmin
);
```

Important principle:

**Never trust organizationId/teamId/role supplied by the frontend when those values should be determined from the authenticated user or server-side relationship.**

For example, when an Admin creates an employee:

```http
POST /api/admin/teams/:teamId/employees
```

Backend determines:

```js
role = "employee"
organizationId = req.user.organizationId
teamId = req.params.teamId
```

and verifies that the team belongs to the Admin's organization and is managed by that Admin.

---

## 7. Owner APIs

### Organization management

```http
POST   /api/owner/organizations
GET    /api/owner/organizations
GET    /api/owner/organizations/:organizationId
PATCH  /api/owner/organizations/:organizationId
DELETE /api/owner/organizations/:organizationId
```

### Admin management

```http
POST   /api/owner/organizations/:organizationId/admins
GET    /api/owner/organizations/:organizationId/admins
GET    /api/owner/admins/:adminId
PATCH  /api/owner/admins/:adminId
DELETE /api/owner/admins/:adminId
```

When creating an Admin:

```json
{
  "name": "Rahul",
  "email": "rahul@acme.com",
  "password": "password"
}
```

Backend automatically sets:

```js
{
  role: "admin",
  organizationId: req.params.organizationId
}
```

The frontend should not be trusted to send these values.

---

## 8. Admin APIs

### Teams

```http
POST   /api/admin/teams
GET    /api/admin/teams
GET    /api/admin/teams/:teamId
PATCH  /api/admin/teams/:teamId
DELETE /api/admin/teams/:teamId
```

Admin's organization comes from:

```js
req.user.organizationId
```

Do not require the frontend to repeatedly send the Admin's organizationId.

### Employees

```http
POST   /api/admin/teams/:teamId/employees
GET    /api/admin/teams/:teamId/employees
PATCH  /api/admin/employees/:employeeId
DELETE /api/admin/employees/:employeeId
```

The backend must verify that the selected team belongs to the authenticated Admin's organization and is managed by that Admin.

---

## 9. Task APIs

### Admin

```http
POST   /api/admin/tasks
GET    /api/admin/tasks
GET    /api/admin/tasks/:taskId
PATCH  /api/admin/tasks/:taskId
DELETE /api/admin/tasks/:taskId
```

Admin can:

- Create task
- Assign task
- Reassign task
- Edit task
- Change priority
- Change due date
- Delete task
- Filter/search tasks

When creating a task, verify:

```text
Admin
 ↓
owns/manages Team
 ↓
Employee belongs to Team
 ↓
Create Task
```

### Employee

```http
GET   /api/employee/tasks
GET   /api/employee/tasks/:taskId
PATCH /api/employee/tasks/:taskId/status
```

Employee should generally only see tasks assigned to them and only update allowed fields.

Example:

```json
{
  "status": "completed"
}
```

Do not allow the employee to modify:

```text
organizationId
teamId
createdBy
assignedTo
```

unless a future explicit permission allows it.

---

## 10. Task Status

Initial state machine:

```text
TODO
 ↓
IN-PROGRESS
 ↓
COMPLETED
```

Priority:

```text
LOW
MEDIUM
HIGH
```

One task initially has one primary assignee.

---

## 11. Team Chat

REST API for history:

```http
GET /api/teams/:teamId/messages
```

Socket.IO for real-time communication.

Initial events:

```text
join-team
send-message
receive-message
user-online
user-offline
typing
stop-typing
```

Concept:

```text
Employee connects
      ↓
joins Socket.IO room
      ↓
team:<teamId>
      ↓
sends message
      ↓
save Message to MongoDB
      ↓
emit to team room
```

Task updates can also emit events such as:

```text
task:created
task:updated
task:completed
```

so team members can see real-time updates.

---

## 12. Multi-Tenant Security Rule

This is one of the most important architectural principles.

Every organization-scoped query must be restricted to the authenticated user's organization.

Bad:

```js
Team.find()
```

Better:

```js
Team.find({
  organizationId: req.user.organizationId
})
```

For Admin-specific team access:

```js
Team.findOne({
  _id: req.params.teamId,
  organizationId: req.user.organizationId,
  adminId: req.user._id
})
```

This prevents an Admin from Organization A from accessing Organization B's data.

---

## 13. Suggested Backend Folder Structure

```text
src/
│
├── controllers/
│   ├── auth.controller.js
│   ├── owner.controller.js
│   ├── organization.controller.js
│   ├── admin.controller.js
│   ├── team.controller.js
│   ├── employee.controller.js
│   ├── task.controller.js
│   └── message.controller.js
│
├── models/
│   ├── User.js
│   ├── Organization.js
│   ├── Team.js
│   ├── Task.js
│   └── Message.js
│
├── routes/
│   ├── auth.routes.js
│   ├── owner.routes.js
│   ├── admin.routes.js
│   ├── employee.routes.js
│   ├── task.routes.js
│   └── message.routes.js
│
├── middleware/
│   ├── auth.js
│   ├── role.js
│   ├── organization.js
│   └── error.js
│
├── sockets/
│   └── chat.socket.js
│
├── utils/
│   ├── ApiError.js
│   └── asyncHandler.js
│
└── app.js
```

---

## 14. Development Order

Do not build everything at once.

### Phase 1 — Backend foundation

```text
Express setup
MongoDB connection
Environment variables
Error handling
Async handler
Basic folder structure
```

### Phase 2 — Authentication

```text
User schema
Password hashing
Login
JWT
HTTP-only cookie
authenticate middleware
```

### Phase 3 — Owner

```text
Owner seed
Create organization
List organizations
Organization details
Create admin
Admin management
```

### Phase 4 — Admin

```text
Admin login
Create team
List teams
Create employee
Team membership
```

### Phase 5 — Tasks

```text
Create task
Assign task
List tasks
Update task
Task status
Task authorization
```

### Phase 6 — Chat

```text
Message schema
Message history
Socket.IO
Team rooms
Real-time messaging
Typing/online status
```

### Phase 7 — Production features

```text
Pagination
Validation
Indexes
Rate limiting
Cloudinary/file uploads
Analytics/Aggregation
Excel export
Logging
Deployment
```

---

## 15. First Milestone

The first working backend flow should be:

```text
OWNER LOGIN
    ↓
CREATE ORGANIZATION
    ↓
VIEW ORGANIZATION
    ↓
CREATE ADMIN
    ↓
ADMIN LOGIN
```

Then:

```text
ADMIN
  ↓
CREATE TEAM
  ↓
CREATE EMPLOYEE
  ↓
EMPLOYEE LOGIN
```

Then:

```text
ADMIN
  ↓
CREATE TASK
  ↓
ASSIGN EMPLOYEE
  ↓
EMPLOYEE UPDATES STATUS
```

Finally:

```text
TEAM
  ├── TASKS
  └── REAL-TIME CHAT
```

---

## 16. Key Design Principle

The application is essentially a **multi-tenant SaaS**:

```text
                    SUPER ADMIN
                         │
             ┌───────────┼───────────┐
             ↓           ↓           ↓
           ORG A       ORG B       ORG C
             │
          ADMINS
             │
           TEAMS
             │
        EMPLOYEES
          /            TASKS    CHAT
```

The most important backend concern is therefore:

> **Every organization-scoped resource must be authorized against the authenticated user's organization and role.**
