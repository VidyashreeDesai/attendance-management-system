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

  async function loadStats() {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (res.ok) {
        document.getElementById("totalStudents").textContent = data.total_students;
        document.getElementById("presentToday").textContent = data.present_today;
        document.getElementById("absentToday").textContent = data.absent_today;
        document.getElementById("overallPct").textContent = data.overall_percentage + "%";
      }
    } catch (err) {
      console.error("Failed to load dashboard stats");
    }
  }

  loadStats();
})();
