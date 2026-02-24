import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const WORKER_URL = "https://lexis-publisher.lexis-english-account.workers.dev/status";

const LeoInsights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(WORKER_URL);
                const json = await res.json();
                setData(json.status);
                setLoading(false);
            } catch (e) {
                setError("Falha ao conectar com o Cérebro do Leo.");
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh a cada 30s
        return () => clearInterval(interval);
    }, []);

    const phases = [
        { id: 1, name: "Fundação", desc: "Informacional & Pillar Pages", months: "Fev-Mar" },
        { id: 2, name: "Comparativos", desc: "Brasil vs Exterior", months: "Abr" },
        { id: 3, name: "Autoridade", desc: "Neurociência & Casos", months: "Mai" },
        { id: 4, name: "Conversão", desc: "Perfis de Executivos", months: "Jun" },
        { id: 5, name: "Local SEO", desc: "Domínio Regional", months: "Jul" },
        { id: 6, name: "Elite", desc: "Objeções & Escala", months: "Ago" }
    ];

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-[#fbd24c] border-t-transparent rounded-full"
            />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-center p-6">
            <h2 className="text-2xl font-black mb-4">Radar Fora de Alcance</h2>
            <p className="text-slate-400 mb-8 max-w-md">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="bg-[#fbd24c] text-[#020617] px-8 py-3 rounded-xl transition-all font-bold uppercase tracking-widest text-xs"
            >
                Tentar Reconectar
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <SEO title="Leo Insights | Dashboard de Estratégia Lexis" description="Acompanhe a evolução da autoridade semântica da Lexis Academy em tempo real." />
            <Navbar />

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <header className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row justify-between items-end gap-6"
                    >
                        <div>
                            <span className="text-[#fbd24c] font-black uppercase tracking-[0.3em] text-xs mb-3 block">Strategy Intelligence</span>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Leo Insights Center</h1>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Leo está Online</span>
                        </div>
                    </motion.div>
                </header>

                {/* GRID PRINCIPAL */}
                <div className="grid lg:grid-cols-3 gap-8 mb-12">

                    {/* CARD 1: FASE ATUAL */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group"
                    >
                        <div className="relative z-10">
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#fbd24c] mb-6">Fase do Plano de 6 Meses</h2>
                            <div className="flex flex-wrap gap-4 mb-10">
                                {phases.map((p, idx) => (
                                    <div key={p.id} className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xs mb-2 transition-all ${idx < (new Date().getMonth() - 1) ? 'bg-green-500 text-white' : idx === (new Date().getMonth() - 1) ? 'bg-[#fbd24c] text-[#020617] ring-4 ring-[#fbd24c]/20' : 'bg-white/10 text-white/40'}`}>
                                            {idx < (new Date().getMonth() - 1) ? '✓' : `0${p.id}`}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${idx === (new Date().getMonth() - 1) ? 'text-white' : 'text-slate-500'}`}>{p.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="grid md:grid-cols-2 gap-10">
                                <div>
                                    <h3 className="text-3xl font-black mb-2">{data?.leo?.plan_phase}</h3>
                                    <p className="text-slate-400 text-sm font-medium">Foco atual: Domínio de termos informacionais e construção de base de tráfego orgânico.</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                    <span className="text-[10px] font-black uppercase text-slate-500 block mb-2">Próxima Grande Meta</span>
                                    <p className="font-bold">Pivotagem para Cluster de Comparativos (Externo vs Interno) em 15 dias.</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbd24c]/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                    </motion.div>

                    {/* CARD 2: QUALIDADE (EMA) */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between"
                    >
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#fbd24c] mb-8">Content Quality (EMA)</h2>
                            <div className="text-center py-6">
                                <span className="text-8xl font-black tracking-tighter text-white">{data?.blog?.quality_ema || '--'}</span>
                                <span className="text-[#fbd24c] font-black text-xl">/100</span>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/5">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-2">
                                <span>Threshold: {data?.blog?.target_threshold}pts</span>
                                <span>Status: {data?.blog?.status}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data?.blog?.quality_ema}%` }}
                                    className="h-full bg-gradient-to-r from-green-500 to-[#fbd24c]"
                                />
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* SEGUNDA LINHA */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* ALVO DO DIA */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#fbd24c] mb-8">Alvo do Próximo Fallback</h2>
                        <div className="mb-8">
                            <span className="text-[10px] font-black uppercase bg-[#fbd24c]/20 text-[#fbd24c] px-3 py-1 rounded-full mb-3 inline-block">
                                Cluster: {data?.leo?.target?.cluster}
                            </span>
                            <h3 className="text-2xl font-black leading-tight italic">"{data?.leo?.target?.topic}"</h3>
                        </div>
                        <div className="text-xs text-slate-500 space-y-2">
                            <p>• Intenção: Informacional-Educativa</p>
                            <p>• Keywords: Lexis 3F, Imersão Brasil, Intensivo</p>
                            <p>• Trigger: Automático (Amanhã 06:00 BRT)</p>
                        </div>
                    </div>

                    {/* LOGS DE OPERAÇÃO */}
                    <div className="lg:col-span-2 bg-[#0a101f] border border-white/10 rounded-[2.5rem] p-10 overflow-hidden relative">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8 flex justify-between">
                            <span>Relatório de Operação de Campo</span>
                            <span className="text-[10px]">v{data?.v}</span>
                        </h2>
                        <div className="font-mono text-sm text-green-500/80 space-y-3 h-48 overflow-y-auto custom-scrollbar">
                            <p className="flex gap-4">
                                <span className="text-slate-600">[{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}]</span>
                                <span className="text-white font-bold">{data?.lastLog || 'Aguardando próximo log...'}</span>
                            </p>
                            <p className="flex gap-4 opacity-50">
                                <span className="text-slate-600">[INFO]</span>
                                <span>Leo: Sistema operando sob Protocolo SEO v1.1.</span>
                            </p>
                            <p className="flex gap-4 opacity-50">
                                <span className="text-slate-600">[INFO]</span>
                                <span>Memory: Score de Prioridade recalculado para {data?.blog?.total_posts} ativos.</span>
                            </p>
                            <p className="flex gap-4 animate-pulse">
                                <span className="text-slate-600">[SCAN]</span>
                                <span className="text-[#fbd24c]">Monitorando SERP para: {data?.leo?.target?.topic}</span>
                            </p>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a101f] to-transparent pointer-events-none"></div>
                    </div>

                </div>

                {/* BOTÃO DE AÇÃO */}
                <div className="mt-12 flex justify-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.open(`https://lexis-publisher.lexis-english-account.workers.dev/auto-publish`, '_blank')}
                        className="bg-[#fbd24c] text-[#020617] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-[#fbd24c]/20"
                    >
                        Forçar Ciclo de Produção Manual
                    </motion.button>
                </div>
            </main>

            <Footer />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default LeoInsights;
