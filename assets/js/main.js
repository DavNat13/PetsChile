// assets/js/main.js

/**
 * Actualiza el contador de ítems del carrito en el header.
 * Se define en el objeto 'window' para ser accesible desde otros scripts.
 */
window.updateCartCounter = () => {
    // Lee el carrito desde localStorage. Si no existe, usa un array vacío.
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCounter = document.querySelector('.cart-counter');

    if (cartCounter) {
        // Suma las cantidades de todos los productos en el carrito.
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalItems > 0) {
            cartCounter.textContent = totalItems;
            // Usamos 'flex' para que coincida con los estilos del contador.
            cartCounter.style.display = 'flex'; 
        } else {
            // Si no hay ítems, oculta el contador.
            cartCounter.style.display = 'none'; 
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LÓGICA PARA EL MENÚ DE NAVEGACIÓN MÓVIL ---
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('#nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            const icon = navToggle.querySelector('i');
            const isExpanded = navLinks.classList.contains('active');
            
            navToggle.setAttribute('aria-expanded', isExpanded);
            
            if (isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- 2. LÓGICA PARA RESALTAR LA PÁGINA ACTIVA EN EL MENÚ ---
    const currentPagePath = window.location.pathname;
    const allNavLinks = document.querySelectorAll('.nav-links a.nav-link');

    allNavLinks.forEach(link => {
        // Comparamos el final de la ruta del enlace con la ruta actual
        if (link.pathname === currentPagePath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            // Nos aseguramos de que los otros enlaces no tengan la clase active
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });

    // --- 3. ACTUALIZAR EL CONTADOR DEL CARRITO AL CARGAR CUALQUIER PÁGINA ---
    // Llama a la función global para asegurar que el contador esté siempre al día.
    window.updateCartCounter();
});