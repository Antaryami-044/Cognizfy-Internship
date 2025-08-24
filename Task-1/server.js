const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.set("view engine", "ejs");
app.set("views", __dirname);

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/submit", (req, res) => {
  const { name, email } = req.body;
  res.render("result", { name, email });
});

app.listen(PORT, () => {
  console.log(`Your Server running at http://localhost:${PORT}`);
});
