function validateForm() {
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let age = document.getElementById("age").value.trim();
  let password = document.getElementById("password").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!name || !email || !age || !password || !confirmPassword) {
    alert("All fields are required!");
    return false;
  }
  if (Number(age) < 18) {
    alert("Age must be 18 or above.");
    return false;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return false;
  }
  return true;
}

function checkPasswordStrength() {
  const val = document.getElementById("password").value;
  const out = document.getElementById("strength");

  let score = 0;
  if (val.length >= 6) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  if (!val) { out.textContent = ""; return; }
  if (score <= 1) { out.textContent = "Weak"; out.style.color = "red"; }
  else if (score === 2) { out.textContent = "Normal"; out.style.color = "orange"; }
  else { out.textContent = "Strong"; out.style.color = "green"; }
}