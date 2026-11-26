// Telegram konfiguratsiyasi
const TELEGRAM_BOT_TOKEN = "9293700630:AAG14IRebHxC5JN0TozffqX5DovPI-73xAU";
const TELEGRAM_CHAT_ID = "-1005684522321";

// Yilni avtomatik qo'yish
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Sahifalar o'rtasida navigatsiya
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const navEl = document.getElementById("mainNav");
const burgerBtn = document.getElementById("burgerBtn");

function navigateTo(pageName) {
  const targetId = `page-${pageName}`;
  const targetPage = document.getElementById(targetId);
  if (!targetPage) return;

  pages.forEach((p) => p.classList.remove("active"));
  targetPage.classList.add("active");

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.page === pageName);
  });

  // Mobil menyuni yopish
  if (navEl && navEl.classList.contains("open")) {
    navEl.classList.remove("open");
    burgerBtn?.setAttribute("aria-expanded", "false");
  }

  // URL hash yangilash va yuqoriga skroll
  history.replaceState(null, "", `#${pageName}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Barcha data-page elementlarini ulash
document.querySelectorAll("[data-page]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const target = el.dataset.page;
    navigateTo(target);
  });
});

// Burger menyu toggle
burgerBtn?.addEventListener("click", () => {
  const isOpen = navEl.classList.toggle("open");
  burgerBtn.setAttribute("aria-expanded", String(isOpen));
});

// Kurs kartasidan yo'nalishni tanlab ro'yxatdan o'tish sahifasiga o'tish
const directionSelect = document.getElementById("direction");
document.querySelectorAll(".select-course-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const courseName = btn.dataset.course;
    if (directionSelect && courseName) {
      directionSelect.value = courseName;
    }
    navigateTo("register");
  });
});

// Sahifa yuklanganda hash bo'yicha ochish
window.addEventListener("DOMContentLoaded", () => {
  const initialHash = window.location.hash.replace("#", "");
  if (initialHash && document.getElementById(`page-${initialHash}`)) {
    navigateTo(initialHash);
  } else {
    navigateTo("home");
  }
});

// Ro'yxatdan o'tish formasi va Telegramga yuborish
const registerForm = document.getElementById("registerForm");
const submitBtn = document.getElementById("submitBtn");
const formStatus = document.getElementById("formStatus");

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  setError("fullNameError", "");
  setError("phoneError", "");
  setError("ageError", "");
  setError("directionError", "");
  formStatus.className = "form-status";
  formStatus.textContent = "";
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const ageRaw = document.getElementById("age").value.trim();
  const direction = document.getElementById("direction").value;

  let isValid = true;

  if (fullName.length < 3) {
    setError("fullNameError", "Ism va familiyani to'liq kiriting (kamida 3 ta belgi).");
    isValid = false;
  }

  const cleanPhone = phone.replace(/[^\d+]/g, "");
  if (cleanPhone.length < 9) {
    setError("phoneError", "To'g'ri telefon raqamini kiriting.");
    isValid = false;
  }

  const age = Number(ageRaw);
  if (!ageRaw || Number.isNaN(age) || age < 5 || age > 80) {
    setError("ageError", "Yoshni 5 dan 80 gacha son ko'rinishida kiriting.");
    isValid = false;
  }

  if (!direction) {
    setError("directionError", "Iltimos, yo'nalishni tanlang.");
    isValid = false;
  }

  if (!isValid) return;

  const now = new Date().toLocaleString("uz-UZ", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const messageText = [
    "🎓 <b>Yangi o'quvchi arizasi — Meta IT School</b>",
    "",
    `👤 <b>Ismi Familiyasi:</b> ${escapeHtml(fullName)}`,
    `📞 <b>Telefon raqami:</b> ${escapeHtml(phone)}`,
    `🎂 <b>Yoshi:</b> ${escapeHtml(age)} yosh`,
    `📚 <b>Yo'nalish:</b> ${escapeHtml(direction)}`,
    `🕒 <b>Yuborilgan vaqt:</b> ${escapeHtml(now)}`,
  ].join("\n");

  submitBtn.disabled = true;
  const originalBtnHtml = submitBtn.innerHTML;
  submitBtn.innerHTML = "<span>Yuborilmoqda...</span>";

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: messageText,
          parse_mode: "HTML",
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.ok) {
      formStatus.className = "form-status success";
      formStatus.textContent =
        "Arizangiz muvaffaqiyatli yuborildi! Tez orada administratorimiz siz bilan bog'lanadi.";
      registerForm.reset();
    } else {
      throw new Error(data.description || "Telegram API xatosi");
    }
  } catch (err) {
    formStatus.className = "form-status error";
    formStatus.textContent =
      "Xatolik yuz berdi. Bot kanalga admin qilinganligini yoki internet aloqasini tekshiring.";
    console.error("Telegram yuborish xatosi:", err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
  }
});