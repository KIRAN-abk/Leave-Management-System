# Leave Management System (MERN Stack)

An enterprise-ready Leave Management System built using the MERN stack (MongoDB, Express, React, Node.js) with JWT authentication and role-based access control (Admin, Manager, Employee). 

The application features responsive dashboards, interactive leave analytics, email notifications, file uploads, and a print-ready reporting dashboard.

---

## 🚀 Key Features

*   **Role-Based Access Control (RBAC)**: Secure access tailored for Admins, Managers, and Employees.
*   **Employee Dashboard**: Track active leave balances, submit leave requests with file uploads (such as medical certificates), and review request history.
*   **Manager Dashboard**: Approve or reject direct report leave requests with comments, view department schedules, and see who is on leave today.
*   **Admin Dashboard**: Manage employees, departments, leave policies, and review monthly leave analytics.
*   **Analytics Reports**: Visual charts (bar and line trends), customizable filters, printable layout reports, and CSV download support.
*   **Email Notifications**: Auto-notification sent to managers upon leave applications, and employees upon approval/rejection.
*   **Preseeded Database**: Auto-seeding of policies, departments, and credentials on startup for instant demo readiness.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS v4, Axios, React Router, Recharts, Lucide Icons.
*   **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer, Nodemailer.

---

## 📂 Project Structure

```
Leave_management_system/
├── backend/
│   ├── config/             # DB connection, database seeder, mailer
│   ├── controllers/        # Express MVC controllers
│   ├── middleware/         # JWT security, Role authorization, Multer
│   ├── models/             # Mongoose schemas (User, LeaveRequest, Dept, Policy)
│   ├── routes/             # API routing
│   ├── uploads/            # Local directory for uploaded certificates
│   ├── .env                # Local environment configuration
│   └── server.js           # Server entry point
└── frontend/
    ├── src/
    │   ├── components/     # Layouts, Sidebar, Header, ProtectedRoute
    │   ├── context/        # Session Context (AuthContext)
    │   ├── pages/          # Login, Dashboards, Employee, Dept, Policy, Reports
    │   ├── utils/          # Axios client configuration
    │   ├── App.jsx         # Routes definition
    │   └── index.css       # Tailwind directives & CSS design tokens
    └── vite.config.js      # Vite compilation configurations
```

---

## ⚙️ Quick Start Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) installed (v18 or higher recommended).
*   [MongoDB](https://www.mongodb.com/) running locally (e.g., `mongodb://127.0.0.1:27017/`) or a MongoDB Atlas connection URI.

---

### Step 1: Backend Setup

1. Open your terminal in the `backend/` folder:
    ```bash
    cd backend
    ```
2. Install the backend dependencies:
    ```bash
    npm install
    ```
3. Configuration: A `.env` file with development defaults has already been created for you. To customize it (such as adding SMTP credentials for email alerts or changing ports), modify the `.env` file:
    ```ini
    PORT=5000
    MONGODB_URI=mongodb://127.0.0.1:27017/leave_management
    JWT_SECRET=super_secret_jwt_key_987654321
    SMTP_HOST=                 # Add SMTP host to enable email notifications
    SMTP_PORT=587
    SMTP_USER=
    SMTP_PASS=
    NODE_ENV=development
    ```
4. Start the server (runs on port 5000):
    ```bash
    npm run dev
    ```
    *Note: The server automatically seeds the database with demo users, policies, and departments on its first run if the database is empty.*

---

### Step 2: Frontend Setup

1. Open your terminal in the `frontend/` folder:
    ```bash
    cd ../frontend
    ```
2. Install the dependencies:
    ```bash
    npm install --legacy-peer-deps
    ```
3. Launch the development server (Vite):
    ```bash
    npm run dev
    ```
4. Open the link displayed in the console (usually `http://localhost:5173`) in your browser.

---

## 🔑 Demo Access Credentials

The database auto-seeds the following credentials for testing:

| Role | Email | Password | Preseeded Account Name |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` | Jane Admin |
| **Manager** | `manager@company.com` | `manager123` | John Manager |
| **Employee** | `employee@company.com` | `employee123` | Alice Employee |

*Use the **quick fill** selectors on the Login Page to instantly fill credentials for these roles.*
