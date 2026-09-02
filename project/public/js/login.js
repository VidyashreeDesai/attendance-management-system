document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.classList.add("hidden");

  if (!username || !password) {
    errorMsg.textContent = "Please enter both username and password.";
    errorMsg.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      sessionStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("user", data.user.username);
      window.location.href = "/dashboard.html";
    } else {
      errorMsg.textContent = data.error || "Login failed.";
      errorMsg.classList.remove("hidden");
    }
  } catch (err) {
    errorMsg.textContent = "Cannot connect to server.";
    errorMsg.classList.remove("hidden");
  }
});
