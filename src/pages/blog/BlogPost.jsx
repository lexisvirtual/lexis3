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
                .ana-heading { letter-spacing: -0.015em; line-height: 1.05; }
                
                /* Prose Optimization for Ana v60 */
                .ana-prose {
                    color: #94a3b8;
                    font-weight: 500;
                }
                .ana-prose h2, .ana-prose h3 {
                    color: white;
                    font-weight: 900;
                    letter-spacing: -0.02em;
                    margin-top: 2.5em;
                }
                .ana-prose strong { color: white; font-weight: 800; }
                .ana-prose a { color: #fbd24c; font-weight: 800; text-decoration: none; border-bottom: 1px solid rgba(251, 210, 76, 0.3); transition: all 0.3s; }
                .ana-prose a:hover { border-bottom-color: #fbd24c; }
                .ana-prose blockquote { border-left-color: #fbd24c; background: rgba(251, 210, 76, 0.03); padding: 2rem; border-radius: 0 2rem 2rem 0; font-style: italic; color: #cbd5e1; }

                /* Tabela AMADOR vs ELITE */
                .ana-prose table { width: 100%; border-collapse: collapse; margin: 2rem 0; font-size: 0.9rem; }
                .ana-prose thead tr { background: rgba(251, 210, 76, 0.08); border-bottom: 2px solid rgba(251, 210, 76, 0.3); }
                .ana-prose th { color: #fbd24c; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.7rem; padding: 1rem 1.25rem; text-align: left; }
                .ana-prose td { padding: 0.85rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: #cbd5e1; vertical-align: top; line-height: 1.6; }
                .ana-prose tr:last-child td { border-bottom: none; }
                .ana-prose tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
                .ana-prose td:first-child { color: #94a3b8; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .ana-prose td:nth-child(2) { color: #ef4444; }
                .ana-prose td:nth-child(3) { color: #4ade80; font-weight: 600; }
            `}</style>

            <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
            <WebGLBackground opacity={heroOpacity} parallax={parallaxY} />

            <SEO
                title={post.title}
                description={post.description}
            />
            <Navbar onOpenModal={() => { }} />

            <main className="pt-48 pb-32 px-6 max-w-4xl mx-auto relative z-10 hero-focus-shift">
                <article className="ana-prose prose prose-invert prose-lg max-w-none">
                    <header className="mb-16 text-center">
                        <div className="text-[#fbd24c] text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-60 reveal active">
                            {post.category || 'Blog Lexis'} • <time className="font-mono">{post.date}</time>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-10 leading-tight ana-heading">
                            {post.title.split(' ').map((word, i) => (
                                <span key={i} className="word-stagger" style={{ animationDelay: `${i * 40}ms` }}>{word}&nbsp;</span>
                            ))}
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

                    <div className="bg-white/[0.02] backdrop-blur-sm border border-white/5 p-8 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden reveal active" style={{ animationDelay: '0.6s' }}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbd24c]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>

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

