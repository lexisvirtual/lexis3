import React, { useState } from 'react';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, Button, SectionHeader } from '../components/shared';

const VideoEmbed = ({ title, youtubeId }) => (
    <div className="reveal">
        <div className="relative w-full pt-[56.25%] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
            <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        </div>
        <p className="mt-4 text-sm font-black uppercase tracking-widest text-white/70 text-center">{title}</p>
    </div>
);

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-[#fbd24c]/30 reveal">
        <button onClick={onToggle} className="w-full p-6 text-left flex justify-between items-center gap-6">
            <span className={`font-black tracking-tight text-base md:text-lg ${isOpen ? 'text-[#fbd24c]' : 'text-white'}`}>{question}</span>
            <span className={`shrink-0 text-[#fbd24c] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </span>
        </button>
        <div className={`transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 px-6 pb-6 -mt-2' : 'max-h-0 opacity-0 px-6'}`}>
            <p className="text-slate-300 font-medium leading-relaxed">{answer}</p>
        </div>
    </div>
);

const Aplicacao = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    useRevealOnScroll();

    React.useEffect(() => {
        setIsModalOpen(false);
    }, []);

    React.useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(progress);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const faqs = [
        { q: 'Emite certificado?', a: 'Sim, ao final do curso cada aluno receberá seu certificado.' },
        { q: 'Funciona para quem não sabe nada de inglês?', a: 'Sim. A metodologia foi desenvolvida para levar do básico ao avançado de acordo com o seu nível atual.' },
        { q: 'Posso pagar por PIX?', a: 'Sim, com condições específicas para esse modelo de pagamento.' },
        { q: 'As aulas são presenciais ou online?', a: 'Temos os dois formatos: imersão presencial e imersão online.' },
        { q: 'O que serei capaz de fazer ao final do curso?', a: 'Falar com mais confiança em entrevistas, reuniões e viagens em inglês.' },
        { q: 'Posso parcelar a compra?', a: 'Sim, é possível parcelar em até 12x sem juros no cartão de crédito.' }
    ];

    return (
        <div className="flex flex-col w-full min-h-screen relative overflow-x-hidden ana-design-system bg-[#0f172a] text-white">
            <style>{`
                .ana-design-system {
                    --premium-easing: cubic-bezier(0.22, 1, 0.36, 1);
                    --accent-gold: #fbd24c;
                    --section-reveal: 0.75s;
                }
                .scroll-progress-bar { position: fixed; top: 0; left: 0; height: 2px; background: var(--accent-gold); opacity: 0.7; z-index: 9999; transition: width 0.1s linear; }
                .ana-design-system::after { content: ""; position: fixed; inset: 0; pointer-events: none; opacity: 0.004; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); z-index: 2; }
                .hero-focus-shift { animation: focusShift 1s var(--premium-easing) forwards; }
                @keyframes focusShift { from { filter: blur(2px); opacity: 0; } to { filter: blur(0); opacity: 1; } }
                .ana-heading { letter-spacing: -0.015em; line-height: 1.05; }
            `}</style>

            <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />

            <SEO
                title="Aplicação"
                description="Tenha o resultado de 2 anos de estudo de inglês em poucas semanas. 120h, foco em conversação e metodologia ativa."
                keywords="aplicação lexis, inglês por imersão, conversação, metodologia ativa, 120 horas"
                canonical="https://lexis.academy/aplicacao"
            />

            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse="" mode="level" />

            <header className="relative pt-10 md:pt-14 pb-20 md:pb-24 px-6 overflow-hidden hero-focus-shift">
                <div className="absolute inset-0 bg-gradient-to-br from-[#820AD1]/15 via-transparent to-transparent z-0"></div>
                <div className="bg-mesh opacity-30"></div>
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-xl px-4 py-2 rounded-full mb-8 reveal">
                        <span className="w-2 h-2 rounded-full bg-[#fbd24c] animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Lexis English Academy</span>
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-10 leading-[1.05] tracking-tighter ana-heading reveal">
                        Resultado de intercâmbio <span className="text-[#fbd24c]">sem sair do país.</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-slate-300 max-w-4xl mx-auto mb-12 font-medium leading-relaxed reveal">
                        Tenha o resultado de 2 anos de estudo de inglês em poucas semanas.
                    </p>

                    <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 mb-12 text-left reveal">
                        <ul className="grid sm:grid-cols-2 gap-4 text-slate-200 font-semibold">
                            {[
                                '120h de aula',
                                'Foco em conversação',
                                'Do básico ao avançado',
                                'Metodologia ativa de aprendizado',
                                'Focado em público adulto',
                                'Resultado 10x mais rápido'
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <span className="mt-1 w-2.5 h-2.5 rounded-full bg-[#fbd24c] shrink-0"></span>
                                    <span className="leading-snug">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 justify-center reveal">
                        <Button primary className="py-6 px-8" onClick={() => setIsModalOpen(true)}>Fazer minha aplicação</Button>
                        <Button primary className="py-6 px-8" onClick={() => document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth' })}>Ver depoimentos</Button>
                    </div>
                </div>
            </header>

            <section id="depoimentos" className="py-16 md:py-20 px-6 bg-[#020617] relative overflow-hidden">
                <div className="max-w-6xl mx-auto relative z-10">
                    <SectionHeader
                        tag="Depoimentos"
                        title="Veja o que acontece na prática"
                        subtitle="Resultados reais de alunos em diferentes modalidades."
                    />

                    <div className="grid md:grid-cols-3 gap-8">
                        <VideoEmbed title="Depoimento em Inglês" youtubeId="ml5Pn0PlIM0" />
                        <VideoEmbed title="Depoimento Maestria" youtubeId="ES62CkMcxx0" />
                        <VideoEmbed title="Depoimento Imersão" youtubeId="Ov_OKy5oHcg" />
                    </div>

                    <div className="mt-10 reveal">
                        <div className="flex justify-center">
                            <Button primary className="py-6 px-8" onClick={() => setIsModalOpen(true)}>Aplicar agora</Button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-20 px-6 bg-white text-[#0f172a] relative overflow-hidden">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 gap-16 items-center">
                        <div className="reveal-left">
                            <span className="text-[#820AD1] font-black uppercase tracking-widest text-xs mb-4 block">Metodologia</span>
                            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tighter ana-heading">
                                Para quem não quer ficar estudando por 5 anos
                            </h2>
                            <p className="text-slate-600 text-lg font-medium leading-relaxed mb-10">
                                Pare de ficar apenas decorando regras e listas de vocabulário. Existe uma forma muito mais eficiente de evoluir no idioma.
                            </p>
                            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8">
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    A Lexis English Academy é focada em comunicação e resultados práticos, com uma metodologia moderna que acelera o aprendizado por meio de aulas dinâmicas, prática constante e repetição inteligente.
                                </p>
                                <p className="mt-5 text-slate-600 font-medium leading-relaxed">
                                    Com professores experientes, material próprio e formatos flexíveis, você ganha confiança para usar o inglês no dia a dia, em viagens, no ambiente profissional e muito mais.
                                </p>
                            </div>
                        </div>

                        <div className="reveal">
                            <div className="relative w-full pt-[56.25%] overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-100">
                                <iframe
                                    className="absolute inset-0 w-full h-full"
                                    src="https://www.youtube.com/embed/kxjTawXDPYU"
                                    title="Escola Lexis"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                            <p className="mt-4 text-sm font-black uppercase tracking-widest text-slate-500 text-center">Escola Lexis</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-20 px-6 bg-[#0f172a] relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <SectionHeader
                        tag="Como funciona"
                        title="Como é possível ter um resultado em tão pouco tempo?"
                        subtitle="Estrutura pensada para acelerar aquisição e confiança com treino real e acompanhamento constante."
                    />

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { n: '01', t: 'Deep Learning', d: 'Assimile o idioma de forma natural com um método que força seu cérebro a lembrar do que aprendeu.' },
                            { n: '02', t: 'Núcleo 80/20 do Inglês', d: 'Aprenda o essencial focando no que você realmente usa no dia a dia, sem precisar virar “professor de inglês”.' },
                            { n: '03', t: 'Sistema de fala por instinto', d: 'Aprenda a falar sem pensar palavra por palavra, de forma mais direta e com confiança.' },
                            { n: '04', t: 'PAL (Peer-Assisted Learning)', d: 'Estudar com outra pessoa é mais eficiente do que métodos tradicionais. Você treina e consolida em parceria.' },
                            { n: '05', t: 'Acompanhamento constante', d: 'Formato ao vivo com professor para acompanhar sua evolução e acelerar seus resultados.' }
                        ].map((item) => (
                            <div key={item.n} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 hover:border-[#fbd24c]/30 transition-colors reveal">
                                <div className="text-[#fbd24c] text-5xl font-black mb-8 opacity-30">{item.n}</div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-4">{item.t}</h3>
                                <p className="text-slate-300 font-medium leading-relaxed">{item.d}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 grid md:grid-cols-2 gap-8">
                        {[
                            { t: '#Bônus 1', h: 'Plataforma de estudos completa', d: 'Centralize conteúdos, revisões e acompanhamento do seu progresso.' },
                            { t: '#Bônus 2', h: 'Inteligência artificial de conversação', d: 'Prática adicional para manter o treino vivo fora do horário de aula.' }
                        ].map((b) => (
                            <div key={b.t} className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[2.5rem] p-10 reveal">
                                <p className="text-[#fbd24c] font-black uppercase tracking-[0.25em] text-[11px] mb-4">{b.t}</p>
                                <h4 className="text-2xl font-black tracking-tight mb-4">{b.h}</h4>
                                <p className="text-slate-300 font-medium leading-relaxed">{b.d}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 bg-[#820AD1]/20 border border-[#820AD1]/30 rounded-[3rem] p-10 md:p-12 text-center reveal">
                        <h3 className="text-3xl md:text-5xl font-black tracking-tighter ana-heading mb-6">Oportunidade exclusiva para quem faz a aplicação</h3>
                        <p className="text-white/70 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                            Faça sua aplicação e receba direcionamento para a melhor modalidade e estratégia de treino para o seu objetivo.
                        </p>
                        <Button primary className="py-6 px-8" onClick={() => setIsModalOpen(true)}>Fazer minha aplicação</Button>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-20 px-6 bg-[#020617] relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">
                    <SectionHeader
                        tag="FAQ"
                        title="Ainda está com dúvidas?"
                        subtitle="Respostas rápidas para as perguntas mais comuns antes de você aplicar."
                    />

                    <div className="space-y-4">
                        {faqs.map((item, idx) => (
                            <FAQItem
                                key={item.q}
                                question={item.q}
                                answer={item.a}
                                isOpen={openFaqIndex === idx}
                                onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                            />
                        ))}
                    </div>

                    <div className="mt-16 text-center reveal">
                        <div className="flex justify-center">
                            <Button
                                primary
                                className="py-6 px-8"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Fazer minha aplicação
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Aplicacao;
