require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const path = require("path");

const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Vercel (and most hosting platforms) sit behind a reverse proxy that
// terminates HTTPS. Without this, Express doesn't know the original request
// was secure, so a "secure" session cookie never gets set/sent correctly -
// causing the user to bounce back to the login page after logging in.
app.set("trust proxy", 1);

// ---------- Middleware ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_management";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboardCatSecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 2, // 2 hours (in seconds)
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
      secure: process.env.NODE_ENV === "production", // HTTPS-only cookie in production (Vercel)
    },
  })
);

// ---------- MongoDB Connection ----------
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 8000, // fail fast with a real error instead of a vague buffering timeout
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ---------- Auth Middleware ----------
function isLoggedIn(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return next();
  }
  return res.redirect("/login");
}

// ---------- Auth Routes ----------
app.get("/", (req, res) => {
  res.redirect(req.session.loggedIn ? "/dashboard" : "/login");
});

app.get("/login", (req, res) => {
  if (req.session.loggedIn) return res.redirect("/dashboard");
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "admin123";

  if (username === adminUser && password === adminPass) {
    req.session.loggedIn = true;
    req.session.username = username;
    return res.redirect("/dashboard");
  }

  res.render("login", { error: "Invalid username or password!" });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// ---------- Student Routes ----------
app.use("/", studentRoutes);

// ---------- 404 Handler ----------
app.use((req, res) => {
  res.status(404).send("404 - Page not found");
});

// ---------- Start Server ----------
// Vercel serverless environment already wraps this exported app - it doesn't
// need (or want) an explicit app.listen(). Locally, we still listen normally.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;