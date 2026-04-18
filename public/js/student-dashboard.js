// Gatekeeper: redirect if not logged in
const studentId   = localStorage.getItem('currentStudentId');
const studentName = localStorage.getItem('studentName');

if (!studentId) {
    window.location.href = 'login.html';
}

// Populate welcome message and info row
document.getElementById('welcomeMsg').innerText = `Welcome, ${studentName || 'Student'}!`;

const metaEl = document.getElementById('studentMeta');
if (metaEl) {
    metaEl.innerHTML = `
        <div class="info-item">
            <span class="info-label">Student ID</span>
            <span class="info-value">${studentId}</span>
        </div>`;
}

// Grade helper
function getGrade(total) {
    if (total >= 70) return { grade: 'A', cls: 'badge-success',  remark: 'Excellent' };
    if (total >= 60) return { grade: 'B', cls: 'badge-info',     remark: 'Very Good' };
    if (total >= 50) return { grade: 'C', cls: 'badge-warning',  remark: 'Good'      };
    if (total >= 40) return { grade: 'D', cls: 'badge-primary',  remark: 'Fair'      };
    return              { grade: 'F', cls: 'badge-error',    remark: 'Fail'      };
}

async function fetchResults() {
    const spinner        = document.getElementById('loadingSpinner');
    const resultsSection = document.getElementById('resultsSection');
    const emptyState     = document.getElementById('emptyState');

    try {
        const response = await fetch(`/api/student/my-results/${studentId}`);
        const data     = await response.json();

        if (spinner) spinner.style.display = 'none';

        if (data.success && data.results && data.results.length > 0) {
            const tbody = document.getElementById('resultsBody');
            let totalScore = 0;

            tbody.innerHTML = data.results.map(row => {
                const sum = parseFloat(row.ca_score) + parseFloat(row.exam_score);
                totalScore += sum;
                const { grade, cls, remark } = getGrade(sum);

                return `
                <tr>
                    <td>${row.subject}</td>
                    <td>${row.ca_score}</td>
                    <td>${row.exam_score}</td>
                    <td><strong>${sum}</strong></td>
                    <td><span class="badge ${cls}">${grade}</span></td>
                    <td>${remark}</td>
                    <td>${row.term}</td>
                </tr>`;
            }).join('');

            const avg = (totalScore / data.results.length).toFixed(2);
            document.getElementById('overallAverage').innerText = avg;

            if (resultsSection) resultsSection.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'block';
        }
    } catch (err) {
        if (spinner) spinner.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            emptyState.innerHTML = '<p style="color:var(--error);">Failed to load results. Please try again.</p>';
        }
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

fetchResults();