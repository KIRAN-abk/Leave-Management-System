# Leave Management System - Walkthrough & Verification

We have successfully developed a full-stack Leave Management System conforming to the MERN stack architecture with JWT security, role-based controls, dashboard charts, email notification support, and print-ready reports.

---

## 🛠️ Changes Implemented

### 1. Express Backend
*   **Mongoose Models**:
    *   [User.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/models/User.js): Tracks credentials, profile image, manager, department, and leave balances (allocated/used).
    *   [LeaveRequest.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/models/LeaveRequest.js): Stores dates, reason, status (Pending/Approved/Rejected), comments, and path to uploaded documents.
    *   [Department.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/models/Department.js): Groups users and maps department head manager.
    *   [LeavePolicy.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/models/LeavePolicy.js): Manages company-wide leave type quotas.
*   **API Controllers**:
    *   [authController.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/controllers/authController.js): Hashing, JWT login, and profile fetching.
    *   [employeeController.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/controllers/employeeController.js): Full CRUD for employees, with automatic leave balance initialization.
    *   [departmentController.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/controllers/departmentController.js): CRUD departments and head-of-dept assignments.
    *   [policyController.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/controllers/policyController.js): Quota settings that synchronize with existing profiles.
    *   [leaveController.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/controllers/leaveController.js): Formulates duration check, overlapping dates check, and balance validation. It aggregates visual chart data for dashboards.
*   **Configuration & Utilities**:
    *   [db.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/config/db.js): Mongoose connection.
    *   [mailer.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/config/mailer.js): Sends HTML notifications to supervisors/staff, logging to console as fallback.
    *   [seed.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/config/seed.js): Seeds starter data.
    *   [server.js](file:///c:/Users/abkbh/Desktop/Leave_management_system/backend/server.js): API router mounting, static uploads folder serving, and auto-seeding.

### 2. React + Vite Frontend
*   **Authentication & Session**:
    *   [AuthContext.jsx](file:///c:/Users/abkbh/Desktop/Leave_management_system/frontend/src/context/AuthContext.jsx): Stores session state and JWT.
    *   [ProtectedRoute.jsx](file:///c:/Users/abkbh/Desktop/Leave_management_system/frontend/src/components/ProtectedRoute.jsx): Blocks path requests from unauthenticated or unauthorized users.
*   **Global Components Layout**:
    *   [Sidebar.jsx](file:///c:/Users/abkbh/Desktop/Leave_management_system/frontend/src/components/Sidebar.jsx): Nav links filtered dynamically by role.
    *   [Header.jsx](file:///c:/Users/abkbh/Desktop/Leave_management_system/frontend/src/components/Header.jsx): Badges and session profile summaries.
    *   [DashboardLayout.jsx](file:///c:/Users/abkbh/Desktop/Leave_management_system/frontend/src/components/DashboardLayout.jsx): Shell for pages.
*   **Pages & UI Views**:
    *   [Login.jsx](file:///c:/Users/abkbh/Desktop/Leave_management_system/frontend/src/pages/Login.jsx): Credentials quick-select interface.
    *   [Dashboard.jsx](file:///c:/Users/abkbh/Desktop/Leave_management_system/frontend/src/pages/Dashboard.jsx): Visualizes analytics and balances.
    *   [Leaves.jsx](file:///c:/Users/abkbh/Desktop/Leave_management_system/frontend/src/pages/Leaves.jsx): Form with live duration calculator and file selector, history table, and supervisor review buttons.
    *   [Employees.jsx](file:///c:/Users/abkbh/Desktop/Leave_management_system/frontend/src/pages/Employees.jsx): Tabular listing and balance auditor.
    *   [Departments.jsx](file:///c:/Users/abkbh/Desktop/Leave_management_system/frontend/src/pages/Departments.jsx): Grid of departments.
    *   [Policies.jsx](file:///c:/Users/abkbh/Desktop/Leave_management_system/frontend/src/pages/Policies.jsx): Admin quota settings.
    *   [Reports.jsx](file:///c:/Users/abkbh/Desktop/Leave_management_system/frontend/src/pages/Reports.jsx): Filter-rich printable table and export to CSV.

---

## 🧪 Verification Scenarios Tested

1.  **Auto-Seeding**: Verified that starting the Express backend on an empty database successfully populates 3 default leave policies, 3 departments, and 3 users (Admin, Manager, Employee).
2.  **Authentication & Guarding**: Checked that direct URL access (e.g. going to `/reports`) redirects to the Login page when not authenticated, and shows an "Access Denied" page if an Employee tries to view Admin policies.
3.  **Applying for Leave & Overlaps**:
    *   Employee applies for 5 days of Annual Leave. Balance shows 21. Live duration previews `5 days`.
    *   Employee tries to apply for a second request overlapping the same dates -> Form blocks submission showing "active request exists".
    *   Employee tries to request 25 days of Sick Leave (quota is 10) -> Form blocks showing "insufficient leave balance".
4.  **Supervisor Approval Workflow**:
    *   Manager logs in, sees the pending request from their employee.
    *   Manager reviews the request and clicks "Approve" with comments.
    *   The employee's profile reflects that `used` days incremented and `remaining` balance decremented.
    *   Email sending is simulated in console:
        ```
        [EMAIL SENDING] To: employee@company.com
        [EMAIL SENDING] Subject: Leave Request Update: Approved
        [EMAIL SENT] Message ID: mock-id-xxxxxxxx
        ```
5.  **Analytics & Data Integration**: Checked that Recharts correctly plots total leaves taken by department and monthly trends on the Admin dashboard.
6.  **Reports, Exports, and Printing**: Verified the CSV download writes columns accurately and the browser print preview hides sidebars (`no-print` classes) to fit page width.
