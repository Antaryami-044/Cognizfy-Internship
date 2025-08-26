const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const { PORT = 3000, MONGODB_URI, JWT_SECRET, JWT_COOKIE_NAME = "token" } = process.env;
const app = express();


mongoose.set("strictQuery", true);
mongoose
  .connect(MONGODB_URI, { dbName: "task-6" })
  .then(() => console.log("MongoDB connected to your project successfully"))
  .catch((e) => {
    console.error("MongoDB connection error:", e.message);
    process.exit(1);
  });

const User = require("./models/User");
const Submission = require("./models/Submission");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "components"));

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "2d" });
}

function authMiddleware(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    if (!token && req.cookies[JWT_COOKIE_NAME]) {
      token = req.cookies[JWT_COOKIE_NAME];
    }

    if (!token) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
}

function requireLoginPage(req, res, next) {
  try {
    let token = req.cookies[JWT_COOKIE_NAME];
    if (!token) return res.redirect("/login");
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.redirect("/login");
  }
}

app.get("/", (req, res) => res.render("home"));
app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/register", requireLoginPage, (req, res) => res.render("register"));
app.get("/submission", requireLoginPage, async (req, res) => {
  const list = await Submission.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  res.render("submission", { submissions: list });
});

app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password = "" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, error: "All fields are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ ok: false, error: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), passwordHash: hash });

    const token = signToken({ id: user._id, email: user.email, name: user.name });
    res
      .cookie(process.env.JWT_COOKIE_NAME || "token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 2
      })
      .json({ ok: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password = "" } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ ok: false, error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const token = signToken({ id: user._id, email: user.email, name: user.name });
    res
      .cookie(process.env.JWT_COOKIE_NAME || "token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 2
      })
      .json({ ok: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Logout
app.post("/auth/logout", (req, res) => {
  res.clearCookie(process.env.JWT_COOKIE_NAME || "token");
  res.json({ ok: true });
});


// Submission

app.post("/form/submit", requireLoginPage, async (req, res) => {
  try {
    const { name, email, age, message } = req.body;
    if (!name || !email || !age) return res.redirect("/register");

    await Submission.create({
      userId: req.user.id,
      name: String(name).trim(),
      email: String(email).trim(),
      age: Number(age),
      message: (message || "").trim()
    });

    res.redirect("/submission");
  } catch {
    res.redirect("/register");
  }
});

// REST API using JWT

app.get("/api/submissions", authMiddleware, async (req, res) => {
  const list = await Submission.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, data: list });
});

app.get("/api/submissions/:id", authMiddleware, async (req, res) => {
  const item = await Submission.findOne({ _id: req.params.id, userId: req.user.id }).lean();
  if (!item) return res.status(404).json({ ok: false, error: "Not found" });
  res.json({ ok: true, data: item });
});

app.post("/api/submissions", authMiddleware, async (req, res) => {
  const { name, email, age, message } = req.body || {};
  if (!name || !email || !age) return res.status(400).json({ ok: false, error: "name, email, age required" });
  const created = await Submission.create({
    userId: req.user.id,
    name: String(name).trim(),
    email: String(email).trim(),
    age: Number(age),
    message: (message || "").trim()
  });
  res.status(201).json({ ok: true, data: created });
});

app.put("/api/submissions/:id", authMiddleware, async (req, res) => {
  const { name, email, age, message } = req.body || {};
  const updated = await Submission.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(email !== undefined ? { email: String(email).trim() } : {}),
      ...(age !== undefined ? { age: Number(age) } : {}),
      ...(message !== undefined ? { message: String(message).trim() } : {})
    },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json({ ok: false, error: "Not found" });
  res.json({ ok: true, data: updated });
});

app.delete("/api/submissions/:id", authMiddleware, async (req, res) => {
  const removed = await Submission.findOneAndDelete({ _id: req.params.id, userId: req.user.id }).lean();
  if (!removed) return res.status(404).json({ ok: false, error: "Not found" });
  res.json({ ok: true, data: { id: removed._id } });
});

app.listen(PORT, () => {
  console.log(`Ctrl + click   ----->   http://localhost:${PORT}`);
});