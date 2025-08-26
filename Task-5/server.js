const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const PORT = 3000;

let submissions = [];
let nextId = 1;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "components"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => res.render("home"));
app.get("/register", (req, res) => res.render("register"));
app.get("/submission", (req, res) => res.render("submission", { submissions }));
app.get("/api-demo", (req, res) => res.render("api"));

app.post("/register", (req, res) => {
  const { name, email, age, password, message } = req.body;
  if (!name || !email || !age) return res.redirect("/register");

  submissions.push({
    id: nextId++,
    name: String(name).trim(),
    email: String(email).trim(),
    age: Number(age),
    message: (message || "").trim()
  });

  res.redirect("/submission");
});

app.get("/api/submissions", (req, res) => {
  res.json({ ok: true, data: submissions });
});

app.get("/api/submissions/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = submissions.find(s => s.id === id);
  if (!item) return res.status(404).json({ ok: false, error: "Not found" });
  res.json({ ok: true, data: item });
});

app.post("/api/submissions", (req, res) => {
  const { name, email, age, message } = req.body || {};
  if (!name || !email || !age) {
    return res.status(400).json({ ok: false, error: "name, email, age are required" });
  }
  const created = {
    id: nextId++,
    name: String(name).trim(),
    email: String(email).trim(),
    age: Number(age),
    message: (message || "").trim()
  };
  submissions.push(created);
  res.status(201).json({ ok: true, data: created });
});

app.put("/api/submissions/:id", (req, res) => {
  const id = Number(req.params.id);
  const found = submissions.findIndex(s => s.id === id);
  if (found === -1) return res.status(404).json({ ok: false, error: "Not found" });

  const { name, email, age, message } = req.body || {};
  const current = submissions[found];

  submissions[found] = {
    ...current,
    name: name !== undefined ? String(name).trim() : current.name,
    email: email !== undefined ? String(email).trim() : current.email,
    age: age !== undefined ? Number(age) : current.age,
    message: message !== undefined ? String(message).trim() : current.message
  };

  res.json({ ok: true, data: submissions[found] });
});

app.delete("/api/submissions/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = submissions.length;
  submissions = submissions.filter(s => s.id !== id);
  if (submissions.length === before) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  res.json({ ok: true, data: { id } });
});

app.listen(PORT, () => {
  console.log(`Ctrl + click ----> http://localhost:${PORT}`);
});
