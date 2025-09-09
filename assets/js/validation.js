// /assets/js/validation.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.contacto-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            let valid = true;
            const fields = form.querySelectorAll('input, textarea, select');
            
            fields.forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.classList.add('input-error');
                } else {
                    field.classList.remove('input-error');
                }
            });

            if (valid) {
                showToast('¡Mensaje enviado correctamente!', 'success');
                form.reset();
                // Asegurarse de que todos los campos quiten la clase de error
                fields.forEach(field => field.classList.remove('input-error'));
            } else {
                showToast('Por favor, completa todos los campos obligatorios.', 'error');
            }
        });
    }
});