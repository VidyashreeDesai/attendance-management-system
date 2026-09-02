const form = document.getElementById('registerForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    errorMsg.textContent = 'Passwords do not match.';
    errorMsg.classList.remove('hidden');
    return;
  }

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();

    if (!response.ok) {
      errorMsg.textContent = data.error || 'Registration failed.';
      errorMsg.classList.remove('hidden');
      return;
    }

    successMsg.textContent = 'Registration successful! Redirecting to login...';
    successMsg.classList.remove('hidden');
    form.reset();
    setTimeout(() => { window.location.href = '/login.html'; }, 1200);
  } catch (err) {
    errorMsg.textContent = 'Unable to connect to the server.';
    errorMsg.classList.remove('hidden');
  }
});
