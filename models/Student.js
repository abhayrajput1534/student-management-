const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    StudentID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    Name: {
      type: String,
      required: true,
      trim: true,
    },
    RollNo: {
      type: String,
      required: true,
      trim: true,
    },
    Course: {
      type: String,
      required: true,
      trim: true,
    },
    Semester: {
      type: Number,
      required: true,
    },
    Mobile: {
      type: String,
      required: true,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
