const fs = require('fs');

// Read data.js content
const dataContent = fs.readFileSync('data.js', 'utf8');

// Extract ncertData object using regex
const match = dataContent.match(/const ncertData\s*=\s*({[\s\S]*})/);
if (!match) {
    console.error('❌ Could not find ncertData in data.js');
    process.exit(1);
}

const ncertData = JSON.parse(match[1]);

// Function to generate slug
function generateSlug(bookClass, subject, bookTitle) {
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

// Collect all URLs
const urls = [];

// Main pages
const mainPages = [
    { url: 'https://setunotes.com/', priority: '1.0', changefreq: 'weekly' },
    { url: 'https://setunotes.com/index.html', priority: '1.0', changefreq: 'weekly' },
    { url: 'https://setunotes.com/about.html', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://setunotes.com/blog.html', priority: '0.7', changefreq: 'weekly' },
    { url: 'https://setunotes.com/faq.html', priority: '0.8', changefreq: 'monthly' },
    { url: 'https://setunotes.com/contact.html', priority: '0.7', changefreq: 'monthly' },
    { url: 'https://setunotes.com/privacy.html', priority: '0.5', changefreq: 'yearly' },
    { url: 'https://setunotes.com/terms.html', priority: '0.5', changefreq: 'yearly' }
];

urls.push(...mainPages);

// All book detail pages
let bookCount = 0;
for (const cls in ncertData.books) {
    for (const subject in ncertData.books[cls]) {
        for (const book of ncertData.books[cls][subject]) {
            const slug = generateSlug(cls, subject, book.text);
            urls.push({
                url: `https://setunotes.com/detail.html?book=${slug}`,
                priority: '0.9',
                changefreq: 'monthly'
            });
            bookCount++;
        }
    }
}

// Generate XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

const today = new Date().toISOString().split('T')[0];

urls.forEach(item => {
    xml += '  <url>\n';
    xml += `    <loc>${item.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += '  </url>\n';
});

xml += '</urlset>';

fs.writeFileSync('sitemap.xml', xml);
console.log('✅ Sitemap.xml generated successfully!');
console.log(`📊 Total URLs: ${urls.length}`);
console.log(`📚 Books included: ${bookCount}`);

