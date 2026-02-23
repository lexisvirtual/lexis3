import React, { useState } from 'react';
import activeTheme from '../data/cee/active-theme.json';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, Button, SectionHeader } from '../components/shared';

const FAQItem = ({ question, answer, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`border-b border-white/5 reveal reveal-delay-${(index % 3) + 1}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left group"
            >
                <span className={`text-lg font-bold tracking-tight transition-colors ${isOpen ? 'text-[#fbd24c]' : 'text-white group-hover:text-[#fbd24c]'}`}>
                    {question}
                </span>
                <span className={`transform transition-transform duration-300 text-[#fbd24c] ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                <p className="text-[#94a3b8] leading-relaxed font-medium">
                    {answer}
                </p>
            </div>
        </div>
    );
};

import WebGLBackground from '../components/WebGLBackground';

const Home = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [heroOpacity, setHeroOpacity] = useState(1);
    const [parallaxY, setParallaxY] = useState(0);

    const openModal = (course = '') => { setSelectedCourse(course); setIsModalOpen(true); };

    useRevealOnScroll();

    React.useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;

            setScrollProgress(progress);
            setParallaxY(scrollTop * 0.02);

            // Cinematic Hero Fade (40% viewport threshold)
            const fadeThreshold = window.innerHeight * 0.4;
            const opacity = Math.max(0, 1 - (scrollTop / fadeThreshold));
            setHeroOpacity(opacity);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const faqs = [
        { q: "O método Lexis serve para quem é totalmente iniciante?", a: "Absolutamente. Nossa metodologia 'Start' foca na fonética e estruturas básicas justamente para construir uma base sólida e automatizada desde o primeiro dia, evitando vícios comuns de quem tenta aprender sozinho." },
        { q: "Qual a diferença entre a Imersão e o Maestria Online?", a: "A Imersão é um choque cultural e cognitivo de 14 dias presenciais em São Carlos-SP com 10h de prática diária. O Maestria Online adapta essa mesma neurociência para um formato digital de 8 semanas, ideal para quem precisa de flexibilidade." },
        { q: "Realmente é possível atingir fluência em tão pouco tempo?", a: "Tratamos o inglês como uma habilidade motora e não como estudo acadêmico. Ao focar na automação cognitiva (falar sem pensar em traduzir), o tempo de resposta do cérebro diminuui drasticamente, o que acelera a fluência real." },
        { q: "Como funciona o suporte para tirar dúvidas?", a: "Oferecemos mentoria individual semanal e suporte nativo via plataforma e WhatsApp. Como nosso foco é o treinamento procedural, você sempre terá um especialista acompanhando sua evolução fonética e estrutural." },
        { q: "Preciso de um nível mínimo de inglês para participar?", a: "Não. Temos programas que vão do zero absoluto ao nível executivo. Realizamos uma avaliação de perfil para direcionar você ao treinamento que trará o maior ROI para sua carreira." }
    ];

    return (
        <div className="flex flex-col w-full min-h-screen relative overflow-x-hidden ana-design-system">
            <style>{`
                /* 1. Atmo WebGL Field (v10/10) */
                .ana-design-system {
                    --premium-easing: cubic-bezier(0.22, 1, 0.36, 1);
                    --accent-gold: #fbd24c;
                    --section-reveal: 0.75s;
                }

                @media (max-width: 768px) {
                    canvas { display: none !important; } /* Performance Shield */
                }

                /* 2. Scroll Progress (Ferramenta) */
                .scroll-progress-bar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    height: 2px;
                    background: var(--accent-gold);
                    opacity: 0.7;
                    z-index: 9999;
                    transition: width 0.1s linear;
                }

                /* 3. Noise Estático Overlay */
                .ana-design-system::after {
                    content: "";
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    opacity: 0.012;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    z-index: 2;
                }

                /* 4. Gradual Focus Shift (Hero) */
                .hero-focus-shift {
                    animation: focusShift 1s var(--premium-easing) forwards;
                }
                @keyframes focusShift {
                    from { filter: blur(6px); opacity: 0; }
                    to { filter: blur(0); opacity: 1; }
                }

                /* 5. Word-by-Word Authority Shift (H1) */
                .word-stagger {
                    display: inline-block;
                    opacity: 0;
                    transform: translateY(8px);
                    animation: wordUp 0.7s var(--premium-easing) forwards;
                }
                @keyframes wordUp {
                    to { opacity: 1; transform: translateY(0); }
                }

                /* 6. Revelação de Seção (Respiração) */
                .reveal {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity var(--section-reveal) var(--premium-easing), 
                                transform var(--section-reveal) var(--premium-easing);
                }
                .reveal.active {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* UI Elements Refined */
                a::after {
                    content: "";
                    position: absolute;
                    left: 0; bottom: -2px;
                    width: 0; height: 1px;
                    background: currentColor;
                    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                a:hover::after { width: 100%; }
                button:active { transform: scale(0.985); }
                button { transition: transform 0.2s var(--premium-easing), filter 0.2s ease; }
                button:hover { transform: translateY(-2px); filter: brightness(1.03); }

                .section-alt:nth-child(odd) { padding: 160px 0; }
                .section-alt:nth-child(even) { padding: 112px 0; }
                .divider-v { width: 1px; height: 50px; background: rgba(255,255,255,0.08); margin: 60px auto; }

                .ana-heading { letter-spacing: -0.015em; line-height: 1.05; }
                .ana-sub { letter-spacing: 0.12em; text-transform: uppercase; font-weight: 800; font-size: 0.65rem; opacity: 0.7; }
            `}</style>

            <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />

            {/* Atmosfera WebGL (10/10 Authority Field) */}
            <WebGLBackground opacity={heroOpacity} parallax={parallaxY} />

            <div id="seasonal-layer"></div>

            <SEO
                title="Lexis Academy | Treinamento de Inglês de Elite"
                description="Treine inglês como um atleta. Metodologia Lexis 3F para fluência real em tempo recorde através de automação cognitiva."
            />
            <Navbar onOpenModal={openModal} />
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse={selectedCourse} />

            {/* HERO SECTION */}
            <header id="inicio" className="relative pt-60 pb-48 px-6 overflow-hidden bg-[#0f172a] hero-focus-shift">
                <div className="bg-mesh opacity-40"></div>
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.8rem] font-extrabold mb-10 leading-[1.05] tracking-tight text-white ana-heading">
                        {["Inglês", "é", "uma", "habilidade."].map((word, i) => (
                            <span key={i} className="word-stagger" style={{ animationDelay: `${i * 60}ms` }}>
                                {word === "habilidade." ? <span className="text-[#fbd24c]">{word}</span> : word}&nbsp;
                            </span>
                        ))}
                        <br />
                        {["Treine", "como", "um", "atleta."].map((word, i) => (
                            <span key={i} className="word-stagger" style={{ animationDelay: `${(i + 4) * 60 + 100}ms` }}>
                                {word}&nbsp;
                            </span>
                        ))}
                    </h1>
                    <p className="text-[#94a3b8] text-lg md:text-2xl max-w-4xl mx-auto mb-16 leading-relaxed font-medium reveal" style={{ transitionDelay: '600ms' }}>
                        A Lexis English Academy transforma o aprendizado em automação cognitiva. Escolha seu caminho e alcance a fluência real em tempo recorde.
                    </p>
                    <div className="flex flex-col md:flex-row gap-6 justify-center reveal" style={{ transitionDelay: '800ms' }}>
                        <Button primary onClick={() => openModal()}>Falar com um especialista</Button>
                        <Button onClick={() => document.getElementById('modalidades').scrollIntoView({ behavior: 'smooth' })}>Conhecer as modalidades</Button>
                    </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none"></div>
            </header>

            {/* SEÇÃO MÉTODO */}
            <section id="metodo" className="section-alt py-32 px-6 bg-slate-50 text-[#0f172a] relative overflow-hidden scroll-mt-20">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="divider-v mb-20"></div>
                    <div className="grid md:grid-cols-2 gap-20 items-center mb-32">
                        <div className="reveal-left">
                            <span className="ana-sub text-[#8c5414] mb-5 block underline decoration-[#fbd24c] decoration-4 underline-offset-8">A Filosofia Lexis</span>
                            <h2 className="ana-heading text-4xl md:text-5xl font-black mb-10 leading-tight tracking-tight">Idioma não se aprende, <br /><span className="text-[#8c5414] italic">se treina.</span></h2>
                            <div className="space-y-6 text-slate-600 text-lg font-medium">
                                <p>Saber regras gramaticais ou teorias linguísticas não faz ninguém falar inglês, assim como:</p>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">✕</span>
                                        Ler sobre natação não faz alguém nadar.
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">✕</span>
                                        Estudar teoria musical não faz tocar instrumento.
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">✕</span>
                                        Conhecer regras do futebol não faz jogar bem.
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="bg-[#0f172a] p-10 rounded-[3rem] text-white shadow-2xl reveal">
                            <h3 className="text-2xl font-black mb-8 border-l-4 border-[#fbd24c] pl-6 uppercase tracking-tight text-white">O Inglês como <br />Esporte Cognitivo</h3>
                            <p className="text-[#94a3b8] mb-8 font-medium">Falar um novo idioma exige o que chamamos de <strong>automação cognitiva</strong>. Para fluência real, o cérebro deve realizar:</p>
                            <div className="space-y-6 text-white">
                                {[
                                    { t: "Processamento Real-Time", d: "Coordenação instantânea entre audição e resposta." },
                                    { t: "Tomada de Decisão Ágil", d: "Escolha automática de estruturas em tempo real." },
                                    { t: "Automação Procedural", d: "Responder sem reflexão consciente ou tradução." }
                                ].map((skill, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="text-[#fbd24c] text-xl font-black">0{idx + 1}</div>
                                        <div>
                                            <h4 className="font-extrabold text-[#fbd24c] text-sm uppercase tracking-widest mb-1">{skill.t}</h4>
                                            <p className="text-xs text-[#94a3b8] leading-relaxed">{skill.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="reveal">
                        <div className="text-center mb-16">
                            <h3 className="text-3xl md:text-4xl font-black mb-6">Por que tratar o Inglês como <br /><span className="text-[#8c5414]">Habilidade</span> acelera seu resultado?</h3>
                            <p className="text-slate-500 max-w-2xl mx-auto font-medium">O estudo passivo é o caminho mais lento. O treinamento orientado foca onde a fluência realmente acontece.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full group hover:border-[#fbd24c] transition-colors">
                                <div className="text-3xl mb-6">🧠</div>
                                <h4 className="text-xl font-black mb-4 text-[#0f172a] uppercase tracking-tight">1. Aquisição ≠ Aprendizagem</h4>
                                <p className="text-slate-600 text-sm mb-6 leading-relaxed">Stephen Krashen demonstra: aprender regras conscientemente não gera fluência. O cérebro só acessa padrões adquiridos pelo uso real.</p>
                                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-[#fbd24c]"></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conversação Autônoma</span>
                                </div>
                            </div>

                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full group hover:border-[#fbd24c] transition-colors">
                                <div className="text-3xl mb-6">⚡</div>
                                <h4 className="text-xl font-black mb-4 text-[#0f172a] uppercase tracking-tight">2. Memória Procedural</h4>
                                <p className="text-slate-600 text-sm mb-6 leading-relaxed">Habilidades ficam na memória procedural. Você não "lembra" como andar de bicicleta; você executa. A Lexis treina sua execução.</p>
                                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-[#fbd24c]"></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ação sem Tradução</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTEÚDO (O CAMINHO DO DOMÍNIO) */}
            <section id="conteudo" className="section-alt py-32 px-6 bg-[#0f172a] scroll-mt-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="divider-v mb-20 opacity-20"></div>
                    <SectionHeader
                        tag="O Caminho do Domínio"
                        title="O que você vai conquistar"
                        subtitle="Uma jornada estruturada em ciclos evolutivos para garantir que você não apenas aprenda, mas automatize o idioma."
                    />

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { step: "01", t: "Start (Fonética)", d: "Correção definitiva de vícios fonéticos e introdução aos Phrasal Verbs mais essenciais." },
                            { step: "02", t: "Run (Estruturas)", d: "Domínio intensivo de estruturas gramaticais das mais simples às mais complexas, sem decoreba." },
                            { step: "03", t: "Fly (Vocabulário)", d: "Expansão estratégica com foco nas 600-700 palavras que compõem 80% do uso cotidiano." },
                            { step: "04", t: "Liberty (Conversação)", d: "O ápice: fluência funcional e compreensão auditiva acima de 70% em situações reais." }
                        ].map((item, idx) => (
                            <div key={idx} className="card-glass p-10 rounded-[2.5rem] border-white/5 group hover:border-[#fbd24c]/30 transition-all duration-500 reveal">
                                <div className="text-[#fbd24c] text-5xl font-black mb-8 opacity-20 group-hover:opacity-100 transition-opacity">
                                    {item.step}
                                </div>
                                <h4 className="text-2xl font-black mb-4 uppercase tracking-tight text-white group-hover:text-[#fbd24c] transition-colors">{item.t}</h4>
                                <p className="text-[#94a3b8] text-sm leading-relaxed font-medium">{item.d}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-12 card-glass rounded-[3rem] border-[#fbd24c]/10 bg-white/[0.01] reveal reveal-delay-2">
                        <h3 className="text-xl font-black mb-10 text-center uppercase tracking-[0.2em] text-[#fbd24c]">Ferramentas de Apoio Inclusas</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
                            {[
                                { name: "Plataforma Teaches", desc: "Central de Conteúdos" },
                                { name: "Memrise", desc: "Repetição Espaçada" },
                                { name: "Gab English IA", desc: "Treino via WhatsApp" },
                                { name: "ChatClass", desc: "Treinamento Diário" },
                                { name: "Aulas Gravadas", desc: "Revisão e Reposição" }
                            ].map((tool, i) => (
                                <div key={i}>
                                    <p className="text-white font-black text-xs uppercase tracking-tighter mb-1">{tool.name}</p>
                                    <p className="text-[#94a3b8] text-[10px] uppercase font-bold tracking-widest opacity-60">{tool.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* MODALIDADES */}
            <section id="modalidades" className="py-32 px-6 bg-[#020617] scroll-mt-20 relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#fbd24c]/5 rounded-full blur-[120px]"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <SectionHeader
                        tag="Escolha sua Intensidade"
                        title="Arquiteturas de Sucesso"
                        subtitle="Sistemas de treinamento cognitivo desenhados para resultados concretos, seja através da imersão total ou da flexibilidade extrema."
                    />

                    <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                        <div className="modality-card bg-slate-900/40 backdrop-blur-xl border-white/10 flex flex-col h-full group reveal">
                            <div className="p-8 md:p-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <span className="bg-amber-400/20 text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">8 Semanas • 120h</span>
                                </div>
                                <h3 className="text-3xl font-black mb-6 uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">Maestria<br /><span className="text-amber-400/80">Online</span></h3>
                                <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">O treinamento de alta performance para quem busca resultados rápidos sem sair de casa. Adaptação total da nossa neurociência para o ambiente digital.</p>
                                <button onClick={() => openModal('Maestria Online')} className="w-full bg-amber-400 text-[#0f172a] py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-amber-300 transition-all mt-auto shadow-xl shadow-amber-400/10 active:scale-95">Solicitar Cronograma</button>
                            </div>
                        </div>

                        <div className="modality-card bg-slate-900 border-lexisPurple/50 ring-1 ring-lexisPurple/30 flex flex-col h-full group reveal reveal-delay-1 lg:scale-105 z-20 shadow-2xl shadow-lexisPurple/20">
                            <div className="p-8 md:p-10 flex flex-col h-full relative">
                                <div className="absolute top-0 right-10 bg-lexisPurple text-white px-5 py-2 rounded-b-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Choque Cognitivo</div>
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-16 h-16 rounded-2xl bg-lexisPurple/20 flex items-center justify-center text-lexisPurple">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    </div>
                                    <span className="bg-lexisPurple/20 text-lexisPurple px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">14 Dias • 120h</span>
                                </div>
                                <h3 className="text-3xl font-black mb-6 uppercase tracking-tight text-white group-hover:text-lexisPurple transition-colors">Imersão<br /><span className="text-lexisPurple/80">Presencial</span></h3>
                                <p className="text-slate-300 text-sm mb-8 leading-relaxed font-medium">A transformação mais rápida do mercado. 10 horas diárias de prática intensiva para detonar bloqueios e alcançar fluência funcional imediata.</p>
                                <button onClick={() => openModal('Imersão Presencial')} className="w-full bg-lexisPurple text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-lexisPurple/80 transition-all mt-auto shadow-xl shadow-lexisPurple/30 active:scale-95">Ver Vagas 2026</button>
                            </div>
                        </div>

                        <div className="modality-card bg-slate-900/40 backdrop-blur-xl border-white/10 flex flex-col h-full group reveal reveal-delay-2">
                            <div className="p-8 md:p-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    </div>
                                    <span className="bg-blue-500/20 text-blue-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">Flexível • Ciclos</span>
                                </div>
                                <h3 className="text-3xl font-black mb-6 uppercase tracking-tight text-white group-hover:text-blue-500 transition-colors">The Way<br /><span className="text-blue-500/80">Cíclico</span></h3>
                                <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">A liberdade total para aprender. Modelo espiral onde você escolhe seu horário e avança conforme domina cada nível, sem prazos engessados.</p>
                                <button onClick={() => openModal('The Way Cíclico')} className="w-full bg-blue-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-blue-400 transition-all mt-auto shadow-xl shadow-blue-500/10 active:scale-95">Agendar Visita</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DEPOIMENTOS */}
            <section id="depoimentos" className="py-32 px-6 bg-[#0f172a] scroll-mt-20 relative overflow-hidden">
                <div className="max-w-6xl mx-auto relative z-10">
                    <SectionHeader
                        tag="Resultados Reais"
                        title="Quem treina, não volta atrás"
                        subtitle="Histórias de profissionais que destravaram a carreira através da fluência real."
                    />

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Ricardo M.", role: "Diretor Comercial", text: "Tentei 4 escolas tradicionais e nunca saí do 'The book is on the table'. Com 2 semanas de Imersão Lexis, destravei reuniões com a matriz na Alemanha que antes eram um pesadelo." },
                            { name: "Ana Clara F.", role: "Arquiteta", text: "O método cíclico The Way foi o único que se adaptou à minha agenda louca. Poder alternar os horários sem perder conteúdo salvou minha fluência." },
                            { name: "Gustavo S.", role: "Desenvolvedor Sr.", text: "O foco em automação cognitiva no Maestria Online é bizarro. Eu parei de traduzir mentalmente e as frases começaram a sair naturais em menos de 2 meses." },
                            { name: "Juliana T.", role: "Marketing Digital", text: "A Garantia Vitalícia me deu segurança, mas nem precisei. O suporte do Gab AI no WhatsApp é incrível para manter o treino diário." },
                            { name: "Felipe R.", role: "Engenheiro de Produção", text: "A imersão presencial foi um divisor de águas. 10 horas por dia focado no esporte cognitivo me deu uma confiança que eu não teria em 2 anos de cursinho." },
                            { name: "Patrícia L.", role: "Advogada Internacional", text: "A Lexis não ensina inglês, ela treina você para usar o inglês. A abordagem de Aula Invertida otimiza cada minuto com o professor. Recomendo demais!" }
                        ].map((testimony, idx) => (
                            <div key={idx} className="bg-white/5 p-10 rounded-[2rem] border border-white/5 hover:border-[#fbd24c]/30 transition-colors reveal">
                                <div className="flex text-[#fbd24c] mb-6">★★★★★</div>
                                <p className="text-slate-300 text-lg italic mb-8">"{testimony.text}"</p>
                                <div>
                                    <p className="text-white font-bold">{testimony.name}</p>
                                    <p className="text-xs uppercase tracking-widest text-[#fbd24c]">{testimony.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PERGUNTAS FREQUENTES */}
            <section id="faq" className="py-32 px-6 bg-[#020617] relative">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16 reveal">
                        <h2 className="text-3xl font-black text-white mb-6">Dúvida Técnica (Lab)</h2>
                        <div className="w-20 h-1 bg-[#fbd24c] mx-auto rounded-full"></div>
                    </div>

                    <div className="space-y-2">
                        {faqs.map((faq, index) => (
                            <FAQItem key={index} question={faq.q} answer={faq.a} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div >
    );
};

export default Home;
