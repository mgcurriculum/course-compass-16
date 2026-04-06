

# Share Saved Courses via WhatsApp & Email

## Summary
Add WhatsApp and Email share buttons to both the **Student Profile detail view** (Students page) and the **Shortlisted Courses page**. These compose a formatted message with the student's profile details and their saved course list, then open WhatsApp or the user's email client.

## How It Works

### Message Format
A formatted text block containing:
- **Student Info**: Name, Mobile, Email, DOB
- **Course List**: Each course with University, Course Name, Country, Duration, Fees, Match %, Status

Example:
```text
*Edroots International — Course Recommendations*

*Student:* John Doe
*Mobile:* 9876543210
*Email:* john@email.com

*Recommended Courses:*
1. University of London — MSc Computer Science
   UK | 2 years | GBP 18,000 | Match: 85% | Eligible

2. University of Toronto — MEng Software Engineering
   Canada | 2 years | CAD 25,000 | Match: 78% | Borderline
```

### WhatsApp
- Opens `https://wa.me/?text={encodedMessage}` in a new tab
- Uses WhatsApp-compatible formatting (`*bold*` for headers)

### Email
- Opens `mailto:?subject=...&body={encodedMessage}` 
- Pre-fills the student's email in the `to` field if available

## UI Changes

### `src/pages/Students.tsx` — Student detail view
- Add "Share via WhatsApp" and "Share via Email" buttons next to the student info card
- Build the message from `selectedContact` + `savedCourses` state

### `src/pages/Shortlisted.tsx` — Shortlisted courses page
- Add WhatsApp and Email share buttons in the header (next to Export CSV)
- Needs to fetch the associated student contact info for the message header
- Uses the active contact from context if available

### Shared utility
- Create a helper function `buildShareMessage(student, courses)` in a small utility to avoid duplication between the two pages

## Files
- **Create**: `src/lib/share-utils.ts` — `buildShareMessage`, `shareViaWhatsApp`, `shareViaEmail` helpers
- **Modify**: `src/pages/Students.tsx` — add share buttons in student detail view
- **Modify**: `src/pages/Shortlisted.tsx` — add share buttons in header

