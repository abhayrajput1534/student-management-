// ---------- Sidebar Toggle ----------
document.addEventListener("DOMContentLoaded", function () {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  if (hamburgerBtn && sidebar) {
    hamburgerBtn.addEventListener("click", function () {
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle("open");
      } else {
        sidebar.classList.toggle("collapsed");
        if (mainContent) mainContent.classList.toggle("full-width");
      }
    });
  }

  // ---------- Password show/hide toggle (Login page) ----------
  const togglePassBtn = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener("click", function () {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      togglePassBtn.textContent = isHidden ? "🙈" : "👁";
    });
  }

  // ---------- Demo "Login as Admin" quick fill ----------
  const loginAsAdminBtn = document.getElementById("loginAsAdminBtn");
  const usernameInput = document.getElementById("username");

  if (loginAsAdminBtn && usernameInput && passwordInput) {
    loginAsAdminBtn.addEventListener("click", function () {
      usernameInput.value = "admin";
      passwordInput.value = "admin123";
      passwordInput.focus();
    });
  }
});

// ---------- Dashboard Chart (Students Overview) ----------
function renderStudentsChart(labels, data) {
  const canvas = document.getElementById("studentsChart");
  if (!canvas || typeof Chart === "undefined") return;

  new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "New Students",
          data: data,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#2563eb",
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { boxWidth: 12, font: { size: 12 } },
        },
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  });
}
