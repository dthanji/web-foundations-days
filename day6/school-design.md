# School Database Design

## Tables

- **`students`** stores each student using `student_id` as its primary key, alongside a required name and a required email. The `UNIQUE` constraint prevents two students from sharing the same email.
- **`courses`** stores each course using `course_id` as its primary key. The course name and teacher name are required; the course name is also unique.
- **`enrolments`** records a student's participation in a course. Each row has its own primary key, required foreign keys to a student and a course, and a required grade constrained to the range 0–100. The unique pair `(student_id, course_id)` prevents duplicate enrolments for the same student and course.

## Relationships

One student can have many enrolments, so **students to enrolments is one-to-many**. Likewise, one course can have many enrolments, so **courses to enrolments is one-to-many**.

Students and courses therefore have a **many-to-many relationship**: a student may take several courses, and each course may contain several students. The `enrolments` join table represents each student–course pairing and stores facts specific to that pairing, such as the grade. Without it, the design would either repeat course/student details or struggle to represent multiple courses per student cleanly.

## Index

I would add an index on `enrolments(course_id)` to speed up queries that list students on a course and count enrolments per course. SQLite may already create indexes for primary keys and unique constraints, but the foreign-key column `course_id` benefits from its own index for these common lookups.

```sql
CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);
```

## SQL or NoSQL?

I would choose a **relational SQL database** for this school system. Students, courses, enrolments, and grades have clear relationships and rules that must remain consistent. SQL supports primary keys, foreign keys, unique constraints, transactions, and joins, making it a good fit for preventing duplicate enrolments and querying grades reliably. A document-oriented NoSQL database could work, but the many-to-many relationship and need for referential integrity make a relational design simpler and safer for this use case.
