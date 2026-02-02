

// Custom frontmatter parser (replaces gray-matter to avoid Buffer issues)
function parseFrontmatter(rawContent) {
    const match = rawContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

    if (!match) {
        return { data: {}, content: rawContent };
    }

    const [, frontmatterText, content] = match;
    const data = {};

    frontmatterText.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim();
            const value = line.slice(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
            data[key] = value;
        }
    });

    return { data, content: content.trim() };
}

export function getPosts() {
    // imports all .md files from src/posts as raw strings
    const modules = import.meta.glob('/src/posts/*.md', { query: '?raw', import: 'default', eager: true });

    const posts = Object.keys(modules).map((path) => {
        const slug = path.split('/').pop().replace('.md', '');
        const rawContent = modules[path];
        const { data, content } = parseFrontmatter(rawContent);

        return {
            slug,
            ...data, // frontmatter properties (title, date, etc)
            content, // body of the markdown
        };
    });

    // Sort by date desc
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostBySlug(slug) {
    const posts = getPosts();
    return posts.find((post) => post.slug === slug);
}
