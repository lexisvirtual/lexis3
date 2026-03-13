import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';


const BlogPauta = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://lexis-publisher.lexis-english-account.workers.dev/pauta');
            const json = await response.json();
            setData(json);
        } catch (err) {
            console.error('Falha ao carregar pauta:', err);
        } finally {
            setLoading(false);
        }
    };

    const triggerProduction = async () => {
        setActionLoading(true);
        try {
            await fetch('https://lexis-publisher.lexis-english-account.workers.dev/auto-publish');
            alert('Produção iniciada no Worker. Aguarde alguns minutos e atualize.');
            fetchData();
        } catch (err) {
            alert('Falha ao disparar produção.');
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            setScrollProgress((scrollTop / (docHeight || 1)) * 100);
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
                .scroll-progress-bar { position: fixed; top: 0; left: 0; height: 2px; background: var(--accent-gold); opacity: 0.7; z-index: 9999; }
                .ana-design-system::after { content: ""; position: fixed; inset: 0; pointer-events: none; opacity: 0.005; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); z-index: 2; }
                .status-badge { padding: 4px 12px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
                .badge-approved { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
                .badge-rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
                .badge-triaged { background: rgba(251, 210, 76, 0.1); color: #fbd24c; border: 1px solid rgba(251, 210, 76, 0.2); }
                .stock-card { transition: all 0.4s var(--premium-easing); }
                .stock-card:hover { transform: translateX(8px); border-color: rgba(251, 210, 76, 0.3); background: rgba(255, 255, 255, 0.05); }
            `}</style>

            <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />


            <SEO title="Pauta de Elite - Controle de Estoque Lexis" description="Visualize a fila de produção e os artigos prontos para publicação." />
            <Navbar onOpenModal={() => { }} />

            <main className="pt-48 pb-20 px-6 max-w-5xl mx-auto relative z-10">
                <header className="mb-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <span className="text-[#fbd24c] text-xs font-black uppercase tracking-[0.3em] mb-4 block">Pauta v3.0</span>
                            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">Stockpile <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbd24c] to-[#f59e0b]">Dashboard</span></h1>
                            <p className="text-slate-400 font-medium max-w-xl">Gerenciamento da Fila de Ouro. O Roger garante que apenas o melhor conteúdo chegue ao estoque.</p>
                        </div>
                        <button
                            onClick={triggerProduction}
                            disabled={actionLoading}
                            className="bg-white text-[#0f172a] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#fbd24c] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            {actionLoading ? 'Processando...' : 'Forçar Refill / Produzir'}
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-[#fbd24c]/20 border-t-[#fbd24c] rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Consultando Worker...</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* ESTOQUE */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-2xl font-black text-white">Fila de Ouro (Prontos)</h2>
                                <span className="bg-[#fbd24c]/10 text-[#fbd24c] text-[10px] font-black px-3 py-1 rounded-full">{data?.stockpile?.length || 0}/5</span>
                            </div>

                            <div className="space-y-4">
                                {data?.stockpile?.length > 0 ? data.stockpile.map((post, i) => (
                                    <div key={i} className="stock-card p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                <span>Score: <span className="text-green-500">{post.score}</span></span>
                                                <span>•</span>
                                                <span>{post.version}</span>
                                            </div>
                                        </div>
                                        <div className="hidden md:block text-right">
                                            <div className="status-badge badge-approved mb-2">Aprovado pelo Roger</div>
                                            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Aguardando 06:00h</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">O estoque está vazio. Clique em Produzir.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* TRIAGEM */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-2xl font-black text-white">Triagem (Fila News)</h2>
                                <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full">{data?.triaged_count || 0}</span>
                            </div>
                            <div className="p-8 bg-blue-500/[0.02] border border-blue-500/10 rounded-2xl">
                                <p className="text-slate-400 text-sm font-medium">Existem {data?.triaged_count || 0} artigos mapeados que serão transformados pelo Diretor Lexis na próxima rodada de refill.</p>
                            </div>
                        </section>

                        {/* REJEITADOS */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-2xl font-black text-white">Vetos do Roger (Rejeitados)</h2>
                                <span className="bg-red-500/10 text-red-400 text-[10px] font-black px-3 py-1 rounded-full">{data?.rejected?.length || 0}</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {data?.rejected?.map((rej, i) => (
                                    <div key={i} className="p-6 bg-red-500/[0.02] border border-red-500/10 rounded-2xl">
                                        <h3 className="text-white font-bold mb-3 text-sm line-clamp-1">{rej.title}</h3>
                                        <p className="text-red-400/80 text-[10px] italic leading-relaxed mb-4">"{rej.reason}"</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Score: {rej.score}</span>
                                            <span className="text-[9px] text-slate-700 font-bold">{new Date(rej.at).toLocaleTimeString('pt-BR')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default BlogPauta;
