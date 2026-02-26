import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, SectionHeader } from '../components/shared';
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
                "name": "Curso de Inglês Intensivo no Brasil: Resultados em Tempo Recorde",
                "description": "O guia completo sobre o curso de inglês intensivo da Lexis Academy. 120 horas de treinamento focado em adultos e executivos.",
                "speakable": {
                    "@type": "SpeakableSpecification",
                    "xpath": ["/html/head/title", "/html/head/meta[@name='description']/@content"]
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
                    }
                ]
            }
        ]
    };

    return (
        <div className="flex flex-col w-full min-h-screen relative overflow-x-hidden ana-design-system bg-[#0f172a]">
            <Helmet>
                <title>Curso de Inglês Intensivo no Brasil | Resultados em 14 Dias | Lexis Academy</title>
                <meta name="description" content="Domine o inglês com nosso curso intensivo de elite. 120 horas de imersão total focada em resultados práticos para sua carreira." />
                <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
            </Helmet>

            <style>{`
                .ana-design-system { --premium-easing: cubic-bezier(0.22, 1, 0.36, 1); --accent-gold: #fbd24c; }
                .scroll-progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: var(--accent-gold); z-index: 9999; }
                .pillar-content h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 2rem; color: #fff; }
                .pillar-content h3 { font-size: 1.5rem; font-weight: 800; color: var(--accent-gold); margin-top: 3rem; }
                .pillar-content p { font-size: 1.125rem; line-height: 1.8; color: #94a3b8; margin-bottom: 1.5rem; }
                .direct-answer { background: rgba(251, 210, 76, 0.05); border-left: 4px solid var(--accent-gold); padding: 2rem; margin: 2rem 0; }
            `}</style>

            <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
            <WebGLBackground opacity={0.3} />
            <Navbar onOpenModal={openModal} />
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse="Intensivo Inquiry" />

            <main className="relative z-10 pt-40 pb-32 px-6">
                <div className="max-w-4xl mx-auto pillar-content">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">Curso de Inglês <span className="text-[#fbd24c]">Intensivo</span> no Brasil</h1>

                    <section>
                        <h2>O que esperar de um curso intensivo de elite?</h2>
                        <div className="direct-answer">
                            <h3>Resposta Direta</h3>
                            <p>Um curso de inglês intensivo de elite deve oferecer uma carga horária condensada (mínimo 120h) in a short period, focando em habilidades motoras e processamento em tempo real, eliminando a dependência do pensamento gramatical lento.</p>
                        </div>
                        <p>Diferente de cursos tradicionais, o intensivo Lexis é desenhado para profissionais que não têm tempo a perder. Usamos o método 3F para garantir que cada hora de estudo seja convertida em fluência ativa.</p>
                    </section>

                    <section className="mt-20">
                        <h2>Por que escolher o Inglês Intensivo?</h2>
                        <p>Tempo é dinheiro. Estudar por 3 anos para chegar a um nível intermediário é um desperdício de potencial. Na Lexis, aplicamos o princípio da intensidade cognitiva:</p>
                        <ul className="list-disc pl-6 text-slate-400 space-y-4">
                            <li><strong>Foco Total:</strong> Sem interrupções semanais.</li>
                            <li><strong>Ambiente Controlado:</strong> Simulações de mundo real.</li>
                            <li><strong>Feedback Instantâneo:</strong> Correção em tempo real de vícios linguísticos.</li>
                        </ul>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PilarIntensivo;
