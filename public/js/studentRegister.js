// Live photo preview
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');

if (photoInput) {
    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

document.getElementById('regForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = 'Registering...';
    btn.disabled = true;

    // Use FormData to support file upload
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('dob', document.getElementById('dob').value);
    formData.append('className', document.getElementById('className').value);

    const photoFile = document.getElementById('photoInput').files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    try {
        const response = await fetch('/api/student/register', {
            method: 'POST',
            body: formData  // No Content-Type header — browser sets it with boundary
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('regForm').style.display = 'none';
            document.getElementById('resultArea').style.display = 'block';
            document.getElementById('displayId').innerText = result.studentId;
        } else {
            alert("Registration failed: " + (result.message || "Unknown error"));
            btn.textContent = 'Register & Generate ID';
            btn.disabled = false;
        }
    } catch (err) {
        console.error("Registration Error:", err);
        alert("Server is currently unreachable. Please try again later.");
        btn.textContent = 'Register & Generate ID';
        btn.disabled = false;
    }
});