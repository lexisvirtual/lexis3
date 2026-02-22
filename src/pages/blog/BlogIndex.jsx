import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getPosts } from '../../utils/posts';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

const BlogIndex = () => {
    const posts = getPosts();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-[#fbd24c] selection:text-black font-sans">
            <SEO
                title="Lexis Intel - Artigos de Elite para Fluência"
                description="Estratégias de guerra e curas pedagógicas para dominar o inglês da vida real."
            />
            <Helmet>
                <title>Lexis Intel | Blog de Elite</title>
            </Helmet>

            <Navbar onOpenModal={() => { }} />

            <header className="pt-40 pb-20 px-6 relative overflow-hidden">
                {/* Ana's Kinetic Background Hint */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.05, 0.1, 0.05]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1/4 left-1/4 w-[600px] h-[600px] bg-[#fbd24c] rounded-full blur-[150px]"
                    />
                </div>

                <div className="max-w-6xl mx-auto relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-none"
                    >
                        LEXIS <span className="text-[#fbd24c]">INTEL</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-slate-400 text-lg md:text-2xl max-w-2xl mx-auto font-medium tracking-tight"
                    >
                        Micro-doses de alta performance para quem não tem tempo a perder.
                    </motion.p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 pb-32">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-12"
                >
                    {posts.map((post) => (
                        <motion.div
                            key={post.slug}
                            variants={itemVariants}
                            whileHover={{ y: -12 }}
                            className="group"
                        >
                            <Link to={`/blog/${post.slug}`} className="block h-full bg-[#0f172a]/40 border border-slate-800/50 rounded-[40px] p-10 md:p-14 transition-all duration-700 hover:border-[#fbd24c]/40 hover:bg-[#0f172a]/80 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5),0_0_50px_-10px_rgba(251,210,76,0.05)] relative overflow-hidden">

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="text-[#fbd24c] text-xs font-bold uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                        <span className="w-10 h-[1px] bg-[#fbd24c]/40"></span>
                                        {post.date ? new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').toUpperCase() : 'ELITE'}
                                    </div>

                                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight group-hover:text-[#fbd24c] transition-colors duration-500 tracking-tight">
                                        {post.title}
                                    </h2>

                                    <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-12 line-clamp-3 font-medium">
                                        {post.description}
                                    </p>

                                    <div className="mt-auto flex items-center gap-3 text-[#fbd24c] font-black text-sm uppercase tracking-[0.2em] group-hover:gap-5 transition-all duration-500">
                                        Acessar Conteúdo <span className="text-xl">→</span>
                                    </div>
                                </div>

                                {/* Background Gloss effect by Ana */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#fbd24c]/0 via-transparent to-[#fbd24c]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogIndex;
