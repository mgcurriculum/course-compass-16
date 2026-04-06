

# Add Dummy Data for Students & Dashboard

## Summary
Insert sample student contacts with varied preferences and saved courses so the Students page and Dashboard charts are populated with meaningful data.

## Data to Insert

### 15 Student Contacts
Diverse students with varying:
- Educational qualifications (Bachelor's, Master's, +2)
- Graduated years (2018-2024)
- IELTS scores (5.5-8.0)
- Work experience (0-5 years)
- Preferred countries (UK, US, Canada, Australia, Germany, Ireland)
- Preferred domains (Computer Science, Business, Engineering, Data Science, etc.)

All linked to the existing admin user_id (`49b417e1-e5b0-4479-a538-9663f256258b`) since RLS requires `user_id` match.

### 40-50 Saved Courses
Spread across the 15 students, referencing existing course IDs, with varied:
- Match scores (55-98%)
- Eligibility statuses (Eligible, Borderline, Not Eligible)

This will populate all 4 dashboard charts:
- Country Preferences bar chart
- Domain Preferences bar chart
- Top Saved Courses bar chart
- Eligibility Distribution pie chart

## Approach
- Use `psql` INSERT statements directly (we have insert access)
- All data tied to existing user_id and course_ids

## No code changes needed
Only database inserts — no file modifications required.

