import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from '../../utils/posts';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import WebGLBackground from '../../components/WebGLBackground';

const BlogPost = () => {
    const { slug } = useParams();
    const post = getPostBySlug(slug);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [heroOpacity, setHeroOpacity] = useState(1);
    const [parallaxY, setParallaxY] = useState(0);

    React.useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            setScrollProgress(progress);
            setParallaxY(scrollTop * 0.02);
            const fadeThreshold = window.innerHeight * 0.4;
            setHeroOpacity(Math.max(0, 1 - (scrollTop / fadeThreshold)));
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!post) {
        return (
            <div className="bg-[#0f172a] min-h-screen text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4 ana-heading">Post não encontrado</h1>
                    <Link to="/blog" className="text-[#fbd24c] hover:underline uppercase tracking-widest font-black text-xs">Voltar para o Blog</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen relative overflow-x-hidden ana-design-system bg-[#0f172a]">
            <style>{`
                .ana-design-system {
                    --premium-easing: cubic-bezier(0.22, 1, 0.36, 1);
                    --accent-gold: #fbd24c;
                    --section-reveal: 0.75s;
                }
                @media (max-width: 768px) { canvas { display: none !important; } }
                .scroll-progress-bar { position: fixed; top: 0; left: 0; height: 2px; background: var(--accent-gold); opacity: 0.7; z-index: 9999; transition: width 0.1s linear; }
                .ana-design-system::after { content: ""; position: fixed; inset: 0; pointer-events: none; opacity: 0.004; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); z-index: 2; }
                .hero-focus-shift { animation: focusShift 1s var(--premium-easing) forwards; }
                @keyframes focusShift { from { filter: blur(2px); opacity: 0; } to { filter: blur(0); opacity: 1; } }
                .word-stagger { display: inline-block; opacity: 0; transform: translateY(4px); animation: wordUp 0.7s var(--premium-easing) forwards; }
                @keyframes wordUp { to { opacity: 1; transform: translateY(0); } }
                .ana-heading { 
                    letter-spacing: -0.015em; 
                    line-height: 1.05; 
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    hyphens: auto;
                }
                
                @media (max-width: 768px) {
                    .ana-heading { font-size: 1.8rem !important; letter-spacing: -0.02em !important; }
                    .ana-prose h2 { font-size: 1.5rem !important; margin-top: 2em !important; overflow-wrap: break-word; }
                    .ana-prose h3 { font-size: 1.25rem !important; overflow-wrap: break-word; }
                    .ana-prose table { display: block; width: 100% !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch; border-radius: 1rem; position: relative; }
                    .ana-prose td, .ana-prose th { min-width: 140px; padding: 1rem !important; font-size: 0.85rem !important; }
                    .ana-prose blockquote { font-size: 1.1rem !important; margin: 2rem 0 !important; }
                }
                
                /* Apple-Inspired Minimalism (Ana v3.7) */
                .ana-prose {
                    color: #94a3b8;
                    font-weight: 400;
                    line-height: 1.8;
                    letter-spacing: -0.011em;
                }
                .ana-prose h2, .ana-prose h3 {
                    color: white;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    margin-top: 4em;
                    margin-bottom: 1.5em;
                }
                .ana-prose h2 { font-size: 2.25rem; }
                .ana-prose h3 { font-size: 1.8rem; }
                .ana-prose strong { color: white; font-weight: 700; }
                .ana-prose a { color: #fbd24c; font-weight: 600; text-decoration: none; transition: opacity 0.3s; }
                .ana-prose a:hover { opacity: 0.7; }
                .ana-prose blockquote { 
                    border-left: 2px solid #fbd24c; 
                    background: transparent; 
                    padding: 0 0 0 2rem; 
                    margin: 3rem 0;
                    font-size: 1.4rem;
                    line-height: 1.6;
                    color: #e2e8f0;
                }

                /* Apple Comparison Style Table */
                .ana-prose table { 
                    width: 100%; 
                    border-collapse: separate; 
                    border-spacing: 0;
                    margin: 0;
                    background: rgba(255,255,255,0.01);
                    border-radius: 1.5rem;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .table-scroll-wrapper {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    border-radius: 1.5rem;
                    margin: 4rem 0;
                    width: 100%;
                }
                .ana-prose thead tr { background: transparent; }
                .ana-prose th { 
                    color: #94a3b8; 
                    font-weight: 600; 
                    text-transform: none; 
                    letter-spacing: -0.01em; 
                    font-size: 0.85rem; 
                    padding: 2rem 1.5rem; 
                    text-align: left;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .ana-prose td { 
                    padding: 1.5rem; 
                    border-bottom: 1px solid rgba(255,255,255,0.03); 
                    color: #cbd5e1; 
                    vertical-align: middle; 
                }
                .ana-prose tr:last-child td { border-bottom: none; }
                .ana-prose td:first-child { 
                    color: white; 
                    font-weight: 600; 
                    font-size: 0.9rem; 
                    text-transform: none;
                    width: 30%;
                }
                .ana-prose td:nth-child(2) { color: #94a3b8; }
                .ana-prose td:nth-child(3) { color: white; font-weight: 600; }

                /* Mobile — DEVE VIR DEPOIS das regras desktop para ter prioridade correta */
                @media (max-width: 768px) {
                    .ana-heading { font-size: 1.8rem !important; letter-spacing: -0.02em !important; }
                    .ana-prose h2 { font-size: 1.5rem !important; margin-top: 2em !important; overflow-wrap: break-word; }
                    .ana-prose h3 { font-size: 1.25rem !important; overflow-wrap: break-word; }
                    .ana-prose td, .ana-prose th { min-width: 130px; padding: 0.875rem 1rem !important; font-size: 0.85rem !important; }
                    .ana-prose blockquote { font-size: 1.1rem !important; margin: 2rem 0 !important; }
                }
            `}</style>

            <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
            <WebGLBackground opacity={heroOpacity} parallax={parallaxY} />

            <SEO
                title={post.title}
                description={post.description}
            />
            <Navbar onOpenModal={() => { }} />

            <main className="pt-32 md:pt-48 pb-32 px-4 md:px-6 max-w-4xl mx-auto relative z-10 hero-focus-shift">
                <article className="ana-prose prose prose-invert prose-lg max-w-none">
                    <header className="mb-16 text-center max-w-full overflow-hidden">
                        <div className="text-[#fbd24c] text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-60">
                            {post.category || 'Blog Lexis'} • <time className="font-mono">{post.date}</time>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-10 leading-tight ana-heading hero-focus-shift">
                            {post.title}
                        </h1>

                        {post.image && (
                            <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl mt-12 border border-white/5 reveal active" style={{ animationDelay: '0.4s' }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-40"></div>
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-[400px] md:h-[500px] object-cover filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                    loading="eager"
                                />
                            </div>
                        )}
                    </header>

                    <div className="bg-white/[0.02] backdrop-blur-sm border border-white/5 p-6 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden reveal active" style={{ animationDelay: '0.6s' }}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbd24c]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: () => null,
                                table: ({node, ...props}) => (
                                    <div className="table-scroll-wrapper">
                                        <table {...props} />
                                    </div>
                                )
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>

                        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#fbd24c] to-[#f59e0b] flex items-center justify-center font-black text-[#0f172a]">L</div>
                                <div>
                                    <p className="text-white font-black text-xs uppercase tracking-widest">Equipe Lexis</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">Authority & Intelligence</p>
                                </div>
                            </div>
                            <Link to="/blog" className="inline-flex items-center gap-3 text-[#fbd24c] font-black uppercase tracking-widest text-[10px] hover:gap-5 transition-all">
                                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                Voltar para o Índice
                            </Link>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPost;

