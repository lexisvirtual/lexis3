
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from '../../utils/posts';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

const BlogPost = () => {
    const { slug } = useParams();
    const post = getPostBySlug(slug);

    if (!post) {
        return (
            <div className="bg-[#0f172a] min-h-screen text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Post não encontrado</h1>
                    <Link to="/blog" className="text-[#fbd24c] hover:underline">Voltar para o Blog</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0f172a] min-h-screen text-slate-300 font-sans selection:bg-[#fbd24c] selection:text-[#0f172a]">
            <SEO
                title={post.title}
                description={post.description}
            />
            <Navbar onOpenModal={() => { }} />

            <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
                <article className="prose prose-invert prose-lg prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-[#fbd24c] prose-img:rounded-xl">
                    <header className="mb-10 text-center">
                        <div className="text-[#fbd24c] text-sm font-bold uppercase tracking-widest mb-4">{post.category || 'Blog Lexis'}</div>
                        <h1 className="text-4xl md:text-5xl text-white mb-6 leading-tight">{post.title}</h1>
                        <time className="text-slate-500 font-mono text-sm">{post.date}</time>
                    </header>

                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPost;
