// /assets/js/pedidos-management.js
document.addEventListener('DOMContentLoaded', () => {
    const ordersTableBody = document.getElementById('orders-table-body');
    if (!ordersTableBody) return;

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
                modalFooter.style.display = 'none';
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
        ordersTableBody.innerHTML = '';

        if (filteredOrders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay pedidos para mostrar.</td></tr>';
            return;
        }

        filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        filteredOrders.forEach(order => {
            const row = document.createElement('tr');
            // --- CAMBIO AQUÍ: Añadimos el botón de eliminar ---
            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>${order.userName}</td>
                <td>${new Date(order.orderDate).toLocaleDateString('es-CL')}</td>
                <td>$${order.total.toLocaleString('es-CL')}</td>
                <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td class="actions-cell">
                    <button class="action-btn btn-view" data-order-id="${order.orderId}" title="Ver Detalle"><i class="fas fa-eye"></i></button>
                    <button class="action-btn btn-complete" data-order-id="${order.orderId}" title="Marcar como Completado"><i class="fas fa-check"></i></button>
                    <button class="action-btn btn-cancel" data-order-id="${order.orderId}" title="Cancelar Pedido"><i class="fas fa-times"></i></button>
                    <button class="action-btn btn-delete" data-order-id="${order.orderId}" title="Eliminar Pedido"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            ordersTableBody.appendChild(row);
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
        modalFooter.style.display = 'flex';

        const itemsHTML = order.items.map(item => `
            <tr>
                <td>${item.nombre}</td>
                <td>${item.quantity}</td>
                <td>$${item.precio.toLocaleString('es-CL')}</td>
                <td>$${(item.quantity * item.precio).toLocaleString('es-CL')}</td>
            </tr>
        `).join('');

        // --- CAMBIO AQUÍ: Mostramos la dirección del usuario ---
        orderDetailContent.innerHTML = `
            <div class="order-details-grid">
                <div><strong>N° Pedido:</strong> ${order.orderId}</div>
                <div><strong>Total:</strong> $${order.total.toLocaleString('es-CL')}</div>
                <div><strong>Fecha:</strong> ${new Date(order.orderDate).toLocaleString('es-CL')}</div>
                <div><strong>Usuario:</strong> ${order.userName} (${order.userId})</div>
                <div><strong>Dirección de Envío:</strong> ${order.userAddress}</div>
                <div><strong>Estado Actual:</strong> <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></div>
            </div>
            <h4 class="mt-3">Productos Incluidos</h4>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr><th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th></tr>
                    </thead>
                    <tbody>${itemsHTML}</tbody>
                </table>
            </div>
        `;
        openModal();
    }

    ordersTableBody.addEventListener('click', (e) => {
        const button = e.target.closest('.action-btn');
        if (!button) return;

        const orderId = button.dataset.orderId;
        if (button.classList.contains('btn-view')) {
            showOrderDetails(orderId);
        } else if (button.classList.contains('btn-complete')) {
            showConfirmation('¿Marcar este pedido como "Completado"?', () => {
                if (updateOrderStatus(orderId, 'Completado')) {
                    showToast('Pedido marcado como Completado.', 'success');
                }
            });
        } else if (button.classList.contains('btn-cancel')) {
            showConfirmation('¿Estás seguro de que quieres "Cancelar" este pedido?', () => {
                if (updateOrderStatus(orderId, 'Cancelado')) {
                    showToast('El pedido ha sido cancelado.', 'success');
                }
            });
        // --- NUEVA LÓGICA AQUÍ: Para el botón de eliminar ---
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