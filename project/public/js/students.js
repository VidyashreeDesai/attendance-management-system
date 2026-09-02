(function () {
  if (!sessionStorage.getItem("loggedIn")) {
    window.location.href = "/index.html";
    return;
  }

  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle) navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.removeItem("loggedIn");
      sessionStorage.removeItem("user");
      window.location.href = "/index.html";
    });
  }

  function showMsg(box, text, type) {
    box.textContent = text;
    box.className = "msg-box " + type;
    box.classList.remove("hidden");
  }

  // Add student form
  const studentForm = document.getElementById("studentForm");
  if (studentForm) {
    studentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msgBox = document.getElementById("msgBox");
      const payload = {
        student_id: document.getElementById("student_id").value.trim(),
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        course: document.getElementById("course").value,
        semester: document.getElementById("semester").value,
      };

      if (!payload.student_id || !payload.name || !payload.email || !payload.phone || !payload.course || !payload.semester) {
        showMsg(msgBox, "All fields are required.", "error");
        return;
      }

      try {
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          showMsg(msgBox, "Student added successfully!", "success");
          studentForm.reset();
        } else {
          showMsg(msgBox, data.error || "Failed to add student.", "error");
        }
      } catch (err) {
        showMsg(msgBox, "Cannot connect to server.", "error");
      }
    });
  }

  // View students
  const studentsBody = document.getElementById("studentsBody");
  if (studentsBody) {
    async function loadStudents(search) {
      const url = search ? "/api/students?search=" + encodeURIComponent(search) : "/api/students";
      try {
        const res = await fetch(url);
        const data = await res.json();
        studentsBody.innerHTML = "";
        if (!Array.isArray(data) || data.length === 0) {
          studentsBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#64748b;">No students found.</td></tr>';
          return;
        }
        data.forEach((s) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${s.student_id}</td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.phone}</td>
            <td>${s.course}</td>
            <td>${s.semester}</td>
            <td><button class="icon-btn edit" data-id="${s.id}">Edit</button></td>
            <td><button class="icon-btn delete" data-id="${s.id}">Delete</button></td>
          `;
          studentsBody.appendChild(tr);
        });

        studentsBody.querySelectorAll(".edit").forEach((btn) =>
          btn.addEventListener("click", () => openEdit(btn.dataset.id))
        );
        studentsBody.querySelectorAll(".delete").forEach((btn) =>
          btn.addEventListener("click", () => delStudent(btn.dataset.id))
        );
      } catch (err) {
        studentsBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#dc2626;">Failed to load students.</td></tr>';
      }
    }

    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const clearBtn = document.getElementById("clearBtn");

    if (searchBtn) searchBtn.addEventListener("click", () => loadStudents(searchInput.value.trim()));
    if (clearBtn) clearBtn.addEventListener("click", () => { searchInput.value = ""; loadStudents(); });
    if (searchInput) searchInput.addEventListener("keyup", (e) => { if (e.key === "Enter") loadStudents(searchInput.value.trim()); });

    loadStudents();

    // Edit modal
    const editModal = document.getElementById("editModal");
    const editForm = document.getElementById("editForm");
    const cancelEdit = document.getElementById("cancelEdit");

    async function openEdit(id) {
      try {
        const res = await fetch("/api/students");
        const data = await res.json();
        const student = data.find((s) => String(s.id) === String(id));
        if (!student) return;
        document.getElementById("editId").value = student.id;
        document.getElementById("editStudentId").value = student.student_id;
        document.getElementById("editName").value = student.name;
        document.getElementById("editEmail").value = student.email;
        document.getElementById("editPhone").value = student.phone;
        document.getElementById("editCourse").value = student.course;
        document.getElementById("editSemester").value = student.semester;
        editModal.classList.remove("hidden");
      } catch (err) {
        console.error("Failed to load student");
      }
    }

    if (cancelEdit) cancelEdit.addEventListener("click", () => editModal.classList.add("hidden"));

    if (editForm) {
      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("editId").value;
        const editMsgBox = document.getElementById("editMsgBox");
        const payload = {
          name: document.getElementById("editName").value.trim(),
          email: document.getElementById("editEmail").value.trim(),
          phone: document.getElementById("editPhone").value.trim(),
          course: document.getElementById("editCourse").value,
          semester: document.getElementById("editSemester").value,
        };
        try {
          const res = await fetch("/api/students/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (res.ok) {
            editModal.classList.add("hidden");
            loadStudents();
          } else {
            showMsg(editMsgBox, data.error || "Failed to update.", "error");
          }
        } catch (err) {
          showMsg(editMsgBox, "Cannot connect to server.", "error");
        }
      });
    }

    async function delStudent(id) {
      if (!confirm("Are you sure you want to delete this student?")) return;
      try {
        const res = await fetch("/api/students/" + id, { method: "DELETE" });
        if (res.ok) loadStudents();
      } catch (err) {
        console.error("Failed to delete student");
      }
    }
  }
})();
