// ── Constants ──────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  PASSWORD_HASH: "admin_pw_hash",
  APPLICATIONS: "job_applications",
  API_KEY: "claude_api_key"
};

const STATUS_COLORS = {
  "Applied":     { bg: "rgba(26,42,74,0.6)",  border: "rgba(58,90,138,0.7)",  text: "#7ab4e8" },
  "Screening":   { bg: "rgba(42,26,74,0.6)",  border: "rgba(90,58,138,0.7)",  text: "#a07ae8" },
  "Interview":   { bg: "rgba(58,42,10,0.6)",  border: "rgba(122,90,26,0.7)",  text: "#c9a84c" },
  "Final Round": { bg: "rgba(58,26,10,0.6)",  border: "rgba(138,58,26,0.7)",  text: "#e08050" },
  "Offer":       { bg: "rgba(10,42,26,0.6)",  border: "rgba(26,106,58,0.7)",  text: "#4ac97a" },
  "Rejected":    { bg: "rgba(42,10,10,0.6)",  border: "rgba(106,26,26,0.7)",  text: "#c94a4a" },
  "Ghosted":     { bg: "rgba(26,26,26,0.6)",  border: "rgba(58,58,58,0.7)",   text: "#7a7a7a" },
  "Withdrawn":   { bg: "rgba(20,20,20,0.6)",  border: "rgba(42,42,42,0.7)",   text: "#555555" }
};

const POOJAN_CONTEXT = `You are assisting Poojan Patel with his job search in Sydney, Australia. His background:

CURRENT ROLE: Co-Founder & CTO @ EasyCM (Apr 2026 - Present)
Production multi-tenant WhatsApp CRM SaaS built from scratch. Stack: Go (Fiber), React/TypeScript, Supabase PostgreSQL with row-level security, Redis + Asynq, Anthropic Claude API (Haiku for fast ops, Sonnet for complex), WhatsApp Cloud API, Railway, Vercel, GitHub Actions. AI pipeline: conversation summarisation, note structuring, agent handover briefings, duplicate detection - all async via background workers so webhooks never block.

PRODUCTION AI PROJECT: Selective Prep - AI essay-marking platform using Claude Haiku server-side against 6 official NSW Selective Test criteria. Structured prompts, retry logic, eval pass to catch hallucinated scores. Real user base.

FREELANCE (Sunless Studios): Delivered 2 live Sydney client websites:
- Ikky's Cakes: React/Vite + PHP/MySQL REST API, session-based auth with session fixation prevention, constant-time password comparison, httponly/SameSite cookies, CORS whitelist, two-layer rate limiting via flock/fstat, file upload hardening (MIME spoofing, path traversal, PHP execution), branded invoice system with PHPMailer HTML emails, zero-downtime SCP redeploys.
- Prime Towing & Hauling: PHP/MySQL + JS, brute-force-protected admin, PHPUnit + Playwright test suite, GitHub Actions CI/CD with automated FTP deploy to Hostinger.

INTERNSHIP: Software Developer Intern @ Robotics Marketer (Jul-Nov 2025, Remote from Sydney)
- 22% API response time improvement on Django/MongoDB production app serving 4000+ active users
- Profiled hot endpoints, redesigned MongoEngine query patterns, added targeted indexes
- Agile team of 7, sprint-by-sprint, daily stand-ups, code reviews

EDUCATION: Bachelor of IT, Macquarie University (Software Technology major, Data Science minor) - Dec 2025. WAM 70 (Credit).

TECH STACK: Go, Python, TypeScript, JavaScript, Java, PHP, SQL, R, Dart, C#
Frameworks: Django, Go Fiber/Chi, React, Vite, Flutter/Dart
AI/LLM: Anthropic Claude API (Haiku + Sonnet), prompt engineering, async AI pipelines, multi-model orchestration, structured output validation
Data: Pandas, Scikit-learn, Matplotlib, Jupyter, EDA, Feature Engineering, Supervised ML
Databases/Cloud: PostgreSQL, Supabase (RLS), MySQL, MongoDB, Redis, Firebase, Railway, Vercel, GitHub Actions, PHPUnit, Playwright

VISA: Subclass 485 - full Australian work rights, NO sponsorship required
LOCATION: Girraween, Sydney NSW (displays as Greater Sydney Area)
EMAIL: patelpoojan6225@gmail.com
LINKEDIN: linkedin.com/in/poojanmpatel
PORTFOLIO: poojanmanojkumarpatel.github.io

IELTS: Band 8 overall (Listening 9, Reading 9, Writing 7, Speaking 7)`;

// ── Utilities ──────────────────────────────────────────────────────────────
async function sha256(message) {
  const buf = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function escHtml(str) {
  return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Storage ────────────────────────────────────────────────────────────────
function getApplications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || "[]");
  } catch {
    return [];
  }
}

function saveApplications(apps) {
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
}

function getApiKey() {
  return localStorage.getItem(STORAGE_KEYS.API_KEY) || "";
}

// ── Auth ───────────────────────────────────────────────────────────────────
function isFirstTime() {
  return !localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
}

async function setupPassword(password) {
  const hash = await sha256(password);
  localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, hash);
}

async function checkPassword(password) {
  const stored = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
  const hash = await sha256(password);
  return hash === stored;
}

// ── Claude API ─────────────────────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("No API key set. Go to Settings to add your Claude API key.");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "API error " + response.status);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function findHiringManager(company, role) {
  const system = POOJAN_CONTEXT + "\n\nYou help Poojan identify the right person to contact at a company. Be concise and actionable. No fluff.";

  const user = `Company: ${company}
Role: ${role}

Give me a practical hiring manager search guide. Include:

1. TITLES TO TARGET — 3-4 specific job titles the hiring manager for this role would likely have (e.g. "Engineering Manager, Backend", "Head of Engineering", "VP Engineering"). Be specific to the role type and likely company size.

2. LINKEDIN SEARCH — Exact search string to paste into LinkedIn People search (e.g. "Canva" "Engineering Manager" "Sydney"). Give 2-3 variations.

3. WHICH TEAM — What department/team they'd sit in.

4. BACKUP CONTACTS — If the HM is hard to find, who else to target (recruiter name patterns, HR titles, team leads).

5. QUICK TIP — One sentence on the best approach for this specific company/role.

Under 280 words. Be direct.`;

  return callClaude(system, user);
}

async function generateOutreach(app, messageType) {
  const system = POOJAN_CONTEXT + "\n\nYou write professional, personalised outreach messages for Poojan. Write in first person as Poojan. Be specific, genuine, and concise. No generic openers like 'I hope this message finds you well.' Lead with the strongest relevant credential.";

  const hmLine = app.hiringManagerName
    ? "Hiring Manager: " + app.hiringManagerName + (app.hiringManagerTitle ? ", " + app.hiringManagerTitle : "")
    : "Hiring Manager: Unknown (write to the hiring team generically)";

  const typeInstructions = {
    "LinkedIn DM": "Write two things: (1) A LinkedIn connection note under 300 characters — punchy, specific to EasyCM CTO or another strong credential relevant to this role. (2) A follow-up DM to send after they accept — 2-3 short paragraphs, conversational LinkedIn tone, ends with a soft CTA (not 'let me know if you have any questions').",
    "Cold Email": "Write a cold outreach email. Format: SUBJECT: [subject line]\n\n[email body]. Body: 3-4 short paragraphs. Lead with the single most relevant credential (EasyCM CTO for engineering/AI roles, 22% API improvement for backend roles, live client sites for full-stack roles). End with a specific, low-friction CTA.",
    "Follow-up": "Write a polite follow-up message. 2 short paragraphs max. Reference the application and express continued interest without being desperate. Can be LinkedIn DM or email — write for both with a clear label. Professional but not stiff."
  };

  const user = `Application details:
Company: ${app.company}
Role: ${app.role}
Status: ${app.status}
${hmLine}
${app.notes ? "Context/Notes: " + app.notes : ""}

Message type: ${messageType}
${typeInstructions[messageType] || ""}

Write the complete message, ready to send.`;

  return callClaude(system, user);
}

// ── App State ──────────────────────────────────────────────────────────────
const state = {
  filter: "All",
  search: "",
  editingId: null,
  aiTargetId: null
};

// ── Stats & Render ─────────────────────────────────────────────────────────
function renderStats() {
  const apps = getApplications();
  document.getElementById("stat-total").textContent = apps.length;
  document.getElementById("stat-active").textContent = apps.filter(a => ["Applied", "Screening", "Interview", "Final Round"].includes(a.status)).length;
  document.getElementById("stat-interviews").textContent = apps.filter(a => ["Interview", "Final Round"].includes(a.status)).length;
  document.getElementById("stat-offers").textContent = apps.filter(a => a.status === "Offer").length;
}

function filteredApps() {
  let apps = getApplications();

  const filterMap = {
    "Active":       ["Applied", "Screening", "Interview", "Final Round"],
    "Interviewing": ["Interview", "Final Round"],
    "Offers":       ["Offer"],
    "Closed":       ["Rejected", "Ghosted", "Withdrawn"]
  };

  if (state.filter !== "All") {
    const allowed = filterMap[state.filter] || [state.filter];
    apps = apps.filter(a => allowed.includes(a.status));
  }

  if (state.search) {
    const q = state.search.toLowerCase();
    apps = apps.filter(a =>
      a.company.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      (a.hiringManagerName || "").toLowerCase().includes(q)
    );
  }

  return apps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderTable() {
  const apps = filteredApps();
  const tbody = document.getElementById("apps-tbody");

  if (apps.length === 0) {
    tbody.innerHTML = "<tr><td colspan=\"7\" class=\"table-empty\">No applications found. Hit \"+ Add Application\" to get started.</td></tr>";
    return;
  }

  tbody.innerHTML = apps.map(app => {
    const sc = STATUS_COLORS[app.status] || STATUS_COLORS["Applied"];
    const hmDisplay = app.hiringManagerName ? escHtml(app.hiringManagerName) : "<span class=\"dim\">—</span>";
    const jobLink = app.jobUrl ? "<a href=\"" + escHtml(app.jobUrl) + "\" target=\"_blank\" class=\"job-url-link\">View JD ↗</a>" : "";

    return "<tr class=\"app-row\">" +
      "<td class=\"td-company\"><div class=\"company-name\">" + escHtml(app.company) + "</div>" + jobLink + "</td>" +
      "<td class=\"td-role\">" + escHtml(app.role) + "</td>" +
      "<td class=\"td-status\"><span class=\"status-badge\" style=\"background:" + sc.bg + ";border-color:" + sc.border + ";color:" + sc.text + "\">" + escHtml(app.status) + "</span></td>" +
      "<td class=\"td-date\">" + formatDate(app.dateApplied) + "</td>" +
      "<td class=\"td-resume\"><span class=\"resume-tag\">" + escHtml(app.resumeVersion || "—") + "</span></td>" +
      "<td class=\"td-hm\">" + hmDisplay + "</td>" +
      "<td class=\"td-actions\">" +
        "<button class=\"action-btn ai-btn\" onclick=\"openAiPanel('" + app.id + "')\" title=\"AI Tools\">✦ AI</button>" +
        "<button class=\"action-btn edit-btn\" onclick=\"openEditModal('" + app.id + "')\" title=\"Edit\">Edit</button>" +
        "<button class=\"action-btn del-btn\" onclick=\"deleteApp('" + app.id + "')\" title=\"Delete\">✕</button>" +
      "</td>" +
    "</tr>";
  }).join("");
}

function render() {
  renderStats();
  renderTable();
}

// ── Modal: Add / Edit Application ──────────────────────────────────────────
function openAddModal() {
  state.editingId = null;
  document.getElementById("modal-title").textContent = "Add Application";
  document.getElementById("app-form").reset();
  document.getElementById("field-date").value = new Date().toISOString().split("T")[0];
  document.getElementById("field-status").value = "Applied";
  document.getElementById("field-resume").value = "V2";
  showModal("app-modal");
}

function openEditModal(id) {
  const app = getApplications().find(a => a.id === id);
  if (!app) return;
  state.editingId = id;
  document.getElementById("modal-title").textContent = "Edit Application";
  document.getElementById("field-company").value = app.company || "";
  document.getElementById("field-role").value = app.role || "";
  document.getElementById("field-status").value = app.status || "Applied";
  document.getElementById("field-date").value = app.dateApplied || "";
  document.getElementById("field-url").value = app.jobUrl || "";
  document.getElementById("field-resume").value = app.resumeVersion || "V2";
  document.getElementById("field-hm-name").value = app.hiringManagerName || "";
  document.getElementById("field-hm-title").value = app.hiringManagerTitle || "";
  document.getElementById("field-hm-linkedin").value = app.hiringManagerLinkedIn || "";
  document.getElementById("field-hm-email").value = app.hiringManagerEmail || "";
  document.getElementById("field-notes").value = app.notes || "";
  showModal("app-modal");
}

function saveApplication() {
  const company = document.getElementById("field-company").value.trim();
  const role = document.getElementById("field-role").value.trim();
  if (!company || !role) {
    showToast("Company and Role are required.");
    return;
  }

  const apps = getApplications();
  const now = new Date().toISOString();

  const data = {
    company,
    role,
    status: document.getElementById("field-status").value,
    dateApplied: document.getElementById("field-date").value,
    jobUrl: document.getElementById("field-url").value.trim(),
    resumeVersion: document.getElementById("field-resume").value,
    hiringManagerName: document.getElementById("field-hm-name").value.trim(),
    hiringManagerTitle: document.getElementById("field-hm-title").value.trim(),
    hiringManagerLinkedIn: document.getElementById("field-hm-linkedin").value.trim(),
    hiringManagerEmail: document.getElementById("field-hm-email").value.trim(),
    notes: document.getElementById("field-notes").value.trim(),
    updatedAt: now
  };

  if (state.editingId) {
    const idx = apps.findIndex(a => a.id === state.editingId);
    if (idx !== -1) apps[idx] = Object.assign({}, apps[idx], data);
  } else {
    apps.push(Object.assign({ id: generateId(), createdAt: now }, data));
  }

  saveApplications(apps);
  closeModal("app-modal");
  render();
  showToast(state.editingId ? "Application updated." : "Application added.");
}

function deleteApp(id) {
  if (!confirm("Delete this application? This cannot be undone.")) return;
  saveApplications(getApplications().filter(a => a.id !== id));
  render();
  showToast("Application deleted.");
}

// ── Modal: AI Panel ────────────────────────────────────────────────────────
function openAiPanel(id) {
  const app = getApplications().find(a => a.id === id);
  if (!app) return;
  state.aiTargetId = id;
  document.getElementById("ai-company").textContent = app.company;
  document.getElementById("ai-role").textContent = app.role;
  document.getElementById("ai-result").innerHTML = "<p class=\"ai-placeholder\">Choose an action above to generate content.</p>";
  document.querySelectorAll(".ai-action-btn").forEach(b => b.disabled = false);
  showModal("ai-modal");
}

async function runAiFindHM() {
  const app = getApplications().find(a => a.id === state.aiTargetId);
  if (!app) return;
  setAiLoading(true, "Finding hiring manager intel...");
  try {
    const result = await findHiringManager(app.company, app.role);
    displayAiResult(result);
  } catch (err) {
    displayAiError(err.message);
  }
}

async function runAiMessage(type) {
  const app = getApplications().find(a => a.id === state.aiTargetId);
  if (!app) return;
  setAiLoading(true, "Generating " + type + "...");
  try {
    const result = await generateOutreach(app, type);
    displayAiResult(result);
  } catch (err) {
    displayAiError(err.message);
  }
}

function setAiLoading(loading, msg) {
  document.querySelectorAll(".ai-action-btn").forEach(b => b.disabled = loading);
  if (loading) {
    document.getElementById("ai-result").innerHTML =
      "<div class=\"ai-loading\"><span class=\"ai-spinner\"></span><span>" + escHtml(msg) + "</span></div>";
  }
}

function displayAiResult(text) {
  const el = document.getElementById("ai-result");
  el.dataset.rawText = text;
  el.innerHTML =
    "<div class=\"ai-output\">" + escHtml(text).replace(/\n/g, "<br>") + "</div>" +
    "<button class=\"copy-btn\" onclick=\"copyAiResult()\">Copy to Clipboard</button>";
  document.querySelectorAll(".ai-action-btn").forEach(b => b.disabled = false);
}

function displayAiError(msg) {
  document.getElementById("ai-result").innerHTML = "<div class=\"ai-error\">Error: " + escHtml(msg) + "</div>";
  document.querySelectorAll(".ai-action-btn").forEach(b => b.disabled = false);
}

function copyAiResult() {
  const text = document.getElementById("ai-result").dataset.rawText || "";
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector(".copy-btn");
    if (btn) {
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = "Copy to Clipboard"; }, 2000);
    }
  });
}

function openEditFromAi() {
  const id = state.aiTargetId;
  closeModal("ai-modal");
  if (id) openEditModal(id);
}

// ── Modal: Settings ────────────────────────────────────────────────────────
function openSettings() {
  const key = getApiKey();
  const keyInput = document.getElementById("field-api-key");
  keyInput.value = key ? key.slice(0, 10) + "•••••••••••••••" : "";
  keyInput.dataset.original = key;
  keyInput.dataset.dirty = "false";
  document.getElementById("field-new-pw").value = "";
  document.getElementById("field-confirm-pw").value = "";
  showModal("settings-modal");
}

function saveSettings() {
  const keyInput = document.getElementById("field-api-key");
  if (keyInput.dataset.dirty === "true") {
    const newKey = keyInput.value.trim();
    if (newKey) localStorage.setItem(STORAGE_KEYS.API_KEY, newKey);
  }

  const newPw = document.getElementById("field-new-pw").value;
  const confirmPw = document.getElementById("field-confirm-pw").value;
  if (newPw || confirmPw) {
    if (newPw.length < 4) { showToast("Password must be at least 4 characters."); return; }
    if (newPw !== confirmPw) { showToast("Passwords do not match."); return; }
    setupPassword(newPw).then(() => showToast("Settings saved."));
  } else {
    showToast("Settings saved.");
  }

  closeModal("settings-modal");
}

// ── Modal helpers ──────────────────────────────────────────────────────────
function showModal(id) {
  document.getElementById("modal-overlay").classList.add("active");
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
  document.getElementById("modal-overlay").classList.remove("active");
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// ── Auth UI ────────────────────────────────────────────────────────────────
function initAuth() {
  if (isFirstTime()) {
    document.getElementById("setup-section").style.display = "block";
    document.getElementById("login-section").style.display = "none";
    document.getElementById("auth-title").textContent = "Set Admin Password";
    document.getElementById("auth-subtitle").textContent = "First-time setup — choose a password to protect this page.";
  } else {
    document.getElementById("setup-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
    document.getElementById("auth-title").textContent = "Admin Access";
    document.getElementById("auth-subtitle").textContent = "Enter your password to continue.";
  }
}

async function handleSetup() {
  const pw = document.getElementById("setup-pw").value;
  const confirm = document.getElementById("setup-confirm").value;
  if (pw.length < 4) { showAuthError("Password must be at least 4 characters."); return; }
  if (pw !== confirm) { showAuthError("Passwords do not match."); return; }
  await setupPassword(pw);
  unlockApp();
}

async function handleLogin() {
  const pw = document.getElementById("login-pw").value;
  const ok = await checkPassword(pw);
  if (ok) {
    unlockApp();
  } else {
    showAuthError("Incorrect password.");
    document.getElementById("login-pw").value = "";
  }
}

function showAuthError(msg) {
  const el = document.getElementById("auth-error");
  el.textContent = msg;
  el.style.display = "block";
}

function unlockApp() {
  document.getElementById("auth-gate").style.display = "none";
  document.getElementById("app").removeAttribute("hidden");
  render();
}

// ── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initAuth();

  // Auth: enter key
  document.getElementById("login-pw").addEventListener("keydown", e => {
    if (e.key === "Enter") handleLogin();
  });
  document.getElementById("setup-confirm").addEventListener("keydown", e => {
    if (e.key === "Enter") handleSetup();
  });

  // Filter tabs
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.filter = btn.dataset.filter;
      renderTable();
    });
  });

  // Search
  document.getElementById("search-input").addEventListener("input", e => {
    state.search = e.target.value;
    renderTable();
  });

  // Overlay click to close
  document.getElementById("modal-overlay").addEventListener("click", e => {
    if (e.target === document.getElementById("modal-overlay")) {
      document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
      document.getElementById("modal-overlay").classList.remove("active");
    }
  });

  // Escape to close
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
      document.getElementById("modal-overlay").classList.remove("active");
    }
  });

  // API key: mark dirty when user types
  document.getElementById("field-api-key").addEventListener("input", function() {
    this.dataset.dirty = "true";
  });
  document.getElementById("field-api-key").addEventListener("focus", function() {
    if (this.dataset.dirty !== "true") {
      this.value = this.dataset.original || "";
      this.dataset.dirty = "true";
    }
  });
});
