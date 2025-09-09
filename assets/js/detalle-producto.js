// assets/js/detalle-producto.js

document.addEventListener('DOMContentLoaded', () => {

    // Contenedor principal de la página de detalles
    const productDetailContainer = document.getElementById('product-detail-container');

    // --- 1. COMPROBACIÓN INICIAL ---
    // Si el contenedor principal no existe en esta página, detenemos la ejecución del script.
    // Esto evita el error "Cannot set properties of null" en otras páginas.
    if (!productDetailContainer) {
        return; 
    }

    // --- 2. INICIALIZACIÓN Y BÚSQUEDA DEL PRODUCTO ---
    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    const breadcrumbProductTitle = document.getElementById('breadcrumb-product-title');
    const relatedProductsGrid = document.getElementById('related-products-grid');

    const urlParams = new URLSearchParams(window.location.search);
    const productCodigo = urlParams.get('codigo');

    // Si no hay un código de producto en la URL, muestra un mensaje y detiene.
    if (!productCodigo) {
        productDetailContainer.innerHTML = '<p class="error-message">Producto no especificado.</p>';
        return;
    }

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.codigo === productCodigo);

    // Si el producto con ese código no se encuentra, muestra un mensaje y detiene.
    if (!product) {
        productDetailContainer.innerHTML = '<p class="error-message">Producto no encontrado.</p>';
        return;
    }

    // --- 3. RENDERIZADO DEL HTML PRINCIPAL ---
    const imagePath = '/assets/img/products/';
    const imageArray = (product.imagenes && product.imagenes.length > 0) ? product.imagenes : ['default.jpg'];
    
    // Genera las imágenes en miniatura
    const thumbnailsHTML = imageArray.map((imageName, index) => `
        <img src="${imagePath}${imageName}" 
             alt="Miniatura ${index + 1}" 
             class="thumbnail-image ${index === 0 ? 'active' : ''}" 
             data-full-src="${imagePath}${imageName}">
    `).join('');

    // Inserta toda la estructura HTML en el contenedor principal
    productDetailContainer.innerHTML = `
        <div class="product-gallery">
            <div class="thumbnail-selector">
                ${thumbnailsHTML}
            </div>
            <img src="${imagePath}${imageArray[0]}" alt="${product.nombre}" class="main-product-image">
        </div>
        <div class="product-details-info">
            <div class="product-header">
                <h1 class="product-title">${product.nombre}</h1>
                <span class="product-price">$${product.precio.toLocaleString('es-CL')}</span>
            </div>
            <p class="product-category">${product.categoria || 'Sin Categoría'}</p> 
            <p class="product-description">${product.descripcion || 'Este producto no tiene una descripción.'}</p>
            <div class="product-meta">
                <span><i class="fas fa-box"></i> Stock: <strong id="product-stock">${product.stock}</strong> unidades</span>
                <span><i class="fas fa-tag"></i> SKU: <strong>${product.codigo}</strong></span>
            </div>
            <div class="add-to-cart-controls">
                <div class="quantity-control">
                    <button class="quantity-btn" id="decrease-quantity"><i class="fas fa-minus"></i></button>
                    <input type="number" id="quantity-input" value="1" min="1" max="${product.stock}" readonly>
                    <button class="quantity-btn" id="increase-quantity"><i class="fas fa-plus"></i></button>
                </div>
                <button id="add-to-cart-btn" class="btn-primary-alt"><i class="fas fa-cart-plus"></i> Añadir al Carrito</button>
            </div>
            <p id="feedback-message" class="feedback-message"></p>
        </div>
    `;

    // Actualiza las migas de pan (breadcrumb)
    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = product.categoria || 'Productos';
        breadcrumbCategory.href = `productos.html`; // Idealmente, esto debería filtrar por categoría.
    }
    if (breadcrumbProductTitle) {
        breadcrumbProductTitle.textContent = product.nombre;
    }

    // --- 4. LÓGICA DE LA GALERÍA DE IMÁGENES ---
    const mainProductImage = productDetailContainer.querySelector('.main-product-image');
    const thumbnailImages = productDetailContainer.querySelectorAll('.thumbnail-image');
    
    thumbnailImages.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            mainProductImage.src = thumbnail.dataset.fullSrc;
            thumbnailImages.forEach(img => img.classList.remove('active'));
            thumbnail.classList.add('active');
        });
    });

    // --- 5. LÓGICA DE AÑADIR AL CARRITO ---
    const addToCartBtn = productDetailContainer.querySelector('#add-to-cart-btn');
    const quantityInput = productDetailContainer.querySelector('#quantity-input');
    const decreaseQuantityBtn = productDetailContainer.querySelector('#decrease-quantity');
    const increaseQuantityBtn = productDetailContainer.querySelector('#increase-quantity');
    const feedbackMessage = productDetailContainer.querySelector('#feedback-message');
    
    const MAX_QUANTITY_PER_ITEM = 5;

    decreaseQuantityBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    increaseQuantityBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue < MAX_QUANTITY_PER_ITEM && currentValue < product.stock) {
            quantityInput.value = currentValue + 1;
        }
    });

    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        if (isNaN(quantity) || quantity <= 0) {
            displayFeedback('Cantidad no válida.', 'error');
            return;
        }
        if (quantity > product.stock) {
            displayFeedback('No hay suficiente stock disponible.', 'error');
            return;
        }
            
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProductIndex = cart.findIndex(item => item.codigo === product.codigo);

        let newTotalQuantity = quantity;
        if (existingProductIndex > -1) {
            newTotalQuantity += cart[existingProductIndex].quantity;
        }

        if (newTotalQuantity > MAX_QUANTITY_PER_ITEM) {
            displayFeedback(`Solo puedes añadir un máximo de ${MAX_QUANTITY_PER_ITEM} unidades de este producto.`, 'error');
            return;
        }
        
        if (newTotalQuantity > product.stock) {
             displayFeedback('No puedes añadir más, excede el stock disponible.', 'error');
             return;
        }

        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        displayFeedback('¡Producto añadido al carrito!', 'success');
        
        // Llama a la función global de main.js para actualizar el contador del header
        if (window.updateCartCounter) {
            window.updateCartCounter();
        }
    });

    function displayFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback-message ${type}`; // Usa 'success' o 'error'
        setTimeout(() => {
            feedbackMessage.textContent = '';
            feedbackMessage.className = 'feedback-message';
        }, 3000);
    }

    // --- 6. RENDERIZADO DE PRODUCTOS SUGERIDOS ---
    if (relatedProductsGrid) {
        const otherProducts = products.filter(p => p.codigo !== productCodigo && p.categoria === product.categoria);
        const randomRelated = otherProducts.sort(() => 0.5 - Math.random()).slice(0, 4); 

        if (randomRelated.length > 0) {
            const relatedHTML = randomRelated.map(relatedProduct => {
                const relatedImage = (relatedProduct.imagenes && relatedProduct.imagenes.length > 0) ? relatedProduct.imagenes[0] : 'default.jpg';
                return `
                    <div class="product-card">
                        <div class="product-card-img-container">
                            <img src="${imagePath}${relatedImage}" alt="${relatedProduct.nombre}" class="product-card-img">
                        </div>
                        <div class="product-card-info">
                            <h4 class="product-card-name">${relatedProduct.nombre}</h4>
                            <p class="product-card-price">$${relatedProduct.precio.toLocaleString('es-CL')}</p>
                            <a href="detalles-producto.html?codigo=${relatedProduct.codigo}" class="btn-primary">Ver Producto</a>
                        </div>
                    </div>
                `;
            }).join('');
            relatedProductsGrid.innerHTML = relatedHTML;
        } else {
            // Oculta la sección si no hay productos que mostrar
            const relatedSection = relatedProductsGrid.closest('.related-products');
            if(relatedSection) relatedSection.style.display = 'none';
        }
    }
});