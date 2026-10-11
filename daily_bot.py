"""
daily_bot.py - Automated LinkedIn Job Discovery & Application Bot for AI Roles
Target Roles: Generative AI, Agentic AI, Machine Learning, AI Engineer (Internship & Full-time)
Candidate: Nikita Banwankar
"""

import os
import sys
import time
import json
import random
from datetime import datetime

# Configure Windows console UTF-8 support
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Target Search Keywords tailored for Nikita's preferences
SEARCH_KEYWORDS = [
    "Generative AI Intern",
    "Agentic AI",
    "AI Engineer Intern",
    "Machine Learning Intern",
    "Data Analyst Trainee",
    "Python AI Developer"
]

CANDIDATE_PROFILE = {
    "name": "Nikita Banwankar",
    "email": "nikitabanwankar@gmail.com",
    "phone": "+91 9307490581",
    "linkedin": "https://linkedin.com/in/nb2268",
    "github": "https://github.com/nb2268",
    "portfolio": "https://nb2268.github.io/portfolio",
    "experience_years": "1",
    "notice_period": "Immediate",
    "location": "Pune, Maharashtra, India",
    "remote_preferred": True,
    "require_visa_outside_india": True,
    "resume_pdf_path": os.path.abspath("Nikita_Banwankar_Resume.pdf"),
    "cover_letter_pdf_path": os.path.abspath("Nikita_Banwankar_Cover_Letter.pdf")
}

SAFETY_SETTINGS = {
    "max_applications_per_day": 15,     # Never exceed 15-20 to avoid ban
    "min_delay_seconds": 4,             # Human-like delay
    "max_delay_seconds": 8,
    "pause_on_unknown_questions": True  # Safety stop if unknown essay questions appear
}

def human_delay(min_s=3, max_s=7):
    """Simulates realistic human pause intervals between actions."""
    t = random.uniform(min_s, max_s)
    time.sleep(t)

def log_application(job_title, company, status="Applied"):
    """Logs application history to a local JSON file."""
    log_file = "applied_jobs_history.json"
    history = []
    if os.path.exists(log_file):
        try:
            with open(log_file, "r") as f:
                history = json.load(f)
        except Exception:
            history = []

    history.append({
        "timestamp": datetime.now().isoformat(),
        "job_title": job_title,
        "company": company,
        "status": status,
        "applicant": CANDIDATE_PROFILE["name"]
    })

    with open(log_file, "w") as f:
        json.dump(history, f, indent=2)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Logged application: {job_title} at {company}")

def main():
    print("=" * 65)
    print("🤖 LINKEDIN AI JOB AUTO-APPLIER (GenAI / Agentic AI / ML)")
    print("Candidate:", CANDIDATE_PROFILE["name"])
    print("Target Daily Cap:", SAFETY_SETTINGS["max_applications_per_day"])
    print("=" * 65)
    print("\n[INFO] Starting LinkedIn Search Query Generator...")
    
    for kw in SEARCH_KEYWORDS:
        # Generates exact LinkedIn URL with filters: Easy Apply, Past 24h, Remote / Worldwide
        encoded_kw = kw.replace(" ", "%20")
        url = (
            f"https://www.linkedin.com/jobs/search/?keywords={encoded_kw}"
            f"&f_AL=true"                    # Easy Apply filter
            f"&f_TPR=r86400"                 # Past 24 hours
            f"&f_WT=2"                      # Remote
        )
        print(f"• Keyword: {kw}")
        print(f"  Target URL: {url}\n")

    print("[SECURITY NOTE]")
    print("1. LinkedIn enforces CAPTCHA and rate limits on unattended automated bots.")
    print("2. The safest, ban-proof method is the Chrome Extension ('LinkedIn Job Copilot AI'),")
    print("   which runs in your active browser session and fills 10-20 jobs in under 3 minutes.")

if __name__ == "__main__":
    main()
