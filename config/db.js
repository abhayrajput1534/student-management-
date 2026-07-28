const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_management";

// In serverless environments (like Vercel), a new function instance can spin
// up per request/cold-start. If we call mongoose.connect() fresh every time
// without waiting for it, queries fire before the connection is ready and
// time out ("buffering timed out"). Caching the connection promise on the
// global object lets warm invocations reuse the same connection instead of
// racing a brand new one.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
        bufferCommands: false, // fail fast instead of silently queueing commands
      })
      .then((mongooseInstance) => {
        console.log("✅ MongoDB connected");
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null; // allow a retry on the next request
        console.error("❌ MongoDB connection error:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = dbConnect;
