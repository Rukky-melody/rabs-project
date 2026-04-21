document.getElementById('studentLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('studentId').value;

    const response = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
    });

    const data = await response.json();
    if (data.success) {
        localStorage.setItem('currentStudentId', studentId);
        localStorage.setItem('studentName', data.student.student_name);
        localStorage.setItem('studentClass', data.student.class_name || '');
        localStorage.setItem('studentPhoto', data.student.photo_url || '');
        window.location.href = 'dashboard.html';
    } else {
        alert(data.message);
    }
});