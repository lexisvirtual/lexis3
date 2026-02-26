import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../../utils/posts';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import WebGLBackground from '../../components/WebGLBackground';

const BlogIndex = () => {
    const posts = getPosts();
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
            `}</style>

            <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
            <WebGLBackground opacity={heroOpacity} parallax={parallaxY} />

            <SEO
                title="Blog - Artigos sobre Fluência e Alta Performance"
                description="Dicas, estratégias e insights sobre como aprender inglês mais rápido com a metodologia Lexis."
            />

            <Navbar onOpenModal={() => { }} />

            <main className="pt-48 pb-20 px-6 max-w-7xl mx-auto relative z-10 hero-focus-shift">
                <header className="mb-24 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight ana-heading">
                        {["Lexis", "Intel"].map((word, i) => (
                            <span key={i} className="word-stagger" style={{ animationDelay: `${i * 100}ms` }}>
                                {word === "Intel" ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbd24c] to-[#f59e0b]">{word}</span> : word}&nbsp;
                            </span>
                        ))}
                    </h1>
                    <div className="flex justify-center gap-4 mb-6">
                        <Link to="/blog/pauta" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#fbd24c]/40 hover:text-[#fbd24c] transition-all">
                            Admin Pauta
                        </Link>
                    </div>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium transition-all duration-700 delay-300 opacity-0 entrance-ready" style={{ animation: 'wordUp 0.8s var(--premium-easing) forwards 0.4s' }}>
                        Estratégias de guerra para quem não tem tempo a perder com métodos tradicionais.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, idx) => (
                        <Link
                            key={post.slug}
                            to={`/blog/${post.slug}`}
                            className="group bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-[#fbd24c]/30 transition-all duration-500 hover:transform hover:-translate-y-2 block h-full relative"
                            style={{ animation: `wordUp 0.7s var(--premium-easing) forwards ${0.5 + idx * 0.1}s`, opacity: 0 }}
                        >
                            {post.image && (
                                <div className="h-56 overflow-hidden border-b border-white/5 relative">
                                    <div className="absolute inset-0 bg-[#fbd24c]/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 filter group-hover:grayscale-0 grayscale-[40%]"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div className="p-10">
                                <div className="text-[#fbd24c] text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-60 group-hover:opacity-100 transition-opacity">
                                    {post.date ? new Date(post.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').toUpperCase() : 'ARTIGO'}
                                </div>
                                <h2 className="text-2xl font-black text-white mb-4 group-hover:text-[#fbd24c] transition-colors line-clamp-2 ana-heading">{post.title}</h2>
                                <p className="text-slate-400 mb-8 line-clamp-3 text-sm font-medium leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">{post.description}</p>
                                <span className="inline-flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                                    Ler artigo
                                    <svg className="w-4 h-4 text-[#fbd24c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </span>
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

