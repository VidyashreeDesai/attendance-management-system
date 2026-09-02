-- ============================================================
-- Attendance Management System - Database Setup File
-- Import this file through phpMyAdmin (XAMPP MySQL)
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS attendance_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE attendance_db;

-- ----------------------------------------------------------
-- Table: admin
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- Default admin account
INSERT INTO admin (username, password) VALUES ('admin', 'admin123');

-- ----------------------------------------------------------
-- Table: students
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  course VARCHAR(20) NOT NULL,
  semester INT NOT NULL
) ENGINE=InnoDB;

-- Sample student records
INSERT INTO students (student_id, name, email, phone, course, semester) VALUES
('S001', 'Ravi Kumar',   'ravi.kumar@example.com',   '9876543210', 'CSE', 5),
('S002', 'Anu Sharma',   'anu.sharma@example.com',   '9876543211', 'CSE', 5),
('S003', 'Kiran Patil',  'kiran.patil@example.com',  '9876543212', 'ISE', 6),
('S004', 'Priya Desai',  'priya.desai@example.com',  '9876543213', 'ECE', 5),
('S005', 'Rahul Gowda',  'rahul.gowda@example.com',  '9876543214', 'CSE', 6);

-- ----------------------------------------------------------
-- Table: attendance
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('Present', 'Absent') NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Sample attendance records
INSERT INTO attendance (student_id, attendance_date, status) VALUES
('S001', '2026-08-25', 'Present'),
('S002', '2026-08-25', 'Present'),
('S003', '2026-08-25', 'Absent'),
('S004', '2026-08-25', 'Present'),
('S005', '2026-08-25', 'Present'),
('S001', '2026-08-26', 'Present'),
('S002', '2026-08-26', 'Absent'),
('S003', '2026-08-26', 'Present'),
('S004', '2026-08-26', 'Absent'),
('S005', '2026-08-26', 'Present'),
('S001', '2026-08-27', 'Present'),
('S002', '2026-08-27', 'Present'),
('S003', '2026-08-27', 'Present'),
('S004', '2026-08-27', 'Present'),
('S005', '2026-08-27', 'Absent');
