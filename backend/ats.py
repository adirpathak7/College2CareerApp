import re
import json
import os
from collections import Counter


# ---------- LOAD KEYWORDS FROM JSON ----------
def load_keywords():
    json_path = os.path.join(os.path.dirname(__file__), "keywords.json")

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("keywords", [])
    except Exception:
        return []


DEFAULT_KEYWORDS = load_keywords()  # LOAD HERE


# ---------- PDF TEXT EXTRACT ----------
def extract_text_from_bytes(pdf_bytes):
    import fitz  # PyMuPDF
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text_parts = []

    for page in doc:
        text_parts.append(page.get_text("text"))

    doc.close()
    return "\n".join(text_parts)


# ---------- CONTACT EXTRACTION ----------
def find_contacts(text):
    contacts = {}

    email_match = re.search(r"[a-zA-Z0-9.\-_+]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
    if email_match:
        contacts["email"] = email_match.group(0)

    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?(\d{10,12})", text.replace(" ", ""))
    if phone_match:
        contacts["phone"] = phone_match.group(0)

    return contacts


# ---------- KEYWORD + SECTION ANALYSIS ----------
def analyze_text(text, keywords=None):
    if keywords is None:
        keywords = DEFAULT_KEYWORDS

    lower = text.lower()

    result = {
        "foundKeywords": [],
        "keywordMatches": {},
        "sections": {},
        "contacts": {},
        "length": len(lower),
    }

    for kw in keywords:
        if kw.lower() in lower:
            result["foundKeywords"].append(kw)
            result["keywordMatches"][kw] = lower.count(kw.lower())

    section_heads = ["experience", "education", "skills", "projects", "certifications", "summary", "objective"]
    for head in section_heads:
        result["sections"][head] = head in lower

    result["contacts"] = find_contacts(text)

    return result


# ---------- SCORE CALCULATION ----------
def score_from_analysis(analysis, text):
    score = 0
    breakdown = []

    important_sections = ["experience", "education", "skills"]
    sections_present = sum(1 for s in important_sections if analysis["sections"].get(s))
    max_sec_pts = 30
    sec_pts = int((sections_present / len(important_sections)) * max_sec_pts)
    score += sec_pts
    breakdown.append(("sections", sec_pts, f"{sections_present}/{len(important_sections)} core sections"))

    matched = len(analysis["foundKeywords"])
    total_kw = max(1, len(DEFAULT_KEYWORDS))
    kw_pts = int((matched / total_kw) * 35)
    score += kw_pts
    breakdown.append(("keywords", kw_pts, f"{matched} keywords matched"))

    contacts = analysis["contacts"]
    contact_pts = 0
    if "email" in contacts:
        contact_pts += 5
    if "phone" in contacts:
        contact_pts += 5
    score += contact_pts
    breakdown.append(("contacts", contact_pts, f"email: {'yes' if 'email' in contacts else 'no'}, phone: {'yes' if 'phone' in contacts else 'no'}"))

    length = analysis["length"]
    if length > 2000:
        len_pts = 20
    elif length > 1000:
        len_pts = 12
    elif length > 600:
        len_pts = 6
    else:
        len_pts = 0
    score += len_pts
    breakdown.append(("length", len_pts, f"chars: {length}"))

    bullets = bool(re.search(r"(- |\u2022|•|\*)", text))
    fmt_pts = 0
    if bullets:
        fmt_pts = 10
    score += fmt_pts
    breakdown.append(("formatting", fmt_pts, f"bullets: {bullets}"))

    final_score = max(0, min(100, score))
    return final_score, breakdown


# ---------- MAIN EXPORT FUNCTION ----------
def analyze_resume(pdf_bytes, keywords=None):
    try:
        text = extract_text_from_bytes(pdf_bytes)
    except Exception:
        try:
            text = pdf_bytes.decode("utf-8", errors="ignore")
        except Exception:
            text = ""

    analysis = analyze_text(text, keywords)
    score, breakdown = score_from_analysis(analysis, text)

    suggestions = []
    if not analysis["sections"].get("experience"):
        suggestions.append("Add an 'Experience' section with job/internship details.")
    if not analysis["sections"].get("skills"):
        suggestions.append("Add a clear 'Skills' section with relevant keywords.")
    if "email" not in analysis["contacts"]:
        suggestions.append("Include an email address in contact details.")
    if "phone" not in analysis["contacts"]:
        suggestions.append("Include a phone number in contact details.")
    if analysis["length"] < 600:
        suggestions.append("Consider adding more detail (projects, responsibilities).")

    final_suggestions = suggestions if score < 80 else []

    return {
        "score": score,
        "breakdown": [{"item": b[0], "points": b[1], "note": b[2]} for b in breakdown],
        "matchedKeywords": analysis["foundKeywords"],
        "contacts": analysis["contacts"],
        "suggestions": final_suggestions,   # updated
        "rawTextSnippet": text[:1000]
    }