const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

let submissions = [];

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "components"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { name, email, age, password, message } = req.body;

  submissions.push({ name, email, age, message });

  res.redirect("/submission");
});

app.get("/submission", (req, res) => {
  res.render("submission", { submissions });
});

app.listen(PORT, () => {
  console.log(`Ctrl + click --> http://localhost:${PORT}`);
});