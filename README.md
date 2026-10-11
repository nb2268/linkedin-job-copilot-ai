# LinkedIn Job Copilot AI 💼🤖

An intelligent, safety-first **Chrome Extension** that acts as your personal job hunting copilot on LinkedIn. It analyzes job descriptions, calculates resume match scores, automatically drafts tailored pitches, fills repetitive "Easy Apply" form fields, and keeps track of all your applications — with a **human-in-the-loop** confirmation step so you stay in total control and your account stays 100% safe.

---

## 🚀 Key Features

1. **Native Chrome Side Panel Integration**:
   - Opens seamlessly alongside LinkedIn jobs without blocking your view or opening separate windows.
   - Automatically detects whichever job you're currently viewing.

2. **Match Scoring & Skill Gap Analysis**:
   - Compares the active job description with your skills and experience.
   - Shows a match score (%) and highlights both matched and missing keywords.

3. **Smart "Easy Apply" Autofill (React-compatible)**:
   - Uses synthetic event dispatching so LinkedIn's React forms properly accept filled values.
   - Automatically fills contact info, years of experience for specific tools, salary expectations, notice period, and authorization / sponsorship radios/dropdowns.
   - Highlights autofilled inputs in green so you can review them at a glance.

4. **Human-in-the-Loop Safe Progression**:
   - Automatically advances multi-step Easy Apply forms, but **always pauses** at the final review screen so you can verify everything before submitting.
   - Completely immune to bot detection because it runs inside your regular, authentic Chrome session.

5. **AI Pitch & Cover Note Generator**:
   - Drafts concise, tailored cover notes directly suited to the company and role.
   - Works right out of the box with built-in templates, or powered by Google Gemini (1.5 Flash / 2.0 Flash) if you provide an API key.

6. **Application Tracker**:
   - 1-click logs applied jobs (Company, Title, Date, Match Score).
   - Export your application history to CSV for spreadsheets or job tracking.

---

## 📦 How to Install in Google Chrome (Takes 30 seconds)

1. Open **Google Chrome**.
2. In the URL bar, go to:
   ```text
   chrome://extensions
   ```
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **"Load unpacked"** button in the top-left corner.
5. Select this project folder:
   ```text
   c:\Users\91930\Desktop\linkdin auto
   ```
6. The extension **LinkedIn Job Copilot AI** will now appear in your extensions list!

---

## 🎯 How to Use

1. Click the **puzzle piece icon** in Chrome's toolbar and pin **LinkedIn Job Copilot AI**.
2. Click the extension icon to open the **Side Panel**.
3. Go to the **👤 Profile** tab:
   - Enter your contact details, skills (e.g. `React: 3, Python: 2, Node.js: 3`), total experience, notice period, and work authorization preferences.
   - Click **Save Profile**.
4. Navigate to any LinkedIn job search page:
   ```text
   https://www.linkedin.com/jobs/
   ```
5. Click on any job posting:
   - The Copilot panel will immediately update with the job title, company, and your **Profile Match Score**.
   - Click **"Open Easy Apply"** -> **"Auto-fill Current Step"** or **"Fill & Next"**.
   - Review the filled fields, make any quick adjustments, and hit submit when you're happy!
6. Click **"Log Job as Applied"** to keep a record in your **Application Tracker**.

---

## 🛡️ Safety & Best Practices

- **Recommended Volume**: Apply to 15–25 high-match jobs per day. Targeted applications with high match scores consistently produce vastly higher callback rates than mass applying to hundreds of unrelated roles.
- **Always Review**: Check the pre-filled questions on the final review step to ensure company-specific questions (like custom essays or portfolio links) are answered accurately.
