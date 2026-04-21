// Gatekeeper: Redirect if no Staff ID is found
const currentStaffId = localStorage.getItem('currentStaffId');
const currentStaffName = localStorage.getItem('staffName') || 'Teacher';

if (!currentStaffId) {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const welcomeEl = document.getElementById('teacherWelcome');
    if (welcomeEl) {
        welcomeEl.innerHTML = `Logged in as: <strong>${currentStaffName}</strong> (${currentStaffId})`;
    }
});

// Spreadsheet table management
const defaultSubjects = ["Mathematics", "English Language", "Civic Education", "Biology", "Chemistry"];
const tbody = document.getElementById('subjectsBody');

// Traits data
const affectiveTraits = ["Honesty", "Cleanliness", "Punctuality", "Attentiveness", "Carefulness", "Considerate", "Politeness", "Obedience", "Promptness"];
const psychomotorTraits = ["Track Events", "Field Events", "Sings Alone", "Dance to beat", "Drawing and Painting"];

function renderTraits(containerId, traits) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    traits.forEach(trait => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        
        let radios = '';
        for (let i = 1; i <= 5; i++) {
            radios += `<label style="display:inline-flex; align-items:center; gap:2px;"><input type="radio" name="${trait}" value="${i}"> ${i}</label>`;
        }
        
        div.innerHTML = `<span style="width: 150px;">${trait}</span> <div style="display:flex; gap:10px;">${radios}</div>`;
        container.appendChild(div);
    });
}

renderTraits('affectiveTraitsContainer', affectiveTraits);
renderTraits('psychomotorTraitsContainer', psychomotorTraits);

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
            <button type="button" class="remove-row-btn" style="color: var(--error); background: transparent; border: none; cursor: pointer; font-size: 1.1rem; outline: none;"><i class="fa-solid fa-delete-left"></i></button>
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
    const studentSex = document.getElementById('studentSex').value;
    const studentClass = document.getElementById('studentClass').value;
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

    // Collect Metadata
    const affectiveResults = {};
    affectiveTraits.forEach(trait => {
        const checked = document.querySelector(`input[name="${trait}"]:checked`);
        affectiveResults[trait] = checked ? parseInt(checked.value) : 0;
    });

    const psychomotorResults = {};
    psychomotorTraits.forEach(trait => {
        const checked = document.querySelector(`input[name="${trait}"]:checked`);
        psychomotorResults[trait] = checked ? parseInt(checked.value) : 0;
    });

    const metadata = {
        sex: studentSex,
        studentClass: studentClass,
        session: document.getElementById('session').value || '',
        timesSchoolOpened: parseInt(document.getElementById('timesSchoolOpened').value) || 0,
        daysPresent: parseInt(document.getElementById('daysPresent').value) || 0,
        daysAbsent: parseInt(document.getElementById('daysAbsent').value) || 0,
        teacherComment: document.getElementById('teacherComment').value || '',
        principalComment: document.getElementById('principalComment').value || '',
        uploadedBy: currentStaffName,
        uploadedById: currentStaffId,
        affectiveTraits: affectiveResults,
        psychomotorTraits: psychomotorResults
    };

    const payload = { studentId, studentFullName, term, scores, metadata };

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

// ─── Manage / Delete Results Panel ────────────────────────────
function showManageMsg(msg, isError = false) {
    const el = document.getElementById('manageMsg');
    el.innerHTML = `<p style="color:${isError ? 'var(--error)' : 'var(--success, #22c55e)'}; margin-bottom:0.5rem;">${msg}</p>`;
}

async function loadResults() {
    const studentId = document.getElementById('manageStudentId').value.trim();
    const term = document.getElementById('manageTerm').value;
    if (!studentId) { showManageMsg('Please enter a Student ID.', true); return; }

    const res = await fetch(`/api/staff/results/${encodeURIComponent(studentId)}/${encodeURIComponent(term)}`);
    const data = await res.json();

    const container = document.getElementById('manageTableContainer');
    const tbody = document.getElementById('manageResultsBody');

    if (!data.success || data.results.length === 0) {
        container.style.display = 'none';
        showManageMsg('No results found for this student and term.', true);
        return;
    }

    showManageMsg(`Loaded ${data.results.length} result(s) for ${term}.`);
    tbody.innerHTML = '';

    data.results.forEach(row => {
        const total = parseFloat(row.ca_score) + parseFloat(row.exam_score);
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border)';
        tr.innerHTML = `
            <td style="padding:10px;">${row.subject}</td>
            <td style="padding:10px;">${row.ca_score}</td>
            <td style="padding:10px;">${row.exam_score}</td>
            <td style="padding:10px;"><strong>${total}</strong></td>
            <td style="padding:10px; text-align:center;">
                <button data-id="${row.id}" class="delete-row-btn" style="color:var(--error); background:transparent; border:none; cursor:pointer; font-size:1.1rem;"><i class="fa-solid fa-delete-left"></i></button>
            </td>
        `;
        tr.querySelector('.delete-row-btn').addEventListener('click', async () => {
            if (!confirm(`Delete "${row.subject}" from ${term}?`)) return;
            const delRes = await fetch(`/api/staff/result/${row.id}`, { method: 'DELETE' });
            const delData = await delRes.json();
            if (delData.success) { tr.remove(); showManageMsg(`"${row.subject}" deleted.`); }
            else showManageMsg(delData.message, true);
        });
        tbody.appendChild(tr);
    });

    container.style.display = 'block';
}

document.getElementById('loadResultsBtn').addEventListener('click', loadResults);

document.getElementById('deleteTermBtn').addEventListener('click', async () => {
    const studentId = document.getElementById('manageStudentId').value.trim();
    const term = document.getElementById('manageTerm').value;
    if (!studentId) { showManageMsg('Please enter a Student ID.', true); return; }
    if (!confirm(`⚠️ Delete ALL ${term} results for student "${studentId}"? This cannot be undone!`)) return;

    const res = await fetch(`/api/staff/results/${encodeURIComponent(studentId)}/${encodeURIComponent(term)}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
        showManageMsg(data.message);
        document.getElementById('manageTableContainer').style.display = 'none';
        document.getElementById('manageResultsBody').innerHTML = '';
    } else {
        showManageMsg(data.message, true);
    }
});

// ─────────────────────────────────────────────────────────────

// Update your logout function to look like this:
window.logout = function() {
    localStorage.clear();
    window.location.href = 'login.html';
};