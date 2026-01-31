
import matter from 'gray-matter';

export function getPosts() {
    // imports all .md files from src/posts as raw strings
    const modules = import.meta.glob('/src/posts/*.md', { as: 'raw', eager: true });

    const posts = Object.keys(modules).map((path) => {
        const slug = path.split('/').pop().replace('.md', '');
        const rawContent = modules[path];
        const { data, content } = matter(rawContent);

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
