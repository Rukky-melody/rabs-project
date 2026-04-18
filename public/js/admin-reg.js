// 1. First, run the Gatekeeper immediately
if (!localStorage.getItem('currentStaffId')) {
    window.location.href = '../teacher/login.html'; 
}

// 2. Wrap the rest in a DOMContentLoaded listener to prevent the "null" error
document.addEventListener('DOMContentLoaded', () => {
    const adminRegForm = document.getElementById('adminRegForm');

    // Extra safety: Only add the listener if the form is actually on this page
    if (adminRegForm) {
        adminRegForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const payload = {
                staffId: document.getElementById('staffId').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value
            };

            try {
                const response = await fetch('/api/admin/register-staff', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (data.success) {
                    alert("New Staff Member Registered!");
                    adminRegForm.reset();
                } else {
                    alert("Error: " + data.message);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                alert("Server connection failed.");
            }
        });
    }
});