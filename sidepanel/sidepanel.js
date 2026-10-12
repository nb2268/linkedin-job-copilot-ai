// sidepanel.js - Controller for LinkedIn Job Copilot AI

// State
let currentJob = null;
let userProfile = {
  name: "Nikita Banwankar",
  email: "nikitabanwankar@gmail.com",
  phone: "+91 9XXXXXXXXX",
  linkedinUrl: "https://linkedin.com/in/nb2268",
  portfolioUrl: "https://nb2268.github.io/portfolio",
  githubUrl: "https://github.com/nb2268",
  currentRole: "AI Engineer / Data & AI Trainee",
  currentCompany: "Tanglobus (Startup)",
  totalYearsExperience: "1",
  noticePeriod: "Immediate / 15 Days",
  expectedSalary: "Competitive / Negotiable (Open to Internship & Full-Time)",
  openToInternship: true,
  openToFullTime: true,
  workFromHome: true,
  location: "Pune, Maharashtra, India",
  legallyAuthorized: true, // Authorized in India
  requireSponsorship: true, // Requires visa sponsorship for roles outside India
  skills: [
    { name: "Generative AI", years: 1 },
    { name: "Agentic AI", years: 1 },
    { name: "Python", years: 2 },
    { name: "SQL", years: 2 },
    { name: "Power BI", years: 2 },
    { name: "Advanced Excel", years: 2 },
    { name: "Pandas", years: 2 },
    { name: "NumPy", years: 2 },
    { name: "Scikit-Learn", years: 1 },
    { name: "Machine Learning", years: 1 },
    { name: "Data Analytics", years: 2 },
    { name: "Prompt Engineering", years: 1 },
    { name: "JavaScript", years: 1 },
    { name: "DOM Automation", years: 1 },
    { name: "Django", years: 1 },
    { name: "MySQL", years: 2 },
    { name: "Git", years: 2 }
  ],
  bio: "AI & Data Science engineering graduate currently working as an AI Engineer at Tanglobus. Hands-on expertise across Generative AI, Agentic AI, Python, SQL, Power BI, Advanced Excel, Machine Learning, and browser automation agents. Open to Full-time and Internship roles (Remote / Hybrid / Pune).",
  coverLetterText: "Dear Hiring Team,\n\nI am writing to express my strong interest in this position. With a B.E. in Artificial Intelligence & Data Science from SGBAU and hands-on experience as an AI Engineer at Tanglobus, I have developed expertise in Python, SQL, Power BI, Machine Learning, and intelligent automation agents. I am enthusiastic about applying my analytical and problem-solving skills to contribute directly to your team's goals.\n\nThank you for considering my application.\n\nSincerely,\nNikita Banwankar"
};

let settings = {
  geminiApiKey: "",
  geminiModel: "gemini-1.5-flash"
};

let trackedJobs = [];

// DOM Elements
const connectionStatus = document.getElementById("connectionStatus");
const refreshJobBtn = document.getElementById("refreshJobBtn");

// Copilot Elements
const jobTitle = document.getElementById("jobTitle");
const jobCompany = document.getElementById("jobCompany");
const jobLocation = document.getElementById("jobLocation");
const jobEasyApplyBadge = document.getElementById("jobEasyApplyBadge");
const jobIdLabel = document.getElementById("jobIdLabel");
const matchScoreVal = document.getElementById("matchScoreVal");
const scoreFill = document.getElementById("scoreFill");
const matchSummary = document.getElementById("matchSummary");
const matchedSkillsList = document.getElementById("matchedSkillsList");
const missingSkillsSection = document.getElementById("missingSkillsSection");
const generatePitchBtn = document.getElementById("generatePitchBtn");
const analyzeJobBtn = document.getElementById("analyzeJobBtn");
const aiAnalysisOutput = document.getElementById("aiAnalysisOutput");

// Action Buttons
const openEasyApplyBtn = document.getElementById("openEasyApplyBtn");
const autofillStepBtn = document.getElementById("autofillStepBtn");
const autoAdvanceBtn = document.getElementById("autoAdvanceBtn");
const logAppliedBtn = document.getElementById("logAppliedBtn");
const copilotStatusMsg = document.getElementById("copilotStatusMsg");

// Profile Elements
const profName = document.getElementById("profName");
const profEmail = document.getElementById("profEmail");
const profPhone = document.getElementById("profPhone");
const profLinkedin = document.getElementById("profLinkedin");
const profGithub = document.getElementById("profGithub");
const profExpYears = document.getElementById("profExpYears");
const profNoticePeriod = document.getElementById("profNoticePeriod");
const profSalary = document.getElementById("profSalary");
const profAuthorized = document.getElementById("profAuthorized");
const profSponsorship = document.getElementById("profSponsorship");
const profSkills = document.getElementById("profSkills");
const profBio = document.getElementById("profBio");
const profCoverLetter = document.getElementById("profCoverLetter");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const saveProfileStatus = document.getElementById("saveProfileStatus");

// Tracker Elements
const trackerCount = document.getElementById("trackerCount");
const trackerList = document.getElementById("trackerList");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const clearTrackerBtn = document.getElementById("clearTrackerBtn");

// Settings Elements
const geminiApiKey = document.getElementById("geminiApiKey");
const geminiModel = document.getElementById("geminiModel");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const saveSettingsStatus = document.getElementById("saveSettingsStatus");

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  setupTabs();
  await loadStoredData();
  bindEvents();
  fetchCurrentJob();
});

// Setup Navigation Tabs
function setupTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      const targetId = tab.getAttribute("data-tab");
      document.getElementById(targetId)?.classList.add("active");
    });
  });
}

// Load profile, settings, and tracker from chrome storage
async function loadStoredData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["userProfile", "settings", "trackedJobs"], (data) => {
      if (data.userProfile) userProfile = { ...userProfile, ...data.userProfile };
      if (data.settings) settings = { ...settings, ...data.settings };
      if (data.trackedJobs) trackedJobs = data.trackedJobs;

      renderProfileFields();
      renderSettingsFields();
      renderTrackerList();
      resolve();
    });
  });
}

function renderProfileFields() {
  profName.value = userProfile.name || "";
  profEmail.value = userProfile.email || "";
  profPhone.value = userProfile.phone || "";
  profLinkedin.value = userProfile.linkedinUrl || "";
  profGithub.value = userProfile.portfolioUrl || userProfile.githubUrl || "";
  profExpYears.value = userProfile.totalYearsExperience || "3";
  profNoticePeriod.value = userProfile.noticePeriod || "Immediate";
  profSalary.value = userProfile.expectedSalary || "";
  profAuthorized.checked = userProfile.legallyAuthorized !== false;
  profSponsorship.checked = userProfile.requireSponsorship === true;

  if (Array.isArray(userProfile.skills)) {
    profSkills.value = userProfile.skills
      .map(s => (s.years ? `${s.name}: ${s.years}` : s.name))
      .join(", ");
  }
  profBio.value = userProfile.bio || "";
  profCoverLetter.value = userProfile.coverLetterText || "";
}

function renderSettingsFields() {
  geminiApiKey.value = settings.geminiApiKey || "";
  if (settings.geminiModel) geminiModel.value = settings.geminiModel;
}

// Parse skills textarea into structured list
function parseSkillsString(raw) {
  if (!raw) return [];
  return raw.split(",").map(item => {
    const parts = item.split(":");
    const name = parts[0].trim();
    const years = parts[1] ? parseFloat(parts[1].trim()) : 2;
    return { name, years: isNaN(years) ? 2 : years };
  }).filter(s => s.name.length > 0);
}

// Save Profile
function saveProfile() {
  userProfile.name = profName.value.trim();
  userProfile.email = profEmail.value.trim();
  userProfile.phone = profPhone.value.trim();
  userProfile.linkedinUrl = profLinkedin.value.trim();
  userProfile.githubUrl = profGithub.value.trim();
  userProfile.portfolioUrl = profGithub.value.trim();
  userProfile.totalYearsExperience = profExpYears.value.trim();
  userProfile.noticePeriod = profNoticePeriod.value.trim();
  userProfile.expectedSalary = profSalary.value.trim();
  userProfile.legallyAuthorized = profAuthorized.checked;
  userProfile.requireSponsorship = profSponsorship.checked;
  userProfile.skills = parseSkillsString(profSkills.value);
  userProfile.bio = profBio.value.trim();
  userProfile.coverLetterText = profCoverLetter.value.trim();

  chrome.storage.local.set({ userProfile }, () => {
    saveProfileStatus.textContent = "Saved!";
    setTimeout(() => { saveProfileStatus.textContent = ""; }, 2500);
    // Recalculate score on current job
    if (currentJob) analyzeJobMatch(currentJob);
  });
}

// Save Settings
function saveSettings() {
  settings.geminiApiKey = geminiApiKey.value.trim();
  settings.geminiModel = geminiModel.value;

  chrome.storage.local.set({ settings }, () => {
    saveSettingsStatus.textContent = "Saved!";
    setTimeout(() => { saveSettingsStatus.textContent = ""; }, 2500);
  });
}

// Fetch active job from the currently active browser tab
async function fetchCurrentJob() {
  connectionStatus.textContent = "Connecting...";
  connectionStatus.style.color = "#64748b";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url || !tab.url.includes("linkedin.com")) {
      connectionStatus.textContent = "Not on LinkedIn";
      jobTitle.textContent = "Open LinkedIn to Start";
      jobCompany.textContent = "Navigate to linkedin.com/jobs";
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "GET_JOB_DETAILS" }, (response) => {
      if (chrome.runtime.lastError || !response || !response.job) {
        connectionStatus.textContent = "Tab ready (No job selected)";
        jobTitle.textContent = "Select or click any job";
        jobCompany.textContent = "LinkedIn Jobs";
        return;
      }

      connectionStatus.textContent = "Connected to LinkedIn";
      connectionStatus.style.color = "#10b981";
      currentJob = response.job;
      displayJob(currentJob);
      analyzeJobMatch(currentJob);
    });
  } catch (err) {
    console.error("fetchCurrentJob error:", err);
    connectionStatus.textContent = "Connection error";
  }
}

// Render Job in UI
function displayJob(job) {
  jobTitle.textContent = job.title || "Job Title not found";
  jobCompany.textContent = job.company || "Company not specified";
  jobLocation.textContent = job.location || "";
  jobIdLabel.textContent = job.jobId ? `ID: ${job.jobId}` : "";

  if (job.easyApplyAvailable) {
    jobEasyApplyBadge.textContent = "⚡ Easy Apply";
    jobEasyApplyBadge.className = "badge easy-apply";
    openEasyApplyBtn.style.display = "block";
  } else {
    jobEasyApplyBadge.textContent = "External Apply";
    jobEasyApplyBadge.className = "badge";
    openEasyApplyBtn.style.display = "none";
  }
}

// Match scoring and skills extraction
function analyzeJobMatch(job) {
  if (!job || !job.description) {
    matchScoreVal.textContent = "50%";
    scoreFill.style.width = "50%";
    matchSummary.textContent = "Full description not available to parse.";
    return;
  }

  const desc = job.description.toLowerCase();
  const title = (job.title || "").toLowerCase();
  const textToScan = `${title} ${desc}`;

  const matched = [];
  const missing = [];

  // Match against profile skills
  if (Array.isArray(userProfile.skills) && userProfile.skills.length > 0) {
    userProfile.skills.forEach(skill => {
      const sName = skill.name.toLowerCase();
      if (textToScan.includes(sName)) {
        matched.push(skill.name);
      } else {
        missing.push(skill.name);
      }
    });
  }

  // Calculate score
  let score = 50;
  if (userProfile.skills && userProfile.skills.length > 0) {
    const ratio = matched.length / userProfile.skills.length;
    score = Math.min(98, Math.max(35, Math.round(ratio * 70 + 25)));
  }

  // Render score
  matchScoreVal.textContent = `${score}%`;
  scoreFill.style.width = `${score}%`;

  if (score >= 75) {
    matchSummary.textContent = `🔥 Strong match! Found ${matched.length} key skills in common.`;
  } else if (score >= 50) {
    matchSummary.textContent = `👍 Good potential fit. Has ${matched.length} matching skills.`;
  } else {
    matchSummary.textContent = `⚠️ Moderate match. Some requirements may need tailoring.`;
  }

  // Render skills tags
  matchedSkillsList.innerHTML = matched.map(s => `<span class="skill-tag">✓ ${s}</span>`).join("");
  missingSkillsSection.innerHTML = missing.slice(0, 4).map(s => `<span class="missing-tag">Missing: ${s}</span>`).join("");
}

// Status message helper
function showStatus(text, type = "info") {
  copilotStatusMsg.textContent = text;
  copilotStatusMsg.className = `status-msg active ${type}`;
  setTimeout(() => {
    copilotStatusMsg.classList.remove("active");
  }, 4000);
}

// Autofill Active Step
async function triggerAutofillStep() {
  showStatus("Autofilling current form step...", "info");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  chrome.tabs.sendMessage(tab.id, {
    action: "AUTOFILL_MODAL",
    profile: userProfile
  }, (res) => {
    if (chrome.runtime.lastError || !res) {
      showStatus("Please ensure Easy Apply modal is open.", "warning");
      return;
    }
    if (res.success) {
      if (res.fileUploadNeeded) {
        showStatus(`Filled ${res.filledCount} fields. 📎 File upload detected (Resume/Cover Letter)!`, "warning");
      } else {
        showStatus(`Filled ${res.filledCount} fields. Review answers above.`, "success");
      }
    } else {
      showStatus(res.reason || "Could not fill form.", "warning");
    }
  });
}

// Autofill & Advance Step (Safe: pauses before final submit)
async function triggerAutoAdvance() {
  showStatus("Filling & advancing...", "info");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  // First fill current step
  chrome.tabs.sendMessage(tab.id, {
    action: "AUTOFILL_MODAL",
    profile: userProfile
  }, (fillRes) => {
    setTimeout(() => {
      // Then click next
      chrome.tabs.sendMessage(tab.id, { action: "CLICK_NEXT_STEP" }, (nextRes) => {
        if (chrome.runtime.lastError || !nextRes) {
          showStatus("Unable to advance step.", "warning");
          return;
        }
        if (nextRes.isFinalStep) {
          showStatus("🛑 Review step reached! Please review and click Submit directly on LinkedIn.", "success");
        } else if (nextRes.success) {
          if (fillRes && fillRes.fileUploadNeeded) {
            showStatus("Advanced! 📎 File upload required on this step. Please select your PDF.", "warning");
          } else {
            showStatus("Advanced to next step. Review & click again.", "info");
          }
        } else {
          showStatus(nextRes.reason || "Step completed.", "warning");
        }
      });
    }, 400);
  });
}

// Open Easy Apply Modal
async function triggerOpenEasyApply() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  chrome.tabs.sendMessage(tab.id, { action: "OPEN_EASY_APPLY" }, (res) => {
    if (res && res.success) {
      showStatus("Easy Apply opened! Autofilling in 1s...", "info");
      setTimeout(() => triggerAutofillStep(), 1000);
    } else {
      showStatus("Could not open Easy Apply. Click the button on LinkedIn.", "warning");
    }
  });
}

// Draft Cover Note / Pitch (Gemini or Local Smart Heuristic)
async function draftCoverNote() {
  if (!currentJob) {
    showStatus("Open a job first.", "warning");
    return;
  }

  aiAnalysisOutput.classList.remove("hidden");
  aiAnalysisOutput.textContent = "Generating tailored pitch...";

  if (settings.geminiApiKey) {
    try {
      const prompt = `Write a concise, high-impact 3-4 sentence message/cover note applying for this job.
Job Title: ${currentJob.title}
Company: ${currentJob.company}
Candidate: ${userProfile.name}
Experience: ${userProfile.totalYearsExperience} years
Candidate Skills: ${JSON.stringify(userProfile.skills)}
Candidate Bio: ${userProfile.bio}

Keep it professional, confident, tailored directly to the company. Do not use generic filler.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.geminiModel || "gemini-1.5-flash"}:generateContent?key=${settings.geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        aiAnalysisOutput.textContent = text.trim();
        return;
      }
    } catch (e) {
      console.warn("Gemini call failed, falling back to local generator:", e);
    }
  }

  // Local fallback generator (zero-api-key heuristic)
  const skillsList = (userProfile.skills || []).map(s => s.name).slice(0, 3).join(", ");
  const pitch = `Hi Hiring Team at ${currentJob.company || "the company"},

I'm excited to apply for the ${currentJob.title || "position"}. With ${userProfile.totalYearsExperience || "3+"} years of hands-on experience specializing in ${skillsList || "software engineering"}, I have a proven track record delivering reliable, production-grade solutions. 

Given your focus on this role, I am confident my technical background and problem-solving mindset make me an immediate contributor to your team. I would welcome the opportunity to discuss how my skill set aligns with your goals.

Best regards,
${userProfile.name || "Candidate"}`;

  aiAnalysisOutput.textContent = pitch;
}

// Deep AI Job Analysis
async function analyzeJobDeep() {
  if (!currentJob) {
    showStatus("Open a job first.", "warning");
    return;
  }

  aiAnalysisOutput.classList.remove("hidden");
  aiAnalysisOutput.textContent = "Analyzing requirements & culture fit...";

  if (settings.geminiApiKey) {
    try {
      const prompt = `Analyze this job posting for candidate:
Job: ${currentJob.title} at ${currentJob.company}
Description snippet: ${currentJob.description.slice(0, 1500)}
Candidate Experience: ${userProfile.totalYearsExperience} yrs, Skills: ${JSON.stringify(userProfile.skills)}

Provide:
1. Top 3 key responsibilities
2. Critical interview topics likely to be tested
3. Tailored advice for this application.
Keep it bulleted and very concise.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.geminiModel || "gemini-1.5-flash"}:generateContent?key=${settings.geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        aiAnalysisOutput.textContent = text.trim();
        return;
      }
    } catch (e) {
      console.warn("Gemini call failed, falling back:", e);
    }
  }

  // Local analysis fallback
  aiAnalysisOutput.textContent = `📋 Role Insights for ${currentJob.title}:
• Company: ${currentJob.company}
• Profile Match: ${matchScoreVal.textContent}
• Focus: Review requirements for any specific frameworks or cloud platforms mentioned in the posting.
• Tip: Highlight concrete outcomes and metrics in your interview discussions.
(Add Gemini API Key in Settings for deep LLM evaluation)`;
}

// Application Tracker Logic
function logCurrentJob() {
  if (!currentJob || !currentJob.title) {
    showStatus("No job active to log.", "warning");
    return;
  }

  const existingIndex = trackedJobs.findIndex(j => (j.jobId && j.jobId === currentJob.jobId) || (j.title === currentJob.title && j.company === currentJob.company));

  const entry = {
    id: currentJob.jobId || String(Date.now()),
    title: currentJob.title,
    company: currentJob.company,
    location: currentJob.location,
    date: new Date().toLocaleDateString(),
    status: "Applied",
    matchScore: matchScoreVal.textContent
  };

  if (existingIndex >= 0) {
    trackedJobs[existingIndex] = entry;
  } else {
    trackedJobs.unshift(entry);
  }

  chrome.storage.local.set({ trackedJobs }, () => {
    renderTrackerList();
    showStatus("Logged to Application Tracker!", "success");
  });
}

function renderTrackerList() {
  trackerCount.textContent = trackedJobs.length;

  if (trackedJobs.length === 0) {
    trackerList.innerHTML = `<p class="empty-state">No jobs tracked yet. Open any job and click "Log Job as Applied".</p>`;
    return;
  }

  trackerList.innerHTML = trackedJobs.map(job => `
    <div class="tracker-item">
      <div class="tracker-item-info">
        <h5>${escapeHtml(job.title)}</h5>
        <p>${escapeHtml(job.company)} • ${escapeHtml(job.location || "")}</p>
        <span class="badge ${job.status === "Applied" ? "easy-apply" : ""}">${job.status} (${job.matchScore || "N/A"})</span>
      </div>
      <div class="tracker-date">${job.date}</div>
    </div>
  `).join("");
}

function exportCsv() {
  if (trackedJobs.length === 0) {
    showStatus("No applications to export.", "warning");
    return;
  }

  const headers = ["Title", "Company", "Location", "Date", "Status", "Match Score"];
  const rows = trackedJobs.map(j => [
    `"${(j.title || "").replace(/"/g, '""')}"`,
    `"${(j.company || "").replace(/"/g, '""')}"`,
    `"${(j.location || "").replace(/"/g, '""')}"`,
    `"${j.date}"`,
    `"${j.status}"`,
    `"${j.matchScore || ""}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `linkedin_applications_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearTracker() {
  if (confirm("Are you sure you want to clear your application history?")) {
    trackedJobs = [];
    chrome.storage.local.set({ trackedJobs }, () => {
      renderTrackerList();
    });
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Bind Button Events
function bindEvents() {
  refreshJobBtn.addEventListener("click", fetchCurrentJob);
  saveProfileBtn.addEventListener("click", saveProfile);
  saveSettingsBtn.addEventListener("click", saveSettings);
  openEasyApplyBtn.addEventListener("click", triggerOpenEasyApply);
  autofillStepBtn.addEventListener("click", triggerAutofillStep);
  autoAdvanceBtn.addEventListener("click", triggerAutoAdvance);
  logAppliedBtn.addEventListener("click", logCurrentJob);
  generatePitchBtn.addEventListener("click", draftCoverNote);
  analyzeJobBtn.addEventListener("click", analyzeJobDeep);
  exportCsvBtn.addEventListener("click", exportCsv);
  clearTrackerBtn.addEventListener("click", clearTracker);

  // Preset 1-Click Search Buttons
  document.querySelectorAll(".preset-search-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const query = encodeURIComponent(btn.getAttribute("data-query"));
      // Filters: Easy Apply (f_AL=true), Past 24 Hours (f_TPR=r86400), Remote (f_WT=2)
      const url = `https://www.linkedin.com/jobs/search/?keywords=${query}&f_AL=true&f_TPR=r86400`;
      chrome.tabs.create({ url });
    });
  });
}
