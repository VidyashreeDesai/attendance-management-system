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

  const attDate = document.getElementById("attDate");
  attDate.value = new Date().toISOString().slice(0, 10);

  const loadBtn = document.getElementById("loadBtn");
  const attBody = document.getElementById("attBody");
  const attTableWrapper = document.getElementById("attTableWrapper");
  const saveBar = document.getElementById("saveBar");
  const saveBtn = document.getElementById("saveBtn");
  const markAllPresent = document.getElementById("markAllPresent");
  const msgBox = document.getElementById("msgBox");

  function showMsg(text, type) {
    msgBox.textContent = text;
    msgBox.className = "msg-box " + type;
    msgBox.classList.remove("hidden");
  }

  let loadedStudents = [];

  loadBtn.addEventListener("click", async () => {
    const course = document.getElementById("attCourse").value;
    const semester = document.getElementById("attSemester").value;
    let url = "/api/attendance/students?";
    if (course) url += "course=" + encodeURIComponent(course) + "&";
    if (semester) url += "semester=" + encodeURIComponent(semester);

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        attBody.innerHTML = "";
        attTableWrapper.classList.add("hidden");
        saveBar.classList.add("hidden");
        showMsg("No students found for the selected filters.", "error");
        return;
      }
      loadedStudents = data;
      msgBox.classList.add("hidden");
      attBody.innerHTML = "";
      data.forEach((s) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${s.student_id}</td>
          <td>${s.name}</td>
          <td>${s.course}</td>
          <td>${s.semester}</td>
          <td>
            <span class="att-radios">
              <label class="radio-label"><input type="radio" name="status_${s.student_id}" value="Present" checked> Present</label>
              <label class="radio-label"><input type="radio" name="status_${s.student_id}" value="Absent"> Absent</label>
            </span>
          </td>
        `;
        attBody.appendChild(tr);
      });
      attTableWrapper.classList.remove("hidden");
      saveBar.classList.remove("hidden");
    } catch (err) {
      showMsg("Cannot connect to server.", "error");
    }
  });

  markAllPresent.addEventListener("click", () => {
    loadedStudents.forEach((s) => {
      const radio = document.querySelector(`input[name="status_${s.student_id}"][value="Present"]`);
      if (radio) radio.checked = true;
    });
  });

  saveBtn.addEventListener("click", async () => {
    const date = attDate.value;
    if (!date) { showMsg("Please select a date.", "error"); return; }
    const records = loadedStudents.map((s) => {
      const checked = document.querySelector(`input[name="status_${s.student_id}"]:checked`);
      return { student_id: s.student_id, status: checked ? checked.value : "Absent" };
    });
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, records }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("Attendance saved successfully!", "success");
        attTableWrapper.classList.add("hidden");
        saveBar.classList.add("hidden");
      } else {
        showMsg(data.error || "Failed to save attendance.", "error");
      }
    } catch (err) {
      showMsg("Cannot connect to server.", "error");
    }
  });
})();
