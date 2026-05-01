# Test Plan: US-2.6a - Official Semester Grades

This test plan verifies that students can only see "Official" verified grades in their portal.

## 1. Backend API Verification

### Test Case 1.1: Filter "In-Progress" Grades
- **Objective:** Ensure the API does not return grades marked as `IN_PROGRESS`.
- **Setup:** 
    - Student A has one enrollment: `Course: CS101`, `Grade: A`, `GradeStatus: IN_PROGRESS`.
- **Action:** Call `GET /api/student/gpa` as Student A.
- **Expected Result:** 
    - `semesterBreakdown` is empty or does not contain CS101.
    - `cumulativeGPA` is `0`.
    - `currentSemesterGPA` is `0`.

### Test Case 1.2: Include "Official" Grades
- **Objective:** Ensure the API returns grades marked as `OFFICIAL`.
- **Setup:** 
    - Student A has one enrollment: `Course: CS101`, `Grade: B`, `GradeStatus: OFFICIAL`.
- **Action:** Call `GET /api/student/gpa` as Student A.
- **Expected Result:** 
    - `semesterBreakdown` contains CS101 with `grade: 'B'`.
    - `cumulativeGPA` is `3.00`.

### Test Case 1.3: Row-Level Security (RLS)
- **Objective:** Ensure students cannot see each other's grades.
- **Setup:** 
    - Student A has official grades.
    - Student B has no enrollments.
- **Action:** Call `GET /api/student/gpa` as Student B.
- **Expected Result:** 
    - `semesterBreakdown` is empty.
    - No data from Student A is leaked.

## 2. Frontend UI Verification

### Test Case 2.1: Academic Standing Page
- **Objective:** Verify detailed course grades are displayed.
- **Action:** Navigate to `/portal/student/gpa`.
- **Expected Result:** 
    - Each semester card shows a "Course Grades" section.
    - Courses show their Name, Code, and Letter Grade (e.g., "A", "B+").
    - If no official grades exist, shows "No Academic Records".

### Test Case 2.2: Student Dashboard
- **Objective:** Verify "Recently Verified Grades" section.
- **Action:** Navigate to `/portal/student/dashboard`.
- **Expected Result:** 
    - A card titled "Recently Verified Grades" is visible.
    - It shows the top 3 grades from the most recent semester with `OFFICIAL` status.
    - "View All" link redirects to the Academic Standing page.

## 3. Data Integrity

### Test Case 3.1: GPA Accuracy
- **Objective:** Verify `calculateGPA` handles honors and credit hours correctly.
- **Setup:** 
    - Course 1: 3 Credits, Grade A (4.0)
    - Course 2: 4 Credits, Grade B (3.0), Honors (+0.5 = 3.5)
- **Calculation:** `((3 * 4.0) + (4 * 3.5)) / 7` = `(12 + 14) / 7` = `3.71`.
- **Action:** Verify API response for this scenario.
- **Expected Result:** `cumulativeGPA` is `3.71`.
