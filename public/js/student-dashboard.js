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

        if (data.success) {
            const metadataArr = data.metadata || [];
            const termMetadata = metadataArr.find(m => m.term === term);
            
            // For Creche, there might be NO results, just metadata!
            const hasMetadata = termMetadata !== undefined;
            const termResults = (data.results || []).filter(r => r.term === term);

            if(!hasMetadata && termResults.length === 0) {
                emptyState.style.display = 'block';
                return;
            }

            const meta = termMetadata || {};

            // --- Populate shared header spans ---
            document.getElementById('displayTerm').innerText = term;
            document.getElementById('displaySession').innerText = meta.session || 'N/A';

            // --- Determine class type ---
            const className = (meta.class_name || '').toUpperCase().trim();
            const isPrenursery = className === 'PRE-NURSERY';

            // --- Auto-calculated rank data from backend ---
            const rankData = (data.classRankMap || {})[term] || {};
            const calculatedPosition = rankData.calculatedPosition || '--';
            const numberOfStudents   = rankData.numberOfStudents   || '--';

            // --- Set report title and show/hide info blocks ---
            const reportTitle = document.getElementById('reportTitle');
            const standardBlock   = document.getElementById('standardInfoBlock');
            const prenurseryBlock = document.getElementById('prenurseryInfoBlock');
            const principalLabel  = document.getElementById('lblPrincipalLabel');

            if (isPrenursery) {
                if (standardBlock)   standardBlock.style.display   = 'none';
                if (prenurseryBlock) prenurseryBlock.style.display  = 'block';
                const nurseryBlock = document.getElementById('nurseryInfoBlock');
                if (nurseryBlock) nurseryBlock.style.display = 'none';

                if (reportTitle) reportTitle.innerText = 'PRE-NURSERY TERMLY RESULT';
                if (principalLabel) principalLabel.innerText = 'HEAD TEACHER\'S REMARK:';

                document.getElementById('pnName').innerText         = studentName || '--';
                document.getElementById('pnAge').innerText          = meta.age || '--';
                document.getElementById('pnClass').innerText        = meta.class_name || '--';
                document.getElementById('pnSession').innerText      = meta.session || '--';
                document.getElementById('pnTerm').innerText         = term;
                document.getElementById('pnSchoolOpened').innerText = meta.times_school_opened || '--';
                document.getElementById('pnTimePresent').innerText  = meta.days_present || '--';
                document.getElementById('pnTimeAbsent').innerText   = meta.days_absent || '--';
                document.getElementById('pnNumberInClass').innerText = numberOfStudents;

            } else if (className.startsWith('NURSERY')) {
                // ── Nursery info block ──
                if (standardBlock)   standardBlock.style.display   = 'none';
                if (prenurseryBlock) prenurseryBlock.style.display  = 'none';
                const nurseryBlock = document.getElementById('nurseryInfoBlock');
                if (nurseryBlock) nurseryBlock.style.display = 'block';

                if (reportTitle) reportTitle.innerText = 'NURSERY TERMLY RESULT';
                if (principalLabel) principalLabel.innerText = 'HEAD TEACHER\'S COMMENT:';

                // Calculate last term commutative aggregate
                const prevTermName = term === 'Second Term' ? 'First Term' : term === 'Third Term' ? 'Second Term' : null;
                const prevResults  = prevTermName ? (data.results || []).filter(r => r.term === prevTermName) : [];
                const lastTermAgg  = prevResults.reduce((s, r) =>
                    s + (parseFloat(r.first_test)||0) + (parseFloat(r.second_test)||0) + (parseFloat(r.exam_score)||0), 0);

                document.getElementById('nrName').innerText         = studentName || '--';
                document.getElementById('nrClass').innerText        = meta.class_name || '--';
                document.getElementById('nrAge').innerText          = meta.age || '--';
                document.getElementById('nrSession').innerText      = meta.session || '--';
                document.getElementById('nrTerm').innerText         = term;
                document.getElementById('nrSchoolOpened').innerText = meta.times_school_opened || '--';
                document.getElementById('nrTimePresent').innerText  = meta.days_present || '--';
                document.getElementById('nrTimeAbsent').innerText   = meta.days_absent || '--';
                document.getElementById('nrNumberInClass').innerText = numberOfStudents;
                document.getElementById('nrLastTermComm').innerText  = prevTermName ? lastTermAgg : '--';

            } else {
                // Show standard info block
                if (prenurseryBlock) prenurseryBlock.style.display = 'none';
                if (standardBlock)   standardBlock.style.display   = 'grid';

                // Reset report title and labels
                if (reportTitle) reportTitle.innerText = 'ACADEMIC REPORT SHEET';
                if (principalLabel) principalLabel.innerText = 'PRINCIPAL\'S COMMENT:';

                // Populate standard fields
                const nameParts  = (studentName || '').split(' ');
                const surname    = nameParts.length > 0 ? nameParts[0] : '--';
                const otherNames = nameParts.slice(1).join(' ') || '--';

                document.getElementById('lblSurname').innerText    = surname.toUpperCase();
                document.getElementById('lblOtherNames').innerText = otherNames.toUpperCase();
                document.getElementById('lblClass').innerText      = meta.class_name || studentClass || '--';
                document.getElementById('lblSex').innerText        = meta.sex || '--';
                document.getElementById('lblSchoolOpened').innerText = meta.times_school_opened || '--';
                document.getElementById('lblDaysPresent').innerText  = meta.days_present || '--';
                document.getElementById('lblDaysAbsent').innerText   = meta.days_absent || '--';
            }

            // --- Render dynamic section ---
            const container = document.getElementById('dynamicReportContainer');

            if (className === 'CRECHE') {
                container.innerHTML = renderCreche(meta);
            } else if (isPrenursery) {
                container.innerHTML = renderPrenursery(termResults, meta, calculatedPosition, numberOfStudents);
            } else if (className.startsWith('NURSERY')) {
                const termSubjectRanks = (data.subjectRankMap || {})[term] || {};
                container.innerHTML = renderNursery(termResults, meta, data, calculatedPosition, numberOfStudents, termSubjectRanks);
            } else {
                container.innerHTML = renderStandard(termResults, meta, data);
            }

            // --- Comments ---
            document.getElementById('lblTeacherComment').innerText  = meta.teacher_comment || '--';
            document.getElementById('lblTeacherName').innerText     = meta.uploaded_by || '--';
            document.getElementById('lblPrincipalComment').innerText = meta.principal_comment || '--';

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


// ─── RENDERING HELPER FUNCTIONS ──────────────────────────────

function renderCreche(metadata) {
    let evaluations = {};
    try { 
        evaluations = typeof metadata.creche_evaluations === 'string' ? JSON.parse(metadata.creche_evaluations) : (metadata.creche_evaluations || {}); 
    } catch(e){}

    let html = `<div class="section-header">CRECHE EVALUATIONS</div>`;
    html += `<div style="font-size:11px; margin-bottom:14px; color:#333; line-height:1.6;"><strong>SCALE:</strong> S=Satisfactory, N=Needs Improvement, I=Improving, U=Unsatisfactory</div>`;
    
    for (const [category, items] of Object.entries(evaluations)) {
        html += `<h4 style="margin-top:10px; font-size:13px; color:#003366;">${category}</h4>`;
        html += `<table class="data-table" style="margin-bottom:15px; width:100%;">
            <thead><tr><th style="text-align:left;">Item</th><th style="width:50px;">S</th><th style="width:50px;">N</th><th style="width:50px;">I</th><th style="width:50px;">U</th></tr></thead><tbody>`;
        for (const [item, rating] of Object.entries(items)) {
            html += `<tr>
                <td style="text-align:left;">${item}</td>
                <td>${rating === 'S' ? '&#10003;' : ''}</td>
                <td>${rating === 'N' ? '&#10003;' : ''}</td>
                <td>${rating === 'I' ? '&#10003;' : ''}</td>
                <td>${rating === 'U' ? '&#10003;' : ''}</td>
            </tr>`;
        }
        html += `</tbody></table>`;
    }
    return html;
}

function renderPrenursery(results, metadata, calculatedPosition, numberOfStudents) {
    let aggregateScore = 0;
    const totalPossible = results.length * 100;
    
    results.forEach(row => {
        aggregateScore += parseFloat(row.first_test) || 0;
    });

    let html = `
    <div class="section-header">COGNITIVE RECORD</div>
    <table class="data-table" style="margin-bottom:20px; width:100%;">
        <thead>
            <tr>
                <th style="text-align:left;">SUBJECTS</th>
                <th style="width:120px;">ASSESSMENTS</th>
                <th style="width:80px;">GRADES</th>
                <th style="text-align:left;">REMARK</th>
            </tr>
        </thead>
        <tbody>`;
    
    results.forEach(row => {
        const score = parseFloat(row.first_test) || 0;
        let grade = '-';
        const remark = row.remark || '';
        
        if (score >= 80)      grade = 'A';
        else if (score >= 65) grade = 'B';
        else if (score >= 59) grade = 'C';
        else if (score >= 45) grade = 'D';
        else if (score > 0)   grade = 'F';
        
        html += `<tr>
            <td style="text-align:left; font-weight:bold;">${row.subject.toUpperCase()}</td>
            <td>${score}</td>
            <td><strong>${grade}</strong></td>
            <td style="text-align:left;">${remark}</td>
        </tr>`;
    });
    
    html += `</tbody></table>
    
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; font-size:13px;">
        <div>AGGREGATE SCORE: <strong>${aggregateScore}</strong> &nbsp;&nbsp; OUT OF: <strong>${totalPossible}</strong></div>
    </div>
    <div style="margin-bottom: 20px; font-weight: bold; font-size:13px;">
        POSITION IN CLASS: <strong>${calculatedPosition}</strong>
    </div>

    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px;">
        <div>
            ${renderBehaviors(metadata, true)}
        </div>
        <div>
            <div class="behavior-header">GRADING SYSTEM</div>
            <table class="behavior-table" style="font-size: 12px;">
                <tbody>
                    <tr><td style="text-align:center; font-weight:bold;">5</td><td style="text-align:left;">80-100% - A - Excellent</td></tr>
                    <tr><td style="text-align:center; font-weight:bold;">4</td><td style="text-align:left;">60-77% - B - Good</td></tr>
                    <tr><td style="text-align:center; font-weight:bold;">3</td><td style="text-align:left;">40-59% - C - Fair</td></tr>
                    <tr><td style="text-align:center; font-weight:bold;">2</td><td style="text-align:left;">39 Below - D - Need improvement</td></tr>
                </tbody>
            </table>
            
            <div style="margin-top: 20px; line-height: 2; font-size:13px;">
                <div><strong>STATUS:</strong> ${metadata.status || '--'}</div>
                <div><strong>END OF TERM:</strong> ${metadata.end_of_term || '--'}</div>
                <div><strong>NEXT TERM BEGINS:</strong> ${metadata.next_term_begins || '--'}</div>
            </div>
            <div style="margin-top:14px; font-weight:bold; text-decoration:underline; font-size:13px;">SCHOOL STAMP</div>
        </div>
    </div>`;

    return html;
}
function getNurseryGrade(total) {
    if (total >= 70) return { grade: 'A', label: 'Excellent' };
    if (total >= 60) return { grade: 'B', label: 'Good' };
    if (total >= 50) return { grade: 'C', label: 'Satisfactory' };
    if (total >= 40) return { grade: 'D', label: 'Fair' };
    return              { grade: 'F', label: 'Poor' };
}

function renderNursery(results, metadata, allData, calculatedPosition, numberOfStudents, subjectRanks) {
    const termName   = results[0]?.term || '';
    const prevTermName = termName === 'Second Term' ? 'First Term' : termName === 'Third Term' ? 'Second Term' : null;
    const prevResults  = prevTermName ? (allData.results || []).filter(r => r.term === prevTermName) : [];
    const prevMap = {};
    prevResults.forEach(r => {
        prevMap[r.subject] = (parseFloat(r.first_test)||0) + (parseFloat(r.second_test)||0) + (parseFloat(r.exam_score)||0);
    });

    // Marks Obtainable row values
    const maxT1 = 20, maxT2 = 20, maxExam = 60, maxTotal = 100;
    let aggregateScore = 0;

    // Build cognitive rows
    let cogRows = `<tr style="background:#f0f0f0; font-weight:bold;">
        <td style="text-align:left; font-style:italic;">Marks Obtainable</td>
        <td>${maxT1}</td><td>${maxT2}</td><td>${maxExam}</td><td>${maxTotal}</td>
        <td>--</td><td>--</td><td>--</td><td>--</td>
    </tr>`;

    results.forEach(row => {
        const t1   = parseFloat(row.first_test)  || 0;
        const t2   = parseFloat(row.second_test) || 0;
        const exam = parseFloat(row.exam_score)  || 0;
        const total = t1 + t2 + exam;
        aggregateScore += total;
        const { grade } = getNurseryGrade(total);
        const lastComm = prevMap[row.subject] !== undefined ? prevMap[row.subject] : '--';
        const subPos   = subjectRanks[row.subject] || '--';
        const remark   = row.remark || '';
        cogRows += `<tr>
            <td style="text-align:left; font-weight:bold;">${row.subject.toUpperCase()}</td>
            <td>${t1}</td><td>${t2}</td><td>${exam}</td><td><strong>${total}</strong></td>
            <td>${lastComm}</td><td><strong>${grade}</strong></td><td>${subPos}</td><td>${remark}</td>
        </tr>`;
    });

    // Build observation traits
    let affTraitsObj = {}, psyTraitsObj = {};
    try {
        affTraitsObj = typeof metadata.affective_traits === 'string' ? JSON.parse(metadata.affective_traits) : (metadata.affective_traits || {});
        psyTraitsObj = typeof metadata.psychomotor_traits === 'string' ? JSON.parse(metadata.psychomotor_traits) : (metadata.psychomotor_traits || {});
    } catch(e) {}

    const traitRow = (name, score, cols) => {
        let cells = '';
        for (let i = 1; i <= cols; i++) cells += `<td>${score === i ? '&#10003;' : ''}</td>`;
        return `<tr><td style="text-align:left; font-size:11px;">${name}</td>${cells}</tr>`;
    };

    let obsRows = Object.entries(affTraitsObj).map(([k,v]) => traitRow(k, v, 5)).join('');
    let phyRows = Object.entries(psyTraitsObj).map(([k,v]) => traitRow(k, v, 5)).join('');

    const html = `
    <div style="display:grid; grid-template-columns:1.6fr 1fr; gap:8px; margin-bottom:16px;">
        <!-- Left: Cognitive Record -->
        <div style="overflow-x:auto;">
            <div class="section-header">COGNITIVE RECORD</div>
            <table class="data-table" style="font-size:11px; min-width:400px;">
                <thead>
                    <tr>
                        <th rowspan="2" style="text-align:left; min-width:120px;">SUBJECTS</th>
                        <th>1st<br>Test</th><th>2nd<br>Test</th><th>Term's<br>Exam</th><th>Total</th>
                        <th>Last Term<br>Comm</th><th>Grade</th><th>Subject<br>Position</th><th>Teacher's<br>Remarks</th>
                    </tr>
                </thead>
                <tbody>${cogRows}</tbody>
            </table>
        </div>
        <!-- Right: Observation & Conduct + Physical Skills -->
        <div>
            ${obsRows ? `
            <div class="behavior-header">OBSERVATION AND CONDUCT</div>
            <table class="behavior-table" style="font-size:11px; width:100%;">
                <thead><tr><th style="text-align:left;">Trait</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr></thead>
                <tbody>${obsRows}</tbody>
            </table>` : ''}
            ${phyRows ? `
            <div class="behavior-header" style="margin-top:8px;">PERFORMANCE IN PHYSICAL SKILLS</div>
            <table class="behavior-table" style="font-size:11px; width:100%;">
                <thead><tr><th style="text-align:left;">Skills</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr></thead>
                <tbody>${phyRows}</tbody>
            </table>` : ''}
        </div>
    </div>

    <!-- Bottom section -->
    <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:16px; margin-top:8px;">
        <div>
            <p style="font-size:13px; margin-bottom:6px;"><strong>AGGREGATE SCORE:</strong> ${aggregateScore}</p>
            <p style="font-size:13px; margin-bottom:6px;"><strong>POSITION IN CLASS:</strong> ${calculatedPosition}</p>
            <p style="font-size:13px; margin-bottom:14px;"><strong>STATUS:</strong> ${metadata.status || '--'}</p>
            <table class="data-table" style="font-size:12px;">
                <tbody>
                    <tr><td style="text-align:left; font-weight:bold; width:55%;">Class Teacher Comment</td><td style="text-align:left;">${metadata.teacher_comment || '--'}</td></tr>
                    <tr><td style="text-align:left; font-weight:bold;">Head Teacher Comment</td><td style="text-align:left;">${metadata.principal_comment || '--'}</td></tr>
                    <tr><td style="text-align:left; font-weight:bold;">Area Improvement is Needed</td><td style="text-align:left;">${metadata.area_improvement || '--'}</td></tr>
                    <tr><td style="text-align:left; font-weight:bold;">End of Term</td><td style="text-align:left;">${metadata.end_of_term || '--'}</td></tr>
                    <tr><td style="text-align:left; font-weight:bold;">Next Term Begins</td><td style="text-align:left;">${metadata.next_term_begins || '--'}</td></tr>
                </tbody>
            </table>
        </div>
        <div>
            <div class="behavior-header">KEY TO RATINGS</div>
            <table class="behavior-table" style="font-size:12px; width:100%;">
                <thead><tr><th></th><th style="text-align:left;">Description</th><th>Score</th><th>Grade</th></tr></thead>
                <tbody>
                    <tr><td><strong>5</strong></td><td style="text-align:left;">Excellent in trait</td><td>70 &amp; Above</td><td>A</td></tr>
                    <tr><td><strong>4</strong></td><td style="text-align:left;">Good in trait</td><td>60-69</td><td>B</td></tr>
                    <tr><td><strong>3</strong></td><td style="text-align:left;">Satisfactory in trait</td><td>50-59</td><td>C</td></tr>
                    <tr><td><strong>2</strong></td><td style="text-align:left;">Fair in trait</td><td>40-49</td><td>D</td></tr>
                    <tr><td><strong>1</strong></td><td style="text-align:left;">Poor in trait</td><td>0-39</td><td>F</td></tr>
                </tbody>
            </table>
            <div style="margin-top:16px; font-weight:bold; text-decoration:underline; font-size:13px;">SCHOOL STAMP</div>
        </div>
    </div>`;
    return html;
}

function renderStandard(results, metadata, allData) {

    // Standard layout (Nursery 1-3, Basic 1-5, JSS 1-3)
    let totalScore = 0;
    results.forEach(r => totalScore += (parseFloat(r.first_test)||0) + (parseFloat(r.second_test)||0) + (parseFloat(r.exam_score)||0));
    
    const calcAve = (arr) => arr.length > 0 ? (arr.reduce((acc, r) => acc + (parseFloat(r.first_test)||0) + (parseFloat(r.second_test)||0) + (parseFloat(r.exam_score)||0), 0) / arr.length).toFixed(2) + '%' : '0.00%';
    const firstTermResults = (allData.results || []).filter(r => r.term === 'First Term');
    const secondTermResults = (allData.results || []).filter(r => r.term === 'Second Term');
    const thirdTermResults = (allData.results || []).filter(r => r.term === 'Third Term');
    
    const termAve = calcAve(results);
    const overallGrade = getGrade(parseFloat(termAve)).grade;
    
    let html = `
    <!-- Summary Block -->
    <div class="summary-grid">
        <div>
            <table class="info-table" style="font-weight:bold;">
                <tr><td style="border-top:2px solid #000;">Total Score:</td><td style="border-top:2px solid #000;">${totalScore}</td></tr>
                <tr><td>1st Term Ave:</td><td>${calcAve(firstTermResults)}</td></tr>
                <tr><td>2nd Term Ave:</td><td>${calcAve(secondTermResults)}</td></tr>
                <tr><td>3rd Term Ave:</td><td>${calcAve(thirdTermResults)}</td></tr>
                <tr><td>Grade:</td><td>${overallGrade}</td></tr>
            </table>
        </div>
        <div style="display:flex; align-items:flex-end; padding-bottom:10px;">
            <div style="border:2px solid #000; padding:12px; font-weight:bold; font-size:14px; width:100%; text-align:center;">
                CLASS AVERAGE: <span>${termAve}</span>
            </div>
        </div>
    </div>`;

    html += `<div class="section-header">COGNITIVE DOMAIN</div>
    <div class="table-scroll">
        <table class="data-table">
            <thead>
                <tr>
                    <th rowspan="2">SUBJECTS</th>
                    <th>1ST TEST</th>
                    <th>2ND TEST</th>
                    <th>EXAMS</th>
                    <th>TOTAL</th>
                    <th rowspan="2">GRADE</th>
                    <th rowspan="2">REMARK</th>
                </tr>
                <tr>
                    <th style="font-size:10px;">20%</th>
                    <th style="font-size:10px;">20%</th>
                    <th style="font-size:10px;">60%</th>
                    <th style="font-size:10px;">100%</th>
                </tr>
            </thead>
            <tbody>`;
            
    results.forEach(row => {
        const t1 = parseFloat(row.first_test) || 0;
        const t2 = parseFloat(row.second_test) || 0;
        const exam = parseFloat(row.exam_score) || 0;
        
        // Fallback to legacy ca_score if first_test is null (for older records)
        const effectiveT1 = (row.first_test === null && row.ca_score !== null) ? parseFloat(row.ca_score) : t1;

        const total = effectiveT1 + t2 + exam;
        const {grade, remark} = getGrade(total);
        html += `<tr>
            <td style="text-align:left; font-weight:bold;">${row.subject.toUpperCase()}</td>
            <td>${effectiveT1}</td><td>${t2}</td><td>${exam}</td><td><strong>${total}</strong></td><td><strong>${grade}</strong></td><td>${remark}</td>
        </tr>`;
    });
    html += `</tbody></table></div>`;
    html += `<div style="font-size:11px; margin-bottom:14px; color:#333; line-height:1.6;">
        <strong>SCALE:</strong> Excellent (5), Very Good (4), Good (3), Fair (2), Poor (1) |
        <strong>GRADE:</strong> A=80-100, B=70-79, C=60-69, D=50-59, E=40-49, F=0-39
    </div>`;
    
    html += renderBehaviors(metadata);
    return html;
}

function renderBehaviors(metadata, isPrenursery = false) {
    let affTraitsObj = {};
    let psyTraitsObj = {};
    try {
        affTraitsObj = typeof metadata.affective_traits === 'string' ? JSON.parse(metadata.affective_traits) : (metadata.affective_traits || {});
        psyTraitsObj = typeof metadata.psychomotor_traits === 'string' ? JSON.parse(metadata.psychomotor_traits) : (metadata.psychomotor_traits || {});
    } catch(e) {}

    if (Object.keys(affTraitsObj).length === 0 && Object.keys(psyTraitsObj).length === 0) return '';

    const generateTraitRow = (traitName, scoreObj) => {
        const score = scoreObj[traitName] || 0;
        let cells = '';
        if (isPrenursery) {
            // Image shows 2, 3, 4, 5
            for(let i=2; i<=5; i++) {
                cells += `<td>${score === i ? '&#10003;' : ''}</td>`;
            }
        } else {
            for(let i=5; i>=1; i--) {
                cells += `<td>${score === i ? '&#10003;' : ''}</td>`;
            }
        }
        return `<tr><td style="text-align:left;">${traitName}</td>${cells}</tr>`;
    };

    let html = `<div class="${isPrenursery ? '' : 'behavior-grid'}">`;
    if (Object.keys(affTraitsObj).length > 0) {
        html += `<div style="${isPrenursery ? 'margin-bottom:20px;' : ''}">
            <div class="behavior-header">Observation & Conduct (1-5)</div>
            <div class="behavior-scroll">
                <table class="behavior-table">
                    <thead><tr><th>Traits</th>${isPrenursery ? '<th>2</th><th>3</th><th>4</th><th>5</th>' : '<th>5</th><th>4</th><th>3</th><th>2</th><th>1</th>'}</tr></thead>
                    <tbody>${Object.keys(affTraitsObj).map(k => generateTraitRow(k, affTraitsObj)).join('')}</tbody>
                </table>
            </div>
        </div>`;
    }
    if (Object.keys(psyTraitsObj).length > 0 && !isPrenursery) {
        html += `<div>
            <div class="behavior-header">Physical Skills (1-5)</div>
            <div class="behavior-scroll">
                <table class="behavior-table">
                    <thead><tr><th>Skills</th><th>5</th><th>4</th><th>3</th><th>2</th><th>1</th></tr></thead>
                    <tbody>${Object.keys(psyTraitsObj).map(k => generateTraitRow(k, psyTraitsObj)).join('')}</tbody>
                </table>
            </div>
        </div>`;
    }
    html += `</div>`;
    return html;
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