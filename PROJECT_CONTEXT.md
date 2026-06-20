# Project Context: MERN Leave Management System

This document consolidates the complete context, requirements, architectural decisions, file structure, API specification, and testing criteria of the Leave Management System. It is designed to be provided to another LLM to immediately resume development or maintenance of the system.

---

## 📌 Project Overview & Requirements
The goal is a full-stack, enterprise-ready **Leave Management System** built on the **MERN stack** (MongoDB, Express, React, Node.js) with **JWT authentication** and **Role-Based Access Control (RBAC)** supporting three roles:
1.  **Admin**: Manages employees, departments, leave policies, and views printable analytics reports.
2.  **Manager**: Reviews pending leave requests of team members they manage, leaves approval/rejection decisions with comments, and tracks department schedules.
3.  **Employee**: Views allocated/remaining leave balances, applies for leave with optional medical certificate attachments, and tracks request history.

---

## 🛠️ Architecture & Tech Stack
*   **Backend**: Node.js & Express.js. Follows **MVC (Model-View-Controller)** pattern. Uses Mongoose for database schemas, JWT (in authorization headers) for session checks, Bcryptjs for password security, Multer for uploading certificates to local disk (`backend/uploads/`), and Nodemailer for sending HTML email alerts.
*   **Frontend**: React.js initialized via Vite. Utilizes Tailwind CSS v4 for modern design aesthetics, React Router DOM (v6) for guarded routing, Axios for API calls with interceptors, Recharts for statistics charts, and Lucide React for modern iconography.
*   **Auto-Seeding**: The backend checks for an empty database on startup and seeds standard leave policies (Annual, Sick, Casual), departments, and three demo users (Admin, Manager, Employee) automatically.

---

## 📂 Complete File Directory Structure
```
Leave_management_system/
├── backend/
│   ├── config/
│   │   ├── db.js             # Mongoose MongoDB connection handler
│   │   ├── mailer.js         # Nodemailer setup with console log fallback
│   │   └── seed.js           # Database seeder (inserts policies, depts, & demo users)
│   ├── controllers/
│   │   ├── authController.js       # Login, profile fetching, password changes
│   │   ├── employeeController.js   # Employee CRUD, initializes user leave balances
│   │   ├── departmentController.js # Department CRUD, unlinks deleted department links
│   │   ├── policyController.js     # Leave policy CRUD, pushes/pulls quota from employee ledger
│   │   └── leaveController.js      # Leave requests (calculates days, overlap checks, dashboard statistics)
│   ├── middleware/
│   │   ├── auth.js           # Extracts JWT Bearer token & verifies roles
│   │   └── upload.js         # Multer configuration (limits files to 5MB images/PDFs)
│   ├── models/
│   │   ├── User.js           # User schema (credentials, manager, department, leave balances)
│   │   ├── LeaveRequest.js   # Request schema (dates, status, comments, attachment file path)
│   │   ├── Department.js     # Department schema
│   │   └── LeavePolicy.js    # Policy schema (allocation days limits)
│   ├── routes/
│   │   ├── authRoutes.js     # Routes for /api/auth
│   │   ├── departmentRoutes.js # Routes for /api/departments
│   │   ├── employeeRoutes.js   # Routes for /api/employees
│   │   ├── policyRoutes.js     # Routes for /api/policies
│   │   └── leaveRoutes.js      # Routes for /api/leaves
│   ├── uploads/              # Local storage folder for uploaded certificates
│   ├── .env                  # Local variables (PORT, MONGODB_URI, JWT_SECRET, SMTP credentials)
│   ├── .env.example          # Template environment configurations
│   └── server.js             # Entry point (CORS, body-parsers, routing, auto-seeder call)
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx  # Guards routes by role and authentication session
    │   │   ├── Sidebar.jsx         # Responsive sidebar displaying links by user role
    │   │   ├── Header.jsx          # Top-bar displaying current page and user role badge
    │   │   └── DashboardLayout.jsx # Combines Sidebar, Header, and child viewports
    │   ├── context/
    │   │   └── AuthContext.jsx     # Controls global state, login/logout, and balance refresh
    │   ├── pages/
    │   │   ├── Login.jsx           # Login interface with quick credential selectors
    │   │   ├── Dashboard.jsx       # Custom dashboards with Recharts visuals for all roles
    │   │   ├── Leaves.jsx          # Leave portal (apply, check balances, manager action modals)
    │   │   ├── Employees.jsx       # Employee directory with CRUD panel and balance viewers
    │   │   ├── Departments.jsx     # Departments panel (grid, edit, delete, manager head)
    │   │   ├── Policies.jsx        # Policy configuration settings
    │   │   ├── Reports.jsx         # Exportable reports table with printing rules
    │   │   └── ChangePassword.jsx  # Security password update form
    │   ├── utils/
    │   │   └── api.js              # Axios client injecting JWT and handling 401s
    │   ├── App.jsx                 # Routes definition
    │   ├── index.css               # Google Fonts, Tailwind imports, glassmorphism templates
    │   └── main.jsx                # StrictMode React mounting point
    ├── vite.config.js              # Vite configuration (registers @tailwindcss/vite plugin)
    └── package.json                # Project configurations & dependency tree
```

---

## 🗄️ Database Schemas & API Routes

### Models
1.  **User**: Name, Email, Password (hashed), Role (`Admin`, `Manager`, `Employee`), Department, Manager (supervisor), Leave Balances (`leaveType` reference, `allocated` days, `used` days), Status (`Active`, `Inactive`), and Profile Image path.
2.  **LeaveRequest**: Employee (reference), Leave Type (reference), Start Date, End Date, Reason, Status (`Pending`, `Approved`, `Rejected`), Comments (manager feedback), Approved By (manager reference), and Attachment path.
3.  **Department**: Name, Description, Manager (reference to department head).
4.  **LeavePolicy**: Name (e.g. Annual Leave), Days (yearly quota), Description.

### API Endpoints
*   `POST /api/auth/login` - Public login.
*   `GET /api/auth/me` - Protected. Returns profile with populated department, supervisor, and balances.
*   `PUT /api/auth/change-password` - Protected. Updates security credentials.
*   `GET /api/departments` - Protected (Admin/Manager). Lists departments.
*   `POST /api/departments` / `PUT /api/departments/:id` / `DELETE /api/departments/:id` - Protected (Admin).
*   `GET /api/employees` - Protected (Admin/Manager). Lists employees.
*   `POST /api/employees` / `PUT /api/employees/:id` / `DELETE /api/employees/:id` - Protected (Admin).
*   `GET /api/policies` - Protected. Lists policies.
*   `POST /api/policies` / `PUT /api/policies/:id` / `DELETE /api/policies/:id` - Protected (Admin).
*   `GET /api/leaves` - Protected. Returns leaves (Employees see only their own, Managers see their team's, Admins see all).
*   `POST /api/leaves` - Protected. Submits a leave request using `multipart/form-data` for file uploads.
*   `GET /api/leaves/stats` - Protected. Aggregates data for charts (Admin department comparison/trends, Manager team list, Employee balance list).
*   `PUT /api/leaves/:id/action` - Protected (Admin/Manager). Updates status to `Approved` or `Rejected` with comments. Increments user's `used` balance upon approval.

---

## 🔑 Demo Access Credentials
*   **Admin**: `admin@company.com` / `admin123` (Name: Jane Admin)
*   **Manager**: `manager@company.com` / `manager123` (Name: John Manager)
*   **Employee**: `employee@company.com` / `employee123` (Name: Alice Employee - reports to John Manager)

---

## 🧪 Verification Criteria
1.  **Date Computations**: Leaves calculate days inclusive of weekends and single days.
2.  **Date Conflicts**: Overlapping requests for the same date range are blocked on submission.
3.  **Balance Protection**: Applying for more days than the remaining quota is blocked.
4.  **Security Guards**: Non-authenticated requests are redirected. Role violations result in an "Access Denied" view.
5.  **Clean Printing**: Global styles hide the sidebar and top-header elements during `window.print()` to produce formatted document layouts.
