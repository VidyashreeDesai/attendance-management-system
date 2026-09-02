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

  const recordsBody = document.getElementById("recordsBody");
  const filterBtn = document.getElementById("filterBtn");
  const clearFilterBtn = document.getElementById("clearFilterBtn");
  const msgBox = document.getElementById("msgBox");

  function showMsg(text, type) {
    msgBox.textContent = text;
    msgBox.className = "msg-box " + type;
    msgBox.classList.remove("hidden");
  }

  async function loadRecords() {
    const date = document.getElementById("filterDate").value;
    const student_id = document.getElementById("filterStudent").value.trim();
    const course = document.getElementById("filterCourse").value;
    const status = document.getElementById("filterStatus").value;

    let url = "/api/attendance?";
    const params = [];
    if (date) params.push("date=" + encodeURIComponent(date));
    if (student_id) params.push("student_id=" + encodeURIComponent(student_id));
    if (course) params.push("course=" + encodeURIComponent(course));
    if (status) params.push("status=" + encodeURIComponent(status));
    url += params.join("&");

    try {
      const res = await fetch(url);
      const data = await res.json();
      recordsBody.innerHTML = "";
      if (!Array.isArray(data) || data.length === 0) {
        recordsBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#64748b;">No records found.</td></tr>';
        return;
      }
      data.forEach((r) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${r.attendance_date}</td>
          <td>${r.student_id}</td>
          <td>${r.name}</td>
          <td>${r.course}</td>
          <td class="${r.status === 'Present' ? 'status-present' : 'status-absent'}">${r.status}</td>
        `;
        recordsBody.appendChild(tr);
      });
    } catch (err) {
      recordsBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#dc2626;">Failed to load records.</td></tr>';
    }
  }

  filterBtn.addEventListener("click", loadRecords);
  clearFilterBtn.addEventListener("click", () => {
    document.getElementById("filterDate").value = "";
    document.getElementById("filterStudent").value = "";
    document.getElementById("filterCourse").value = "";
    document.getElementById("filterStatus").value = "";
    loadRecords();
  });

  loadRecords();
})();
