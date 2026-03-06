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
                "description": "Escola de inglês por imersão focada em treinamento intensivo para adultos e executivos.",
                "address": {
                    "@type": "PostalAddress",
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
                        "name": "O que é o Método 3F?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "O Método 3F foca em Phrase (blocos de contexto), Fluidity (velocidade de processamento) e Function (aplicação real), garantindo fluência rápida através do treino de habilidades motoras."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Existe alguma garantia de resultado?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sim, oferecemos Garantia Vitalícia. Se o aluno não atingir o nível prometido, ele pode refazer a imersão sem custo adicional de treinamento."
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
                .pillar-content h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 2rem; color: #fff; line-height: 1.1; }
                .pillar-content h3 { font-size: 1.5rem; font-weight: 800; color: var(--accent-gold); margin-top: 2rem; margin-bottom: 1rem; }
                .pillar-content p { font-size: 1.125rem; line-height: 1.8; color: #94a3b8; margin-bottom: 1.5rem; }
                .direct-answer { background: rgba(251, 210, 76, 0.05); border-left: 4px solid var(--accent-gold); padding: 2rem; margin: 2rem 0; border-radius: 0 1rem 1rem 0; }
                table tr:nth-child(even) { background: rgba(255, 255, 255, 0.02); }
                table td, table th { transition: all 0.3s ease; }
                table tr:hover td { color: #fff; background: rgba(251, 210, 76, 0.05); }
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
                        <h2>O Conflito: Por que métodos tradicionais falham?</h2>
                        <div className="grid md:grid-cols-2 gap-8 mt-10">
                            <div className="bg-slate-800/50 p-8 border border-slate-700 rounded-xl">
                                <h3 className="text-[#fbd24c] mb-4">Ensino Tradicional</h3>
                                <ul className="space-y-3 text-slate-400">
                                    <li>❌ 3 a 5 anos para resultados básicos</li>
                                    <li>❌ Foco em gramática teórica (Saber sobre)</li>
                                    <li>❌ 2 horas por semana (Baixa densidade)</li>
                                    <li>❌ Tradução mental constante</li>
                                </ul>
                            </div>
                            <div className="bg-slate-800/50 p-8 border border-[#fbd24c]/30 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-[#fbd24c] text-black text-xs font-bold px-3 py-1">RECOMENDADO</div>
                                <h3 className="text-white mb-4">Treino Lexis</h3>
                                <ul className="space-y-3 text-slate-200">
                                    <li>✅ Resultados reais em 14 dias</li>
                                    <li>✅ Foco em habilidade motora (Saber fazer)</li>
                                    <li>✅ 10 horas por dia (Imersão total)</li>
                                    <li>✅ Resposta automática e intuitiva</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="mt-32">
                        <h2>O Mecanismo Único: Método 3F</h2>
                        <p className="mb-12">Não é mágica, é engenharia linguística. O Método 3F é o que permite condensar anos de estudo em dias de treino intenso.</p>

                        <div className="space-y-12">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="text-4xl font-black text-[#fbd24c] opacity-50">01</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mt-0 mb-4">Phrase (Blocos de Contexto)</h3>
                                    <p>Ninguém fala por palavras isoladas. Treinamos através de *chunks* — blocos de linguagem prontos que seu cérebro recupera instantaneamente, eliminando a montagem gramatical lenta.</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="text-4xl font-black text-[#fbd24c] opacity-50">02</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mt-0 mb-4">Fluidity (Velocidade de Processamento)</h3>
                                    <p>O foco aqui é o "motor" da fala. Através de exercícios de repetição deliberada e pressão controlada, aumentamos sua velocidade de reação para que o inglês saia sem esforço.</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="text-4xl font-black text-[#fbd24c] opacity-50">03</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mt-0 mb-4">Function (Aplicação Real)</h3>
                                    <p>De nada adianta o treino sem o jogo. Simulamos situações reais do seu dia a dia profissional para que a habilidade seja transferida imediatamente para o mundo real.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-32">
                        <h2>A Jornada: 4 Fases da Fluência</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
                            {[
                                { title: 'Start', phase: 'Fonética', desc: 'Ajuste de ouvido e sons críticos.' },
                                { title: 'Run', phase: 'Estruturas', desc: 'Domínio dos tempos e conectores.' },
                                { title: 'Fly', phase: 'Vocabulário', desc: 'Expansão para 600+ palavras chave.' },
                                { title: 'Liberty', phase: 'Conversação', desc: 'Simulações de mundo real.' }
                            ].map((item, i) => (
                                <div key={i} className="p-6 bg-slate-800/30 border border-slate-700 rounded-lg">
                                    <div className="text-[#fbd24c] font-black mb-1">FASE {i+1}</div>
                                    <h3 className="text-xl font-bold text-white mt-0 mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-400 mb-0">{item.phase}: {item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-32">
                        <h2>Análise de ROI: Por que investir no Intensivo?</h2>
                        <div className="overflow-x-auto mt-10">
                            <table className="w-full text-left border-collapse border border-slate-700">
                                <thead>
                                    <tr className="bg-slate-800">
                                        <th className="p-4 border border-slate-700 text-white">Critério</th>
                                        <th className="p-4 border border-slate-700 text-slate-400">Modelo Semanal</th>
                                        <th className="p-4 border border-slate-700 text-[#fbd24c]">Intensivo Lexis</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-4 border border-slate-700 text-white font-bold">Tempo para Fluência</td>
                                        <td className="p-4 border border-slate-700 text-slate-400">3 a 5 anos</td>
                                        <td className="p-4 border border-slate-700 text-white">14 dias (Início)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border border-slate-700 text-white font-bold">Custo de Oportunidade</td>
                                        <td className="p-4 border border-slate-700 text-slate-400">Alto (Perda de promoções)</td>
                                        <td className="p-4 border border-slate-700 text-white">Baixo (Resultados imediatos)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border border-slate-700 text-white font-bold">Retenção Cognitiva</td>
                                        <td className="p-4 border border-slate-700 text-slate-400">Baixa (Curva de esquecimento)</td>
                                        <td className="p-4 border border-slate-700 text-white">Alta (Densidade total)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="mt-32 p-8 md:p-12 bg-gradient-to-br from-[#fbd24c]/20 to-transparent border border-[#fbd24c]/30 rounded-2xl">
                        <h2 className="mt-0">Garantia Vitalícia Lexis</h2>
                        <p className="text-xl text-white font-medium italic">"Se você não atingir o nível prometido, pode refazer a imersão sem custo de treinamento."</p>
                        <p className="mb-0">Acreditamos tanto no nosso processo que removemos todo o risco de suas mãos. Nosso compromisso é com o seu resultado, não com o tempo de prateleira.</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PilarIntensivo;
