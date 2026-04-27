document.getElementById('teacherLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const staffId = document.getElementById('staffId').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/api/staff/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staffId, password })
            });

            const data = await response.json();
            if (data.success && data.role === 'teacher') {
                localStorage.setItem('currentStaffId', staffId);
                localStorage.setItem('staffName', data.staffName || 'Teacher');
                localStorage.setItem('assignedClass', data.assignedClass || '');
                window.location.href = 'upload.html';
            } else {
                alert("Invalid Credentials or Access Level");
            }
        });