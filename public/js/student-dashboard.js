// Gatekeeper: redirect if not logged in
const studentId   = localStorage.getItem('currentStudentId');
const studentName = localStorage.getItem('studentName');
const studentClass = localStorage.getItem('studentClass') || 'N/A';
const studentPhoto = localStorage.getItem('studentPhoto') || '';

if (!studentId) {
    window.location.href = 'login.html';
}

// Populate the side drawer
const drawerNameEl = document.getElementById('drawerName');
const drawerIdEl   = document.getElementById('drawerId');
if (drawerNameEl) drawerNameEl.textContent = studentName || 'Student';
if (drawerIdEl)   drawerIdEl.textContent   = studentId || '';

// ── Photo display ──
function applyPhoto(url) {
    const drawerPhoto = document.getElementById('drawerPhoto');
    const reportPhoto = document.getElementById('reportPhoto');
    if (url) {
        if (drawerPhoto) drawerPhoto.innerHTML = `<img src="${url}" alt="Student Photo">`;
        if (reportPhoto) reportPhoto.innerHTML = `<img src="${url}" alt="Student Photo" style="width:100%;height:100%;object-fit:cover;">`;
    } else {
        // No photo — show upload button in drawer
        const uploadBtn = document.getElementById('drawerUploadBtn');
        if (uploadBtn) uploadBtn.style.display = 'flex';
    }
}
applyPhoto(studentPhoto);

// ── One-time upload for existing users ──
const drawerPhotoInput = document.getElementById('drawerPhotoInput');
if (drawerPhotoInput) {
    drawerPhotoInput.addEventListener('change', async () => {
        const file = drawerPhotoInput.files[0];
        if (!file) return;

        const uploadBtn = document.getElementById('drawerUploadBtn');
        uploadBtn.textContent = 'Uploading...';
        uploadBtn.disabled = true;

        const formData = new FormData();
        formData.append('photo', file);
        formData.append('studentId', studentId);

        try {
            const res = await fetch('/api/student/upload-photo', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('studentPhoto', data.photoUrl);
                applyPhoto(data.photoUrl);
                uploadBtn.style.display = 'none';
            } else {
                alert(data.message);
                uploadBtn.innerHTML = '<i class="fa-solid fa-camera"></i> Upload Photo';
                uploadBtn.disabled = false;
            }
        } catch (err) {
            alert('Upload failed. Please try again.');
            uploadBtn.innerHTML = '<i class="fa-solid fa-camera"></i> Upload Photo';
            uploadBtn.disabled = false;
        }
    });
}

const affectiveTraitsList = ["Honesty", "Cleanliness", "Punctuality", "Attentiveness", "Carefulness", "Considerate", "Politeness", "Obedience", "Promptness"];
const psychomotorTraitsList = ["Track Events", "Field Events", "Sings Alone", "Dance to beat", "Drawing and Painting"];

// Grade helper based on image
function getGrade(total) {
    if (total >= 80) return { grade: 'A', remark: 'EXCELLENT' };
    if (total >= 70) return { grade: 'B', remark: 'VERY GOOD' };
    if (total >= 60) return { grade: 'C', remark: 'GOOD' };
    if (total >= 50) return { grade: 'D', remark: 'FAIR' };
    if (total >= 40) return { grade: 'E', remark: 'POOR' };
    return              { grade: 'F', remark: 'VERY POOR' };
}

async function fetchResults(term = 'First Term') {
    const loadingState = document.getElementById('loadingState');
    const reportContent = document.getElementById('reportContent');
    const emptyState   = document.getElementById('emptyState');

    loadingState.style.display = 'block';
    reportContent.style.display = 'none';
    emptyState.style.display = 'none';

    try {
        const response = await fetch(`/api/student/my-results/${studentId}`);
        const data     = await response.json();

        loadingState.style.display = 'none';

        if (data.success && data.results && data.results.length > 0) {
            // Filter results by selected term
            const termResults = data.results.filter(r => r.term === term);
            
            if(termResults.length === 0) {
                emptyState.style.display = 'block';
                return;
            }

            // Find metadata for this term
            const metadataArr = data.metadata || [];
            const termMetadata = metadataArr.find(m => m.term === term) || {};

            // --- Populate Header ---
            document.getElementById('displayTerm').innerText = term;
            document.getElementById('displaySession').innerText = termMetadata.session || 'N/A';

            // --- Populate Student Info Block ---
            // Split studentName into Surname and Other names if possible
            const nameParts = (studentName || '').split(' ');
            const surname = nameParts.length > 0 ? nameParts[0] : '--';
            const otherNames = nameParts.slice(1).join(' ') || '--';
            
            document.getElementById('lblSurname').innerText = surname.toUpperCase();
            document.getElementById('lblOtherNames').innerText = otherNames.toUpperCase();
            document.getElementById('lblClass').innerText = termMetadata.class_name || studentClass || '--';
            document.getElementById('lblSex').innerText = termMetadata.sex || '--';
            
            document.getElementById('lblSchoolOpened').innerText = termMetadata.times_school_opened || '--';
            document.getElementById('lblDaysPresent').innerText = termMetadata.days_present || '--';
            document.getElementById('lblDaysAbsent').innerText = termMetadata.days_absent || '--';

            // --- Populate Cognitive Domain ---
            const tbody = document.getElementById('cognitiveBody');
            let totalScore = 0;

            tbody.innerHTML = termResults.map(row => {
                const sum = parseFloat(row.ca_score) + parseFloat(row.exam_score);
                totalScore += sum;
                const { grade, remark } = getGrade(sum);

                return `
                <tr>
                    <td>${row.subject.toUpperCase()}</td>
                    <td>${row.ca_score}</td>
                    <td>${row.exam_score}</td>
                    <td><strong>${sum}</strong></td>
                    <td><strong>${grade}</strong></td>
                    <td>${remark}</td>
                </tr>`;
            }).join('');

            // --- Populate Summary Block ---
            document.getElementById('lblTotalScore').innerText = totalScore.toFixed(2);
            
            // Calculate term averages
            const firstTermResults = data.results.filter(r => r.term === 'First Term');
            const secondTermResults = data.results.filter(r => r.term === 'Second Term');
            const thirdTermResults = data.results.filter(r => r.term === 'Third Term');
            
            const calcAve = (arr) => arr.length > 0 ? (arr.reduce((acc, r) => acc + parseFloat(r.ca_score) + parseFloat(r.exam_score), 0) / arr.length).toFixed(2) + '%' : '0.00%';
            
            document.getElementById('lbl1stTermAve').innerText = calcAve(firstTermResults);
            document.getElementById('lbl2ndTermAve').innerText = calcAve(secondTermResults);
            document.getElementById('lbl3rdTermAve').innerText = calcAve(thirdTermResults);
            
            const currentTermAve = calcAve(termResults);
            document.getElementById('lblClassAverage').innerText = currentTermAve; // Placeholder
            
            const overallNum = parseFloat(currentTermAve);
            document.getElementById('lblOverallGrade').innerText = getGrade(overallNum).grade;

            // --- Populate Behavioral Domains ---
            let affTraitsObj = {};
            let psyTraitsObj = {};
            try {
                affTraitsObj = typeof termMetadata.affective_traits === 'string' ? JSON.parse(termMetadata.affective_traits) : (termMetadata.affective_traits || {});
                psyTraitsObj = typeof termMetadata.psychomotor_traits === 'string' ? JSON.parse(termMetadata.psychomotor_traits) : (termMetadata.psychomotor_traits || {});
            } catch(e) {}

            const generateTraitRow = (traitName, scoreObj) => {
                const score = scoreObj[traitName] || 0;
                let cells = '';
                for(let i=5; i>=1; i--) {
                    cells += `<td>${score === i ? '&#10003;' : ''}</td>`; // Checkmark
                }
                return `<tr><td>${traitName}</td>${cells}</tr>`;
            };

            document.getElementById('affectiveBody').innerHTML = affectiveTraitsList.map(t => generateTraitRow(t, affTraitsObj)).join('');
            document.getElementById('psychomotorBody').innerHTML = psychomotorTraitsList.map(t => generateTraitRow(t, psyTraitsObj)).join('');

            // --- Comments ---
            document.getElementById('lblTeacherComment').innerText = termMetadata.teacher_comment || '--';
            document.getElementById('lblPrincipalComment').innerText = termMetadata.principal_comment || '--';

            reportContent.style.display = 'block';
        } else {
            emptyState.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        loadingState.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.innerHTML = '<p style="color:var(--error);">Failed to load results. Please try again.</p>';
    }
}

document.getElementById('termSelector').addEventListener('change', (e) => {
    fetchResults(e.target.value);
});

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Initial fetch
fetchResults('First Term');