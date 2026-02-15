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
    // Toggle menu on button click
    mobileMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        mobileMenuBtn.classList.toggle("active");
        mobileNav.classList.toggle("active");
    });

    // Close menu when a link is clicked (using event delegation)
    mobileNav.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            mobileMenuBtn.classList.remove("active");
            mobileNav.classList.remove("active");
        }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".mobile-menu-btn") && !e.target.closest(".mobile-nav")) {
            mobileMenuBtn.classList.remove("active");
            mobileNav.classList.remove("active");
        }
    });
}

/* ===============================
   SEARCH FILTERS TOGGLE (Mobile)
=================================*/
const searchToggle = document.getElementById("searchToggle");
const searchArea = document.getElementById("searchArea");

if (searchToggle && searchArea) {
    searchToggle.addEventListener("click", () => {
        searchToggle.classList.toggle("active");
        searchArea.classList.toggle("active");
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

/* ===============================
   PAGINATION SETTINGS
=================================*/
const paginationContainer = document.createElement("div");
paginationContainer.className = "pagination";

let currentPage = 1;
const booksPerPage = 12;

/* ===============================
   LOCAL STORAGE CACHE
=================================*/
if (!localStorage.getItem("ncertData")) {
    localStorage.setItem("ncertData", JSON.stringify(ncertData));
} else {
    const localData = JSON.parse(localStorage.getItem("ncertData"));
    Object.assign(ncertData, localData);
}

/* ===============================
   FLATTEN BOOK DATA
=================================*/
let allBooks = [];

// Helper function to generate SEO-friendly slugs
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

/* ===============================
   POPULATE FILTER DROPDOWNS
=================================*/
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

/* ===============================
   RENDER BOOKS
=================================*/
function renderBooks(books) {
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

        // Download Book
        card.querySelector(".download-btn")
            .addEventListener("click", () => {
                window.open(zip, "_blank");
            });

        booksContainer.appendChild(card);
    });

    setupPagination(books.length);
    
    // Ensure pagination container is in the DOM, right after books container
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

    const maxVisible = 5; // pages around current
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    // ===== PREVIOUS BUTTON =====
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

    // ===== FIRST PAGE =====
    if (startPage > 1) {
        addPageButton(1);

        if (startPage > 2) {
            addDots();
        }
    }

    // ===== MIDDLE PAGES =====
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i);
    }

    // ===== LAST PAGE =====
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            addDots();
        }
        addPageButton(totalPages);
    }

    // ===== NEXT BUTTON =====
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


    // ===== HELPER FUNCTIONS =====
    function addPageButton(page) {
        const btn = document.createElement("button");
        btn.textContent = page;

        if (page === currentPage) {
            btn.classList.add("active");
        }

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
   SHUFFLE FUNCTION
=================================*/
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/* ===============================
   FILTER + SEARCH
=================================*/
function applyFilters(resetPage = true) {

    if (resetPage) currentPage = 1;

    let filtered = allBooks;
    let hasActiveFilter = false;

    if (classFilter.value) {
        filtered = filtered.filter(b => b.class === classFilter.value);
        hasActiveFilter = true;
    }

    if (subjectFilter.value) {
        filtered = filtered.filter(b => b.subject === subjectFilter.value);
        hasActiveFilter = true;
    }

    if (searchInput.value) {
        filtered = filtered.filter(b =>
            b.text.toLowerCase().includes(searchInput.value.toLowerCase())
        );
        hasActiveFilter = true;
    }

    // If no filters applied, shuffle the results
    if (!hasActiveFilter) {
        filtered = shuffleArray(filtered);
    }

    renderBooks(filtered);
}

[classFilter, subjectFilter]
    .forEach(el => el.addEventListener("change", () => applyFilters()));

searchInput.addEventListener("input", () => applyFilters());

/* ===============================
   MODAL (PROFESSIONAL)
=================================*/
function openChapters(code, range, title, cls, subject) {

    chapterList.innerHTML = "";

    let [start, end] = range.split("-").map(Number);
    if (start < 1) start = 1;

    const coverURL = `${ncertData.url}${code}cc.jpg`;

    document.getElementById("modalCover").src = coverURL;
    document.getElementById("modalBg").style.backgroundImage =
        `url(${coverURL})`;

    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalMeta").textContent =
        `Class ${cls} • ${subject}`;

    document.getElementById("downloadFullBook").href =
        `${ncertData.url}${code}dd.zip`;

    for (let i = start; i <= end; i++) {

        const chapterNumber = String(i).padStart(2, "0");

        const link = document.createElement("a");
        link.href =
            `${ncertData.url}${code}${chapterNumber}.pdf`;
        link.target = "_blank";
        link.textContent = "Chapter " + i;
        link.className = "chapter-card";

        chapterList.appendChild(link);
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
}

closeBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
});

/* ===============================
   SERVICE WORKER (OPTIONAL)
=================================*/
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("sw.js")
        .then(() => console.log("Service Worker Registered"))
        .catch(err => console.log("SW Error:", err));
}

/* ===============================
   NEWSLETTER SUBSCRIPTION
=================================*/
const newsletterForm = document.getElementById("newsletterForm");
if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        
        // Store email in localStorage
        let subscribers = JSON.parse(localStorage.getItem("subscribers")) || [];
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem("subscribers", JSON.stringify(subscribers));
        }
        
        // Show success message
        const button = newsletterForm.querySelector('button');
        const originalText = button.textContent;
        button.textContent = "✓ Subscribed!";
        button.style.opacity = "0.7";
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.opacity = "1";
            newsletterForm.reset();
        }, 3000);
    });
}

/* ===============================
   SCROLL ANIMATIONS
=================================*/
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate stats, features, and testimonials on scroll
document.querySelectorAll('.stat-card, .feature-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = '0.6s ease-out';
    observer.observe(el);
});

/* ===============================
   KEYBOARD SHORTCUTS
=================================*/
document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
    
    // Alt + D for dark mode toggle
    if (e.altKey && e.key === 'd') {
        darkToggle.click();
    }
});

/* ===============================
   IMPROVED FILTERING WITH MEMORY
=================================*/
// Save filter preferences
function saveFilterPreferences() {
    const preferences = {
        class: classFilter.value,
        subject: subjectFilter.value
    };
    localStorage.setItem("filterPreferences", JSON.stringify(preferences));
}

// Load filter preferences
function loadFilterPreferences() {
    const preferences = JSON.parse(localStorage.getItem("filterPreferences"));
    if (preferences) {
        classFilter.value = preferences.class || "";
        subjectFilter.value = preferences.subject || "";
    }
}

classFilter.addEventListener("change", () => {
    applyFilters();
    saveFilterPreferences();
});

subjectFilter.addEventListener("change", () => {
    applyFilters();
    saveFilterPreferences();
});

loadFilterPreferences();

/* ===============================
   SEARCH HIGHLIGHTING
=================================*/
function highlightSearchTerm(book, searchTerm) {
    if (!searchTerm) return book.text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return book.text.replace(regex, '<mark>$1</mark>');
}

/* ===============================
   BOOK STATISTICS
=================================*/
function getBookStats() {
    return {
        totalBooks: allBooks.length,
        uniqueClasses: [...new Set(allBooks.map(b => b.class))].length,
        uniqueSubjects: [...new Set(allBooks.map(b => b.subject))].length
    };
}

console.log("📚 Library Stats:", getBookStats());

/* ===============================
   PERFORMANCE MONITORING
=================================*/
window.addEventListener("load", () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`Page loaded in ${pageLoadTime}ms`);
});

/* ===============================
   INITIAL LOAD
=================================*/
applyFilters();
