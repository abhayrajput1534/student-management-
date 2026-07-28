const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const formatDate = require("../config/formatDate");
const { COURSES, SEMESTERS, TOTAL_SYSTEM_USERS } = require("../config/constants");

const PAGE_SIZE = 8;

// Middleware: check if logged in
function isLoggedIn(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return next();
  }
  return res.redirect("/login");
}

// Common stats used on Dashboard / View Students / Search Student headers
async function getCommonStats() {
  const totalStudents = await Student.countDocuments();
  return {
    totalStudents,
    totalCourses: COURSES.length,
    totalSemesters: SEMESTERS.length,
    totalUsers: TOTAL_SYSTEM_USERS,
  };
}

// Builds last 5 weekly buckets (7-day windows) ending today, counts students
// created in each - powers the "Students Overview" chart on the dashboard.
async function getWeeklyStudentCounts() {
  const buckets = [];
  const now = new Date();

  for (let i = 4; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    buckets.push({ start, end });
  }

  const labels = [];
  const counts = [];

  for (const bucket of buckets) {
    const count = await Student.countDocuments({
      createdAt: { $gte: bucket.start, $lte: bucket.end },
    });
    labels.push(
      `${bucket.start.getDate()} ${bucket.start.toLocaleString("en-US", { month: "short" })}`
    );
    counts.push(count);
  }

  return { labels, counts };
}

// ================= DASHBOARD =================
router.get("/dashboard", isLoggedIn, async (req, res) => {
  try {
    const stats = await getCommonStats();
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(3);
    const chartData = await getWeeklyStudentCounts();

    res.render("dashboard", {
      pageTitle: "Dashboard",
      active: "dashboard",
      today: formatDate(),
      stats,
      recentStudents,
      chartData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while loading dashboard");
  }
});

// ================= VIEW ALL STUDENTS (with filters + pagination) =================
router.get("/students", isLoggedIn, async (req, res) => {
  try {
    const stats = await getCommonStats();

    const query = (req.query.query || "").trim();
    const course = req.query.course || "";
    const semester = req.query.semester || "";
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const filter = {};

    if (query) {
      const regex = new RegExp(query, "i");
      filter.$or = [{ Name: regex }, { RollNo: regex }, { StudentID: regex }];
    }
    if (course) filter.Course = course;
    if (semester) filter.Semester = Number(semester);

    const totalFiltered = await Student.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(totalFiltered / PAGE_SIZE), 1);
    const currentPage = Math.min(page, totalPages);

    const students = await Student.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    res.render("viewStudents", {
      pageTitle: "View Students",
      active: "view",
      today: formatDate(),
      stats,
      students,
      query,
      course,
      semester,
      courses: COURSES,
      semesters: SEMESTERS,
      currentPage,
      totalPages,
      totalFiltered,
      pageSize: PAGE_SIZE,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while fetching students");
  }
});

// ================= DEDICATED SEARCH STUDENT PAGE =================
router.get("/students/search", isLoggedIn, async (req, res) => {
  try {
    const stats = await getCommonStats();

    const searchBy = req.query.searchBy || "";
    const searchValue = (req.query.searchValue || "").trim();
    const course = req.query.course || "";

    let students = [];
    let searched = false;

    if (searchValue || course) {
      searched = true;
      const filter = {};
      const regex = searchValue ? new RegExp(searchValue, "i") : null;

      if (regex) {
        if (searchBy === "Name") filter.Name = regex;
        else if (searchBy === "RollNo") filter.RollNo = regex;
        else if (searchBy === "StudentID") filter.StudentID = regex;
        else filter.$or = [{ Name: regex }, { RollNo: regex }, { StudentID: regex }];
      }

      if (course) filter.Course = course;

      students = await Student.find(filter).sort({ createdAt: -1 });
    }

    res.render("searchStudent", {
      pageTitle: "Search Student",
      active: "search",
      today: formatDate(),
      stats,
      students,
      searchBy,
      searchValue,
      course,
      courses: COURSES,
      searched,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while searching students");
  }
});

// ================= ADD STUDENT - show form =================
router.get("/students/add", isLoggedIn, (req, res) => {
  res.render("addStudent", {
    pageTitle: "Add Student",
    active: "add",
    today: formatDate(),
    courses: COURSES,
    semesters: SEMESTERS,
    error: null,
    formData: {},
  });
});

// ================= ADD STUDENT - handle submit =================
router.post("/students/add", isLoggedIn, async (req, res) => {
  const { StudentID, Name, RollNo, Course, Semester, Mobile, Email } = req.body;

  try {
    const existing = await Student.findOne({ StudentID });
    if (existing) {
      return res.render("addStudent", {
        pageTitle: "Add Student",
        active: "add",
        today: formatDate(),
        courses: COURSES,
        semesters: SEMESTERS,
        error: "This Student ID already exists. Please try a different Student ID.",
        formData: req.body,
      });
    }

    await Student.create({ StudentID, Name, RollNo, Course, Semester, Mobile, Email });
    res.redirect("/students");
  } catch (err) {
    console.error(err);
    res.render("addStudent", {
      pageTitle: "Add Student",
      active: "add",
      today: formatDate(),
      courses: COURSES,
      semesters: SEMESTERS,
      error: "Something went wrong. Please fill in all the required fields correctly.",
      formData: req.body,
    });
  }
});

// ================= VIEW STUDENT DETAIL (read-only) =================
router.get("/students/view/:id", isLoggedIn, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.redirect("/students");

    res.render("viewStudentDetail", {
      pageTitle: "Student Details",
      active: "view",
      today: formatDate(),
      student,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/students");
  }
});

// ================= EDIT STUDENT - show form =================
router.get("/students/edit/:id", isLoggedIn, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.redirect("/students");

    res.render("editStudent", {
      pageTitle: "Edit Student",
      active: "view",
      today: formatDate(),
      courses: COURSES,
      semesters: SEMESTERS,
      student,
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/students");
  }
});

// ================= EDIT STUDENT - handle update =================
router.put("/students/edit/:id", isLoggedIn, async (req, res) => {
  const { StudentID, Name, RollNo, Course, Semester, Mobile, Email } = req.body;

  try {
    await Student.findByIdAndUpdate(req.params.id, {
      StudentID, Name, RollNo, Course, Semester, Mobile, Email,
    });
    res.redirect("/students");
  } catch (err) {
    console.error(err);
    const student = await Student.findById(req.params.id);
    res.render("editStudent", {
      pageTitle: "Edit Student",
      active: "view",
      today: formatDate(),
      courses: COURSES,
      semesters: SEMESTERS,
      student,
      error: "Update failed. Please try again.",
    });
  }
});

// ================= DELETE STUDENT =================
router.delete("/students/delete/:id", isLoggedIn, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect("/students");
  } catch (err) {
    console.error(err);
    res.redirect("/students");
  }
});

module.exports = router;
