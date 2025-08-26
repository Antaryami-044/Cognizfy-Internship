function validateForm() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const age = Number(document.getElementById("age").value);
  if (!name || !email || !age) {
    alert("Name, Email and Age are required.");
    return false;
  }
  if (!/^[^ ]+@[^ ]+\.[a-z]{2,}$/i.test(email)) {
    alert("Please enter a valid email.");
    return false;
  }
  if (age < 18) {
    alert("Age must be 18 or above.");
    return false;
  }
  return true;
}
