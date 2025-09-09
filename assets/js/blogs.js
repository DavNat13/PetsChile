// /assets/js/blogs.js
document.addEventListener('DOMContentLoaded', () => {
    const blogGrid = document.getElementById('blog-grid');
    
    // La variable blogPosts viene del archivo blog-data.js
    if (typeof blogPosts !== 'undefined' && blogGrid) {
        const imagePath = '/assets/img/blog/'; // Carpeta para las imágenes del blog

        blogGrid.innerHTML = blogPosts.map(post => `
            <article class="blog-card">
                <a href="detalle-blog.html?id=${post.id}" class="blog-card-link">
                    <img src="${imagePath}${post.image}" alt="${post.title}" class="blog-card-image">
                    <div class="blog-card-content">
                        <h3 class="blog-card-title">${post.title}</h3>
                        <p class="blog-card-excerpt">${post.shortDescription}</p>
                        <span class="blog-card-readmore">Leer Más <i class="fas fa-arrow-right"></i></span>
                    </div>
                </a>
            </article>
        `).join('');
    }
});