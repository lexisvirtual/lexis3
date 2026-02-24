import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, Button, SectionHeader } from '../components/shared';
import WebGLBackground from '../components/WebGLBackground';

const PilarIntercambio = () => {
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
                "@id": "https://lexis.academy/intercambio-sem-sair-do-brasil/#webpage",
                "url": "https://lexis.academy/intercambio-sem-sair-do-brasil",
                "name": "Intercâmbio Sem Sair do Brasil: A Alternativa Pro aos EUA e UK",
                "description": "Saiba como o intercâmbio doméstico da Lexis Academy oferece a mesma carga horária de um intercâmbio internacional sem os custos e burocracia.",
                "speakable": { "@type": "SpeakableSpecification", "xpath": ["/html/head/title"] }
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "O que é intercâmbio no Brasil?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "É uma modalidade de imersão onde o aluno se hospeda ou frequenta um campus que opera 100% em inglês, simulando a vivência no exterior."
                        }
                    }
                ]
            }
        ]
    };

    return (
        <div className="flex flex-col w-full min-h-screen relative overflow-x-hidden ana-design-system bg-[#0f172a]">
            <Helmet>
                <title>Intercâmbio Sem Sair do Brasil | Imersão Total | Lexis Academy</title>
                <meta name="description" content="Tudo sobre Intercâmbio Doméstico. Aprenda inglês com a mesma intensidade de uma viagem internacional por uma fração do custo." />
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
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse="Intercambio Inquiry" />

            <main className="relative z-10 pt-40 pb-32 px-6">
                <div className="max-w-4xl mx-auto pillar-content">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">Intercâmbio Sem <span className="text-[#fbd24c]">Sair do Brasil</span></h1>

                    <section>
                        <h2>Por que o intercâmbio tradicional faliu para profissionais?</h2>
                        <div className="direct-answer">
                            <h3>Resposta Direta</h3>
                            <p>O intercâmbio internacional costuma ser ineficiente para profissionais devido ao alto custo de oportunidade, tempo de deslocamento e, principalmente, a tendência de formar guetos linguísticos (falar português com outros brasileiros no exterior). O intercâmbio doméstico elimina esses riscos.</p>
                        </div>
                        <p>Na Lexis Academy, recriamos o ambiente de Londres ou Nova York no interior de São Paulo. Você tem 120 horas de exposição pura, suporte pedagógico de elite e foco em situações que você realmente enfrentará no seu dia a dia profissional.</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PilarIntercambio;
