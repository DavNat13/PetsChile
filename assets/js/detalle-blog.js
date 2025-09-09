// /assets/js/detalle-blog.js
document.addEventListener('DOMContentLoaded', () => {
    const postDetailContainer = document.getElementById('blog-post-detail');
    
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'));

    if (isNaN(postId)) {
        postDetailContainer.innerHTML = '<p class="error-message">Artículo no encontrado.</p>';
        return;
    }

    // La variable blogPosts viene del archivo blog-data.js
    const post = blogPosts.find(p => p.id === postId);

    if (!post) {
        postDetailContainer.innerHTML = '<p class="error-message">El artículo que buscas no existe.</p>';
        return;
    }
    
    document.title = `${post.title} - Pets Chile`; // Actualiza el título de la página
    const imagePath = '/assets/img/blog/';

    postDetailContainer.innerHTML = `
        <header class="post-header">
            <h1 class="post-title">${post.title}</h1>
            <div class="post-meta">
                <span>Por: ${post.author}</span> | <span>Publicado: ${post.date}</span>
            </div>
        </header>
        <img src="${imagePath}${post.image}" alt="${post.title}" class="post-image">
        <div class="post-content">
            ${post.longDescription}
        </div>
        <a href="blogs.html" class="btn-back-to-blog"><i class="fas fa-arrow-left"></i> Volver al Blog</a>
    `;
});