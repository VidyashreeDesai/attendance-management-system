# Attendance Management System

A simple web-based Attendance Management System built with **Node.js**, **MySQL**, **HTML/CSS/JS**.

## Technology Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js (built-in `http`, `url`, `fs`, `path` modules — no Express)
- Database: MySQL (via XAMPP)
- Node.js MySQL driver: `mysql2`

## Setup Instructions

### 1. Install XAMPP
- Download and install XAMPP.
- Open XAMPP Control Panel.
- Start **MySQL** (Apache optional).

### 2. Import the Database
- Open phpMyAdmin in your browser (http://localhost/phpmyadmin).
- Click **Import**.
- Choose the file `database/attendance_db.sql` from this project.
- Click **Go** to import. This creates the `attendance_db` database with all tables and sample data.

### 3. Install Node.js Dependencies
```bash
npm install
```

### 4. Start the Application
```bash
npm start
```
The server runs at **http://localhost:3000**.

### 5. Login
- Username: `admin`
- Password: `admin123`

## Database Configuration
Default settings (XAMPP defaults):
- Host: localhost
- User: root
- Password: (empty)
- Database: attendance_db
- Port: 3306

To override, set environment variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`.

## Features
- Login (MySQL-backed credentials)
- Dashboard with stats
- Add / View / Edit / Delete students
- Search students by ID, name, or course
- Mark attendance by date, course, semester
- View attendance records with filters
- Attendance report with percentage calculation

## Project Structure
```
Attendance-Management-System/
├── server.js
├── database.js
├── package.json
├── public/
│   ├── index.html
│   ├── dashboard.html
│   ├── add-student.html
│   ├── students.html
│   ├── attendance.html
│   ├── records.html
│   ├── report.html
│   ├── css/style.css
│   └── js/
│       ├── login.js
│       ├── dashboard.js
│       ├── students.js
│       ├── attendance.js
│       ├── records.js
│       └── report.js
└── database/
    └── attendance_db.sql
```


## Run in VS Code

1. Extract the ZIP file.
2. Open the **project** folder (the folder that contains `package.json`) in VS Code.
3. Open **Terminal > New Terminal**.
4. Run:
   ```bash
   npm install
   npm start
   ```
5. Open **http://localhost:3000** in your browser. The new Home page will appear.
6. Click **Get Started** or **Login**. Default login: `admin` / `admin123`.

### MySQL
Make sure MySQL is running and the `attendance_db` database/tables from `database/attendance_db.sql` have been imported. If your MySQL password is not empty, set it before starting the server:
- PowerShell: `$env:DB_PASSWORD="your_password"`
- Command Prompt: `set DB_PASSWORD=your_password`

## Home and Register Pages
- Home page: `http://localhost:3000/`
- Login page: `http://localhost:3000/login.html`
- Register page: `http://localhost:3000/register.html`
- New administrator accounts can be created from the Register page.

### Run in VS Code
```powershell
cd "C:\Users\vidya\Downloads\attendance-management-system-with-home\project"
npm install
npm start
```
Then open `http://localhost:3000` in your browser.
