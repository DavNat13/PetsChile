document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('reg-password');
    const regionSelect = document.getElementById('reg-region');
    const comunaSelect = document.getElementById('reg-comuna');

    // --- Funcionalidad Mostrar/Ocultar Contraseña ---
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // --- LÓGICA DE UBICACIÓN (ADAPTADA A TU ARCHIVO location.js) ---
    // Asegurarse de que regionesYComunas esté disponible globalmente desde location.js
    if (typeof regionesYComunas !== 'undefined' && regionSelect && comunaSelect) {
        const cargarRegiones = () => {
            regionSelect.innerHTML = '<option value="">Selecciona tu Región</option>';
            for (const region in regionesYComunas) {
                regionSelect.innerHTML += `<option value="${region}">${region}</option>`;
            }
        };

        const cargarComunas = (regionSeleccionada) => {
            comunaSelect.innerHTML = '<option value="">Selecciona tu Comuna</option>';
            comunaSelect.disabled = true;

            if (regionSeleccionada && regionesYComunas[regionSeleccionada]) {
                regionesYComunas[regionSeleccionada].forEach(comuna => {
                    comunaSelect.innerHTML += `<option value="${comuna}">${comuna}</option>`;
                });
                comunaSelect.disabled = false;
            }
        };

        regionSelect.addEventListener('change', () => cargarComunas(regionSelect.value));
        cargarRegiones(); // Cargar regiones al inicio
    } else {
        console.error("regionesYComunas no está definido o los selectores no existen.");
    }

    // --- LÓGICA DE VALIDACIÓN ESPECÍFICA (RUN y Email, duplicada para el registro) ---
    const validarRun = (run) => {
        run = run.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
        if (!/^[0-9]{7,8}[0-9K]$/.test(run)) return false;
        
        let cuerpo = run.slice(0, -1);
        let dv = run.slice(-1);
        
        let suma = 0;
        let multiplo = 2;
        
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

    // --- Manejo del Formulario de Registro ---
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const nombre = document.getElementById('reg-nombre').value;
            const apellidos = document.getElementById('reg-apellidos').value;
            const run = document.getElementById('reg-run').value;
            const email = document.getElementById('reg-email').value;
            const fechaNacimiento = document.getElementById('reg-fechaNacimiento').value;
            const region = regionSelect.value;
            const comuna = comunaSelect.value;
            const direccion = document.getElementById('reg-direccion').value;
            const password = passwordInput.value;

            // --- VALIDACIONES DE CAMPOS ---
            if (!validarRun(run)) {
                alert('El RUN ingresado no es válido. Formato: 19011022K (sin puntos ni guion).');
                return;
            }
            if (!validarCorreo(email)) {
                alert('El correo no es válido. Debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.');
                return;
            }
            if (!nombre || !apellidos || !fechaNacimiento || !region || !comuna || !direccion || !password) {
                alert('Por favor, rellena todos los campos obligatorios.');
                return;
            }
            if (password.length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres.');
                return;
            }

            let users = JSON.parse(localStorage.getItem('users')) || [];

            // Verificar si el RUN o el email ya existen
            if (users.some(user => user.run === run.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase())) {
                alert('El RUN ya está registrado.');
                return;
            }
            if (users.some(user => user.email === email)) {
                alert('El correo electrónico ya está registrado.');
                return;
            }

            // Crear el nuevo objeto de usuario (por defecto rol Cliente)
            const newUser = {
                run: run.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase(),
                nombre: nombre,
                apellidos: apellidos,
                email: email,
                fechaNacimiento: fechaNacimiento,
                role: 'Cliente', // Los usuarios registrados son por defecto 'Cliente'
                region: region,
                comuna: comuna,
                direccion: direccion,
                password: password 
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            alert('Registro exitoso. ¡Ahora puedes iniciar sesión!');
            window.location.href = 'login.html'; // Redirigir al login
        });
    }
});