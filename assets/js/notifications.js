// /assets/js/notifications.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Contenedor para MODALES ---
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
        <div id="app-modal-overlay" class="modal-overlay">
            <div id="app-modal-content" class="modal-content">
                <header id="app-modal-header" class="modal-header"></header>
                <div id="app-modal-body" class="modal-body"></div>
                <footer id="app-modal-footer" class="modal-footer"></footer>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);

    // --- Contenedor para NOTIFICACIONES FLOTANTES (TOASTS) ---
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    // Seleccionar elementos del DOM para los modales
    const overlay = document.getElementById('app-modal-overlay');
    const modalHeader = document.getElementById('app-modal-header');
    const modalBody = document.getElementById('app-modal-body');
    const modalFooter = document.getElementById('app-modal-footer');

    const closeModal = () => {
        overlay.classList.remove('visible');
    };

    // --- FUNCIÓN PARA MOSTRAR MODALES DE NOTIFICACIÓN ---
    window.showNotification = function(message, type = 'success') {
        modalHeader.innerHTML = `<h2 class="${type}">${type === 'success' ? 'Éxito' : 'Error'}</h2>`;
        modalBody.innerHTML = `<p>${message}</p>`;
        modalFooter.innerHTML = '';
        overlay.classList.add('visible');
        setTimeout(closeModal, 2500);
    };

    // --- FUNCIÓN PARA MOSTRAR MODALES DE CONFIRMACIÓN ---
    window.showConfirmation = function(message, onConfirm) {
        modalHeader.innerHTML = `<h2>Confirmación Requerida</h2> <button id="modal-close-btn" class="close-btn">&times;</button>`;
        modalBody.innerHTML = `<p>${message}</p>`;
        modalFooter.innerHTML = `
            <button id="modal-cancel-btn" class="btn-secondary">Cancelar</button>
            <button id="modal-confirm-btn" class="btn-confirm">Confirmar</button>
        `;
        overlay.classList.add('visible');
        
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');
        const closeBtn = document.getElementById('modal-close-btn');

        const cleanUpAndClose = () => {
            confirmBtn.replaceWith(confirmBtn.cloneNode(true));
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
            closeBtn.replaceWith(closeBtn.cloneNode(true));
            closeModal();
        };

        confirmBtn.addEventListener('click', () => {
            onConfirm();
            cleanUpAndClose();
        }, { once: true });

        cancelBtn.addEventListener('click', cleanUpAndClose, { once: true });
        closeBtn.addEventListener('click', cleanUpAndClose, { once: true });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cleanUpAndClose();
            }
        }, { once: true });
    };

    // --- FUNCIÓN PARA NOTIFICACIONES FLOTANTES (TOASTS) ---
    window.showToast = function(message, type = 'success') {
        const mainToastContainer = document.getElementById('toast-container');
        if (!mainToastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<p>${message}</p>`;

        mainToastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('visible');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('visible');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 4000); // La notificación durará 4 segundos
    };
});