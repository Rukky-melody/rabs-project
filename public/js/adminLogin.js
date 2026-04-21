document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const staffId = document.getElementById('staffId').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/staff/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ staffId, password })
                });

                const data = await response.json();

                if (data.success) {
                    // Critical Check: Ensure this person is actually an Admin
                    if (data.role === 'admin') {
                        localStorage.setItem('currentStaffId', data.staffId);
                        localStorage.setItem('staffRole', data.role);
                        localStorage.setItem('staffName', data.staffName || 'Admin');
                        window.location.href = 'reg.html';
                    } else {
                        alert("Access Denied: You do not have Administrative privileges.");
                    }
                } else {
                    alert("Login Failed: " + data.message);
                }
            } catch (err) {
                console.error("Login error:", err);
                alert("Server error. Please check your connection.");
            }
        });
    }
});