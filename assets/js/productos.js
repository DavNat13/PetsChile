// assets/js/productos.js

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const products = JSON.parse(localStorage.getItem('products')) || [];

    if (productGrid) {
        if (products.length === 0) {
            productGrid.innerHTML = '<p>No hay productos disponibles en este momento.</p>';
            return;
        }

        const imagePath = '/assets/img/products/';

        const productsHTML = products.map(product => {
            const firstImage = (product.imagenes && product.imagenes.length > 0) ? product.imagenes[0] : 'default.jpg';
            
            return `
            <div class="product-card">
                <div class="product-card-img-container">
                    <img src="${imagePath}${firstImage}" alt="${product.nombre}" class="product-card-img">
                </div>
                <div class="product-card-info">
                    <h3 class="product-card-name">${product.nombre}</h3>
                    <p class="product-card-price">$${product.precio.toLocaleString('es-CL')}</p>
                    <a href="detalles-producto.html?codigo=${product.codigo}" class="btn-primary">Ver Detalle</a>
                </div>
            </div>
            `}).join('');

        productGrid.innerHTML = productsHTML;
    }
});