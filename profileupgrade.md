Got it 👍 You want me to prepare a Markdown (.md) file that acts like a prompt-style research + synopsis document for redesigning your profile page. It should explain everything clearly (so Claude or any dev can implement it safely without breaking existing functionality).

Here’s a clean draft:

⸻

PROFILE_PAGE_REDESIGN.md

🎯 Objective

Redesign the user profile page for the WelthWest project to make it modern, responsive, and user-friendly while keeping all existing functionality intact. The design should be inspired by the Canva mockup and must replace the outdated version shown in the current system.

⸻

📝 Synopsis & Requirements

1. Profile Header
	•	Circular Profile Icon with Initials
	•	Display user initials (e.g., RT for Rudresh Tiwari).
	•	Background color should be randomly generated but within a pastel or soft color palette for readability.
	•	Should adapt dynamically to screen sizes.

2. Form Layout
	•	Use a two-column grid layout on desktop and a single-column layout on mobile (responsive design).
	•	Inputs should be styled with rounded corners, shadows, and clear placeholder text.
	•	Validation for each field must be enforced without breaking form submission.

3. Profile Fields

Keep all existing fields and add new ones.

Existing Fields
	•	First Name
	•	Last Name
	•	Username
	•	Email
	•	Bio

New Fields
	•	Mobile Number (with OTP Verification)
	•	Send OTP on mobile input.
	•	User must verify OTP before saving.
	•	Aadhar Number (masked after save, e.g., XXXX-XXXX-1234).
	•	PAN Number (validated with standard PAN format: ABCDE1234F).
	•	Date of Birth (Finance-related → useful for KYC verification).
	•	Occupation / Income Source (Important for financial profiling & compliance).

⸻

⚙️ Functional Requirements
	1.	Data Storage
	•	All fields should continue to store data in the same backend system.
	•	OTP verification should only update the verified mobile number once completed.
	•	Sensitive fields (Aadhar, PAN) should be stored securely with encryption.
	2.	Validation Rules
	•	Email → must be valid format.
	•	Mobile → 10-digit numeric + OTP.
	•	Aadhar → 12-digit numeric.
	•	PAN → Alphanumeric format (ABCDE1234F).
	•	DOB → Must be in DD/MM/YYYY format.
	3.	Responsiveness
	•	No breaking of existing navbar, dashboard, or side panels.
	•	Mobile view should stack fields vertically.
	•	Desktop view should use 2-column layout.
	4.	Performance & Compatibility
	•	Must integrate smoothly with existing API endpoints.
	•	OTP system should not delay profile load time (trigger only on mobile update).
	•	No breaking changes in database schema → instead, extend with new fields.

⸻

🎨 UI/UX Guidelines
	•	Consistency: Follow the Canva mockup’s theme.
	•	Minimalistic design: Keep it clean and not cluttered.
	•	Color scheme: Match WelthWest brand palette (light + dark theme).
	•	Error states: Highlight invalid inputs in red with tooltips.
	•	Success state: Show green check or toast after successful update.

⸻

📌 Prompt Instructions for Claude (or Any Dev AI)

You are improving the WelthWest profile page. Use the Canva mockup as a design reference.
Replace the outdated profile form with a responsive modern layout.
Implement the following:
	•	Circular profile initials at the top with random soft background color.
	•	Fields: First Name, Last Name, Username, Email, Bio, Mobile Number (OTP), Aadhar Number, PAN Number, Date of Birth, Occupation/Income Source.
	•	Ensure all fields validate properly and store securely in the backend.
	•	Keep the layout responsive (grid on desktop, single-column on mobile).
	•	Do not remove or break any existing functionality.
	•	OTP should only trigger on mobile number input.
	•	Secure sensitive fields (Aadhar, PAN) and mask after save.
	•	Maintain compatibility with both light and dark theme.

⸻

 ----------------------------------------------------
|                      [ RT ]                        |
|                 (Profile Initials)                 |
 ----------------------------------------------------
| First Name   | Last Name                           |
| Username     | Email                               |
| Bio (multi-line text area)                         |
| Mobile No + OTP Verify Button                      |
| Aadhar No    | PAN No                              |
| Date of Birth| Occupation / Income Source          |
 ----------------------------------------------------
|            [ Update Profile Button ]               |
 ----------------------------------------------------