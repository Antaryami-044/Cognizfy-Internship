const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "index.html"));
});

let submissions = [];

app.post("/submit", (req, res) => {
      const { name, email, age, message } = req.body;

      if (!name || !email || !age) {
            return res.send("<h2 style='color:red;'>Error: All fields are required!</h2><a href='/'>Go Back</a>");
      }
      if (isNaN(age) || age < 18) {
            return res.send("<h2 style='color:red;'>Error: Age must be 18 or above!</h2><a href='/'>Go Back</a>");
      }

      submissions.push({ name, email, age, message });

      res.send(`
    <h1 style="color:green;">Submitted Successfully</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Age:</strong> ${age}</p>
    <p><strong>Message:</strong> ${message}</p>
    <br><a href="/">Go Back</a>
    <br><a href="/submissions">View All Submissions</a>
  `);
});

app.get("/submissions", (req, res) => {
      let list = submissions.map(
            (s, i) => `<li style="list-style-type: decimal"> ${s.name} (${s.email}, ${s.age}) - ${s.message}</li>`
      ).join("");

      res.send(`
    <h1>All Submissions</h1>
    <ul>${list || "<p>No submissions yet.</p>"}</ul>
    <a href="/">Go Back</a>
  `);
});

app.listen(PORT, () => {
      console.log(`Ctrl + click --> http://localhost:${PORT}`);
});
