// /assets/js/user-management.js
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('users-table-body')) return;

    const modal = document.getElementById('user-modal');
    const userForm = document.getElementById('user-form');
    const tableBody = document.getElementById('users-table-body');

    const validarRun = (run) => {
        run = run.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
        if (!/^[0-9]{7,8}[0-9K]$/.test(run)) return false;
        let cuerpo = run.slice(0, -1), dv = run.slice(-1), suma = 0, multiplo = 2;
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += multiplo * cuerpo.charAt(i);
            multiplo = multiplo === 7 ? 2 : multiplo + 1;
        }
        const dvEsperado = 11 - (suma % 11);
        const dvCalculado = (dvEsperado === 11) ? '0' : (dvEsperado === 10) ? 'K' : dvEsperado.toString();
        return dv === dvCalculado;
    };

    const validarCorreo = (correo) => /@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(correo);

    const initializeSampleUsers = () => {
        if (!localStorage.getItem('users')) {
            const sampleUsers = [
                { run: '19011022K', nombre: 'David', apellidos: 'Martínez', email: 'david.martinez@gmail.com', fechaNacimiento: '1995-05-10', role: 'Administrador', direccion: 'Av. Siempre Viva 123', password: 'password123' },
                { run: '181234567', nombre: 'Ana', apellidos: 'García', email: 'ana.garcia@duoc.cl', fechaNacimiento: '1998-02-20', role: 'Vendedor', direccion: 'Calle Falsa 456', password: 'password456' }
            ];
            localStorage.setItem('users', JSON.stringify(sampleUsers));
        }
    };

    const searchInput = document.getElementById('search-input');
    const roleFilter = document.getElementById('role-filter');
    const emailDomainFilter = document.getElementById('email-domain-filter');
    
    const applyFilters = (users) => {
        let filteredUsers = [...users];
        const searchTerm = searchInput.value.toLowerCase();
        const role = roleFilter.value;
        const domain = emailDomainFilter.value;
        if (searchTerm) filteredUsers = filteredUsers.filter(u => `${u.nombre} ${u.apellidos}`.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm));
        if (role) filteredUsers = filteredUsers.filter(u => u.role === role);
        if (domain) filteredUsers = filteredUsers.filter(u => u.email.endsWith(domain));
        return filteredUsers;
    };

    const displayUsers = () => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const filteredUsers = applyFilters(users);
        if (filteredUsers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">No se encontraron usuarios.</td></tr>';
            return;
        }
        const tableHTML = filteredUsers.map(user => `
            <tr data-run="${user.run}">
                <td>${user.run}</td>
                <td>${user.nombre} ${user.apellidos}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button class="action-btn btn-edit" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                    <button class="action-btn btn-delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`).join('');
        tableBody.innerHTML = tableHTML;
    };

    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const runInput = document.getElementById('user-run').value;
        const email = document.getElementById('user-email').value;
        if (!validarRun(runInput)) return showToast('El RUN ingresado no es válido.', 'error');
        if (!validarCorreo(email)) return showToast('El correo no es válido.', 'error');
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userRun = document.getElementById('user-id').value;
        const userData = {
            run: runInput.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase(),
            nombre: document.getElementById('user-nombre').value,
            apellidos: document.getElementById('user-apellidos').value,
            email: email,
            fechaNacimiento: document.getElementById('user-fechaNacimiento').value,
            role: document.getElementById('user-role').value,
            direccion: document.getElementById('user-direccion').value,
        };
        const password = document.getElementById('user-password').value;
        if (userRun) {
            const userIndex = users.findIndex(u => u.run === userRun);
            if (userIndex === -1) return showToast("Error: No se encontró el usuario para actualizar.", 'error');
            const originalPassword = users[userIndex].password;
            Object.assign(users[userIndex], userData);
            users[userIndex].password = password ? password : originalPassword;
            showToast('Usuario actualizado con éxito.', 'success');
        } else {
            if (users.some(u => u.run === userData.run || u.email === email)) return showToast('Error: El RUN o el correo electrónico ya están registrados.', 'error');
            if (!password) return showToast('La contraseña es obligatoria para nuevos usuarios.', 'error');
            userData.password = password;
            users.push(userData);
            showToast('Usuario añadido con éxito.', 'success');
        }
        localStorage.setItem('users', JSON.stringify(users));
        closeModal();
        displayUsers();
    });

    tableBody.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (!row) return;
        const run = row.dataset.run;
        if (!run) return;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.run === run);
        if (!user) return;

        if (e.target.closest('.btn-edit')) {
            document.getElementById('modal-title').textContent = 'Editar Usuario';
            document.getElementById('user-id').value = user.run;
            document.getElementById('user-run').value = user.run;
            document.getElementById('user-nombre').value = user.nombre;
            document.getElementById('user-apellidos').value = user.apellidos;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-fechaNacimiento').value = user.fechaNacimiento;
            document.getElementById('user-role').value = user.role;
            document.getElementById('user-direccion').value = user.direccion;
            document.getElementById('user-password').placeholder = "Dejar en blanco para no cambiar";
            document.getElementById('user-password').required = false;
            openModal();
        }

        if (e.target.closest('.btn-delete')) {
            showConfirmation(`¿Estás seguro de que quieres eliminar a ${user.nombre} ${user.apellidos}?`, () => {
                const updatedUsers = users.filter(u => u.run !== run);
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                displayUsers();
                showToast('Usuario eliminado.', 'success');
            });
        }
    });

    const addUserBtn = document.getElementById('add-user-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    const openModal = () => {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 10);
    };

    const closeModal = () => {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    };
    
    addUserBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Añadir Nuevo Usuario';
        document.getElementById('user-id').value = '';
        userForm.reset();
        document.getElementById('user-password').required = true;
        document.getElementById('user-password').placeholder = "Contraseña";
        openModal();
    });

    closeModalBtn.addEventListener('click', closeModal);

    searchInput.addEventListener('input', displayUsers);
    [roleFilter, emailDomainFilter].forEach(el => el.addEventListener('change', displayUsers));
    
    initializeSampleUsers();
    displayUsers();
});