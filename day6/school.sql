-- Day 6: School database
-- SQLite-compatible setup and sample queries.
PRAGMA foreign_keys = ON;

-- Remove existing tables so this script can be rerun safely.
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE,
    teacher_name TEXT NOT NULL
);

CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade REAL NOT NULL CHECK (grade >= 0 AND grade <= 100),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    UNIQUE (student_id, course_id)
);

-- Sample students
INSERT INTO students (student_id, full_name, email) VALUES
    (1, 'Amina Otieno', 'amina.otieno@example.com'),
    (2, 'Brian Kamau', 'brian.kamau@example.com'),
    (3, 'Chao Mwangi', 'chao.mwangi@example.com'),
    (4, 'Diana Wanjiku', 'diana.wanjiku@example.com');

-- Sample courses
INSERT INTO courses (course_id, course_name, teacher_name) VALUES
    (1, 'Web Development', 'Ms. Njeri'),
    (2, 'Database Systems', 'Mr. Otieno'),
    (3, 'Computer Networks', 'Dr. Kamau');

-- Sample enrolments: Diana has no enrolments and Computer Networks has no students.
INSERT INTO enrolments (enrolment_id, student_id, course_id, grade) VALUES
    (1, 1, 1, 88),
    (2, 1, 2, 91),
    (3, 2, 1, 76),
    (4, 3, 2, 85),
    (5, 3, 1, 90);

-- Query 1: All courses taken by one student, selected by name.
SELECT s.full_name AS student_name,
       c.course_name,
       e.grade
FROM students AS s
JOIN enrolments AS e ON e.student_id = s.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE s.full_name = 'Amina Otieno'
ORDER BY c.course_name;

-- Query 2: All students enrolled on one course.
SELECT c.course_name,
       s.full_name AS student_name,
       e.grade
FROM courses AS c
JOIN enrolments AS e ON e.course_id = c.course_id
JOIN students AS s ON s.student_id = e.student_id
WHERE c.course_name = 'Web Development'
ORDER BY s.full_name;

-- Query 3: Number of students per course, including courses with zero enrolments.
SELECT c.course_name,
       COUNT(e.student_id) AS student_count
FROM courses AS c
LEFT JOIN enrolments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name
ORDER BY c.course_name;

-- Query 4: Students who have no enrolments.
SELECT s.student_id,
       s.full_name,
       s.email
FROM students AS s
LEFT JOIN enrolments AS e ON e.student_id = s.student_id
WHERE e.student_id IS NULL
ORDER BY s.full_name;

-- Query 5: Update one student's grade for one course, then verify it.
UPDATE enrolments
SET grade = 93
WHERE student_id = (
    SELECT student_id FROM students WHERE full_name = 'Amina Otieno'
)
AND course_id = (
    SELECT course_id FROM courses WHERE course_name = 'Database Systems'
);

SELECT s.full_name AS student_name,
       c.course_name,
       e.grade
FROM enrolments AS e
JOIN students AS s ON s.student_id = e.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE s.full_name = 'Amina Otieno'
  AND c.course_name = 'Database Systems';
