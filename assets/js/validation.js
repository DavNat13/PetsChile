// /assets/js/validation.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.contacto-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            let valid = true;
            const fields = form.querySelectorAll('input, textarea, select');
            
            fields.forEach(field => {
                const fieldContainer = field.closest('.form-group');
                if (!field.value.trim()) {
                    valid = false;
                    if(fieldContainer) fieldContainer.classList.add('input-error');
                } else {
                    if(fieldContainer) fieldContainer.classList.remove('input-error');
                }
            });

            if (valid) {
                // Crear el objeto de la solicitud
                const nuevaSolicitud = {
                    id: `SOL-${Date.now()}`,
                    fecha: new Date().toISOString(),
                    nombre: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    region: document.getElementById('region').value,
                    comuna: document.getElementById('comuna').value,
                    asunto: document.getElementById('subject').value,
                    mensaje: document.getElementById('message').value,
                    estado: 'Pendiente' // Estado inicial por defecto
                };

                // Guardar en localStorage
                const solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
                solicitudes.push(nuevaSolicitud);
                localStorage.setItem('solicitudes', JSON.stringify(solicitudes));

                showToast('¡Mensaje enviado correctamente!', 'success');
                form.reset();
                document.getElementById('comuna').disabled = true;

            } else {
                showToast('Por favor, completa todos los campos obligatorios.', 'error');
            }
        });
    }
});