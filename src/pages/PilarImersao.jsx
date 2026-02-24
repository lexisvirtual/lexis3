import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, Button, SectionHeader } from '../components/shared';
import WebGLBackground from '../components/WebGLBackground';

const PilarImersao = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const openModal = () => setIsModalOpen(true);

    useRevealOnScroll();

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            setScrollProgress((scrollTop / docHeight) * 100);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // JSON-LD Scripts (Leo's SEO Mission)
    const jsonLdData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "EducationalOrganization",
                "@id": "https://lexis.academy/#organization",
                "name": "Lexis English Academy",
                "url": "https://lexis.academy",
                "logo": "https://lexis.academy/logo.png",
                "description": "Escola de elite especializada em imersão e inglês intensivo para adultos e executivos no Brasil.",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "São Carlos",
                    "addressRegion": "SP",
                    "addressCountry": "BR"
                }
            },
            {
                "@type": "WebPage",
                "@id": "https://lexis.academy/ingles-por-imersao-brasil/#webpage",
                "url": "https://lexis.academy/ingles-por-imersao-brasil",
                "name": "Inglês por Imersão no Brasil: O Guia Definitivo 2026",
                "isPartOf": { "@id": "https://lexis.academy/#website" },
                "description": "Descubra como funciona o verdadeiro inglês por imersão no Brasil. Aprenda por que o método intensivo da Lexis Academy substitui o intercâmbio internacional.",
                "breadcrumb": { "@id": "https://lexis.academy/ingles-por-imersao-brasil/#breadcrumb" },
                "speakable": {
                    "@type": "SpeakableSpecification",
                    "xpath": [
                        "/html/head/title",
                        "/html/head/meta[@name='description']/@content"
                    ]
                }
            },
            {
                "@type": "Course",
                "name": "Imersão Lexis Academy 120h",
                "description": "Programa intensivo de 14 dias com 120 horas de prática real de inglês em ambiente controlado.",
                "provider": { "@id": "https://lexis.academy/#organization" },
                "hasCourseInstance": {
                    "@type": "CourseInstance",
                    "courseMode": "Presencial",
                    "duration": "P14D",
                    "courseWorkload": "PT120H",
                    "location": {
                        "@type": "Place",
                        "name": "Lexis Academy Campus",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "São Carlos",
                            "addressRegion": "SP"
                        }
                    }
                }
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "O que é inglês por imersão?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Inglês por imersão é um método de aprendizado onde o aluno é exposto ao idioma 100% do tempo, simulando a vida em um país nativo. Na Lexis Academy, isso significa praticar por 10 horas diárias durante 14 dias seguidos."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Vale a pena fazer imersão em inglês no Brasil?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sim, vale a pena pois elimina custos de viagem internacional, vistos e câmbio, oferecendo a mesma carga horária prática (120h) em um ambiente focado em Business English e fluência real."
                        }
                    }
                ]
            }
        ]
    };

    return (
        <div className="flex flex-col w-full min-h-screen relative overflow-x-hidden ana-design-system bg-[#0f172a]">
            <Helmet>
                <title>Inglês por Imersão no Brasil: O Guia Definitivo | Lexis Academy</title>
                <meta name="description" content="Tudo o que você precisa saber sobre Inglês por Imersão e Intensivo no Brasil. Metodologia de elite que garante 6 meses de evolução em apenas 14 dias." />
                <link rel="canonical" href="https://lexis.academy/ingles-por-imersao-brasil" />
                <script type="application/ld+json">
                    {JSON.stringify(jsonLdData)}
                </script>
            </Helmet>

            <style>{`
                .ana-design-system {
                    --premium-easing: cubic-bezier(0.22, 1, 0.36, 1);
                    --accent-gold: #fbd24c;
                    --section-reveal: 0.75s;
                }
                .scroll-progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: var(--accent-gold); z-index: 9999; transition: width 0.1s linear; }
                .pillar-content h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 2rem; color: #fff; line-height: 1.1; letter-spacing: -0.02em; }
                .pillar-content h3 { font-size: 1.5rem; font-weight: 800; margin-top: 3rem; margin-bottom: 1rem; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.05em; }
                .pillar-content p { font-size: 1.125rem; line-height: 1.8; color: #94a3b8; margin-bottom: 1.5rem; }
                .pillar-content ul { margin-bottom: 2rem; }
                .pillar-content li { margin-bottom: 1rem; color: #cbd5e1; display: flex; gap: 0.75rem; }
                .pillar-content li::before { content: "â†’"; color: var(--accent-gold); font-weight: bold; }
                .direct-answer { background: rgba(251, 210, 76, 0.05); border-left: 4px solid var(--accent-gold); padding: 2rem; border-radius: 0 1rem 1rem 0; margin: 2rem 0; }
                .direct-answer p { color: #fff; font-weight: 600; margin-bottom: 0; }
            `}</style>

            <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
            <WebGLBackground opacity={0.4} />

            <Navbar onOpenModal={openModal} />
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse="Lexis Pillar Inquiry" />

            <main className="relative z-10">
                {/* HERO SECTION */}
                <header className="pt-40 pb-20 px-6 max-w-5xl mx-auto text-center">
                    <span className="inline-block bg-[#820AD1]/20 text-[#fbd24c] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">Autoridade Semântica Dominante</span>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
                        Inglês por Imersão no Brasil: <br />
                        <span className="text-[#fbd24c]">O Guia Definitivo (2026)</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                        Entenda por que o intercâmbio doméstico se tornou a escolha número #1 de executivos e profissionais que precisam de resultados imediatos sem sair do país.
                    </p>
                </header>

                {/* CONTENT FLOW */}
                <div className="max-w-4xl mx-auto px-6 pb-32 pillar-content">

                    {/* SECTION 1 */}
                    <section id="o-que-e">
                        <h2>O que é imersão em inglês?</h2>
                        <div className="direct-answer">
                            <h3>Resposta Direta</h3>
                            <p>Inglês por imersão é um processo de aquisição linguística acelerada onde o estudante é submetido a um ambiente de "exclusividade idiomática". É a técnica de isolar o cérebro das referências maternas para forçar a plasticidade neural na nova língua.</p>
                        </div>
                        <p>
                            Diferente de um curso tradicional que você faz duas vezes por semana, a imersão na Lexis Academy funciona como um "reset" cognitivo. Durante 14 dias, você vive, pensa e trabalha em inglês. Isso ativa a sua **Memória Procedural**, que é a mesma utilizada para tocar um instrumento ou andar de bicicleta — você não precisa "pensar" na regra, você simplesmente executa.
                        </p>
                        <p>
                            Nossa abordagem foca na **Fluência Funcional**, que permite ao aluno navegar por situações de Business e convívio social com 70% a 90% de autonomia em tempo recorde.
                        </p>
                    </section>

                    {/* SECTION 2 */}
                    <section className="mt-24">
                        <h2>Diferença entre Inglês Intensivo e Tradicional</h2>
                        <p>
                            Muitos acreditam que "Inglês Intensivo" é apenas ter mais horas de aula. Na Lexis, a diferença é estrutural e biológica:
                        </p>
                        <ul>
                            <li><strong>Carga Horária:</strong> Em 14 dias, entregamos 120 horas de aula. Em um curso tradicional, você levaria de 6 meses a 1 ano para atingir essa mesma exposição.</li>
                            <li><strong>Curva de Esquecimento:</strong> No modelo tradicional, você estuda na segunda e esquece 80% do conteúdo até a quarta-feira. Na imersão, o aprendizado é contínuo, impedindo que o cérebro descarte a informação.</li>
                            <li><strong>Musculatura Social:</strong> Ensinamos inglês como um "esporte social". Você é treinado para lidar com a pressão de uma reunião real, algo impossível de simular em 1 hora de aula semanal.</li>
                        </ul>
                    </section>

                    {/* SECTION 3 */}
                    <section className="mt-24">
                        <h2>Como funciona o Intercâmbio Doméstico?</h2>
                        <div className="direct-answer">
                            <h3>Resposta Direta</h3>
                            <p>O intercâmbio doméstico (ou sem sair do Brasil) consiste em programas residenciais ou de jornada integral onde a escola replica as condições sociais de um país anglófono, eliminando a barreira do português sem os custos logísticos de uma viagem internacional.</p>
                        </div>
                        <p>
                            Ao escolher a Lexis para seu intercâmbio no Brasil, você elimina:
                        </p>
                        <ul>
                            <li>Gastos exorbitantes com câmbio de dólar ou euro.</li>
                            <li>Processos burocráticos de vito e passaporte.</li>
                            <li>O risco de ficar em "comunidades brasileiras" no exterior (o maior erro de quem viaja).</li>
                        </ul>
                        <p>
                            Aqui, o seu foco é 100% técnico. O ambiente é controlado e otimizado para que cada minuto seja conversacional.
                        </p>
                    </section>

                    {/* SECTION 4 - RESULTADOS MENSURÁVEIS */}
                    <section className="mt-24 bg-white/5 p-10 rounded-[2rem] border border-white/10">
                        <h2>Resultados Mensuráveis em 2 Semanas</h2>
                        <p>
                            Nossos dados de 2025 mostram que o aluno médio da imersão Lexis atinge:
                        </p>
                        <div className="grid grid-cols-2 gap-6 mt-8">
                            <div className="text-center">
                                <span className="block text-4xl font-black text-[#fbd24c]">120h</span>
                                <span className="text-xs uppercase font-bold text-slate-500">Prática Real</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-4xl font-black text-[#fbd24c]">70%</span>
                                <span className="text-xs uppercase font-bold text-slate-500">Retenção Ativa</span>
                            </div>
                        </div>
                        <p className="mt-8 italic text-sm">
                            *"A eficiência da imersão não está na quantidade de informação, mas na intensidade da repetição deliberada."*
                        </p>
                    </section>

                    {/* SECTION 5 - COMPARAÇÃO INTERNACIONAL */}
                    <section className="mt-24">
                        <h2>Comparação: Lexis vs Intercâmbio Internacional</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/20">
                                        <th className="py-4 text-white uppercase text-xs tracking-widest">Critério</th>
                                        <th className="py-4 text-[#fbd24c] uppercase text-xs tracking-widest">Lexis Academy (Brasil)</th>
                                        <th className="py-4 text-white uppercase text-xs tracking-widest">EUA / UK / Canada</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-400">
                                    <tr className="border-b border-white/5">
                                        <td className="py-4 font-bold text-white">Custo Total</td>
                                        <td className="py-4">Investimento Local</td>
                                        <td className="py-4">Câmbio + Passagem + Estadia</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-4 font-bold text-white">Foco do Conteúdo</td>
                                        <td className="py-4">Business & Fluência Real</td>
                                        <td className="py-4">Inglês Geral / Acadêmico</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-4 font-bold text-white">Exposição Diária</td>
                                        <td className="py-4">10h Controladas</td>
                                        <td className="py-4">4h-5h (Variável)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* SECTION 6 - NEUROCIÊNCIA */}
                    <section className="mt-24">
                        <h2>A Neurociência da Imersão</h2>
                        <p>
                            Por que funcionamos? O cérebro humano é preguiçoso por natureza (economiza energia). Em aulas tradicionais, ele sabe que pode voltar para o português a qualquer momento. Na imersão, o cérebro entra em modo de **Sobrevivência Social**.
                        </p>
                        <p>
                            Isso libera neurotransmissores vinculados à atenção e memória de longo prazo. Você não está apenas decorando verbos; você está criando novos caminhos neurais.
                        </p>
                    </section>

                    <div className="mt-32 p-12 bg-gradient-to-br from-[#820AD1] to-[#4c057a] rounded-[3rem] text-center shadow-2xl">
                        <h2 className="text-white !mb-6">Pronto para o próximo nível?</h2>
                        <p className="text-white/80 mb-10">Agende uma consultoria diagnóstica gratuita para avaliarmos seu nível atual e desenharmos seu plano de imersão.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button primary onClick={openModal}>Verificar Agenda 2026</Button>
                            <a href="https://wa.me/5516988183210" target="_blank" rel="noopener noreferrer">
                                <Button>Falar via WhatsApp</Button>
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PilarImersao;
