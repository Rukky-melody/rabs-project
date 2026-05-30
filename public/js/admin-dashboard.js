document.addEventListener('DOMContentLoaded', () => {
    
    // Auth Check
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('staffRole');
    
    if (!token || (role !== 'admin' && role !== 'Admin')) {
        alert("Unauthorized access. Redirecting to login.");
        window.location.href = 'login.html';
        return;
    }

    const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Set Welcome Name
    const staffName = localStorage.getItem('staffName');
    if (staffName) {
        document.getElementById('adminNameDisplay').textContent = `Welcome, ${staffName}`;
        document.querySelector('.avatar').textContent = staffName.charAt(0).toUpperCase();
    }

    // Navigation Logic
    const navBtns = document.querySelectorAll('.nav-btn[data-target]');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
            pageTitle.textContent = btn.textContent;
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    // Initialize Dashboard Data
    fetchStaffs();
    fetchStudents();

    // Fetch Staff Function
    async function fetchStaffs() {
        try {
            const res = await fetch('/api/admin/staffs', { headers: authHeaders });
            const data = await res.json();
            if (data.success) {
                const tbody = document.getElementById('staffTableBody');
                tbody.innerHTML = '';
                document.getElementById('statTotalStaff').textContent = data.staffs.length;
                
                data.staffs.forEach(staff => {
                    const date = new Date(staff.created_at).toLocaleDateString();
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${staff.staff_id}</td>
                        <td>${staff.staff_name || 'N/A'}</td>
                        <td><span style="padding: 4px 8px; border-radius: 4px; background: ${staff.role.toLowerCase() === 'admin' ? '#fee2e2' : '#e0e7ff'}; color: ${staff.role.toLowerCase() === 'admin' ? '#991b1b' : '#3730a3'}; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">${staff.role}</span></td>
                        <td>${staff.assigned_class || 'None'}</td>
                        <td>${date}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        } catch (error) {
            console.error("Failed to fetch staff:", error);
        }
    }

    // Fetch Students Function
    async function fetchStudents() {
        try {
            const res = await fetch('/api/admin/students', { headers: authHeaders });
            const data = await res.json();
            if (data.success) {
                const accordionContainer = document.getElementById('studentsAccordion');
                accordionContainer.innerHTML = '';
                
                const classes = Object.keys(data.classes);
                document.getElementById('statTotalClasses').textContent = classes.length;

                classes.forEach(className => {
                    const students = data.classes[className];
                    
                    const item = document.createElement('div');
                    item.className = 'accordion-item';
                    
                    item.innerHTML = `
                        <div class="accordion-header">
                            <span>${className}</span>
                            <span style="color: #6b7280; font-size: 0.9rem;">${students.length} Student(s)</span>
                        </div>
                        <div class="accordion-content">
                            <div class="accordion-content-inner">
                                <table class="data-table" style="box-shadow: none; border: 1px solid #e5e7eb;">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Added On</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${students.map(s => `
                                            <tr>
                                                <td>${s.generated_id}</td>
                                                <td>${s.student_name}</td>
                                                <td>${new Date(s.created_at).toLocaleDateString()}</td>
                                                <td><button onclick="window.deleteStudent('${s.generated_id}')" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Delete</button></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;

                    // Toggle Accordion Logic
                    const header = item.querySelector('.accordion-header');
                    header.addEventListener('click', () => {
                        item.classList.toggle('active');
                    });

                    accordionContainer.appendChild(item);
                });
            }
        } catch (error) {
            console.error("Failed to fetch students:", error);
        }
    }

    // Search Results Function
    document.getElementById('searchResultBtn').addEventListener('click', async () => {
        const query = document.getElementById('resultSearchInput').value.trim();
        if (!query) {
            alert("Please enter a search term.");
            return;
        }

        const tbody = document.getElementById('resultsTableBody');
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Searching...</td></tr>`;

        try {
            const res = await fetch(`/api/admin/results/search?query=${encodeURIComponent(query)}`, { headers: authHeaders });
            const data = await res.json();

            if (data.success) {
                tbody.innerHTML = '';
                if (data.results.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" class="text-center">No results found for "${query}"</td></tr>`;
                    return;
                }

                data.results.forEach(r => {
                    const date = new Date(r.created_at).toLocaleDateString();
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${r.student_id}</td>
                        <td style="font-weight: 500;">${r.student_name}</td>
                        <td>${r.class_name || 'N/A'}</td>
                        <td>${r.term}</td>
                        <td>${date}</td>
                        <td><button class="primary-btn" onclick="window.viewResultDetails('${r.student_id}', '${r.term}', '${r.student_name.replace(/'/g, "\\'")}')" style="padding: 6px 12px; font-size: 0.8rem;">View Details</button></td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color: red;">Error: ${data.message}</td></tr>`;
            }
        } catch (error) {
            console.error("Search error:", error);
            tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color: red;">Failed to connect to server.</td></tr>`;
        }
    });

    // Add Staff Modal Logic
    const modal = document.getElementById('addStaffModal');
    document.getElementById('openAddStaffModal').addEventListener('click', () => modal.classList.add('active'));
    document.getElementById('closeAddStaffModal').addEventListener('click', () => modal.classList.remove('active'));

    document.getElementById('addStaffForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            staffName: document.getElementById('newStaffName').value.trim(),
            staffId: document.getElementById('newStaffId').value.trim(),
            password: document.getElementById('newStaffPassword').value,
            role: document.getElementById('newStaffRole').value,
            assignedClass: document.getElementById('newStaffClass').value.trim()
        };

        try {
            const res = await fetch('/api/admin/register-staff', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                alert("Staff added successfully!");
                modal.classList.remove('active');
                document.getElementById('addStaffForm').reset();
                fetchStaffs(); // Refresh table
            } else {
                alert("Failed: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error adding staff.");
        }
    });

    // View Result Details Redirect
    window.viewResultDetails = function(studentId, term, studentName) {
        window.location.href = `../student/dashboard.html?studentId=${encodeURIComponent(studentId)}&term=${encodeURIComponent(term)}&studentName=${encodeURIComponent(studentName)}&adminView=true`;
    };

    // Delete Student Logic
    window.deleteStudent = async function(studentId) {
        if (!confirm(`Are you sure you want to delete student ${studentId}? This will also delete all their results and cannot be undone.`)) {
            return;
        }
        try {
            const res = await fetch(`/api/admin/student/${encodeURIComponent(studentId)}`, {
                method: 'DELETE',
                headers: authHeaders
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchStudents(); // refresh the list
            } else {
                alert("Failed to delete student: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting student.");
        }
    };

});
