document.getElementById('regForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect data from the form
    const data = {
        name: document.getElementById('name').value,
        dob: document.getElementById('dob').value,
        className: document.getElementById('className').value
    };

    try {
        const response = await fetch('/api/student/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            // Hide the form and show the generated ID
            document.getElementById('regForm').style.display = 'none';
            document.getElementById('resultArea').style.display = 'block';
            document.getElementById('displayId').innerText = result.studentId;
        } else {
            alert("Registration failed: " + (result.message || "Unknown error"));
        }
    } catch (err) {
        console.error("Registration Error:", err);
        alert("Server is currently unreachable. Please try again later.");
    }
});