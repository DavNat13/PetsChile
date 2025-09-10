// /assets/js/solicitudes-management.js
document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('solicitudes-grid');
    if (!gridContainer) return;

    const modal = document.getElementById('solicitud-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const saveStatusBtn = document.getElementById('save-status-btn');
    
    let currentSolicitudId = null;

    const openModal = () => {
        modal.style.display = 'flex';
        setTimeout(() => modal.style.opacity = '1', 10);
    };

    const closeModal = () => {
        modal.style.opacity = '0';
        setTimeout(() => modal.style.display = 'none', 300);
    };

    closeModalBtn.addEventListener('click', closeModal);

    const applyFilters = (solicitudes) => {
        const searchTerm = searchInput.value.toLowerCase();
        const status = statusFilter.value;
        return solicitudes.filter(s => {
            const matchesSearch = !searchTerm || s.nombre.toLowerCase().includes(searchTerm) || s.email.toLowerCase().includes(searchTerm) || s.asunto.toLowerCase().includes(searchTerm);
            const matchesStatus = !status || s.estado === status;
            return matchesSearch && matchesStatus;
        });
    };

    const displaySolicitudes = () => {
        let solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
        solicitudes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        const filteredSolicitudes = applyFilters(solicitudes);
        
        gridContainer.innerHTML = '';
        if (filteredSolicitudes.length === 0) {
            gridContainer.innerHTML = '<p class="empty-message">No hay solicitudes para mostrar.</p>';
            return;
        }

        filteredSolicitudes.forEach(s => {
            const card = document.createElement('div');
            // Añadimos la clase de estado dinámicamente
            card.className = `management-card status-${s.estado.toLowerCase()}`;
            card.innerHTML = `
                <div class="card-details">
                    <h4 class="card-title">${s.asunto}</h4>
                    <div class="card-info-grid">
                        <div class="info-item">
                            <i class="fas fa-user"></i>
                            <span><strong>De:</strong> ${s.nombre}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span><strong>Fecha:</strong> ${new Date(s.fecha).toLocaleDateString('es-CL')}</span>
                        </div>
                         <div class="info-item">
                            <i class="fas fa-info-circle"></i>
                            <span><strong>Estado:</strong> ${s.estado}</span>
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="action-btn btn-view" data-id="${s.id}" title="Ver Detalles"><i class="fas fa-eye"></i></button>
                    <button class="action-btn btn-delete" data-id="${s.id}" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            gridContainer.appendChild(card);
        });
    };

    const showSolicitudDetails = (id) => {
        const solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
        const solicitud = solicitudes.find(s => s.id === id);
        if (!solicitud) return;
        
        currentSolicitudId = id;
        const modalContent = document.getElementById('solicitud-detail-content');
        modalContent.innerHTML = `
            <div class="order-details-grid">
                <div><strong>ID:</strong> ${solicitud.id}</div>
                <div><strong>Fecha:</strong> ${new Date(solicitud.fecha).toLocaleString('es-CL')}</div>
                <div><strong>Nombre:</strong> ${solicitud.nombre}</div>
                <div><strong>Email:</strong> <a href="mailto:${solicitud.email}">${solicitud.email}</a></div>
                <div><strong>Región:</strong> ${solicitud.region}</div>
                <div><strong>Comuna:</strong> ${solicitud.comuna}</div>
            </div>
            <h4 class="mt-3">Asunto: ${solicitud.asunto}</h4>
            <div class="card-container" style="background: #f8f9fa; padding: 1.25rem;">
                <p><strong>Mensaje:</strong></p>
                <p style="white-space: pre-wrap;">${solicitud.mensaje}</p>
            </div>
        `;
        document.getElementById('solicitud-status-select').value = solicitud.estado;
        openModal();
    };

    gridContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.action-btn');
        if (!button) return;
        const id = button.dataset.id;

        if (button.classList.contains('btn-view')) {
            showSolicitudDetails(id);
        } else if (button.classList.contains('btn-delete')) {
            showConfirmation('¿Estás seguro de que quieres eliminar esta solicitud permanentemente?', () => {
                let solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
                const updatedSolicitudes = solicitudes.filter(s => s.id !== id);
                localStorage.setItem('solicitudes', JSON.stringify(updatedSolicitudes));
                displaySolicitudes();
                showToast('Solicitud eliminada.', 'success');
            });
        }
    });

    saveStatusBtn.addEventListener('click', () => {
        if (!currentSolicitudId) return;
        let solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
        const index = solicitudes.findIndex(s => s.id === currentSolicitudId);
        if (index !== -1) {
            solicitudes[index].estado = document.getElementById('solicitud-status-select').value;
            localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
            showToast('Estado de la solicitud actualizado.', 'success');
            closeModal();
            displaySolicitudes();
        }
    });

    searchInput.addEventListener('input', displaySolicitudes);
    statusFilter.addEventListener('change', displaySolicitudes);

    displaySolicitudes();
});