import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, SectionHeader, Button } from '../components/shared';
import WebGLBackground from '../components/WebGLBackground';

const PilarIntensivo = () => {
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

    const jsonLdData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": "https://lexis.academy/curso-ingles-intensivo-brasil/#webpage",
                "url": "https://lexis.academy/curso-ingles-intensivo-brasil",
                "name": "Curso de Inglês Intensivo no Brasil | Resultados em 14 Dias | Lexis Academy",
                "description": "Domine o inglês com nosso curso intensivo de elite no Brasil. 120 horas de imersão total focada em resultados práticos para executivos e adultos.",
                "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://lexis.academy" },
                        { "@type": "ListItem", "position": 2, "name": "Curso Intensivo", "item": "https://lexis.academy/curso-ingles-intensivo-brasil" }
                    ]
                }
            },
            {
                "@type": "EducationalOrganization",
                "name": "Lexis Academy",
                "url": "https://lexis.academy",
                "logo": "https://lexis.academy/logo.png",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Rua Visconde de Inhaúma, 1295",
                    "addressLocality": "São Carlos",
                    "addressRegion": "SP",
                    "addressCountry": "BR"
                }
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Quanto tempo dura um curso de inglês intensivo?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Na Lexis Academy, nosso curso intensivo de elite dura 14 dias, com 10 horas diárias de prática deliberada, totalizando 120 horas de treinamento."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Qual a diferença entre curso de inglês tradicional e o intensivo Lexis?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Cursos tradicionais focam em gramática declarativa e levam anos. O intensivo Lexis foca em memória procedural e processamento rápido, entregando em 14 dias a carga horária de 3 anos de estudo regular."
                        }
                    }
                ]
            }
        ]
    };

    return (
        <div className="flex flex-col w-full min-h-screen relative overflow-x-hidden ana-design-system bg-[#0f172a]">
            <Helmet>
                <title>Curso de Inglês Intensivo no Brasil | Resultados em 14 Dias | Lexis Academy</title>
                <meta name="description" content="Domine o inglês com nosso curso intensivo de elite no Brasil. 120 horas de imersão total focada em resultados práticos para executivos e adultos." />
                <link rel="canonical" href="https://lexis.academy/curso-ingles-intensivo-brasil" />

                {/* Open Graph */}
                <meta property="og:title" content="Curso de Inglês Intensivo no Brasil | Resultados em 14 Dias" />
                <meta property="og:description" content="120 horas de imersão total no Brasil. Método Lexis focado em fluência real para executivos." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://lexis.academy/curso-ingles-intensivo-brasil" />
                <meta property="og:image" content="https://lexis.academy/logo.png" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Curso de Inglês Intensivo no Brasil | Resultados em 14 Dias" />
                <meta name="twitter:description" content="Domine o inglês em tempo recorde com 120h de treinamento de elite." />

                <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
            </Helmet>

            <style>{`
                .ana-design-system { --premium-easing: cubic-bezier(0.22, 1, 0.36, 1); --accent-gold: #fbd24c; }
                .scroll-progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: var(--accent-gold); z-index: 9999; }
                .pillar-content h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 2rem; color: #fff; line-height: 1.1; letter-spacing: -0.02em; }
                .pillar-content h3 { font-size: 1.5rem; font-weight: 800; color: var(--accent-gold); margin-top: 3rem; margin-bottom: 1rem; }
                .pillar-content p { font-size: 1.125rem; line-height: 1.8; color: #94a3b8; margin-bottom: 1.5rem; }
                .direct-answer { background: rgba(251, 210, 76, 0.05); border-left: 4px solid var(--accent-gold); padding: 2.5rem; margin: 3rem 0; border-radius: 0 1rem 1rem 0; }
                .method-card { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 1.5rem; transition: all 0.3s ease; }
                .method-card:hover { border-color: var(--accent-gold); transform: translateY(-5px); }
                .comparison-table { width: 100%; border-collapse: separate; border-spacing: 0 0.5rem; }
                .comparison-table th { text-align: left; padding: 1rem; color: #fff; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; }
                .comparison-table td { padding: 1.5rem 1rem; background: rgba(30, 41, 59, 0.3); color: #94a3b8; }
                .comparison-table tr td:first-child { border-radius: 0.75rem 0 0 0.75rem; color: #fff; font-weight: 700; }
                .comparison-table tr td:last-child { border-radius: 0 0.75rem 0.75rem 0; }
                .lexis-highlight { color: var(--accent-gold); font-weight: 900; }
            `}</style>

            <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
            <WebGLBackground opacity={0.3} />
            <Navbar onOpenModal={openModal} />
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse="Intensivo Inquiry" />

            <main className="relative z-10 pt-40 pb-32 px-6">
                <div className="max-w-4xl mx-auto pillar-content">
                    {/* Hero Section */}
                    <SectionHeader
                        tag="TREINAMENTO DE ELITE"
                        title={<>Curso de Inglês <span className="text-[#fbd24c]">Intensivo</span> no Brasil</>}
                        subtitle="A solução definitiva para executivos e adultos que precisam de fluência real em tempo recorde, sem as distrações de uma viagem internacional."
                    />

                    <div className="flex justify-center mb-20">
                        <Button primary onClick={openModal}>Ver Próximas Turmas</Button>
                    </div>

                    {/* Resposta Direta (Snippet) */}
                    <section className="reveal">
                        <div className="direct-answer">
                            <h3 className="!mt-0">O que define um curso de inglês intensivo de elite?</h3>
                            <p className="mb-0 italic text-white/90">
                                "Diferente de cursos livres, um curso intensivo de elite deve oferecer uma carga horária mínima de 120 horas em um curto intervalo (ex: 14 dias), focando no desenvolvimento da <strong>memória procedural</strong> e processamento em tempo real, eliminando a dependência do pensamento gramatical lento e da tradução mental."
                            </p>
                        </div>
                    </section>

                    {/* O Problema vs A Solução */}
                    <section className="mt-20 reveal">
                        <h2>Por que as escolas tradicionais falham?</h2>
                        <p>A maioria dos métodos trata o inglês como uma <strong>matéria acadêmica</strong> (como história ou geografia). Você estuda a regra, faz a prova e esquece. Na Lexis, entendemos que o inglês é uma <strong>habilidade motora</strong>, como dirigir ou praticar um esporte.</p>

                        <div className="grid md:grid-cols-2 gap-6 mt-10">
                            <div className="method-card">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <span className="text-red-500">✕</span> Ensino Tradicional
                                </h4>
                                <ul className="space-y-3 text-sm">
                                    <li>• Foco em gramática declarativa</li>
                                    <li>• Progressão lenta e artificial</li>
                                    <li>• Baixa carga horária de fala</li>
                                    <li>• Dependência de tradução</li>
                                </ul>
                            </div>
                            <div className="method-card border-emerald-500/30">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <span className="text-emerald-500">✓</span> Treinamento Lexis
                                </h4>
                                <ul className="space-y-3 text-sm">
                                    <li>• Foco em resposta automática</li>
                                    <li>• Intensidade cognitiva (10h/dia)</li>
                                    <li>• Ambiente de imersão total</li>
                                    <li>• Método 3F (Phrase, Fluidity, Function)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* O Método 3F */}
                    <section className="mt-32 reveal">
                        <h2>O Motor da Fluência: Método 3F</h2>
                        <p>Nossa engenharia pedagógica é baseada em três pilares inegociáveis que garantem que você não apenas "saiba" inglês, mas "faça" inglês.</p>

                        <div className="space-y-8 mt-12">
                            <div>
                                <h3>1. Phrase (Construção)</h3>
                                <p>Não ensinamos palavras isoladas. Treinamos blocos de linguagem (collocations) e padrões que o cérebro processa como uma única unidade de informação.</p>
                            </div>
                            <div>
                                <h3>2. Fluidity (Velocidade)</h3>
                                <p>O segredo da fluência não é o vocabulário, é a velocidade de processamento. Treinamos a automação para que você pare de traduzir mentalmente.</p>
                            </div>
                            <div>
                                <h3>3. Function (Realidade)</h3>
                                <p>O treinamento é aplicado a situações reais de negócios e lifestyle. Se você não consegue usar em uma reunião ou jantar, o treino não cumpriu seu papel.</p>
                            </div>
                        </div>
                    </section>

                    {/* Tabela de Intensidade */}
                    <section className="mt-32 reveal">
                        <h2>O Retorno sobre seu Tempo (ROI)</h2>
                        <p>Compare o investimento de tempo e a entrega de carga horária real de prática ativa:</p>

                        <div className="overflow-x-auto mt-8">
                            <table className="comparison-table">
                                <thead>
                                    <tr>
                                        <th>Modalidade</th>
                                        <th>Tempo Total</th>
                                        <th>Carga Horária</th>
                                        <th>Foco Principal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Curso Tradicional</td>
                                        <td>3 a 5 Anos</td>
                                        <td>~120 horas</td>
                                        <td>Gramática e Livros</td>
                                    </tr>
                                    <tr className="border-l-2 border-[#fbd24c]">
                                        <td className="lexis-highlight">Intensivo Lexis</td>
                                        <td className="lexis-highlight text-white">14 Dias</td>
                                        <td className="lexis-highlight">120 horas</td>
                                        <td className="lexis-highlight">Fluência e Performance</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-6 text-sm italic text-slate-500 text-center">
                            * O Intensivo Lexis entrega em 2 semanas a mesma carga horária prática que um curso regular leva anos para completar.
                        </p>
                    </section>

                    {/* Call to Action Final */}
                    <section className="mt-32 p-12 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[2rem] border border-[#fbd24c]/20 text-center reveal">
                        <h2 className="!text-3xl md:!text-5xl mb-6 italic">Pare de estudar. <br/><span className="text-[#fbd24c]">Comece a treinar.</span></h2>
                        <p className="max-w-2xl mx-auto mb-10">
                            Nossas turmas são reduzidas e as vagas para o Intensivo no Brasil são altamente concorridas. Garanta sua análise de perfil.
                        </p>
                        <Button primary onClick={openModal}>Quero falar com um Consultor</Button>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PilarIntensivo;
