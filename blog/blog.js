/* ===============================
   BLOG DYNAMIC LOADING
=================================*/
document.addEventListener("DOMContentLoaded", () => {
    const blogGrid = document.getElementById("blogGrid");

    if (blogGrid) {
        // Fetch from the same folder
        fetch('blog-data.json')
            .then(response => response.json())
            .then(data => {
                blogGrid.innerHTML = "";
                data.forEach(post => {
                    const article = document.createElement("article");
                    article.className = "blog-card";

                    // Make the entire card clickable
                    article.style.cursor = "pointer";
                    article.addEventListener("click", (e) => {
                        window.location.href = `${post.slug}.html`;
                    });

                    // Check if image is an emoji or a path
                    let imageHTML = "";
                    if (post.image && (post.image.includes('/') || post.image.includes('.'))) {
                        imageHTML = `<img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    } else {
                        imageHTML = post.image || "📝";
                    }

                    article.innerHTML = `
                        <div class="blog-image">${imageHTML}</div>
                        <div class="blog-meta">
                            <span class="blog-date">${post.date}</span>
                            <span class="blog-category">${post.category}</span>
                        </div>
                        <h2>${post.title}</h2>
                        <p>${post.excerpt}</p>
                        <a href="${post.slug}.html" class="read-more" onclick="event.stopPropagation();">Read More →</a>
                    `;
                    blogGrid.appendChild(article);
                });
            })
            .catch(err => {
                console.error("Error loading blog data:", err);
                blogGrid.innerHTML = "<p>Failed to load articles. Please try again later.</p>";
            });
    }
});
