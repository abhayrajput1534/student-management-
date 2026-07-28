# Student Management System

Node.js + Express + EJS + MongoDB se bana hua simple Student Management System.

## Features
- Login Page (session based) + "Login as Admin" quick demo-fill button
- Dashboard — Total Students / Total Courses / Total Semesters / Total Users stat cards, Quick Actions, "Students Overview" line chart (last 5 weeks), Recent Students table
- Add Student (Course & Semester as dropdowns)
- View Students — searchable + filterable (Course, Semester) table with pagination
- Update Student
- Delete Student (with confirmation popup)
- Dedicated Search Student page (Search By: Name / Roll No / Student ID + optional Course filter)
- View Student Details (read-only profile page)
- Collapsible sidebar (hamburger toggle), responsive on mobile

## Folder Structure
```
Student-Management-System
│
├── public
│   ├── css/style.css
│   ├── js/script.js
│   └── images
│
├── views
│   ├── partials
│   │   ├── sidebar.ejs
│   │   └── topbar.ejs
│   ├── login.ejs
│   ├── dashboard.ejs
│   ├── addStudent.ejs
│   ├── viewStudents.ejs
│   ├── editStudent.ejs
│   ├── searchStudent.ejs
│   └── viewStudentDetail.ejs
│
├── models
│   └── Student.js
│
├── routes
│   └── studentRoutes.js
│
├── config
│   ├── constants.js       (Course list, Semester list, system user count)
│   └── formatDate.js
│
├── server.js
├── package.json
└── README.md
```

## Setup Instructions

### 1. Dependencies install karo
```bash
npm install
```

### 2. MongoDB setup
- Agar local MongoDB use karna hai to MongoDB Community Server install karke chalu karo.
- Ya phir [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) pe free cluster bana ke connection string le lo.

### 3. .env file banao
`.env.example` ko copy karke `.env` naam se save karo, aur values apne hisaab se update karo:
```bash
cp .env.example .env
```

`.env` file mein ye variables hain:
```
MONGO_URI=mongodb://127.0.0.1:27017/student_management
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
SESSION_SECRET=yourSuperSecretKey123
PORT=3000
```

### 4. Server chalu karo
```bash
npm start
```
Development mode (auto-restart) ke liye:
```bash
npm run dev
```

### 5. Browser mein kholo
```
http://localhost:3000
```

Login credentials (default): 
- Username: `admin`
- Password: `admin123`

## Notes
- Login credentials `.env` file se aate hain — jitna chaho change kar sakte ho.
- Student ID unique hona chahiye, warna add karte waqt error dikhega.
- Delete karte waqt confirmation popup aayega taaki galti se delete na ho.
- Course dropdown ki list `config/constants.js` mein hai — yahan se courses add/remove kar sakte ho.
- "Total Users" stat abhi fixed (1) hai kyunki system mein sirf ek admin login hai. Agar future mein multi-user/role-based login (teacher, staff, etc.) banana ho, to ye dynamic ho jayega.
- Pagination "View Students" page pe 8 students per page dikhata hai — `PAGE_SIZE` variable `routes/studentRoutes.js` mein change kar sakte ho.
- "Students Overview" chart Chart.js (CDN) se banaya hai aur actual database ke createdAt timestamps se pichhle 5 hafton ka data dikhata hai.
