document.addEventListener('DOMContentLoaded', function() {
    // --- 1. VERIFICACIÓN DE SEGURIDAD Y SESIÓN ---
    const currentUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!currentUser) {
        alert('Acceso denegado. Debes iniciar sesión.');
        window.location.href = '/login.html';
        return;
    }
    if (currentUser.role === 'Cliente') {
        alert('No tienes permisos para acceder a esta página.');
        window.location.href = '/index.html';
        return;
    }

    // --- 2. LÓGICA DE VISIBILIDAD POR ROL ---
    const usuariosNavItem = document.querySelector('.nav-item-usuarios');
    if (currentUser.role !== 'Administrador') {
        if (usuariosNavItem) {
            usuariosNavItem.style.display = 'none';
        }
    }
    
    // --- 3. LÓGICA PARA RESALTAR EL ENLACE ACTIVO ---
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        link.classList.remove('active');
        if (linkHref && currentPath.endsWith(linkHref)) {
            link.classList.add('active');
        }
    });

    // --- 4. LÓGICA DEL DASHBOARD (NUEVO) ---
    // Se ejecuta solo si estamos en la página del dashboard
    if (document.querySelector('.stat-cards-grid')) {
        const welcomeHeader = document.querySelector('.admin-header h1');
        welcomeHeader.textContent = `Bienvenido, ${currentUser.name}`;

        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];

        // Calcular Ingresos Totales (solo de pedidos completados)
        const totalRevenue = orders
            .filter(order => order.status === 'Completado')
            .reduce((sum, order) => sum + order.total, 0);

        // Contar clientes (usuarios con rol "Cliente")
        const totalCustomers = users.filter(user => user.role === 'Cliente').length;

        // Mostrar estadísticas
        document.getElementById('total-revenue').textContent = `$${totalRevenue.toLocaleString('es-CL')}`;
        document.getElementById('total-orders').textContent = orders.length;
        document.getElementById('total-customers').textContent = totalCustomers;
        document.getElementById('total-products').textContent = products.length;
    }
});