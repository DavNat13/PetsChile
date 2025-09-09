// /assets/js/login.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const loginPasswordInput = document.getElementById('login-password');

    if (toggleLoginPassword && loginPasswordInput) {
        toggleLoginPassword.addEventListener('click', function() {
            const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            loginPasswordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            let users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // --- CAMBIO IMPORTANTE AQUÍ ---
                // Ahora guardamos más datos del usuario en la sesión
                sessionStorage.setItem('loggedInUser', JSON.stringify({
                    run: user.run,                      // <-- Añadido
                    email: user.email,
                    name: user.nombre,
                    lastName: user.apellidos,           // <-- Añadido
                    role: user.role,
                    direccion: user.direccion           // <-- Añadido
                }));

                alert('¡Inicio de sesión exitoso!');

                if (user.role === 'Administrador' || user.role === 'Vendedor') {
                    window.location.href = 'admin/dashboard.html';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                alert('Credenciales incorrectas. Intenta de nuevo.');
            }
        });
    }
});