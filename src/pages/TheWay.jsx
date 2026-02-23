import React, { useState } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, Button, SectionHeader } from '../components/shared';
import WebGLBackground from '../components/WebGLBackground';

const TheWay = () => {
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

    const schedules = ["7h", "12h", "18h", "20h", "21h"];

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
                title="The Way Cíclico | Curso de Inglês Flexível Online | Início Imediato"
                description="Curso de inglês online com modelo cíclico. 5 horários disponíveis. Comece em qualquer dia do ano. Aulas ao vivo de segunda a quinta. Flexibilidade total para sua rotina."
            />
            <Navbar onOpenModal={openModal} />
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse="The Way Cíclico" />

            {/* HERO */}
            <header className="relative pt-60 pb-32 px-6 overflow-hidden hero-focus-shift">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-8 reveal">
                        <span className="text-white font-black uppercase text-xs tracking-widest">🔄 Flexibilidade Total</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight text-white ana-heading">
                        {["The", "Way", "Cíclico"].map((word, i) => (
                            <span key={i} className="word-stagger" style={{ animationDelay: `${i * 100}ms` }}>
                                {word}&nbsp;
                            </span>
                        ))}
                        <br />
                        <span className="text-[#fbd24c] word-stagger" style={{ animationDelay: '400ms' }}>Comece Hoje Mesmo.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed reveal" style={{ transitionDelay: '600ms' }}>
                        Modelo espiral contínuo. Escolha seu horário entre 5 opções diárias. Avance no seu ritmo sem prazos engessados.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center reveal" style={{ transitionDelay: '800ms' }}>
                        <Button primary onClick={openModal}>Agendar Visita</Button>
                        <Button onClick={() => document.getElementById('horarios')?.scrollIntoView({ behavior: 'smooth' })}>Ver Horários</Button>
                    </div>
                </div>
            </header>

            {/* DIFERENCIAIS */}
            <section className="py-24 px-6 bg-slate-50 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader
                        tag="Diferenciais"
                        title="Por que The Way Cíclico?"
                        subtitle="A liberdade que sua agenda precisa com o resultado que sua carreira exige."
                    />
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: "🔄", title: "Modelo Cíclico", desc: "Comece em qualquer data. O conteúdo se repete em ciclos." },
                            { icon: "⏰", title: "5 Horários", desc: "Escolha entre 7h, 12h, 18h, 20h ou 21h. Alterne livremente." },
                            { icon: "📈", title: "Seu Ritmo", desc: "Avance somente após cumprir a carga horária de cada nível." }
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

            {/* HORÁRIOS */}
            <section id="horarios" className="py-24 px-6 bg-[#0f172a] text-white relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <SectionHeader
                        tag="Flexibilidade"
                        title="Horários Disponíveis"
                        subtitle="Segunda a Quinta-feira • 1 hora por aula. O mesmo conteúdo em todas as faixas."
                    />
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {schedules.map((time, i) => (
                            <div key={i} className="bg-blue-500/20 border-2 border-blue-500 p-6 rounded-2xl hover:bg-blue-500/30 transition-colors reveal">
                                <p className="text-3xl font-black text-blue-400">{time}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-slate-500 mt-8 text-sm font-medium reveal">Você pode alternar entre os horários conforme sua disponibilidade.</p>
                </div>
            </section>

            {/* COMO FUNCIONA */}
            <section className="py-24 px-6 bg-slate-50 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <SectionHeader
                        tag="Espirais"
                        title="Como Funciona o Modelo Cíclico"
                        subtitle="Um sistema desenhado para nunca deixar lacunas no seu conhecimento."
                    />
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { step: "1", title: "Início Imediato", desc: "Entre em qualquer momento do ano. Não precisa esperar turma fechar." },
                            { step: "2", title: "Aulas Repetidas", desc: "O mesmo conteúdo é ministrado diariamente em múltiplos horários." },
                            { step: "3", title: "Progressão por Carga", desc: "Você só avança após cumprir as horas necessárias do nível atual." },
                            { step: "4", title: "Sem Lacunas", desc: "Se perder uma aula, assiste no próximo ciclo. Ninguém fica para trás." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border-2 border-slate-200 reveal group hover:border-blue-500 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-xl mb-4 shadow-lg shadow-blue-500/30">{item.step}</div>
                                <h3 className="text-xl font-black mb-3 text-[#0f172a] uppercase tracking-tight">{item.title}</h3>
                                <p className="text-slate-600 font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DURAÇÃO */}
            <section className="py-24 px-6 bg-[#0f172a] text-white relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <SectionHeader
                        tag="Prazos"
                        title="Duração Média"
                        subtitle="Seu objetivo está mais perto do que você imagina."
                    />
                    <p className="text-2xl md:text-4xl font-black text-slate-300 mb-12 ana-heading reveal">10 a 12 meses <br /><span className="text-blue-400 text-lg md:text-2xl uppercase tracking-widest">para completar todos os níveis</span></p>
                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 reveal group hover:border-[#fbd24c]/30 transition-all max-w-2xl mx-auto">
                        <h3 className="text-xl font-black mb-4 text-[#fbd24c] uppercase tracking-tight">Garantia de Adaptação</h3>
                        <p className="text-slate-400 font-medium">Reembolso integral se você não se adaptar após as 5 primeiras aulas ao vivo. Sem burocracia.</p>
                    </div>
                    <div className="mt-12 reveal">
                        <Button primary onClick={openModal}>Começar Agora</Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default TheWay;

