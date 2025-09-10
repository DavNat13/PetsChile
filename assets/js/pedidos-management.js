// /assets/js/pedidos-management.js
document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('orders-grid');
    if (!gridContainer) return;

    const modal = document.getElementById('order-detail-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const orderDetailContent = document.getElementById('order-detail-content');
    const modalFooter = document.getElementById('order-modal-footer');
    const statusSelect = document.getElementById('order-status-select');
    const saveStatusBtn = document.getElementById('save-status-btn');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    let currentEditingOrderId = null;

    const openModal = () => {
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.style.opacity = '1';
                if (modal.querySelector('.modal-content')) {
                    modal.querySelector('.modal-content').style.transform = 'scale(1)';
                }
            }, 10);
        }
    };
    
    const closeModal = () => {
        if (modal) {
            modal.style.opacity = '0';
            if (modal.querySelector('.modal-content')) {
                modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
            }
            setTimeout(() => {
                modal.style.display = 'none';
                currentEditingOrderId = null;
            }, 300);
        }
    };

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    const applyFilters = (orders) => {
        const searchTerm = searchInput.value.toLowerCase();
        const status = statusFilter.value;
        let filteredOrders = [...orders];

        if (searchTerm) {
            filteredOrders = filteredOrders.filter(order =>
                order.orderId.toLowerCase().includes(searchTerm) ||
                order.userName.toLowerCase().includes(searchTerm)
            );
        }
        if (status) {
            filteredOrders = filteredOrders.filter(order => order.status === status);
        }
        return filteredOrders;
    };

    function displayOrders() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const filteredOrders = applyFilters(orders);
        
        gridContainer.innerHTML = '';
        if (filteredOrders.length === 0) {
            gridContainer.innerHTML = '<p class="empty-message">No hay pedidos para mostrar.</p>';
            return;
        }

        filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        filteredOrders.forEach(order => {
            const card = document.createElement('div');
            // Añadimos la clase de estado dinámicamente
            card.className = `management-card status-${order.status.toLowerCase()}`;
            card.innerHTML = `
                <div class="card-details">
                     <h4 class="card-title">${order.orderId}</h4>
                    <div class="card-info-grid">
                        <div class="info-item">
                            <i class="fas fa-user"></i>
                            <span><strong>Usuario:</strong> ${order.userName}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span><strong>Fecha:</strong> ${new Date(order.orderDate).toLocaleDateString('es-CL')}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-dollar-sign"></i>
                            <span><strong>Total:</strong> $${order.total.toLocaleString('es-CL')}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-info-circle"></i>
                            <span><strong>Estado:</strong> ${order.status}</span>
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="action-btn btn-view" data-order-id="${order.orderId}" title="Ver Detalles"><i class="fas fa-eye"></i></button>
                    <button class="action-btn btn-delete" data-order-id="${order.orderId}" title="Eliminar Pedido"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            gridContainer.appendChild(card);
        });
    }

    function updateOrderStatus(orderId, newStatus) {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        const orderIndex = orders.findIndex(o => o.orderId === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem('orders', JSON.stringify(orders));
            displayOrders();
            return true;
        }
        return false;
    }

    saveStatusBtn.addEventListener('click', () => {
        if (currentEditingOrderId) {
            const newStatus = statusSelect.value;
            if (updateOrderStatus(currentEditingOrderId, newStatus)) {
                showToast('Estado del pedido actualizado.', 'success');
                closeModal();
            } else {
                showToast('Error al actualizar el estado.', 'error');
            }
        }
    });

    function showOrderDetails(orderId) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const order = orders.find(o => o.orderId === orderId);
        if (!order || !orderDetailContent) return;

        currentEditingOrderId = orderId;
        statusSelect.value = order.status;

        const itemsHTML = order.items.map(item => `
            <tr>
                <td>${item.nombre}</td>
                <td>${item.quantity}</td>
                <td>$${item.precio.toLocaleString('es-CL')}</td>
                <td>$${(item.quantity * item.precio).toLocaleString('es-CL')}</td>
            </tr>
        `).join('');

        orderDetailContent.innerHTML = `
            <div class="order-details-sections">
                <div class="order-details-section">
                    <div class="detail-item">
                        <i class="fas fa-hashtag"></i>
                        <div><strong>N° Pedido:</strong><span>${order.orderId}</span></div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <div><strong>Fecha:</strong><span>${new Date(order.orderDate).toLocaleString('es-CL')}</span></div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-dollar-sign"></i>
                        <div><strong>Total:</strong><span>$${order.total.toLocaleString('es-CL')}</span></div>
                    </div>
                </div>
                <div class="order-details-section">
                    <div class="detail-item">
                        <i class="fas fa-user"></i>
                        <div><strong>Usuario:</strong><span>${order.userName} (${order.userId})</span></div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div><strong>Dirección:</strong><span>${order.userAddress || 'No especificada'}</span></div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-info-circle"></i>
                        <div><strong>Estado Actual:</strong><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></div>
                    </div>
                </div>
            </div>

            <h4>Productos Incluidos</h4>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHTML}</tbody>
                </table>
            </div>
        `;
        openModal();
    }

    gridContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.action-btn');
        if (!button) return;

        const orderId = button.dataset.orderId;
        if (button.classList.contains('btn-view')) {
            showOrderDetails(orderId);
        } else if (button.classList.contains('btn-delete')) {
            showConfirmation('¿Eliminar este pedido permanentemente? Esta acción no se puede deshacer.', () => {
                let orders = JSON.parse(localStorage.getItem('orders')) || [];
                const updatedOrders = orders.filter(o => o.orderId !== orderId);
                localStorage.setItem('orders', JSON.stringify(updatedOrders));
                displayOrders();
                showToast('Pedido eliminado exitosamente.', 'success');
            });
        }
    });

    searchInput.addEventListener('input', displayOrders);
    statusFilter.addEventListener('change', displayOrders);
    
    displayOrders();
});