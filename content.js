// content.js - Injected into LinkedIn pages

// Safe logger
function log(...args) {
  console.log("[LinkedIn Copilot]", ...args);
}

// React controlled component value setter helper
function setReactInputValue(element, value) {
  try {
    const prototype = Object.getPrototypeOf(element);
    const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
    const protoValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

    if (protoValueSetter && valueSetter !== protoValueSetter) {
      protoValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));
    element.classList.add("ljc-autofilled-field");
    return true;
  } catch (err) {
    console.error("Error setting React value:", err);
    element.value = value;
    return false;
  }
}

// Extract active job information from LinkedIn DOM
function extractJobDetails() {
  const job = {
    title: "",
    company: "",
    location: "",
    workplaceType: "",
    description: "",
    easyApplyAvailable: false,
    jobUrl: window.location.href,
    jobId: ""
  };

  // Extract job ID from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  job.jobId = urlParams.get("currentJobId") || "";
  if (!job.jobId) {
    const match = window.location.pathname.match(/\/jobs\/view\/(\d+)/);
    if (match) job.jobId = match[1];
  }

  // Job Title selectors
  const titleEl = document.querySelector(
    ".job-details-jobs-unified-top-card__job-title, " +
    ".jobs-unified-top-card__job-title, " +
    ".jobs-details__main-content h1, " +
    "h1.t-24, h2.t-24"
  );
  if (titleEl) job.title = titleEl.innerText.trim();

  // Company Name selectors
  const companyEl = document.querySelector(
    ".job-details-jobs-unified-top-card__company-name, " +
    ".jobs-unified-top-card__company-name, " +
    ".jobs-unified-top-card__subtitle-primary-grouping a, " +
    ".jobs-company__box a"
  );
  if (companyEl) job.company = companyEl.innerText.trim();

  // Location selectors
  const locationEl = document.querySelector(
    ".job-details-jobs-unified-top-card__bullet, " +
    ".jobs-unified-top-card__bullet, " +
    ".jobs-unified-top-card__subtitle-primary-grouping span:not(a)"
  );
  if (locationEl) job.location = locationEl.innerText.trim();

  // Job Description
  const descEl = document.querySelector(
    "#job-details, " +
    ".jobs-description__content, " +
    ".jobs-box__html-content, " +
    ".jobs-description"
  );
  if (descEl) {
    job.description = descEl.innerText.trim();
  }

  // Easy Apply Button
  const easyApplyBtn = document.querySelector(
    "button.jobs-apply-button[aria-label*='Easy Apply'], " +
    "button.jobs-apply-button span.artdeco-button__text"
  );
  if (easyApplyBtn) {
    const text = easyApplyBtn.innerText.toLowerCase();
    job.easyApplyAvailable = text.includes("easy apply");
  }

  return job;
}

// Scrape fields from current Easy Apply Modal
function getEasyApplyFormFields() {
  const modal = document.querySelector(".jobs-easy-apply-modal, .artdeco-modal");
  if (!modal) return { open: false, fields: [] };

  const fieldList = [];
  const formGroups = modal.querySelectorAll(".fb-dash-form-element, .jobs-easy-apply-form-section, div.mt2, div.mb4");

  formGroups.forEach((group, index) => {
    const labelEl = group.querySelector("label, .fb-dash-form-element__label, .artdeco-hoverable-trigger");
    const label = labelEl ? labelEl.innerText.trim() : "";

    const textInput = group.querySelector("input[type='text'], input[type='number'], input[type='email'], input[type='tel']");
    const textarea = group.querySelector("textarea");
    const select = group.querySelector("select");
    const radioInputs = group.querySelectorAll("input[type='radio']");

    if (textInput) {
      fieldList.push({
        id: `field_${index}`,
        type: "text",
        label: label,
        currentValue: textInput.value,
        elementSelector: textInput
      });
    } else if (textarea) {
      fieldList.push({
        id: `field_${index}`,
        type: "textarea",
        label: label,
        currentValue: textarea.value,
        elementSelector: textarea
      });
    } else if (select) {
      const options = Array.from(select.options).map(opt => ({ text: opt.text.trim(), value: opt.value }));
      fieldList.push({
        id: `field_${index}`,
        type: "select",
        label: label,
        options: options,
        currentValue: select.value,
        elementSelector: select
      });
    } else if (radioInputs.length > 0) {
      const options = Array.from(radioInputs).map(r => {
        const rLabel = group.querySelector(`label[for="${r.id}"]`) || r.parentElement;
        return {
          id: r.id,
          value: r.value,
          label: rLabel ? rLabel.innerText.trim() : r.value
        };
      });
      fieldList.push({
        id: `field_${index}`,
        type: "radio",
        label: label,
        options: options,
        elementSelector: radioInputs
      });
    }
  });

  // Check current modal navigation button state
  const nextBtn = modal.querySelector(
    "button[aria-label*='Continue to next step'], " +
    "button[aria-label*='Review your application'], " +
    "button span.artdeco-button__text"
  );

  const isSubmitStep = !!modal.querySelector("button[aria-label*='Submit application']");

  return {
    open: true,
    fields: fieldList.map(f => ({ id: f.id, type: f.type, label: f.label, currentValue: f.currentValue, options: f.options })),
    isSubmitStep: isSubmitStep,
    stepTitle: modal.querySelector("h3, h2")?.innerText.trim() || "Application Form"
  };
}

// Auto-fill active modal based on profile data & rules
function autofillActiveModal(profile, aiAnswers = {}) {
  const modal = document.querySelector(".jobs-easy-apply-modal, .artdeco-modal");
  if (!modal) return { success: false, reason: "Easy Apply modal is not open." };

  let filledCount = 0;
  const questionsAndLabels = [];

  // 1. Process Text inputs & textareas
  const inputs = modal.querySelectorAll("input[type='text'], input[type='number'], input[type='email'], input[type='tel'], textarea");
  inputs.forEach((input) => {
    const formGroup = input.closest(".fb-dash-form-element, .jobs-easy-apply-form-section, div.mt2, div.mb4") || input.parentElement;
    const labelEl = formGroup ? formGroup.querySelector("label, .fb-dash-form-element__label") : null;
    const label = (labelEl ? labelEl.innerText : "").toLowerCase();

    // Check specific known fields
    let fillValue = null;

    if (label.includes("phone") || label.includes("mobile")) {
      fillValue = profile.phone;
    } else if (label.includes("email")) {
      fillValue = profile.email;
    } else if (label.includes("linkedin")) {
      fillValue = profile.linkedinUrl;
    } else if (label.includes("github") || label.includes("portfolio") || label.includes("website")) {
      fillValue = profile.portfolioUrl || profile.githubUrl;
    } else if (label.includes("years of") || label.includes("how many years") || label.includes("experience")) {
      // Find matching skill in profile
      const userSkills = profile.skills || [];
      let foundSkillYears = null;
      for (const skill of userSkills) {
        if (label.includes(skill.name.toLowerCase())) {
          foundSkillYears = skill.years;
          break;
        }
      }
      fillValue = foundSkillYears !== null ? String(foundSkillYears) : String(profile.totalYearsExperience || "3");
    } else if (label.includes("notice period")) {
      fillValue = profile.noticePeriod || "Immediately";
    } else if (label.includes("salary") || label.includes("compensation")) {
      fillValue = profile.expectedSalary || "";
    } else if (label.includes("current company") || label.includes("employer")) {
      fillValue = profile.currentCompany || "Tanglobus (Startup)";
    } else if (label.includes("cover letter") || label.includes("message to hiring manager") || label.includes("why do you want") || label.includes("why should we hire") || label.includes("why are you interested")) {
      fillValue = profile.coverLetterText || `Dear Hiring Team,\n\nI am writing to express my strong interest in this position. With a B.E. in Artificial Intelligence & Data Science and hands-on experience as an AI Engineer at Tanglobus, I have developed expertise in Python, SQL, Power BI, Machine Learning, and intelligent automation agents. I am enthusiastic about applying my analytical and problem-solving skills to contribute directly to your team's goals.\n\nThank you for considering my application.\n\nSincerely,\n${profile.name || "Nikita Banwankar"}`;
    } else if (aiAnswers && aiAnswers[label]) {
      fillValue = aiAnswers[label];
    }

    if (fillValue && (!input.value || input.value.trim() === "" || input.value === "0")) {
      setReactInputValue(input, fillValue);
      filledCount++;
    }

    if (label) {
      questionsAndLabels.push({ label, current: input.value });
    }
  });

  // 2. Process Radio buttons (Yes / No questions, sponsorship, legal authorization)
  const radioGroups = modal.querySelectorAll(".fb-dash-form-element, .jobs-easy-apply-form-section");
  radioGroups.forEach((group) => {
    const labelEl = group.querySelector("legend, label, .fb-dash-form-element__label");
    const label = (labelEl ? labelEl.innerText : "").toLowerCase();
    const radios = group.querySelectorAll("input[type='radio']");

    if (radios.length > 0) {
      let desiredAnswer = null; // true for Yes, false for No

      // Authorization / Sponsorship questions
      if (label.includes("authorized to work") || label.includes("legally authorized") || label.includes("right to work")) {
        // If question specifically asks about India, she is authorized
        desiredAnswer = true;
      } else if (label.includes("sponsorship") || label.includes("require visa") || label.includes("will you now or in the future require")) {
        // For overseas/out-of-India roles, sponsorship is required
        desiredAnswer = profile.requireSponsorship !== false; 
      } else if (label.includes("work from home") || label.includes("remote") || label.includes("hybrid") || label.includes("comfortable commuting") || label.includes("willing to relocate") || label.includes("drug test") || label.includes("background check")) {
        desiredAnswer = true; // Comfortable with WFH, remote, relocation, or commuting
      } else if (label.includes("internship") || label.includes("full-time") || label.includes("full time")) {
        desiredAnswer = true; // Open to both
      }

      if (desiredAnswer !== null) {
        radios.forEach((radio) => {
          const rLabel = group.querySelector(`label[for="${radio.id}"]`) || radio.parentElement;
          const rText = (rLabel ? rLabel.innerText : "").toLowerCase();
          const isYesOption = rText.includes("yes") || radio.value.toLowerCase() === "yes";
          const isNoOption = rText.includes("no") || radio.value.toLowerCase() === "no";

          if ((desiredAnswer && isYesOption) || (!desiredAnswer && isNoOption)) {
            if (!radio.checked) {
              radio.click();
              radio.dispatchEvent(new Event("change", { bubbles: true }));
              group.classList.add("ljc-autofilled-field");
              filledCount++;
            }
          }
        });
      }
    }
  });

  // 3. Process Dropdowns (<select>)
  const selects = modal.querySelectorAll("select");
  selects.forEach((select) => {
    const formGroup = select.closest(".fb-dash-form-element, .jobs-easy-apply-form-section") || select.parentElement;
    const labelEl = formGroup ? formGroup.querySelector("label, .fb-dash-form-element__label") : null;
    const label = (labelEl ? labelEl.innerText : "").toLowerCase();

    if (label.includes("sponsorship")) {
      const target = profile.requireSponsorship ? "yes" : "no";
      for (const opt of select.options) {
        if (opt.text.toLowerCase().includes(target)) {
          select.value = opt.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          filledCount++;
          break;
        }
      }
    } else if (label.includes("authorized")) {
      for (const opt of select.options) {
        if (opt.text.toLowerCase().includes("yes")) {
          select.value = opt.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          filledCount++;
          break;
        }
      }
    }
  });

  // 4. Check for File Upload inputs (Resume / Cover Letter upload)
  let fileUploadNeeded = false;
  const fileInputs = modal.querySelectorAll("input[type='file']");
  fileInputs.forEach((fileInput) => {
    const parentContainer = fileInput.closest(".jobs-easy-apply-form-section, div.mt2, div.mb4, .fb-dash-form-element") || fileInput.parentElement;
    if (parentContainer) {
      parentContainer.classList.add("ljc-highlight-attention");
      fileUploadNeeded = true;
    }
  });

  return { success: true, filledCount, questions: questionsAndLabels, fileUploadNeeded };
}

// Click the next / continue button in Easy Apply modal (NEVER auto-click final submit)
function clickNextStep() {
  const modal = document.querySelector(".jobs-easy-apply-modal, .artdeco-modal");
  if (!modal) return { success: false, reason: "Modal not open" };

  // Check if we are at final review / submit step
  const submitBtn = modal.querySelector("button[aria-label*='Submit application']");
  if (submitBtn) {
    return { success: false, isFinalStep: true, message: "Paused for human review: Ready to submit!" };
  }

  // Look for Next / Review button
  const buttons = Array.from(modal.querySelectorAll("footer button, .artdeco-modal__actionbar button"));
  const nextBtn = buttons.find(btn => {
    const text = btn.innerText.toLowerCase();
    const aria = (btn.getAttribute("aria-label") || "").toLowerCase();
    return (
      text.includes("next") ||
      text.includes("continue") ||
      text.includes("review") ||
      aria.includes("continue to next step") ||
      aria.includes("review your application")
    );
  });

  if (nextBtn) {
    nextBtn.click();
    return { success: true, isFinalStep: false };
  }

  return { success: false, reason: "No next button found." };
}

// Click Easy Apply button to open the modal
function openEasyApplyModal() {
  const easyApplyBtn = document.querySelector(
    "button.jobs-apply-button[aria-label*='Easy Apply'], " +
    "button.jobs-apply-button"
  );
  if (easyApplyBtn) {
    easyApplyBtn.click();
    return { success: true };
  }
  return { success: false, reason: "Easy Apply button not found on page." };
}

// Inject subtle floating badge to toggle or open sidepanel
function injectFloatingBadge() {
  if (document.getElementById("ljc-floating-trigger")) return;

  const badge = document.createElement("div");
  badge.id = "ljc-floating-trigger";
  badge.className = "ljc-floating-badge";
  badge.innerHTML = `
    <span class="ljc-dot"></span>
    <span>Copilot AI</span>
  `;

  badge.title = "Click to open LinkedIn Job Copilot";
  badge.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL" });
  });

  document.body.appendChild(badge);
}

// Listen for messages from sidepanel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_JOB_DETAILS") {
    const job = extractJobDetails();
    sendResponse({ job });
  } else if (request.action === "GET_MODAL_FIELDS") {
    const modalData = getEasyApplyFormFields();
    sendResponse({ modalData });
  } else if (request.action === "AUTOFILL_MODAL") {
    const res = autofillActiveModal(request.profile || {}, request.aiAnswers || {});
    sendResponse(res);
  } else if (request.action === "CLICK_NEXT_STEP") {
    const res = clickNextStep();
    sendResponse(res);
  } else if (request.action === "OPEN_EASY_APPLY") {
    const res = openEasyApplyModal();
    sendResponse(res);
  }
  return true;
});

// Run once loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectFloatingBadge);
} else {
  injectFloatingBadge();
}
