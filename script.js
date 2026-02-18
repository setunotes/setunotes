/* ===============================
   DARK MODE
=================================*/
const darkToggle = document.getElementById("darkToggle");
if (darkToggle) {
    darkToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("darkMode", document.body.classList.contains("dark"));
    });
}

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

/* ===============================
   MOBILE NAVIGATION
=================================*/
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileNav = document.getElementById("mobileNav");

if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        mobileMenuBtn.classList.toggle("active");
        mobileNav.classList.toggle("active");
    });

    mobileNav.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            mobileMenuBtn.classList.remove("active");
            mobileNav.classList.remove("active");
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".mobile-menu-btn") && !e.target.closest(".mobile-nav")) {
            mobileMenuBtn.classList.remove("active");
            mobileNav.classList.remove("active");
        }
    });
}

/* ===============================
   DOM ELEMENTS
=================================*/
const booksContainer = document.getElementById("booksContainer");
const classFilter = document.getElementById("classFilter");
const subjectFilter = document.getElementById("subjectFilter");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("chapterModal");
const closeBtn = document.getElementById("closeModal");
const overlay = document.querySelector(".modal-overlay");
const chapterList = document.getElementById("chapterList");
const blogGrid = document.getElementById("blogGrid");

/* ===============================
   PAGINATION SETTINGS
=================================*/
const paginationContainer = document.createElement("div");
paginationContainer.className = "pagination";

let currentPage = 1;
const booksPerPage = 12;

/* ===============================
   FETCH BLOG DATA
=================================*/
if (blogGrid) {
    fetch('blog-data.json')
        .then(response => response.json())
        .then(data => {
            blogGrid.innerHTML = "";
            data.forEach(post => {
                const article = document.createElement("article");
                article.className = "blog-card";
                article.innerHTML = `
                    <div class="blog-image">${post.image}</div>
                    <div class="blog-meta">
                        <span class="blog-date">${post.date}</span>
                        <span class="blog-category">${post.category}</span>
                    </div>
                    <h2>${post.title}</h2>
                    <p>${post.excerpt}</p>
                    <a href="blog/${post.slug}.html" class="read-more">Read More →</a>
                `;
                blogGrid.appendChild(article);
            });
        })
        .catch(err => {
            console.error("Error loading blog data:", err);
            blogGrid.innerHTML = "<p>Failed to load articles. Please try again later.</p>";
        });
}

/* ===============================
   LOCAL STORAGE CACHE (BOOKS)
=================================*/
if (typeof ncertData !== 'undefined') {
    if (!localStorage.getItem("ncertData")) {
        localStorage.setItem("ncertData", JSON.stringify(ncertData));
    } else {
        const localData = JSON.parse(localStorage.getItem("ncertData"));
        Object.assign(ncertData, localData);
    }
}

/* ===============================
   FLATTEN BOOK DATA
=================================*/
let allBooks = [];

function generateBookSlug(bookClass, subject, bookTitle) {
    const slugify = (text) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };
    return `class-${bookClass}-${slugify(subject)}-${slugify(bookTitle)}`;
}

if (typeof ncertData !== 'undefined' && ncertData.books) {
    for (const cls in ncertData.books) {
        for (const subject in ncertData.books[cls]) {
            ncertData.books[cls][subject].forEach(book => {
                allBooks.push({
                    class: cls,
                    subject,
                    text: book.text,
                    code: book.code,
                    chapters: book.chapters,
                    slug: generateBookSlug(cls, subject, book.text)
                });
            });
        }
    }
}

/* ===============================
   POPULATE FILTER DROPDOWNS
=================================*/
if (classFilter && subjectFilter) {
    [...new Set(allBooks.map(b => b.class))]
        .sort((a, b) => a - b)
        .forEach(c => {
            const option = document.createElement("option");
            option.value = c;
            option.textContent = `Class ${c}`;
            classFilter.appendChild(option);
        });

    [...new Set(allBooks.map(b => b.subject))]
        .sort()
        .forEach(s => {
            const option = document.createElement("option");
            option.value = s;
            option.textContent = s;
            subjectFilter.appendChild(option);
        });
}

/* ===============================
   RENDER BOOKS
=================================*/
function renderBooks(books) {
    if (!booksContainer) return;
    booksContainer.innerHTML = "";
    paginationContainer.innerHTML = "";

    const start = (currentPage - 1) * booksPerPage;
    const end = start + booksPerPage;
    const paginatedBooks = books.slice(start, end);

    paginatedBooks.forEach(book => {
        const card = document.createElement("div");
        card.className = "book-card";
        const img = `${ncertData.url}${book.code}cc.jpg`;
        const zip = `${ncertData.url}${book.code}dd.zip`;

        card.innerHTML = `
            <img src="${img}" loading="lazy" alt="${book.text}">
            <h4>${book.text}</h4>
            <small>Class ${book.class} • ${book.subject}</small>
            <div class="card-buttons">
                <a href="detail.html?book=${book.slug}" class="view-btn">View Chapters</a>
                <button class="download-btn">Download Book</button>
            </div>
        `;

        card.querySelector(".download-btn").addEventListener("click", () => {
            window.open(zip, "_blank");
        });

        booksContainer.appendChild(card);
    });

    setupPagination(books.length);
    if (!paginationContainer.parentElement) {
        booksContainer.parentElement.insertBefore(paginationContainer, booksContainer.nextElementSibling);
    }
}

/* ===============================
   PAGINATION
=================================*/
function setupPagination(totalBooks) {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(totalBooks / booksPerPage);
    if (totalPages <= 1) return;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Previous";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            applyFilters(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
    paginationContainer.appendChild(prevBtn);

    if (startPage > 1) {
        addPageButton(1);
        if (startPage > 2) addDots();
    }

    for (let i = startPage; i <= endPage; i++) addPageButton(i);

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) addDots();
        addPageButton(totalPages);
    }

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            applyFilters(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
    paginationContainer.appendChild(nextBtn);

    function addPageButton(page) {
        const btn = document.createElement("button");
        btn.textContent = page;
        if (page === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => {
            currentPage = page;
            applyFilters(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        paginationContainer.appendChild(btn);
    }

    function addDots() {
        const span = document.createElement("span");
        span.textContent = "...";
        span.className = "dots";
        paginationContainer.appendChild(span);
    }
}

/* ===============================
   FILTER + SEARCH
=================================*/
function applyFilters(resetPage = true) {
    if (!booksContainer) return;
    if (resetPage) currentPage = 1;

    let filtered = allBooks;
    let hasActiveFilter = false;

    if (classFilter && classFilter.value) {
        filtered = filtered.filter(b => b.class === classFilter.value);
        hasActiveFilter = true;
    }

    if (subjectFilter && subjectFilter.value) {
        filtered = filtered.filter(b => b.subject === subjectFilter.value);
        hasActiveFilter = true;
    }

    if (searchInput && searchInput.value) {
        filtered = filtered.filter(b =>
            b.text.toLowerCase().includes(searchInput.value.toLowerCase())
        );
        hasActiveFilter = true;
    }

    renderBooks(filtered);
}

if (classFilter && subjectFilter) {
    [classFilter, subjectFilter].forEach(el => el.addEventListener("change", () => applyFilters()));
}
if (searchInput) searchInput.addEventListener("input", () => applyFilters());

/* ===============================
   FAQ ACCORDION
=================================*/
document.addEventListener("click", (e) => {
    const question = e.target.closest('.faq-question');
    if (question) {
        const item = question.closest('.faq-item');
        if (item) {
            item.classList.toggle('open');
            const toggle = question.querySelector('.faq-toggle');
            if (toggle) toggle.textContent = item.classList.contains('open') ? '−' : '+';
        }
    }
});

/* ===============================
   INITIAL LOAD
=================================*/
applyFilters();
