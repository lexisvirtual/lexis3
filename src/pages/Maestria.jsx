import React, { useState } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, Button, SectionHeader } from '../components/shared';
import WebGLBackground from '../components/WebGLBackground';

const Maestria = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [heroOpacity, setHeroOpacity] = useState(1);
    const [parallaxY, setParallaxY] = useState(0);
    const openModal = () => setIsModalOpen(true);

    useRevealOnScroll();

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
                .reveal { opacity: 0; transform: translateY(20px); transition: opacity var(--section-reveal) var(--premium-easing), transform var(--section-reveal) var(--premium-easing); }
                .reveal.active { opacity: 1; transform: translateY(0); }
                .ana-heading { letter-spacing: -0.015em; line-height: 1.05; }
            `}</style>

            <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
            <WebGLBackground opacity={heroOpacity} parallax={parallaxY} />

            <SEO
                title="Maestria Online | Curso Intensivo de Inglês 8 Semanas | 120h Ao Vivo"
                description="Curso intensivo online de inglês em 8 semanas. 120 horas de aulas ao vivo (19h-22h). Garantia vitalícia. Metodologia Lexis adaptada para o digital. Resultados rápidos sem sair de casa."
            />
            <Navbar onOpenModal={openModal} />
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse="Maestria Online" />

            {/* HERO */}
            <header className="relative pt-60 pb-32 px-6 overflow-hidden hero-focus-shift">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-8 reveal">
                        <span className="text-white font-black uppercase text-xs tracking-widest">⚡ Alta Performance</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight text-white ana-heading">
                        {["Maestria", "Online"].map((word, i) => (
                            <span key={i} className="word-stagger" style={{ animationDelay: `${i * 100}ms` }}>
                                {word}&nbsp;
                            </span>
                        ))}
                        <br />
                        <span className="text-[#fbd24c] word-stagger" style={{ animationDelay: '300ms' }}>8 Semanas. 100% Ao Vivo.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed reveal" style={{ transitionDelay: '500ms' }}>
                        Treinamento de alta performance sem sair de casa. 3 horas diárias ao vivo (19h-22h) com metodologia Lexis adaptada para o ambiente digital.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center reveal" style={{ transitionDelay: '700ms' }}>
                        <Button primary onClick={openModal}>Solicitar Cronograma</Button>
                        <Button onClick={() => document.getElementById('ferramentas')?.scrollIntoView({ behavior: 'smooth' })}>Ver Ferramentas</Button>
                    </div>
                </div>
            </header>

            {/* DIFERENCIAIS */}
            <section className="py-24 px-6 bg-slate-50 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader
                        tag="Diferenciais"
                        title="Por que o Maestria Online?"
                        subtitle="A conveniência do digital com a intensidade da Lexis Academy."
                    />
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: "🖥️", title: "100% Online", desc: "Acessível de qualquer lugar. Aulas ao vivo das 19h às 22h." },
                            { icon: "🎥", title: "Aulas Gravadas", desc: "Todas as aulas ficam disponíveis para revisão e reposição." },
                            { icon: "🔄", title: "Garantia Vitalícia", desc: "Refaça o curso quantas vezes quiser, sem custo adicional." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 reveal group hover:border-[#fbd24c] transition-colors">
                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                                <h3 className="text-xl font-black mb-3 text-[#0f172a] uppercase tracking-tight">{item.title}</h3>
                                <p className="text-slate-600 font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FERRAMENTAS */}
            <section id="ferramentas" className="py-24 px-6 bg-[#0f172a] text-white relative z-10">
                <div className="max-w-5xl mx-auto">
                    <SectionHeader
                        tag="Ecossistema"
                        title="Ferramentas Inclusas"
                        subtitle="Sua jornada é potencializada por tecnologia de elite."
                    />
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { name: "Plataforma Teaches", desc: "Central de conteúdos organizada e eficiente." },
                            { name: "Memrise", desc: "Repetição espaçada para fixação de vocabulário." },
                            { name: "Gab English IA", desc: "Treino de conversação via WhatsApp com IA." },
                            { name: "ChatClass", desc: "Simulações diárias de conversas reais." },
                            { name: "Aulas Gravadas", desc: "Revisão e reposição quando precisar." }
                        ].map((tool, i) => (
                            <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 reveal group hover:border-[#fbd24c]/30 transition-all">
                                <h3 className="text-lg font-black text-[#fbd24c] mb-2 uppercase tracking-tight">{tool.name}</h3>
                                <p className="text-slate-400 text-sm font-medium">{tool.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CRONOGRAMA */}
            <section className="py-24 px-6 bg-slate-50 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <SectionHeader
                        tag="Estrutura"
                        title="Como Funciona"
                        subtitle="Um sistema planejado para sua máxima evolução em 60 dias."
                    />
                    <div className="space-y-4">
                        {[
                            { title: "Duração", desc: "8 semanas (2 meses)" },
                            { title: "Carga Horária", desc: "120 horas totais" },
                            { title: "Horário", desc: "Segunda a sexta, 19h às 22h (3h/dia ao vivo)" },
                            { title: "Formato", desc: "Aulas ao vivo + ferramentas complementares" },
                            { title: "Nível", desc: "Básico a Intermediário (não recomendado para avançados)" }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border-2 border-slate-200 flex justify-between items-center reveal">
                                <span className="font-black text-[#0f172a] uppercase tracking-tighter">{item.title}</span>
                                <span className="text-slate-600 font-bold">{item.desc}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-center reveal">
                        <Button primary onClick={openModal}>Garantir Minha Vaga</Button>
                    </div>
                </div>
            </section>

            {/* METODOLOGIA */}
            <section className="py-24 px-6 bg-[#0f172a] text-white relative z-10">
                <div className="max-w-5xl mx-auto">
                    <SectionHeader
                        tag="Ciência"
                        title="Metodologia Ativa"
                        subtitle="Não é estudo passivo. É treinamento procedural de alta performance."
                    />
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            "Aula Invertida",
                            "Instrução por Pares",
                            "Repetição Espaçada",
                            "Aprendizagem Baseada em Problemas",
                            "Gamificação",
                            "Grupos Operativos"
                        ].map((method, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl reveal">
                                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-[#0f172a] font-black text-sm">{i + 1}</div>
                                <span className="font-bold text-slate-200">{method}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Maestria;

