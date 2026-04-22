# Software Requirements Specification (SRS) - RABS

**Project Name**: RABS (Result & Academic Broadcast System)  
**Version**: 1.0.0  
**Status**: Development / Production Ready

---

## 1. Project Overview
RABS is a comprehensive academic management platform designed to streamline the processing, storage, and broadcasting of student results. It provides a multi-portal environment for Students, Teachers, and Administrators to interact with academic data in a secure and efficient manner.

### 1.1 Objectives
*   To digitize academic record-keeping.
*   To provide students with instant access to their academic report sheets.
*   To simplify the result upload process for teachers through manual and batch entry.
*   To ensure data integrity through strict role-based access control.

---

## 2. System Architecture
The application follows a modern client-server architecture:

*   **Frontend**: Hosted on **Vercel**. Built using HTML5, Vanilla CSS3 (custom design system), and JavaScript (ES6+).
*   **Backend**: Hosted on **Render**. Built with Node.js and Express.js.
*   **Database**: Cloud-hosted MySQL (via **Aiven**).
*   **File Storage**: **Cloudinary** is used for student profile pictures and other assets.

---

## 3. User Roles & Portals

### 3.1 Student Portal
*   **Registration**: Students can register themselves to generate a unique Student ID.
*   **Profile Management**: Students can upload and update their profile pictures.
*   **Result Viewing**: Access to a formal "Academic Report Sheet" optimized for A4 printing.
*   **Historical Access**: View results by Term and Session.

### 3.2 Teacher Portal
*   **Result Upload**: Manual entry of scores for Test (30%) and Exams (70%).
*   **Batch Management**: Predefined subjects are automatically populated for each class.
*   **Metadata Entry**: Teachers can record attendance, behavioral traits (Affective Domain), and psychomotor skills.
*   **Comments**: Teachers and Principals can add personalized comments to report sheets.

### 3.3 Admin Portal
*   **Staff Management**: Creation and management of Teacher and Admin accounts.
*   **System Oversight**: Global view of the system status and user logs.

---

## 4. Database Schema
The system uses a relational database with the following primary tables:

*   **`staff`**: Stores credentials and roles for teachers and admins.
*   **`students`**: Stores basic student details and unique generated IDs.
*   **`results`**: Stores subject-specific scores (CA, Exam, Average) linked to students.
*   **`report_metadata`**: Stores term-specific data like attendance, comments, and traits (JSON format).

---

## 5. Technical Specifications

### 5.1 Design System
*   **Theme**: Dark mode by default with custom CSS variables for easy skinning.
*   **Responsiveness**: Mobile-first design ensures accessibility on smartphones, tablets, and desktops.
*   **Print Optimization**: Specific CSS `@media print` rules for the Academic Report Sheet to ensure professional quality on paper.

### 5.2 Security
*   **Authentication**: Password hashing for staff accounts.
*   **Validation**: Frontend and backend validation for score limits (0-30 for Test, 0-70 for Exam).
*   **Data Integrity**: Foreign key constraints and unique keys to prevent duplicate entries.

### 5.3 Key Dependencies
*   `express`: Web server framework.
*   `mysql2`: Database driver.
*   `cloudinary`: Image management.
*   `dotenv`: Environment variable management.

---

## 6. Deployment Workflow
1.  **Local Development**: Code is written and tested locally.
2.  **Version Control**: Pushed to GitHub.
3.  **CI/CD**:
    *   **Frontend**: Automatically deployed to Vercel upon push to `main`.
    *   **Backend**: Automatically redeployed on Render.
    *   **Database**: Persists on Aiven cloud.

---

## 7. Future Enhancements
*   Automated email notifications for results.
*   Graphical performance analytics for students.
*   Parent/Guardian login portal.
