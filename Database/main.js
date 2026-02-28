(async function() {
    const res = await fetch("data.json");
    let employees = await res.json();
    let selectedId = employees[0]?.id || -1;

    const list = document.querySelector(".emp-list-items");
    const info = document.querySelector(".emp-detail-info");
    const modal = document.querySelector(".modal");
    const editModal = document.querySelector(".edit-modal");
    const form = document.querySelector(".emp-form");
    const editForm = document.querySelector(".edit-form");
    const search = document.getElementById("searchInput");
    const sort = document.getElementById("sortSelect");
    const totalEl = document.getElementById("totalEmployees");
    const avgEl = document.getElementById("avgSalary");

    const toast = (msg, type = 'success') => {
        const t = document.createElement("div");
        t.className = `toast ${type}`;
        t.innerHTML = `<span>${type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✕'}</span> <span>${msg}</span>`;
        document.getElementById("toastContainer").append(t);
        setTimeout(() => t.classList.add("hiding"), 2500);
    };

    const updateStats = () => {
        totalEl.textContent = employees.length;
        const avg = employees.length ? Math.round(employees.reduce((s, e) => s + +e.salary, 0) / employees.length) : 0;
        avgEl.textContent = `KSh ${avg.toLocaleString()}`;
    };

    const render = () => {
        let filtered = employees;
        const q = search.value.toLowerCase();
        if (q) filtered = filtered.filter(e => e.firstName.toLowerCase().includes(q) || e.lastName.toLowerCase().includes(q) || e.email.includes(q));
        
        const s = sort.value;
        filtered.sort((a, b) => {
            if (s === 'name') return a.firstName.localeCompare(b.firstName);
            if (s === 'nameDesc') return b.firstName.localeCompare(a.firstName);
            if (s === 'salary') return a.salary - b.salary;
            if (s === 'salaryDesc') return b.salary - a.salary;
            if (s === 'age') return a.age - b.age;
            return b.age - a.age;
        });

        if (!filtered.find(e => e.id === selectedId)) selectedId = filtered[0]?.id || -1;
        
        list.innerHTML = filtered.length ? filtered.map(e => `
            <span class="emp-item ${e.id === selectedId ? 'selected' : ''}" id="${e.id}">
                <span>${e.firstName} ${e.lastName}</span>
                <span><i class="emp-edit">✎</i><i class="emp-delete">✕</i></span>
            </span>`).join('') : '<div class="no-results">No results</div>';
        
        const emp = employees.find(e => e.id === selectedId);
        info.innerHTML = emp ? `
            <img src="${emp.imageUrl}" />
            <span class="emp-detail-heading">${emp.firstName} ${emp.lastName}</span>
            <span class="salary">KSh ${parseInt(emp.salary).toLocaleString()}</span>
            <span>📧 ${emp.email}</span>
            <span>📱 ${emp.contactNumber}</span>
            <span>📍 ${emp.address}</span>
            <span>🎂 ${emp.dob} (${emp.age} yrs)</span>
            <div class="emp-detail-actions">
                <button class="edit-detail-btn" onclick="openEdit(${emp.id})">✎ Edit</button>
                <button class="delete-detail-btn" onclick="delEmp(${emp.id})">✕ Delete</button>
            </div>` : '<div class="empty-state">Select employee</div>';
    };

    document.querySelector(".add-btn").onclick = () => modal.style.display = "flex";
    document.querySelector(".cancel-btn").onclick = () => { modal.style.display = "none"; form.reset(); };
    modal.onclick = e => { if(e.target === modal) { modal.style.display = "none"; form.reset(); }};

    form.onsubmit = e => {
        e.preventDefault();
        const f = new FormData(form);
        const emp = { id: Math.max(...employees.map(e => e.id), 1000) + 1, ...Object.fromEntries(f), age: 2026 - +f.get('dob').slice(0,4), imageUrl: f.get('imageUrl') || `https://i.pravatar.cc/150?img=${Math.floor(Math.random()*70)}` };
        employees.push(emp);
        render(); updateStats(); toast(`${emp.firstName} added!`);
        modal.style.display = "none"; form.reset();
    };

    window.openEdit = id => {
        const e = employees.find(x => x.id === id);
        editForm.editId.value = e.id;
        editForm.editFirstName.value = e.firstName;
        editForm.editLastName.value = e.lastName;
        editForm.editEmail.value = e.email;
        editForm.editContactNumber.value = e.contactNumber;
        editForm.editSalary.value = e.salary;
        editForm.editAddress.value = e.address;
        const [d,m,y] = e.dob.split('/');
        editForm.editDob.value = `${y}-${m}-${d}`;
        editModal.style.display = "flex";
    };

    document.querySelector(".edit-cancel").onclick = () => { editModal.style.display = "none"; editForm.reset(); };
    editModal.onclick = e => { if(e.target === editModal) { editModal.style.display = "none"; editForm.reset(); }};

    editForm.onsubmit = e => {
        e.preventDefault();
        const f = new FormData(editForm);
        const i = employees.findIndex(x => x.id == f.get("editId"));
        const [d,m,y] = editForm.editDob.value.split('-');
        employees[i] = { ...employees[i], firstName: f.get("editFirstName"), lastName: f.get("editLastName"), email: f.get("editEmail"), contactNumber: f.get("editContactNumber"), salary: f.get("editSalary"), address: f.get("editAddress"), dob: `${d}/${m}/${y}`, age: 2026 - +y };
        render(); updateStats(); toast("Updated!", "success");
        editModal.style.display = "none"; editForm.reset();
    };

    window.delEmp = id => {
        if (!confirm("Delete this employee?")) return;
        employees = employees.filter(e => e.id !== id);
        selectedId = employees[0]?.id || -1;
        render(); updateStats(); toast("Deleted", "warning");
    };

    list.onclick = e => {
        if (e.target.classList.contains("emp-delete")) { delEmp(+e.target.closest(".emp-item").id); return; }
        if (e.target.classList.contains("emp-edit")) { openEdit(+e.target.closest(".emp-item").id); return; }
        if (e.target.tagName === "SPAN") { selectedId = +e.target.closest(".emp-item").id; render(); }
    };

    search.oninput = render;
    sort.onchange = render;

    render(); updateStats();
})();
