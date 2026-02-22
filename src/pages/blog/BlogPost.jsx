import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getPostBySlug } from '../../utils/posts';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

const BlogPost = () => {
    const { slug } = useParams();
    const post = getPostBySlug(slug);

    if (!post) {
        return (
            <div className="bg-[#020617] min-h-screen text-white flex items-center justify-center font-sans tracking-tighter">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-8">Conteúdo Indisponível</h1>
                    <Link to="/blog" className="bg-[#fbd24c] text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform inline-block">
                        Voltar para a Intel
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#020617] min-h-screen text-slate-300 font-sans selection:bg-[#fbd24c] selection:text-black">
            <SEO
                title={`${post.title} | Lexis Intel`}
                description={post.description}
            />
            <Navbar onOpenModal={() => { }} />

            <main className="pt-40 pb-32 px-6 max-w-4xl mx-auto">
                {/* Ana's Background Breath */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                    <motion.div
                        animate={{
                            opacity: [0.03, 0.07, 0.03],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 15, repeat: Infinity }}
                        className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-[#fbd24c] rounded-full blur-[200px]"
                    />
                </div>

                <article className="relative z-10">
                    <header className="mb-20 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[#fbd24c] text-xs font-black uppercase tracking-[0.5em] mb-8 flex items-center justify-center gap-4"
                        >
                            <span className="w-12 h-[1px] bg-[#fbd24c]/40"></span>
                            {post.category || 'Elite Training'}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-10 leading-[1.1] tracking-tighter"
                        >
                            {post.title}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center justify-center gap-6 text-slate-500 font-bold text-xs uppercase tracking-widest"
                        >
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#fbd24c]"></span>
                                {post.date || 'Hoje'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                            <span>Lexis Academy Team</span>
                        </motion.div>
                    </header>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="prose prose-invert prose-2xl max-w-none 
                        prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter
                        prose-p:text-slate-400 prose-p:leading-relaxed prose-p:font-medium
                        prose-strong:text-[#fbd24c] prose-strong:font-black
                        prose-blockquote:border-l-[#fbd24c] prose-blockquote:bg-white/5 prose-blockquote:p-8 prose-blockquote:rounded-r-3xl
                        prose-code:text-[#fbd24c] prose-code:bg-[#fbd24c]/10 prose-code:px-2 prose-code:py-0.5 prose-code:rounded
                        prose-pre:bg-[#0f172a] prose-pre:border prose-pre:border-slate-800/50 prose-pre:rounded-3xl
                        "
                    >
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </motion.div>
                </article>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-24 pt-12 border-t border-slate-900 flex flex-col items-center"
                >
                    <Link to="/blog" className="group flex items-center gap-4 text-slate-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">
                        <span className="translate-x-0 group-hover:-translate-x-2 transition-transform duration-300">←</span>
                        Explorar mais Intel
                    </Link>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPost;
