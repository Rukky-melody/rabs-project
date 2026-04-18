// Gatekeeper: Redirect if no Staff ID is found
if (!localStorage.getItem('currentStaffId')) {
    window.location.href = 'login.html';
}

// ... rest of your upload logic

// Spreadsheet table management
const defaultSubjects = ["Mathematics", "English Language", "Civic Education", "Biology", "Chemistry"];
const tbody = document.getElementById('subjectsBody');

function createRow(subject = "") {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="padding: 10px;">
            <input type="text" class="subject-input" value="${subject}" placeholder="Subject Name" required style="width: 100%; border: 1px solid var(--border); padding: 8px; border-radius: 4px; background: transparent; color: var(--text);">
        </td>
        <td style="padding: 10px;">
            <input type="number" class="ca-input" placeholder="0-30" min="0" max="30" style="width: 100%; border: 1px solid var(--border); padding: 8px; border-radius: 4px; background: transparent; color: var(--text);">
        </td>
        <td style="padding: 10px;">
            <input type="number" class="exam-input" placeholder="0-70" min="0" max="70" style="width: 100%; border: 1px solid var(--border); padding: 8px; border-radius: 4px; background: transparent; color: var(--text);">
        </td>
        <td style="padding: 10px; text-align: center;">
            <button type="button" class="remove-row-btn" style="color: var(--error); background: transparent; border: none; cursor: pointer; font-size: 1.2rem; outline: none;">&times;</button>
        </td>
    `;
    
    tr.querySelector('.remove-row-btn').addEventListener('click', () => tr.remove());
    return tr;
}

if (tbody) {
    defaultSubjects.forEach(sub => tbody.appendChild(createRow(sub)));
    document.getElementById('addRowBtn').addEventListener('click', () => {
        tbody.appendChild(createRow(""));
    });
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const studentFullName = document.getElementById('studentFullName').value;
    const term = document.getElementById('term').value;
    
    const rows = document.querySelectorAll('#subjectsBody tr');
    const scores = [];
    const subjectsSet = new Set();
    let hasDuplicate = false;
    
    rows.forEach(row => {
        const subject = row.querySelector('.subject-input').value.trim();
        const caScore = row.querySelector('.ca-input').value;
        const examScore = row.querySelector('.exam-input').value;
        
        if (subject && (caScore !== "" || examScore !== "")) {
            const lowerSub = subject.toLowerCase();
            if (subjectsSet.has(lowerSub)) {
                hasDuplicate = true;
            }
            subjectsSet.add(lowerSub);
            
            scores.push({
                subject,
                caScore: caScore ? parseFloat(caScore) : 0,
                examScore: examScore ? parseFloat(examScore) : 0
            });
        }
    });

    if (hasDuplicate) {
        alert("Duplicate subjects detected! You cannot enter the same subject twice in one upload.");
        return;
    }

    if(scores.length === 0) {
        alert("Please enter scores for at least one subject!");
        return;
    }

    const payload = { studentId, studentFullName, term, scores };

    const response = await fetch('/api/staff/upload-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.success) {
        alert("Batch results successfully posted!");
        document.getElementById('uploadForm').reset();
        if (tbody) {
            tbody.innerHTML = '';
            defaultSubjects.forEach(sub => tbody.appendChild(createRow(sub)));
        }
    } else {
        alert("Error: " + data.message);
    }
});

// Update your logout function to look like this:
window.logout = function() {
    localStorage.clear();
    window.location.href = 'login.html';
};