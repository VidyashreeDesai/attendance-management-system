const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const pool = require("./database");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(req, res, pathname) {
  let filePath = path.join(PUBLIC_DIR, pathname);
  if (pathname === "/" || pathname === "") filePath = path.join(PUBLIC_DIR, "index.html");

  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 - Page Not Found</h1>");
      return;
    }
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
}

// ---- API Handlers ----

async function register(req, res) {
  const { username, password } = await readBody(req);
  if (!username || !password) return sendJson(res, 400, { error: "Username and password are required" });
  if (username.trim().length < 3) return sendJson(res, 400, { error: "Username must be at least 3 characters" });
  if (password.length < 6) return sendJson(res, 400, { error: "Password must be at least 6 characters" });
  try {
    const [existing] = await pool.query("SELECT id FROM admin WHERE username = ?", [username.trim()]);
    if (existing.length > 0) return sendJson(res, 409, { error: "Username already exists" });
    await pool.query("INSERT INTO admin (username, password) VALUES (?, ?)", [username.trim(), password]);
    sendJson(res, 201, { message: "Registration successful" });
  } catch (err) {
    sendJson(res, 500, { error: "Database error: " + err.message });
  }
}

async function login(req, res) {
  const { username, password } = await readBody(req);
  if (!username || !password) return sendJson(res, 400, { error: "Username and password are required" });
  try {
    const [rows] = await pool.query("SELECT * FROM admin WHERE username = ? AND password = ?", [username, password]);
    if (rows.length === 0) return sendJson(res, 401, { error: "Invalid username or password" });
    sendJson(res, 200, { message: "Login successful", user: { username: rows[0].username } });
  } catch (err) {
    sendJson(res, 500, { error: "Database error: " + err.message });
  }
}

async function addStudent(req, res) {
  const { student_id, name, email, phone, course, semester } = await readBody(req);
  if (!student_id || !name || !email || !phone || !course || !semester)
    return sendJson(res, 400, { error: "All fields are required" });
  try {
    await pool.query(
      "INSERT INTO students (student_id, name, email, phone, course, semester) VALUES (?, ?, ?, ?, ?, ?)",
      [student_id, name, email, phone, course, semester]
    );
    sendJson(res, 201, { message: "Student added successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return sendJson(res, 409, { error: "Student ID already exists" });
    sendJson(res, 500, { error: "Database error: " + err.message });
  }
}

async function getStudents(req, res, query) {
  try {
    let sql = "SELECT * FROM students";
    const params = [];
    if (query.search) {
      sql += " WHERE student_id LIKE ? OR name LIKE ? OR course LIKE ?";
      const term = `%${query.search}%`;
      params.push(term, term, term);
    }
    sql += " ORDER BY id ASC";
    const [rows] = await pool.query(sql, params);
    sendJson(res, 200, rows);
  } catch (err) {
    sendJson(res, 500, { error: "Database error: " + err.message });
  }
}

async function updateStudent(req, res, id) {
  const { name, email, phone, course, semester } = await readBody(req);
  if (!name || !email || !phone || !course || !semester)
    return sendJson(res, 400, { error: "All fields are required" });
  try {
    const [result] = await pool.query(
      "UPDATE students SET name = ?, email = ?, phone = ?, course = ?, semester = ? WHERE id = ?",
      [name, email, phone, course, semester, id]
    );
    if (result.affectedRows === 0) return sendJson(res, 404, { error: "Student not found" });
    sendJson(res, 200, { message: "Student updated successfully" });
  } catch (err) {
    sendJson(res, 500, { error: "Database error: " + err.message });
  }
}

async function deleteStudent(req, res, id) {
  try {
    const [result] = await pool.query("DELETE FROM students WHERE id = ?", [id]);
    if (result.affectedRows === 0) return sendJson(res, 404, { error: "Student not found" });
    await pool.query("DELETE FROM attendance WHERE student_id = (SELECT student_id FROM students WHERE id = ?)", [id]).catch(() => {});
    sendJson(res, 200, { message: "Student deleted successfully" });
  } catch (err) {
    sendJson(res, 500, { error: "Database error: " + err.message });
  }
}

async function markAttendance(req, res) {
  const { date, records } = await readBody(req);
  if (!date || !records || !Array.isArray(records) || records.length === 0)
    return sendJson(res, 400, { error: "Date and attendance records are required" });
  try {
    const values = records.map((r) => [r.student_id, date, r.status]);
    await pool.query("INSERT INTO attendance (student_id, attendance_date, status) VALUES ?", [values]);
    sendJson(res, 201, { message: "Attendance saved successfully" });
  } catch (err) {
    sendJson(res, 500, { error: "Database error: " + err.message });
  }
}

async function getAttendanceRecords(req, res, query) {
  try {
    let sql = `
      SELECT a.id, a.student_id, s.name, s.course, a.attendance_date, a.status
      FROM attendance a
      JOIN students s ON a.student_id = s.student_id
      WHERE 1=1
    `;
    const params = [];
    if (query.date) { sql += " AND a.attendance_date = ?"; params.push(query.date); }
    if (query.student_id) { sql += " AND a.student_id = ?"; params.push(query.student_id); }
    if (query.course) { sql += " AND s.course = ?"; params.push(query.course); }
    if (query.status) { sql += " AND a.status = ?"; params.push(query.status); }
    sql += " ORDER BY a.attendance_date DESC, a.id ASC";
    const [rows] = await pool.query(sql, params);
    sendJson(res, 200, rows);
  } catch (err) {
    sendJson(res, 500, { error: "Database error: " + err.message });
  }
}

async function getReport(req, res, query) {
  try {
    let sql = `
      SELECT s.student_id, s.name, s.course,
        COUNT(a.id) AS total_classes,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent
      FROM students s
      LEFT JOIN attendance a ON s.student_id = a.student_id
    `;
    const params = [];
    const conditions = [];
    if (query.course) { conditions.push("s.course = ?"); params.push(query.course); }
    if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
    sql += " GROUP BY s.student_id, s.name, s.course ORDER BY s.student_id ASC";
    const [rows] = await pool.query(sql, params);
    const report = rows.map((r) => ({
      student_id: r.student_id,
      name: r.name,
      course: r.course,
      total_classes: r.total_classes || 0,
      present: r.present || 0,
      absent: r.absent || 0,
      percentage: r.total_classes > 0 ? Math.round(((r.present / r.total_classes) * 100) * 100) / 100 : 0,
    }));
    sendJson(res, 200, report);
  } catch (err) {
    sendJson(res, 500, { error: "Database error: " + err.message });
  }
}

async function getDashboardStats(req, res) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [totalRows] = await pool.query("SELECT COUNT(*) AS total FROM students");
    const [presentRows] = await pool.query("SELECT COUNT(*) AS total FROM attendance WHERE attendance_date = ? AND status = 'Present'", [today]);
    const [absentRows] = await pool.query("SELECT COUNT(*) AS total FROM attendance WHERE attendance_date = ? AND status = 'Absent'", [today]);
    const [allAttendance] = await pool.query("SELECT COUNT(*) AS total FROM attendance");
    const [presentAll] = await pool.query("SELECT COUNT(*) AS total FROM attendance WHERE status = 'Present'");
    const overall = allAttendance[0].total > 0 ? Math.round((presentAll[0].total / allAttendance[0].total) * 100) : 0;
    sendJson(res, 200, {
      total_students: totalRows[0].total,
      present_today: presentRows[0].total,
      absent_today: absentRows[0].total,
      overall_percentage: overall,
    });
  } catch (err) {
    sendJson(res, 500, { error: "Database error: " + err.message });
  }
}

async function getStudentsByCourseSemester(req, res, query) {
  try {
    let sql = "SELECT * FROM students WHERE 1=1";
    const params = [];
    if (query.course) { sql += " AND course = ?"; params.push(query.course); }
    if (query.semester) { sql += " AND semester = ?"; params.push(query.semester); }
    sql += " ORDER BY student_id ASC";
    const [rows] = await pool.query(sql, params);
    sendJson(res, 200, rows);
  } catch (err) {
    sendJson(res, 500, { error: "Database error: " + err.message });
  }
}

// ---- Router ----

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const query = parsed.query;
  const method = req.method;

  // API routes
  if (pathname.startsWith("/api")) {
    try {
      if (pathname === "/api/login" && method === "POST") return await login(req, res);
      if (pathname === "/api/register" && method === "POST") return await register(req, res);
      if (pathname === "/api/students" && method === "POST") return await addStudent(req, res);
      if (pathname === "/api/students" && method === "GET") return await getStudents(req, res, query);
      if (pathname.startsWith("/api/students/") && method === "PUT") {
        const id = pathname.split("/")[3];
        return await updateStudent(req, res, id);
      }
      if (pathname.startsWith("/api/students/") && method === "DELETE") {
        const id = pathname.split("/")[3];
        return await deleteStudent(req, res, id);
      }
      if (pathname === "/api/attendance" && method === "POST") return await markAttendance(req, res);
      if (pathname === "/api/attendance" && method === "GET") return await getAttendanceRecords(req, res, query);
      if (pathname === "/api/attendance/students" && method === "GET") return await getStudentsByCourseSemester(req, res, query);
      if (pathname === "/api/report" && method === "GET") return await getReport(req, res, query);
      if (pathname === "/api/dashboard" && method === "GET") return await getDashboardStats(req, res);
      return sendJson(res, 404, { error: "API endpoint not found" });
    } catch (err) {
      return sendJson(res, 500, { error: "Server error: " + err.message });
    }
  }

  // Static files
  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Attendance Management System running at http://localhost:${PORT}`);
});
