// Gatekeeper: Redirect if no Staff ID is found
const currentStaffId = localStorage.getItem('currentStaffId');
const currentStaffName = localStorage.getItem('staffName') || 'Teacher';
const assignedClass = localStorage.getItem('assignedClass') || 'Basic 1-5';

if (!currentStaffId) {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const welcomeEl = document.getElementById('teacherWelcome');
    if (welcomeEl) {
        welcomeEl.innerHTML = `Logged in as: <strong>${currentStaffName}</strong> (${currentStaffId}) - Class: <strong>${assignedClass}</strong>`;
    }
    
    // Auto-select class if possible
    const classSelect = document.getElementById('studentClass');
    if (classSelect) {
        // Try to find matching option
        let found = false;
        for (let i = 0; i < classSelect.options.length; i++) {
            if (classSelect.options[i].value === assignedClass) {
                classSelect.selectedIndex = i;
                found = true;
                break;
            }
        }
        if (!found) {
            // Add it if it doesn't exist
            const opt = document.createElement('option');
            opt.value = assignedClass;
            opt.textContent = assignedClass;
            opt.selected = true;
            classSelect.appendChild(opt);
        }
        classSelect.disabled = true; // Lock it to their assigned class
    }

    renderDynamicForm();
});

// ─── CONFIGURATIONS ─────────────────────────────────────────────

const classConfigs = {
    'crech': {
        type: 'creche',
        categories: [
            { name: "PERSONAL SOCIAL DEVELOPMENT", items: ["Listen attentively", "Listens to others without interruption", "Follows directions", "Works without constant supervision", "Complete tasks", "Takes care of materials", "Expresses self creativity", "Observes, questions explores", "Takes care of personal needs (zipping, e.t.c)", "Takes pride in his/her accomplishments", "Uses appropriate manners", "Shows positive attitude", "Gets along well with other children", "Participates in group activities", "Exercises self-control", "Respects right and properties of others", "Accepts correction"] },
            { name: "PHYSICAL DEVELOPMENT", items: ["Shows small muscle control (painting, coloring, writing, drawing, cutting, assembling puzzles)", "Physical Education Skills - Shows large muscle control (runs, jumps, hops, throws, catches)", "Physical Education Conducts"] },
            { name: "MUSIC", items: ["Music skills", "Music conducts"] },
            { name: "TECHNOLOGY", items: ["Computer skills"] },
            { name: "SKILLS DEVELOPMENT - SPEAKING/LISTENING", items: ["Can say full name", "Can say address", "Can say phone number", "Recognizes name"] },
            { name: "SKILLS DEVELOPMENT - WRITING", items: ["Can print name", "Establishes relationship between picture and print", "Writes 1 or 2 thoughts sentences focused on topic", "Understands /explains own writing", "Uses invented spellings generally readable by others", "Writes some sights words correctly", "Uses some correct capital letters & spelling", "Writes most letters of the alphabet"] },
            { name: "SKILLS DEVELOPMENT - LANGUAGE READING", items: ["Can recite the alphabet in order", "Can identify rhyming words", "Can identify most beginning sounds in words", "Recognizes basic sight words", "Understands concepts of print", "Demonstrates sense of story", "Can read simple texts"] },
            { name: "SKILLS DEVELOPMENT - MATHEMATICS", items: ["Understands number values from 0 up to", "Understands meaning of more, less and equal", "Understands directional/positional words", "Can rote count from 1 up to", "Understands calendar time including:", "Can create and extend patterns", "Can sort and classify objects"] }
        ]
    },
    'Pre-nursery': {
        type: 'prenursery',
        subjects: ["NUMBER WORK", "LETTER WORK", "COLOUR WORK", "WRITING", "MUSICH AND MOVEMENT", "SOCIAL SKILL", "EMOTIONAL INTELLIGENCE", "STORY TELLING"],
        observationTraits: ["Honesty", "Punctuality", "Cleanliness", "Attentiveness", "Maturity", "Emotional Balance"],
        physicalTraits: []
    },
    'Nursery 1-3': {
        type: 'standard',
        subjects: ["ENGLISH LANGUAGE", "MATHEMATICS", "BASIC SCIENCE", "SOCIAL HABIT", "HEALTH HABIT", "AGRICULTURAL SCIENCE", "QUANTITATIVE REASONING", "VERBAL REASONING", "CHRISTIAN RELIGIOUS", "HAND WRITING", "PHONICS", "CULTURAL AND CREATIVE ART", "COMPUTER STUDIES"],
        observationTraits: ["Honesty", "Leadership", "Punctuality", "Cleanliness", "Attentiveness", "Maturity", "Politeness", "Emotional Balance"],
        physicalTraits: ["Handwriting", "Handwork", "Drama", "Sports", "Ball Game", "Track Event", "Throws", "Jumps"]
    },
    'Basic 1-5': {
        type: 'standard',
        subjects: ["ENGLISH LANGUAGE", "MATHEMATICS", "BASIC SCIENCE", "SOCIAL STUDIES", "HEALTH EDUCATION", "AGRICULTURAL SCIENCE", "QUANTITATIVE REASONING", "VERBAL REASONING", "HOME ECONOMICS", "VOCATIONAL APTITUDE", "SECURITY EDUCATION", "CHRISTIAN RELIGIOUS KNOWLEDGE", "CIVIC EDUCATION", "PHYSICAL HEALTH EDUCATION", "COMPUTER SCIENCE", "CULTURAL & CREATIVE ART", "PHONICS", "HAND WRITING"],
        observationTraits: ["Honesty", "Leadership", "Punctuality", "Cleanliness", "Attentiveness", "Maturity", "Politeness", "Emotional Balance"],
        physicalTraits: ["Handwriting", "Handwork", "Drama", "Sports", "Ball Game", "Track Event", "Throws", "Jumps"]
    },
    'Junior secondary school 1-3': {
        type: 'standard',
        subjects: ["MATHEMATICS", "ENGLISH LANGUAGE", "LITERATURE", "CULTURAL & CREATIVE ART", "CHRISTIAN RELIGIOUS STUDIES", "BUSINESS STUDIES", "BASIC SCIENCE & TECHNOLOGY", "BASIC SCIENCE", "BASIC TECHNOLOGY", "INFORMATION TECHNOLOGY", "PHYSICAL HEALTH EDUCATION", "PREVOCATIONAL STUDIES", "HOME ECONOMICS", "AGRICULTURAL SCIENCE", "NATIONAL VALUE", "SOCIAL STUDIES", "CIVIC EDUCATION", "SECURITY EDUCATION"],
        observationTraits: ["Honesty", "Leadership", "Punctuality", "Cleanliness", "Attentiveness", "Maturity", "Politeness", "Emotional Balance"],
        physicalTraits: []
    }
};

function getConfig() {
    if (!assignedClass) return classConfigs['Basic 1-5'];
    
    const cls = assignedClass.toUpperCase().trim();
    if (cls === 'CRECHE') return classConfigs['crech'];
    if (cls === 'PRE-NURSERY') return classConfigs['Pre-nursery'];
    if (cls.startsWith('NURSERY')) return classConfigs['Nursery 1-3'];
    if (cls.startsWith('BASIC')) return classConfigs['Basic 1-5'];
    if (cls.startsWith('JSS')) return classConfigs['Junior secondary school 1-3'];
    
    return classConfigs['Basic 1-5']; // fallback
}

// ─── RENDERING ─────────────────────────────────────────────

function renderDynamicForm() {
    const container = document.getElementById('dynamicFormContainer');
    if (!container) return;
    
    const config = getConfig();
    let html = `
        <!-- Report Metadata Section -->
        <h3 style="color: var(--text); margin-top: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">Report Metadata</h3>
        
        <div class="form-grid" style="margin-top: 1rem;">
            <div class="form-group">
                <label for="session">Session</label>
                <input type="text" id="session" placeholder="e.g., 2025/2026 Session">
            </div>
            <div class="form-group">
                <label for="age">Age</label>
                <input type="text" id="age" placeholder="e.g. 3 Years">
            </div>
            <div class="form-group">
                <label for="numberInClass">Number in Class</label>
                <input type="number" id="numberInClass" placeholder="20">
            </div>
            <div class="form-group">
                <label for="position">Position in Class</label>
                <input type="text" id="position" placeholder="e.g. 1st">
            </div>
            <div class="form-group">
                <label for="timesSchoolOpened">Times School Opened</label>
                <input type="number" id="timesSchoolOpened" placeholder="114">
            </div>
            <div class="form-group">
                <label for="daysPresent">Days Present</label>
                <input type="number" id="daysPresent" placeholder="112">
            </div>
            <div class="form-group">
                <label for="daysAbsent">Days Absent</label>
                <input type="number" id="daysAbsent" placeholder="4">
            </div>
            <div class="form-group">
                <label for="status">Status</label>
                <input type="text" id="status" placeholder="e.g. Promoted to Nursery 1">
            </div>
            <div class="form-group">
                <label for="endOfTerm">End of Term</label>
                <input type="text" id="endOfTerm" placeholder="e.g. 15th April 2026">
            </div>
            <div class="form-group">
                <label for="nextTermBegins">Next Term Begins</label>
                <input type="text" id="nextTermBegins" placeholder="e.g. 5th May 2026">
            </div>
        </div>
    `;

    if (config.type === 'creche') {
        html += renderCrecheForm(config);
    } else if (config.type === 'prenursery') {
        html += renderPreNurseryForm(config);
    } else {
        html += renderStandardForm(config);
    }

    container.innerHTML = html;

    // Attach event listeners
    if (config.type === 'standard') {
        document.querySelectorAll('.score-input').forEach(input => {
            input.addEventListener('input', calculateStandardTermAverage);
        });
        document.getElementById('addRowBtn')?.addEventListener('click', () => {
            const tbody = document.getElementById('subjectsBody');
            tbody.insertAdjacentHTML('beforeend', getStandardRowHTML(''));
            // Re-attach listeners to new row
            const newRow = tbody.lastElementChild;
            newRow.querySelectorAll('.score-input').forEach(input => input.addEventListener('input', calculateStandardTermAverage));
            newRow.querySelector('.remove-row-btn').addEventListener('click', (e) => {
                e.target.closest('tr').remove();
                calculateStandardTermAverage();
            });
        });
    } else if (config.type === 'prenursery') {
        document.querySelectorAll('.score-input').forEach(input => {
            input.addEventListener('input', calculatePrenurseryGrade);
        });
    }
}

function renderCrecheForm(config) {
    let html = `<h3 style="color: var(--text); margin-top: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">Creche Evaluations (S/N/I/U)</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">S=Satisfactory, N=Needs Improvement, I=Improving, U=Unsatisfactory</p>`;
    
    config.categories.forEach((cat, cIdx) => {
        html += `<h4 style="margin-top:1.5rem; color:var(--primary-light);">${cat.name}</h4>`;
        html += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; color: var(--text);">
            <thead>
                <tr style="border-bottom: 1px solid var(--border); text-align: left;">
                    <th style="padding: 10px;">Item</th>
                    <th style="padding: 10px; width: 60px; text-align:center;">S</th>
                    <th style="padding: 10px; width: 60px; text-align:center;">N</th>
                    <th style="padding: 10px; width: 60px; text-align:center;">I</th>
                    <th style="padding: 10px; width: 60px; text-align:center;">U</th>
                </tr>
            </thead>
            <tbody>`;
        
        cat.items.forEach((item, iIdx) => {
            const radioName = `creche_${cIdx}_${iIdx}`;
            html += `
                <tr style="border-bottom: 1px solid var(--border-light);">
                    <td style="padding: 8px;">${item}</td>
                    <td style="text-align:center;"><input type="radio" name="${radioName}" value="S"></td>
                    <td style="text-align:center;"><input type="radio" name="${radioName}" value="N"></td>
                    <td style="text-align:center;"><input type="radio" name="${radioName}" value="I"></td>
                    <td style="text-align:center;"><input type="radio" name="${radioName}" value="U"></td>
                </tr>
            `;
        });
        html += `</tbody></table>`;
    });
    return html;
}

function renderPreNurseryForm(config) {
    let html = `
    <div style="margin-top: 2rem; margin-bottom: 2rem; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; color: var(--text);">
            <thead>
                <tr style="border-bottom: 1px solid var(--border); text-align: left;">
                    <th style="padding: 10px;">Subjects</th>
                    <th style="padding: 10px; width: 150px;">Assessments (100)</th>
                    <th style="padding: 10px; width: 100px;">Grades</th>
                    <th style="padding: 10px; width: 200px;">Remark</th>
                </tr>
            </thead>
            <tbody id="subjectsBody">`;
    
    config.subjects.forEach(sub => {
        html += `
            <tr class="subject-row">
                <td style="padding: 10px;">
                    <input type="text" class="subject-input" value="${sub}" readonly style="width: 100%; border: none; background: transparent; color: var(--text); font-weight: bold;">
                </td>
                <td style="padding: 10px;">
                    <input type="number" class="score-input first-test-input" placeholder="0-100" min="0" max="100" style="width: 100%; border: 1px solid var(--border); padding: 8px; border-radius: 4px; background: transparent; color: var(--text);">
                </td>
                <td style="padding: 10px;">
                    <strong class="grade-display">-</strong>
                </td>
                <td style="padding: 10px;">
                    <input type="text" class="remark-input" placeholder="Remark" style="width: 100%; border: 1px solid var(--border); padding: 8px; border-radius: 4px; background: transparent; color: var(--text);">
                </td>
            </tr>`;
    });
    html += `</tbody></table></div>`;
    html += renderTraitsSection(config);
    return html;
}

function getStandardRowHTML(sub) {
    return `
        <tr class="subject-row">
            <td style="padding: 10px;">
                <input type="text" class="subject-input" value="${sub}" ${sub ? 'readonly' : 'placeholder="Subject Name"'} style="width: 100%; border: ${sub ? 'none' : '1px solid var(--border)'}; background: transparent; color: var(--text); font-weight: ${sub ? 'bold' : 'normal'};">
            </td>
            <td style="padding: 10px;">
                <input type="number" class="score-input first-test-input" placeholder="0-20" min="0" max="20" style="width: 100%; border: 1px solid var(--border); padding: 8px; border-radius: 4px; background: transparent; color: var(--text);">
            </td>
            <td style="padding: 10px;">
                <input type="number" class="score-input second-test-input" placeholder="0-20" min="0" max="20" style="width: 100%; border: 1px solid var(--border); padding: 8px; border-radius: 4px; background: transparent; color: var(--text);">
            </td>
            <td style="padding: 10px;">
                <input type="number" class="score-input exam-input" placeholder="0-60" min="0" max="60" style="width: 100%; border: 1px solid var(--border); padding: 8px; border-radius: 4px; background: transparent; color: var(--text);">
            </td>
            <td style="padding: 10px;">
                <strong class="total-score-display">0</strong>
            </td>
            <td style="padding: 10px; text-align: center;">
                <button type="button" class="remove-row-btn" style="color: var(--error); background: transparent; border: none; cursor: pointer; font-size: 1.1rem; outline: none; ${sub ? 'display:none;' : ''}"><i class="fa-solid fa-delete-left"></i></button>
            </td>
        </tr>`;
}

function renderStandardForm(config) {
    let html = `
    <div style="margin-top: 2rem; margin-bottom: 2rem; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; color: var(--text);">
            <thead>
                <tr style="border-bottom: 1px solid var(--border); text-align: left;">
                    <th style="padding: 10px;">Subject</th>
                    <th style="padding: 10px; width: 100px;">1st Test (20)</th>
                    <th style="padding: 10px; width: 100px;">2nd Test (20)</th>
                    <th style="padding: 10px; width: 100px;">Exam (60)</th>
                    <th style="padding: 10px; width: 80px;">Total</th>
                    <th style="padding: 10px; width: 50px;"></th>
                </tr>
            </thead>
            <tbody id="subjectsBody">`;
    
    config.subjects.forEach(sub => {
        html += getStandardRowHTML(sub);
    });

    html += `</tbody></table>
        <div id="averageDisplay" style="margin-bottom: 1rem; text-align: right; font-size: 1.1rem; color: var(--text);">
            Term Average: <strong id="termAverage">0.00%</strong>
        </div>
        <button type="button" id="addRowBtn" style="background: transparent; border: 1px dashed var(--border); color: var(--text-muted); padding: 10px; border-radius: 6px; cursor: pointer; width: 100%; text-align: center;">+ Add Extra Subject</button>
    </div>`;

    html += renderTraitsSection(config);
    return html;
}

function renderTraitsSection(config) {
    let html = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">`;
    
    if (config.observationTraits && config.observationTraits.length > 0) {
        html += `<div><h4 style="color: var(--text); margin-bottom: 0.5rem;">Observation & Conduct (1-5)</h4>
                 <div style="display: flex; flex-direction: column; gap: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">`;
        config.observationTraits.forEach(trait => {
            html += `<div style="display:flex; justify-content:space-between;">
                        <span style="width:150px;">${trait}</span>
                        <div style="display:flex; gap:10px;">
                            ${[1,2,3,4,5].map(i => `<label style="display:inline-flex; align-items:center; gap:2px;"><input type="radio" name="obs_${trait}" value="${i}"> ${i}</label>`).join('')}
                        </div>
                     </div>`;
        });
        html += `</div></div>`;
    }

    if (config.physicalTraits && config.physicalTraits.length > 0) {
        html += `<div><h4 style="color: var(--text); margin-bottom: 0.5rem;">Physical Skills (1-5)</h4>
                 <div style="display: flex; flex-direction: column; gap: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">`;
        config.physicalTraits.forEach(trait => {
            html += `<div style="display:flex; justify-content:space-between;">
                        <span style="width:150px;">${trait}</span>
                        <div style="display:flex; gap:10px;">
                            ${[1,2,3,4,5].map(i => `<label style="display:inline-flex; align-items:center; gap:2px;"><input type="radio" name="phy_${trait}" value="${i}"> ${i}</label>`).join('')}
                        </div>
                     </div>`;
        });
        html += `</div></div>`;
    }
    html += `</div>`;
    return html;
}

// ─── CALCULATIONS ─────────────────────────────────────────────

function calculateStandardTermAverage() {
    const rows = document.querySelectorAll('#subjectsBody tr');
    let totalSum = 0;
    let count = 0;
    
    rows.forEach(row => {
        const t1 = parseFloat(row.querySelector('.first-test-input')?.value) || 0;
        const t2 = parseFloat(row.querySelector('.second-test-input')?.value) || 0;
        const exam = parseFloat(row.querySelector('.exam-input')?.value) || 0;
        const total = t1 + t2 + exam;
        
        const totalEl = row.querySelector('.total-score-display');
        if (totalEl) totalEl.textContent = total;
        
        if (t1 > 0 || t2 > 0 || exam > 0) {
            totalSum += total;
            count++;
        }
    });
    
    const avg = count > 0 ? (totalSum / count).toFixed(2) : "0.00";
    const termAvgEl = document.getElementById('termAverage');
    if (termAvgEl) termAvgEl.textContent = avg + "%";
}

function calculatePrenurseryGrade(e) {
    const row = e.target.closest('tr');
    const score = parseFloat(row.querySelector('.first-test-input').value) || 0;
    const gradeEl = row.querySelector('.grade-display');
    
    if (score >= 80) gradeEl.textContent = "A";
    else if (score >= 60) gradeEl.textContent = "B";
    else if (score >= 40) gradeEl.textContent = "C";
    else if (score > 0) gradeEl.textContent = "D";
    else gradeEl.textContent = "-";
}

// ─── SUBMISSION ─────────────────────────────────────────────

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const config = getConfig();
    const studentId = document.getElementById('studentId').value;
    const studentFullName = document.getElementById('studentFullName').value;
    const studentSex = document.getElementById('studentSex').value;
    const studentClass = document.getElementById('studentClass').value; // from hidden or disabled select
    const term = document.getElementById('term').value;
    
    let scores = [];
    let crecheEvaluations = null;
    
    if (config.type === 'creche') {
        crecheEvaluations = {};
        config.categories.forEach((cat, cIdx) => {
            crecheEvaluations[cat.name] = {};
            cat.items.forEach((item, iIdx) => {
                const checked = document.querySelector(`input[name="creche_${cIdx}_${iIdx}"]:checked`);
                crecheEvaluations[cat.name][item] = checked ? checked.value : '';
            });
        });
    } else {
        const rows = document.querySelectorAll('#subjectsBody tr');
        rows.forEach(row => {
            const subject = row.querySelector('.subject-input').value.trim();
            if (!subject) return;

            if (config.type === 'prenursery') {
                const score = row.querySelector('.first-test-input').value;
                const remark = row.querySelector('.remark-input')?.value || '';
                if (score !== "") {
                    scores.push({
                        subject,
                        firstTest: parseFloat(score),
                        secondTest: 0,
                        caScore: 0,
                        examScore: 0,
                        remark: remark
                    });
                }
            } else {
                const t1 = row.querySelector('.first-test-input').value;
                const t2 = row.querySelector('.second-test-input').value;
                const exam = row.querySelector('.exam-input').value;
                
                if (t1 !== "" || t2 !== "" || exam !== "") {
                    scores.push({
                        subject,
                        firstTest: t1 ? parseFloat(t1) : 0,
                        secondTest: t2 ? parseFloat(t2) : 0,
                        caScore: 0,
                        examScore: exam ? parseFloat(exam) : 0
                    });
                }
            }
        });

        if (scores.length === 0) {
            alert("Please enter scores for at least one subject!");
            return;
        }
    }

    // Collect Metadata Traits
    const affectiveResults = {};
    if (config.observationTraits) {
        config.observationTraits.forEach(trait => {
            const checked = document.querySelector(`input[name="obs_${trait}"]:checked`);
            if(checked) affectiveResults[trait] = parseInt(checked.value);
        });
    }

    const psychomotorResults = {};
    if (config.physicalTraits) {
        config.physicalTraits.forEach(trait => {
            const checked = document.querySelector(`input[name="phy_${trait}"]:checked`);
            if(checked) psychomotorResults[trait] = parseInt(checked.value);
        });
    }

    const metadata = {
        sex: studentSex,
        studentClass: studentClass,
        session: document.getElementById('session').value || '',
        age: document.getElementById('age').value || '',
        numberInClass: parseInt(document.getElementById('numberInClass').value) || 0,
        position: document.getElementById('position').value || '',
        timesSchoolOpened: parseInt(document.getElementById('timesSchoolOpened').value) || 0,
        daysPresent: parseInt(document.getElementById('daysPresent').value) || 0,
        daysAbsent: parseInt(document.getElementById('daysAbsent').value) || 0,
        status: document.getElementById('status').value || '',
        endOfTerm: document.getElementById('endOfTerm').value || '',
        nextTermBegins: document.getElementById('nextTermBegins').value || '',
        teacherComment: document.getElementById('teacherComment').value || '',
        principalComment: document.getElementById('principalComment').value || '',
        uploadedBy: currentStaffName,
        uploadedById: currentStaffId,
        affectiveTraits: affectiveResults,
        psychomotorTraits: psychomotorResults,
        crecheEvaluations: crecheEvaluations
    };

    const payload = { studentId, studentFullName, term, scores, metadata };

    // Update submit button text to show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Posting...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/staff/upload-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.success) {
            alert("Results successfully posted!");
            // Reset numerical inputs and radios, leave text inputs
            document.querySelectorAll('.score-input').forEach(inp => inp.value = '');
            document.querySelectorAll('input[type="radio"]').forEach(inp => inp.checked = false);
            if(document.getElementById('termAverage')) document.getElementById('termAverage').textContent = '0.00%';
            document.querySelectorAll('.total-score-display').forEach(el => el.textContent = '0');
            document.querySelectorAll('.grade-display').forEach(el => el.textContent = '-');
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        alert("Network error.");
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
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

    if (!data.success || (data.results.length === 0 && (!data.metadata || data.metadata.length === 0))) {
        container.style.display = 'none';
        showManageMsg('No results found for this student and term.', true);
        return;
    }

    showManageMsg(`Loaded ${data.results.length} result(s)${data.metadata && data.metadata.length > 0 ? ' (plus metadata)' : ''} for ${term}.`);
    tbody.innerHTML = '';

    let totalSum = 0;
    data.results.forEach(row => {
        // Calculate total regardless of schema version
        const t1 = parseFloat(row.first_test) || 0;
        const t2 = parseFloat(row.second_test) || 0;
        const ca = parseFloat(row.ca_score) || 0;
        const ex = parseFloat(row.exam_score) || 0;
        const total = t1 + t2 + ca + ex;
        
        totalSum += total;
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border)';
        tr.innerHTML = `
            <td style="padding:10px;">${row.subject}</td>
            <td style="padding:10px;">${t1 || ca}</td>
            <td style="padding:10px;">${t2 || ex}</td>
            <td style="padding:10px;"><strong>${total}</strong></td>
            <td style="padding:10px; text-align:center;">
                <button data-id="${row.id}" class="delete-row-btn" style="color:var(--error); background:transparent; border:none; cursor:pointer; font-size:1.1rem;"><i class="fa-solid fa-delete-left"></i></button>
            </td>
        `;
        tr.querySelector('.delete-row-btn').addEventListener('click', async () => {
            if (!confirm(`Delete "${row.subject}" from ${term}?`)) return;
            const delRes = await fetch(`/api/staff/result/${row.id}`, { method: 'DELETE' });
            const delData = await delRes.json();
            if (delData.success) { 
                tr.remove(); 
                showManageMsg(`"${row.subject}" deleted.`);
                loadResults(); 
            }
            else showManageMsg(delData.message, true);
        });
        tbody.appendChild(tr);
    });

    if (data.results.length === 0 && data.metadata && data.metadata.length > 0) {
        // Only metadata exists (e.g. Creche)
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="4" style="padding:15px; font-weight:bold; color:var(--text); text-align:center;">Metadata / Behavioral Evaluations Only (e.g. Creche)</td>
            <td style="padding:10px; text-align:center;">
                <!-- They can use 'Delete ALL term results' below to clear this -->
            </td>
        `;
        tbody.appendChild(tr);
    } else if (data.results.length > 0) {
        const average = (totalSum / data.results.length).toFixed(2);
        const avgTr = document.createElement('tr');
        avgTr.style.background = 'rgba(255, 255, 255, 0.03)';
        avgTr.innerHTML = `
            <td style="padding:15px; font-weight:bold; color:var(--text);">TERM AVERAGE</td>
            <td></td>
            <td></td>
            <td style="padding:15px; font-size:1.1rem; color:var(--success, #22c55e);"><strong>${average}%</strong></td>
            <td></td>
        `;
        tbody.appendChild(avgTr);
    }

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

window.logout = function() {
    localStorage.clear();
    window.location.href = 'login.html';
};