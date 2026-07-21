# Technical Specification: Password Policy & Password-Creation Feature Upgrade

**Application Type:** E-commerce
**Prepared by:** Senior Application Security Engineer & Lead UX Designer
**Status:** Draft for review
**Version:** 1.0

## 1. Overview & Goals

This specification defines the requirements to upgrade password creation, storage, and enforcement across the e-commerce platform (customer accounts, guest-to-account conversion, and internal/admin accounts). The primary tension to manage is **security vs. conversion friction**: e-commerce checkout and account-creation flows are highly sensitive to abandonment, so complexity and validation UX must be strict enough to resist credential attacks but forgiving enough not to tank signup/checkout completion rates.

Design principles:
- Favor **length over complexity** (NIST SP 800-63B aligned) to reduce user frustration while improving actual entropy.
- Push validation feedback to be **real-time and encouraging**, not punitive.
- Assume this is a high-value target for **credential stuffing** (reused e-commerce/retail passwords are the most commonly stuffed credential type), so backend defenses are weighted heavily.

---

## 2. Password Complexity Rules

### 2.1 Length Requirements
- **Minimum length:** 10 characters for customer accounts; 12 characters for admin/staff/merchant-portal accounts.
- **Maximum length:** 128 characters (do not silently truncate — reject with a clear error if exceeded).
- Passwords MUST be accepted as-is, including spaces and all printable Unicode characters (do not restrict to ASCII only — this excludes legitimate international users).
- No maximum length shorter than 64 is acceptable per NIST 800-63B guidance; 128 gives headroom for passphrases.

### 2.2 Character Type Requirements
Rather than mandating "must include 1 uppercase + 1 number + 1 symbol" (which drives predictable patterns like `Password1!`), apply a **composition score model**:

- Baseline requirement: minimum length (2.1) is the only hard gate.
- Encourage (not force) diversity via the strength meter (Section 3.2) — award higher strength scores for:
  - Mixed case (upper + lower)
  - Numbers
  - Special characters (`!@#$%^&*()-_=+[]{};:'",.<>/?`)
  - Passphrases (3+ dictionary words, e.g., `correct-horse-battery`)
- **Hard rejection only applies to:**
  - Passwords entirely numeric (e.g., `1234567890`) — blocked regardless of length, as these are trivially guessable and often phone numbers.
  - Passwords identical to a keyboard-walk pattern (`qwertyuiop`, `1qaz2wsx`, etc.) — detected via the blacklist in 2.3.

> **Rationale:** Forced-composition rules (NIST-deprecated) measurably push users toward predictable substitutions (`@` for `a`, `1` for `i`) that attackers already account for in cracking dictionaries. Length + blacklist checking is more effective.

### 2.3 Password Blacklisting

Reject passwords that match any of the following, checked at submission time (server-side, case-insensitive, with common substitution normalization e.g. `@`→`a`, `0`→`o`, `3`→`e`):

- **Top breached-password lists:** Check against a local copy of the top 100k–1M entries from Have I Been Pwned's Pwned Passwords list (k-anonymity API model — only a SHA-1 prefix is sent externally, full hash never leaves the server).
- **Common sequences/patterns:** `123456`, `123456789`, `qwerty`, `password`, `letmein`, `welcome`, `admin`, `iloveyou`, `abc123`, `000000`, `111111`, sequential runs (`abcdef`, `987654`), and keyboard walks.
- **Site/brand-specific terms:** The application name, company name, and common product category terms (e.g., `shop123`, `[storename]2024`).
- **Personal identifiers:** Any password containing (as substring, case-insensitive) the user's:
  - Email local-part (before the `@`)
  - First name / last name (if collected)
  - Username, if the platform uses one separately from email
- **Reused-context check:** If this is a password *change* (not creation), reject if the new password matches any of the user's last 5 password hashes.

**Implementation note:** All blacklist checks run server-side as the source of truth. Client-side may run a lightweight local check (e.g., top 1,000 common passwords) for instant feedback, but must never be trusted as the sole gate.

---

## 3. User Experience & Interface (UX/UI)

### 3.1 Real-Time Validation Indicators

As the user types in the password field, display live checklist-style feedback below the input (not just on blur/submit):

- Each requirement rendered as a row with a neutral state (before typing) → red/error state (unmet, after debounce) → green/checkmark state (met).
- Debounce validation by ~150–300ms to avoid flickering on every keystroke.
- Example checklist rows:
  - ✅ At least 10 characters
  - ✅ Not a commonly used password
  - ✅ Doesn't contain your name or email
- Do **not** show a red X the instant the field is focused/empty — only mark a rule "failed" once the user has typed enough for it to be meaningfully unmet, or after they blur the field. Failing instantly on an empty field reads as hostile UI.
- Use color + icon + text (not color alone) for accessibility (WCAG 2.1 SC 1.4.1 — color must not be the only means of conveying state). Screen readers must get live-region (`aria-live="polite"`) announcements when a requirement transitions from unmet to met.

### 3.2 Dynamic Password Strength Meter

- Visual bar (4–5 segments) beneath the password field, updating live as the user types.
- Backed by an entropy-estimation library (e.g., `zxcvbn` or `zxcvbn-ts`) rather than a naive character-class count — this correctly penalizes predictable patterns even when they technically satisfy character-class rules.
- Strength bands:
  | Score | Label | Bar Color |
  |---|---|---|
  | 0–1 | Very Weak | Red |
  | 2 | Weak | Orange |
  | 3 | Good | Yellow-green |
  | 4 | Strong | Green |
- Show a one-line contextual tip tied to the score (e.g., "Try adding another word or a few more characters" for Weak) rather than generic "weak password" text.
- The meter is advisory — it must never block submission on its own; only the hard rules in Section 2 block submission.

### 3.3 Show/Hide Password Toggle

- Eye icon (👁) button positioned inside the input field, right-aligned, for both the password and confirm-password fields independently.
- Default state: hidden (`type="password"`).
- Toggle button must be:
  - Keyboard accessible (focusable, `Enter`/`Space` activates it).
  - Labeled via `aria-label="Show password"` / `"Hide password"`, toggling with state.
  - Not a submit trigger (`type="button"`, never `type="submit"`).
- Auto-re-hide is **not** applied on blur (this breaks users mid-review); state persists until manually toggled or the form is submitted/reset.
- Do not use a "confirm password" field at all if show/hide is implemented well — consider removing the duplicate-entry field entirely for signup (reduces friction) since the show/hide toggle already lets users verify their input. Retain confirm-password only for flows without visible-password support (e.g., legacy fallback).

---

## 4. Backend Security & Rate Limiting

### 4.1 Hashing & Storage

- **Algorithm:** Argon2id (preferred) — memory-hard, resistant to GPU/ASIC cracking.
  - Recommended parameters (tune to server capacity, target ~250–500ms hash time): memory cost 19 MiB minimum (OWASP baseline; 46–64 MiB preferred if resources allow), iterations 2–3, parallelism 1.
- **Fallback:** bcrypt with cost factor 12+ if Argon2id is unavailable in the current stack.
- Salting is handled automatically per-hash by both Argon2id and bcrypt (unique random salt per password, stored alongside the hash) — never implement custom salting.
- **Never** store or log plaintext passwords, including in application logs, error traces, or analytics events. Password fields must be explicitly excluded from request logging middleware.
- Add a **server-side pepper** (a secret key stored in a secrets manager/KMS, not in code or env files committed to the repo) as an additional HMAC layer before hashing, to protect against full database exfiltration without app-server compromise.
- Rehash-on-login: if a user authenticates with a hash produced by outdated parameters, transparently rehash with current parameters.

### 4.2 Anti-Brute-Force Mechanisms

- **Progressive delay:** Increase response delay after failed attempts (e.g., 1s after 3 fails, 5s after 5, 30s after 8) per account+IP combination.
- **Account lockout:**
  - Soft lockout after 10 consecutive failed attempts on one account: require CAPTCHA to continue, do not fully lock the account (avoids attacker-triggered denial-of-service against legitimate users).
  - Hard lockout / step-up verification (email/SMS confirmation) after 20 failed attempts within a rolling 24-hour window.
- **CAPTCHA triggers:** Invisible/risk-based CAPTCHA (e.g., reCAPTCHA v3, hCaptcha) triggered by:
  - Failed-attempt velocity per IP or account.
  - Signup velocity per IP (bot-driven fake-account creation).
- **Rate limiting (IP + account level):**
  - Login endpoint: max 10 requests/minute per IP, 5 requests/minute per account.
  - Password-creation/reset endpoint: max 5 requests/hour per account.
- **Credential-stuffing detection:** Flag and challenge login attempts where the same IP/device fingerprint cycles through many distinct usernames in a short window.
- **Notification:** Email the account holder on: password change, new-device login, and lockout trigger — with a "this wasn't me" recovery link.

---

## 5. Error Messaging

All validation errors must be **specific, non-technical, and actionable** — never expose backend implementation details (e.g., never say "bcrypt hash comparison failed" or "SQL constraint violation").

| Scenario | Error Message |
|---|---|
| Too short | "Your password needs to be at least 10 characters long." |
| Too long | "Your password can't be longer than 128 characters." |
| Common/breached password | "This password has appeared in known data breaches. Please choose a different one." |
| Contains personal info | "Your password can't contain your name or email address." |
| All-numeric password | "Please don't use an all-number password — try adding a letter or symbol." |
| Matches recent password (on change) | "You've used this password recently. Please choose a new one." |
| Passwords don't match (confirm field) | "Passwords don't match. Please re-enter." |
| Account locked (soft) | "For your security, please complete the verification below to continue." |
| Account locked (hard) | "We've temporarily locked this account for your protection. Check your email to verify it's you." |
| Rate limited | "Too many attempts. Please try again in a few minutes." |
| Generic login failure | "Incorrect email or password." *(intentionally generic — do not reveal whether the email or password was the incorrect part, to avoid account enumeration)* |

**General rules:**
- Errors appear inline, adjacent to the relevant field, not only in a summary banner at the top.
- Never reveal *which specific blacklist entry* matched (e.g., don't say "this is the #4,213 most common password") — just that it's disallowed.
- Login failure messages must be identical in wording and timing (via constant-time comparison) whether the email doesn't exist or the password is wrong, to prevent user enumeration.
- Success confirmation ("Password updated") should also be explicit and immediate, not just an implied redirect.

---

## 6. Open Questions for Stakeholder Review

- Should admin/merchant-portal accounts require MFA in addition to this password policy? (Recommended: yes, given elevated privilege.)
- Confirm acceptable UX tradeoff for removing the confirm-password field on signup (Section 3.3) — requires product sign-off given it's a deviation from current pattern.
- Confirm pepper key management approach (which KMS/secrets manager is already in use in this environment).
