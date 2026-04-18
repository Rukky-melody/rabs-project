// Gatekeeper: Redirect if no Staff ID is found
if (!localStorage.getItem('currentStaffId')) {
    window.location.href = 'login.html';
}

// ... rest of your upload logic

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        studentId: document.getElementById('studentId').value,
        studentFullName: document.getElementById('studentFullName').value,
        subject: document.getElementById('subject').value,
        caScore: document.getElementById('caScore').value,
        examScore: document.getElementById('examScore').value,
        term: document.getElementById('term').value
    };

    const response = await fetch('/api/staff/upload-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.success) {
        alert("Result successfully posted!");
        document.getElementById('uploadForm').reset();
    } else {
        alert("Error: " + data.message);
    }
});
// ... existing upload logic ...

// Update your logout function to look like this:
window.logout = function() {
    localStorage.clear();
    window.location.href = 'login.html';
};