Create a full-stack production-style HRMS SaaS MVP project with 2 folders:

/backend
/frontend

====================================================
TECH STACK
==========

Frontend:

* React
* Vite
* Tailwind CSS
* React Router
* Axios
* Zustand
* React Query
* shadcn/ui
* Recharts
* Framer Motion

Backend:

* Node.js
* Express.js
* JWT Authentication
* File-based JSON storage
* Modular architecture
* REST APIs

====================================================
IMPORTANT ARCHITECTURE RULE
===========================

Backend MUST be designed in a way that JSON storage can later be replaced with PostgreSQL without changing API logic.

Use:

* repository pattern
* service layer
* controller layer

DO NOT directly read/write JSON files inside route files.

====================================================
PROJECT STRUCTURE
=================

backend/
src/
controllers/
services/
repositories/
routes/
middleware/
utils/
database/
data/
config/
validations/

frontend/
src/
components/
pages/
layouts/
hooks/
store/
services/
lib/
routes/

====================================================
APP TYPE
========

Build a Multi-Tenant Employee Attendance + Leave + Payroll Management SaaS.

====================================================
MULTI TENANT SYSTEM
===================

Every entity must contain:

* companyId

Support:

* multiple companies
* isolated data

====================================================
USER ROLES
==========

Roles:

* SUPER_ADMIN
* COMPANY_ADMIN
* EMPLOYEE

====================================================
AUTHENTICATION
==============

Build JWT authentication.

Features:

* login
* logout
* protected routes
* role-based middleware

Use:

* access token
* refresh token

Store auth securely.

====================================================
JSON DATABASE SYSTEM
====================

Use JSON files for storage initially.

Inside:
backend/src/data/

Create files:

* companies.json
* users.json
* employees.json
* attendance.json
* leaves.json
* payrolls.json
* settings.json

Create reusable JSON database utility.

Example:

* readJson()
* writeJson()

====================================================
IMPORTANT
=========

Create repository classes so future migration to PostgreSQL is easy.

Example:
EmployeeRepository
AttendanceRepository
PayrollRepository

Later only repository implementation changes.

====================================================
FRONTEND UI DESIGN
==================

Create modern SaaS admin panel UI.

Design:

* minimal
* compact
* professional
* light gray background
* white cards
* blue primary color
* smooth shadows
* responsive sidebar
* small clean fonts

====================================================
ADMIN PANEL PAGES
=================

Create these pages:

1. Login
2. Dashboard
3. Employees
4. Attendance
5. Leave Requests
6. Payroll
7. QR Scanner
8. Reports
9. Settings

====================================================
DASHBOARD
=========

Show:

* total employees
* present today
* absent today
* pending leave requests
* payroll summary
* attendance graph

Use Recharts.

====================================================
EMPLOYEE MANAGEMENT
===================

Features:

* add employee
* edit employee
* deactivate employee
* employee profile
* assign salary
* shift timing
* QR code generation

Employee fields:

* employeeCode
* fullName
* phone
* email
* password
* department
* designation
* joiningDate
* monthlySalary
* shiftStart
* shiftEnd
* status
* qrCode

====================================================
QR ATTENDANCE SYSTEM
====================

Attendance works by scanning employee QR ID cards.

Create:

* QR Scanner page
* webcam QR scanner

Flow:

* scan QR
* validate employee
* mark attendance

Attendance types:

* CHECK_IN
* CHECK_OUT

Prevent:

* duplicate checkin
* duplicate checkout

====================================================
ATTENDANCE SYSTEM
=================

Attendance fields:

* employeeId
* companyId
* date
* checkInTime
* checkOutTime
* status
* lateMinutes
* overtimeMinutes
* attendanceMethod

Statuses:

* PRESENT
* ABSENT
* LATE
* HALF_DAY
* ON_LEAVE

====================================================
LATE RULE SETTINGS
==================

Settings page should support:

* office start time
* grace period
* late fine enabled
* late fine amount
* late count threshold

====================================================
LEAVE MANAGEMENT
================

Employee can:

* apply leave
* select leave type
* select half day/full day
* choose date range
* write reason

Admin can:

* approve leave
* reject leave

Leave types:

* Casual Leave
* Sick Leave
* Unpaid Leave

====================================================
PAYROLL SYSTEM
==============

Generate monthly payroll.

Payroll formula:
Monthly Salary

* absent deductions
* late fine

- overtime

Payroll page should show:

* present days
* absent days
* late count
* deductions
* final salary

Allow:

* generate payroll
* lock payroll

====================================================
REPORTS PAGE
============

Generate:

* attendance report
* payroll report
* leave report

Add:

* filters
* export buttons

====================================================
SETTINGS PAGE
=============

Settings:

* company profile
* office timings
* attendance rules
* late rules

====================================================
BACKEND API REQUIREMENTS
========================

Use REST APIs.

Routes:

* /auth
* /employees
* /attendance
* /leave
* /payroll
* /settings
* /reports

====================================================
VALIDATION
==========

Use:

* Zod or Joi validation

====================================================
SECURITY
========

Implement:

* JWT middleware
* role checks
* API validation
* secure password hashing
* CORS handling

====================================================
IMPORTANT UI FEATURES
=====================

Add:

* loading states
* toast notifications
* reusable tables
* reusable modals
* reusable forms
* error handling
* empty states

====================================================
CODE QUALITY
============

Generate:

* scalable architecture
* reusable hooks
* reusable services
* reusable API layer
* proper naming conventions
* production-style folder structure

Avoid toy/demo architecture.

Build like a real SaaS MVP.
