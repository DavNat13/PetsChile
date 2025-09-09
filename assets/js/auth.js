// /assets/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DE VALIDACIÓN (REUTILIZABLE) ---
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

    const validarCorreo = (correo) => {
        const dominiosPermitidos = /@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
        return dominiosPermitidos.test(correo);
    };

    // --- LÓGICA DE REGISTRO ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const regionSelect = document.getElementById('reg-region');
        const comunaSelect = document.getElementById('reg-comuna');

        if (typeof regionesYComunas !== 'undefined' && regionSelect && comunaSelect) {
            for (const region in regionesYComunas) {
                regionSelect.innerHTML += `<option value="${region}">${region}</option>`;
            }
            regionSelect.addEventListener('change', () => {
                comunaSelect.innerHTML = '<option value="">Selecciona tu Comuna</option>';
                const regionSeleccionada = regionSelect.value;
                if (regionSeleccionada && regionesYComunas[regionSeleccionada]) {
                    regionesYComunas[regionSeleccionada].forEach(comuna => {
                        comunaSelect.innerHTML += `<option value="${comuna}">${comuna}</option>`;
                    });
                    comunaSelect.disabled = false;
                } else {
                    comunaSelect.disabled = true;
                }
            });
        }

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const run = document.getElementById('reg-run').value;
            const email = document.getElementById('reg-email').value;
            if (!validarRun(run)) { return showToast('El RUN no es válido.', 'error'); }
            if (!validarCorreo(email)) { return showToast('El dominio del correo no es válido.', 'error'); }
            
            const newUser = {
                run: run.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase(),
                nombre: document.getElementById('reg-nombre').value,
                apellidos: document.getElementById('reg-apellidos').value,
                email: email,
                fechaNacimiento: document.getElementById('reg-fechaNacimiento').value,
                role: 'Cliente',
                region: regionSelect.value,
                comuna: comunaSelect.value,
                direccion: document.getElementById('reg-direccion').value,
                password: document.getElementById('reg-password').value
            };

            for (const key in newUser) {
                if (!newUser[key]) {
                    return showToast(`El campo '${key}' es obligatorio.`, 'error');
                }
            }
            
            let users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(user => user.run === newUser.run || user.email === newUser.email)) {
                return showToast('El RUN o el correo ya están registrados.', 'error');
            }

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            showToast('¡Registro exitoso! Serás redirigido para iniciar sesión.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });

        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', function() {
                const passwordInput = document.getElementById('reg-password');
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.querySelector('i').classList.toggle('fa-eye');
                this.querySelector('i').classList.toggle('fa-eye-slash');
            });
        }
    }

    // --- LÓGICA DE INICIO DE SESIÓN (CORREGIDA Y COMPLETA) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            if (!email || !password) { return showToast('Todos los campos son obligatorios.', 'error'); }

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                sessionStorage.setItem('loggedInUser', JSON.stringify({
                    run: user.run,
                    email: user.email,
                    name: user.nombre,
                    lastName: user.apellidos,
                    role: user.role,
                    direccion: user.direccion
                }));

                showToast('¡Inicio de sesión exitoso!', 'success');
                setTimeout(() => {
                    if (user.role === 'Administrador' || user.role === 'Vendedor') {
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                showToast('Correo o contraseña incorrectos.', 'error');
            }
        });

        const toggleLoginPassword = document.getElementById('toggleLoginPassword');
        if (toggleLoginPassword) {
            toggleLoginPassword.addEventListener('click', function() {
                const passwordInput = document.getElementById('login-password');
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.querySelector('i').classList.toggle('fa-eye');
                this.querySelector('i').classList.toggle('fa-eye-slash');
            });
        }
    }
});