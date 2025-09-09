// js/session.js
document.addEventListener('DOMContentLoaded', () => {
    const userActionsContainer = document.querySelector('.user-actions');
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (loggedInUser) {
        let dropdownMenuHTML = `
            <div class="dropdown-header">Conectado como:<br><strong>${loggedInUser.name}</strong></div>
            <hr>
            <a href="#">Mi Perfil</a>
            <a href="#">Mis Compras</a>
        `;

        // Lógica de Roles: Añadimos el enlace al panel solo si es Admin o Vendedor.
        if (loggedInUser.role === 'Administrador' || loggedInUser.role === 'Vendedor') { // <-- Corregido a Mayúscula
            dropdownMenuHTML += `
                <a href="/admin/dashboard.html">Panel de Administración</a>
            `;
        }

        dropdownMenuHTML += `
            <hr>
            <a href="#" id="logout-btn">Cerrar Sesión</a>
        `;

        userActionsContainer.innerHTML = `
            <div class="user-dropdown">
                <button id="user-dropdown-btn" class="dropdown-toggle">
                    <i class="fas fa-user-circle"></i>
                    <span>${loggedInUser.name}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div id="user-dropdown-content" class="dropdown-content">
                    ${dropdownMenuHTML}
                </div>
            </div>
        `;
        
        const dropdownBtn = document.getElementById('user-dropdown-btn');
        const dropdownContent = document.getElementById('user-dropdown-content');
        const logoutBtn = document.getElementById('logout-btn');

        dropdownBtn.addEventListener('click', () => {
            dropdownContent.classList.toggle('show');
        });

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('loggedInUser');
            window.location.href = '/login.html';
        });

        window.addEventListener('click', (e) => {
            if (!dropdownBtn.contains(e.target)) {
                if (dropdownContent.classList.contains('show')) {
                    dropdownContent.classList.remove('show');
                }
            }
        });

    } else {
        userActionsContainer.innerHTML = `
            <a href="/login.html" class="btn-login">Iniciar sesión</a>
        `;
    }
});