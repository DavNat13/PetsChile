// /assets/js/product_management.js
document.addEventListener('DOMContentLoaded', function() {
    // Verifica si el contenedor de la grilla de productos existe para ejecutar el script.
    if (document.getElementById('products-grid')) {
        
        const modal = document.getElementById('product-modal');
        const addProductBtn = document.getElementById('add-product-btn');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const productForm = document.getElementById('product-form');
        const gridContainer = document.getElementById('products-grid'); // Cambiado de tableBody a gridContainer
        const imageInput = document.getElementById('prod-imagen');
        const imagePreviewContainer = document.getElementById('image-preview-container');

        let currentImageFiles = [];

        // Funciones para abrir y cerrar el modal (sin cambios)
        const openModal = () => {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.querySelector('.modal-content').style.transform = 'scale(1)';
            }, 10);
        };
        
        const closeModal = () => {
            modal.style.opacity = '0';
            modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
            setTimeout(() => {
                modal.style.display = 'none';
                productForm.reset();
                document.getElementById('prod-codigo').readOnly = false;
                document.getElementById('prod-id').value = '';
                document.getElementById('modal-title').textContent = 'Añadir Nuevo Producto';
                imagePreviewContainer.innerHTML = '';
                currentImageFiles = [];
            }, 300);
        };

        addProductBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);

        // Funciones para manejar la previsualización de imágenes (sin cambios)
        const renderImagePreviews = (imageSource) => {
            imagePreviewContainer.innerHTML = '';
            const imagePath = '/assets/img/products/';
            if (!imageSource) return;
            imageSource.forEach((item, index) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'preview-image-wrapper';
                if (typeof item === 'string') {
                    wrapper.innerHTML = `<img src="${imagePath}${item}" class="preview-image" alt="Previsualización">`;
                    imagePreviewContainer.appendChild(wrapper);
                } else {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        wrapper.innerHTML = `
                            <img src="${e.target.result}" class="preview-image" alt="Previsualización">
                            <button type="button" class="remove-image-btn" data-index="${index}">&times;</button>
                        `;
                        imagePreviewContainer.appendChild(wrapper);
                    }
                    reader.readAsDataURL(item);
                }
            });
        };

        imageInput.addEventListener('change', () => {
            currentImageFiles = Array.from(imageInput.files);
            renderImagePreviews(currentImageFiles);
        });

        imagePreviewContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-image-btn')) {
                e.preventDefault();
                const indexToRemove = parseInt(e.target.dataset.index, 10);
                currentImageFiles.splice(indexToRemove, 1);
                const newFileList = new DataTransfer();
                currentImageFiles.forEach(file => newFileList.items.add(file));
                imageInput.files = newFileList.files;
                renderImagePreviews(currentImageFiles);
            }
        });

        // Selectores para filtros y ordenamiento
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const stockFilter = document.getElementById('stock-filter');
        const sortBy = document.getElementById('sort-by');

        // Lógica para aplicar filtros y ordenamiento (sin cambios)
        const applyFiltersAndSort = (products) => {
            let filteredProducts = [...products];
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                filteredProducts = filteredProducts.filter(p =>
                    (p.nombre || '').toLowerCase().includes(searchTerm) ||
                    (p.codigo || '').toLowerCase().includes(searchTerm)
                );
            }
            const category = categoryFilter.value;
            if (category) {
                filteredProducts = filteredProducts.filter(p => p.categoria === category);
            }
            const stockLevel = stockFilter.value;
            if (stockLevel === 'low-stock') {
                filteredProducts = filteredProducts.filter(p => p.stock <= (p.stock_critico || 5));
            }
            const sortValue = sortBy.value;
            switch (sortValue) {
                case 'price-asc': filteredProducts.sort((a, b) => a.precio - b.precio); break;
                case 'price-desc': filteredProducts.sort((a, b) => b.precio - a.precio); break;
                case 'name-asc': filteredProducts.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
                case 'name-desc': filteredProducts.sort((a, b) => b.nombre.localeCompare(a.nombre)); break;
            }
            return filteredProducts;
        };

        // Función principal para mostrar los productos como tarjetas
        const displayProducts = () => {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const processedProducts = applyFiltersAndSort(products);
            gridContainer.innerHTML = '';
            if (processedProducts.length === 0) {
                gridContainer.innerHTML = '<p class="empty-message">No se encontraron productos.</p>';
                return;
            }
            processedProducts.forEach(product => {
                const originalIndex = products.indexOf(products.find(p => p.codigo === product.codigo));
                const card = document.createElement('div');
                card.className = 'management-card'; // Clase base
                card.innerHTML = `
                    <div class="card-details">
                        <h4 class="card-title">${product.nombre}</h4>
                        <div class="card-info-grid">
                            <div class="info-item">
                                <i class="fas fa-barcode"></i>
                                <span><strong>Código:</strong> ${product.codigo || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-dollar-sign"></i>
                                <span><strong>Precio:</strong> $${(product.precio || 0).toLocaleString('es-CL')}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-boxes-stacked"></i>
                                <span><strong>Stock:</strong> ${product.stock ?? 0}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-tag"></i>
                                <span><strong>Categoría:</strong> ${product.categoria || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="action-btn btn-edit" data-original-index="${originalIndex}" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                        <button class="action-btn btn-delete" data-original-index="${originalIndex}" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                gridContainer.appendChild(card);
            });
        };

        // Lógica del formulario de producto (sin cambios)
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const productIndex = document.getElementById('prod-id').value;
            let imageNames = currentImageFiles.map(file => file.name);

            if (imageNames.length === 0) {
                if (productIndex !== '' && products[productIndex]) {
                    imageNames = products[productIndex].imagenes || ['default.jpg'];
                } else {
                    imageNames = ['default.jpg'];
                }
            }
            const productData = {
                codigo: document.getElementById('prod-codigo').value,
                nombre: document.getElementById('prod-nombre').value,
                descripcion: document.getElementById('prod-descripcion').value,
                precio: parseFloat(document.getElementById('prod-precio').value),
                stock: parseInt(document.getElementById('prod-stock').value),
                stock_critico: parseInt(document.getElementById('prod-stock-critico').value) || 0,
                categoria: document.getElementById('prod-categoria').value,
                imagenes: imageNames,
            };
            if (productIndex !== '') {
                products[productIndex] = { ...products[productIndex], ...productData };
                showToast('Producto actualizado con éxito.', 'success');
            } else {
                if (products.some(p => p.codigo === productData.codigo)) {
                    showToast('Error: El código de producto ya existe.', 'error');
                    return;
                }
                products.push(productData);
                showToast('Producto añadido con éxito.', 'success');
            }
            localStorage.setItem('products', JSON.stringify(products));
            closeModal();
            displayProducts();
            loadCategories();
        });

        // Event listener para los botones de las tarjetas (ahora en gridContainer)
        gridContainer.addEventListener('click', (e) => {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const button = e.target.closest('.action-btn');
            if (!button) return;
            
            const index = button.dataset.originalIndex;
            if (index === undefined || index < 0 || !products[index]) return;
            
            const product = products[index];

            if (button.classList.contains('btn-edit')) {
                document.getElementById('modal-title').textContent = 'Editar Producto';
                document.getElementById('prod-id').value = index;
                document.getElementById('prod-codigo').value = product.codigo;
                document.getElementById('prod-codigo').readOnly = true;
                document.getElementById('prod-nombre').value = product.nombre;
                document.getElementById('prod-descripcion').value = product.descripcion;
                document.getElementById('prod-precio').value = product.precio;
                document.getElementById('prod-stock').value = product.stock;
                document.getElementById('prod-stock-critico').value = product.stock_critico;
                document.getElementById('prod-categoria').value = product.categoria;
                if (product.imagenes && product.imagenes.length > 0) {
                    imageInput.value = '';
                    currentImageFiles = [];
                    renderImagePreviews(product.imagenes);
                }
                openModal();
            }
            if (button.classList.contains('btn-delete')) {
                showConfirmation(`¿Estás seguro de que quieres eliminar el producto "${product.nombre}"?`, () => {
                    products.splice(index, 1);
                    localStorage.setItem('products', JSON.stringify(products));
                    displayProducts();
                    loadCategories();
                    showToast('Producto eliminado.', 'success');
                });
            }
        });
        
        // Función para cargar categorías en el filtro (sin cambios)
        const loadCategories = () => {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const categories = [...new Set(products.map(p => p.categoria).filter(Boolean))];
            const savedValue = categoryFilter.value;
            categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
            categories.sort().forEach(cat => {
                categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
            categoryFilter.value = savedValue;
        };
        
        // Event listeners para los filtros y carga inicial
        [searchInput, categoryFilter, stockFilter, sortBy].forEach(el => {
            el.addEventListener('change', displayProducts);
        });
        searchInput.addEventListener('input', displayProducts);

        loadCategories();
        displayProducts();
    }
});