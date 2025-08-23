import authService from "./src/services/auth.service.js";
import playerService from "./src/services/player.service.js";
import userService from "./src/services/user.service.js";
import playlistCtrl from "./src/controllers/playlist.controller.js";

const $ = (selector, p = document) => p.querySelector(selector);
const $$ = (selector, p = document) => p.querySelectorAll(selector);

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const signupBtn = $(".signup-btn");
  const loginBtn = $(".login-btn");
  const authModal = $("#authModal");
  const modalClose = $("#modalClose");
  const signupForm = $("#signupForm");
  const loginForm = $("#loginForm");
  const showLoginBtn = $("#showLogin");
  const showSignupBtn = $("#showSignup");
  const sidebar = $(".sidebar");

  // Function to show signup form
  function showSignupForm() {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  }

  // Function to show login form
  function showLoginForm() {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  }

  // Function to open modal
  function openModal() {
    authModal.classList.add("show");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  // Open modal with Sign Up form when clicking Sign Up button
  signupBtn.addEventListener("click", function () {
    showSignupForm();
    openModal();
  });

  // Open modal with Login form when clicking Login button
  loginBtn.addEventListener("click", function () {
    showLoginForm();
    openModal();
  });

  // Close modal function
  function closeModal() {
    authModal.classList.remove("show");
    document.body.style.overflow = "auto"; // Restore scrolling
  }

  // Close modal when clicking close button
  modalClose.addEventListener("click", closeModal);

  // Close modal when clicking overlay (outside modal container)
  authModal.addEventListener("click", function (e) {
    if (e.target === authModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && authModal.classList.contains("show")) {
      closeModal();
    }
  });

  // Switch to Login form
  showLoginBtn.onclick = showLoginForm;

  // Switch to Signup form
  showSignupBtn.onclick = showSignupForm;

  /* ***** */
  const sidebarNav = $(".sidebar-nav", sidebar);
  const contextMenu = $(".contextmenu", sidebarNav);
  const menuitem = $(".menuitem");

  const toggleContextMenu = (e, show) => {
    if (contextMenu.contains(e.target) || menuitem.contains(e.target)) return;

    e.preventDefault();
    const menuStyle = contextMenu.style.display === "block";
    if (menuStyle) return (contextMenu.style.display = "none");

    if (show && !menuitem.contains(e.target)) {
      contextMenu.style.display = "block";
      contextMenu.style.left = e.pageX + "px";
      contextMenu.style.top = e.pageY + "px";
    }
  };

  sidebarNav.addEventListener("contextmenu", (e) => {
    toggleContextMenu(e, true);
  });

  document.addEventListener("click", (e) => {
    if (!contextMenu.contains(e.target)) {
      toggleContextMenu(e, false);
    }
  });

  menuitem.addEventListener("click", (e) => {
    // e.preventDefault();
  });
  /* ***** */
});

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
  const userAvatar = $("#userAvatar");
  const userDropdown = $("#userDropdown");
  const logoutBtn = $("#logoutBtn");

  // Toggle dropdown when clicking avatar
  userAvatar.addEventListener("click", function (e) {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });

  // Close dropdown when pressing Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && userDropdown.classList.contains("show")) {
      userDropdown.classList.remove("show");
    }
  });

  // Handle logout button click
  logoutBtn.addEventListener("click", function () {
    // Close dropdown first
    userDropdown.classList.remove("show");

    console.log("Logout clicked");
    // TODO: Students will implement logout logic here
  });
});

// Other functionality
// TODO: Implement other functionality here
document.addEventListener("DOMContentLoaded", async function () {
  async function createDummyAccount() {
    const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
    const username = `user${suffix}`;
    const email = `nguyen${suffix}@gmail.com`;
    const password = "Password123!@#";
    const body = {
      username: username,
      email: email,
      password: password,
      display_name: username,
    };

    try {
      // // 1. Register lấy token
      const res = await authService.register(body);
      // // 2. Lưu token
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      // // 3. Test gọi /users/me
      const me = await userService.getProfile();
      // return { email, username, password, tokens: res, profile: me };
    } catch (err) {
      console.error("❌ Mock register failed:", err);
      throw err;
    }
  }
  await createDummyAccount();

  await playlistCtrl.init();
});
