function validateForm() {
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let age = document.getElementById("age").value.trim();
  let password = document.getElementById("password").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (name === "" || email === "" || age === "" || password === "" || confirmPassword === "") {
    alert("All fields are required!");
    return false;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return false;
  }

  return true;
}

function checkPasswordStrength() {
  let password = document.getElementById("password").value;
  let strengthBar = document.getElementById("strength");

  let strength = 0;

  if (password.length >= 6) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength === 0) {
    strengthBar.innerHTML = "";
  } else if (strength <= 1) {
    strengthBar.innerHTML = "Weak";
    strengthBar.style.color = "red";
  } else if (strength === 2) {
    strengthBar.innerHTML = "Normal";
    strengthBar.style.color = "orange";
  } else if (strength >= 3) {
    strengthBar.innerHTML = "Strong";
    strengthBar.style.color = "green";
  }
}
