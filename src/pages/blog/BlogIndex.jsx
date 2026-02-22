
import React from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../../utils/posts';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

const BlogIndex = () => {
    const posts = getPosts();

    return (
        <div className="bg-[#0f172a] min-h-screen text-slate-300 font-sans selection:bg-[#fbd24c] selection:text-[#0f172a]">
            <SEO
                title="Blog - Artigos sobre Fluência e Alta Performance"
                description="Dicas, estratégias e insights sobre como aprender inglês mais rápido com a metodologia Lexis."
            />

            <Navbar onOpenModal={() => { }} />

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <header className="mb-16 text-center">
                    <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight">Lexis <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbd24c] to-[#f59e0b]">Intel</span></h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">Estratégias de guerra para quem não tem tempo a perder com métodos tradicionais.</p>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link key={post.slug} to={`/blog/${post.slug}`} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#fbd24c]/50 transition-all hover:transform hover:-translate-y-1 block h-full">
                            {post.image && (
                                <div className="h-48 overflow-hidden border-b border-white/5 relative">
                                    <div className="absolute inset-0 bg-[#fbd24c]/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:grayscale-0 grayscale-[30%]"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div className="p-8">
                                <div className="text-[#fbd24c] text-xs font-bold uppercase tracking-widest mb-4">
                                    {post.date ? new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').toUpperCase() : 'ARTIGO'}
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-[#fbd24c] transition-colors line-clamp-2">{post.title}</h2>
                                <p className="text-slate-400 mb-6 line-clamp-3 text-sm leading-relaxed">{post.description}</p>
                                <span className="text-white text-sm font-bold border-b border-[#fbd24c] pb-0.5">Ler artigo →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogIndex;
