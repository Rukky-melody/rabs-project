// Gatekeeper: redirect if not logged in as admin
if (!localStorage.getItem('currentStaffId')) {
    window.location.href = '../teacher/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const adminRegForm = document.getElementById('adminRegForm');
    const regMsg       = document.getElementById('regMsg');
    const submitBtn    = document.getElementById('submitBtn');

    function showMsg(message, type = 'error') {
        const colorMap = {
            error:   'alert-error',
            success: 'alert-success',
            info:    'alert-info'
        };
        regMsg.innerHTML = `<div class="alert ${colorMap[type]}">${message}</div>`;
    }

    if (adminRegForm) {
        adminRegForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            regMsg.innerHTML = '';

            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
            submitBtn.disabled = true;

            const payload = {
                staffId:  document.getElementById('staffId').value.trim(),
                password: document.getElementById('password').value,
                role:     document.getElementById('role').value
            };

            try {
                const response = await fetch('/api/admin/register-staff', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(payload)
                });

                const data = await response.json();

                if (data.success) {
                    showMsg(`<i class="fa-solid fa-circle-check"></i> Staff member <strong>${payload.staffId}</strong> registered successfully!`, 'success');
                    adminRegForm.reset();
                } else {
                    showMsg(`<i class="fa-solid fa-circle-xmark"></i> ${data.message || 'Registration failed.'}`, 'error');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                showMsg('<i class="fa-solid fa-wifi"></i> Server connection failed. Please try again.', 'error');
            } finally {
                submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
                submitBtn.disabled = false;
            }
        });
    }
});