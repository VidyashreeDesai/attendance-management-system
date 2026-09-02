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

  const reportBody = document.getElementById("reportBody");
  const genReportBtn = document.getElementById("genReportBtn");
  const msgBox = document.getElementById("msgBox");

  function showMsg(text, type) {
    msgBox.textContent = text;
    msgBox.className = "msg-box " + type;
    msgBox.classList.remove("hidden");
  }

  async function loadReport() {
    const course = document.getElementById("reportCourse").value;
    let url = "/api/report?";
    if (course) url += "course=" + encodeURIComponent(course);

    try {
      const res = await fetch(url);
      const data = await res.json();
      reportBody.innerHTML = "";
      if (!Array.isArray(data) || data.length === 0) {
        reportBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#64748b;">No data available.</td></tr>';
        return;
      }
      data.forEach((r) => {
        const tr = document.createElement("tr");
        const pctClass = r.percentage >= 75 ? "status-present" : "status-absent";
        tr.innerHTML = `
          <td>${r.student_id}</td>
          <td>${r.name}</td>
          <td>${r.course}</td>
          <td>${r.total_classes}</td>
          <td>${r.present}</td>
          <td>${r.absent}</td>
          <td class="${pctClass}">${r.percentage}%</td>
        `;
        reportBody.appendChild(tr);
      });
    } catch (err) {
      reportBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#dc2626;">Failed to load report.</td></tr>';
    }
  }

  genReportBtn.addEventListener("click", loadReport);
  loadReport();
})();
