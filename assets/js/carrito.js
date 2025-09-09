// /assets/js/carrito.js
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSubtotalElem = document.getElementById('cart-subtotal');
    const cartTotalElem = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.querySelector('.btn-checkout');

    const imagePath = '/assets/img/products/';
    const MAX_QUANTITY_PER_ITEM = 5;

    function renderCart() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        window.updateCartCounter();

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '';
            cartSummary.style.display = 'none';
            emptyCartMessage.style.display = 'flex';
            if(checkoutBtn) checkoutBtn.disabled = true;
        } else {
            cartSummary.style.display = 'block';
            emptyCartMessage.style.display = 'none';
            if(checkoutBtn) checkoutBtn.disabled = false;
            
            cartItemsContainer.innerHTML = cart.map(item => {
                const itemImage = (item.imagenes && item.imagenes.length > 0) ? item.imagenes[0] : 'default.jpg';
                const itemSubtotal = item.precio * item.quantity;
                
                return `
                <div class="cart-item" data-codigo="${item.codigo}">
                    <img src="${imagePath}${itemImage}" alt="${item.nombre}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.nombre}</h3>
                        <p class="cart-item-price">$${item.precio.toLocaleString('es-CL')}</p>
                        <button class="cart-item-remove"><i class="fas fa-trash-alt"></i> Eliminar</button>
                    </div>
                    <div class="cart-item-quantity quantity-control"> 
                        <button class="quantity-btn decrease-btn" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <input type="text" value="${item.quantity}" readonly>
                        <button class="quantity-btn increase-btn" ${item.quantity >= item.stock || item.quantity >= MAX_QUANTITY_PER_ITEM ? 'disabled' : ''}>+</button>
                    </div>
                    <strong class="cart-item-subtotal">$${itemSubtotal.toLocaleString('es-CL')}</strong>
                </div>
                `;
            }).join('');

            updateCartSummary(cart);
        }
    }

    function updateCartSummary(cart) {
        const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
        cartSubtotalElem.textContent = `$${subtotal.toLocaleString('es-CL')}`;
        cartTotalElem.textContent = `$${subtotal.toLocaleString('es-CL')}`;
    }

    function handleCheckout() {
        showConfirmation('¿Estás seguro de que quieres finalizar tu compra?', () => {
            const currentUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

            if (!currentUser) {
                showToast('Debes iniciar sesión para realizar un pedido.', 'error');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                return;
            }

            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                showToast('Tu carrito está vacío.', 'error');
                return;
            }

            const products = JSON.parse(localStorage.getItem('products')) || [];
            cart.forEach(cartItem => {
                const productInStock = products.find(p => p.codigo === cartItem.codigo);
                if (productInStock) {
                    productInStock.stock -= cartItem.quantity;
                    if (productInStock.stock < 0) {
                        productInStock.stock = 0;
                    }
                }
            });
            localStorage.setItem('products', JSON.stringify(products));


            const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

            // --- CAMBIO AQUÍ: Añadimos la dirección del usuario ---
            const newOrder = {
                orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                userId: currentUser.run,
                userName: `${currentUser.name} ${currentUser.lastName}`,
                userAddress: currentUser.direccion || 'No especificada', // Añadimos la dirección
                orderDate: new Date().toISOString(),
                items: cart,
                total: total,
                status: 'Procesando'
            };

            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(newOrder);
            localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.removeItem('cart');

            showToast('Su pedido se ha registrado con éxito', 'success');
            
            setTimeout(() => {
                renderCart();
                window.location.href = '/index.html';
            }, 2500);
        });
    }
    
    function updateItemQuantity(codigo, newQuantity) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const productInCart = cart.find(item => item.codigo === codigo);

        if (productInCart) {
            if (newQuantity > 0 && newQuantity <= productInCart.stock && newQuantity <= MAX_QUANTITY_PER_ITEM) {
                productInCart.quantity = newQuantity;
            } else if (newQuantity <= 0) {
                cart = cart.filter(item => item.codigo !== codigo);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        }
    }

    function removeItem(codigo) {
        showConfirmation('¿Estás seguro de que quieres eliminar este producto del carrito?', () => {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart = cart.filter(item => item.codigo !== codigo);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        });
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
    
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', e => {
            const itemElement = e.target.closest('.cart-item');
            if (!itemElement) return;
            const codigo = itemElement.dataset.codigo;
            const currentQuantity = parseInt(itemElement.querySelector('input').value);
            if (e.target.closest('.increase-btn')) {
                updateItemQuantity(codigo, currentQuantity + 1);
            }
            if (e.target.closest('.decrease-btn')) {
                updateItemQuantity(codigo, currentQuantity - 1);
            }
            if (e.target.closest('.cart-item-remove')) {
                removeItem(codigo);
            }
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            showConfirmation('¿Estás seguro de que quieres vaciar todo el carrito?', () => {
                localStorage.removeItem('cart');
                renderCart();
            });
        });
    }

    renderCart();
});