import React, { useState } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, Button } from '../components/shared';

const Maestria = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    useRevealOnScroll();

    return (
        <>
            <SEO
                title="Maestria Online | Curso Intensivo de Inglês 8 Semanas | 120h Ao Vivo"
                description="Curso intensivo online de inglês em 8 semanas. 120 horas de aulas ao vivo (19h-22h). Garantia vitalícia. Metodologia Lexis adaptada para o digital. Resultados rápidos sem sair de casa."
                keywords="curso de inglês online, intensivo 8 semanas, aulas ao vivo, inglês rápido, curso online noturno"
            />
            <Navbar onOpenModal={openModal} />
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse="Maestria Online" />

            {/* HERO */}
            <header className="relative pt-60 pb-32 px-6 overflow-hidden bg-gradient-to-br from-amber-600 via-[#0f172a] to-[#0f172a]">
                <div className="max-w-5xl mx-auto text-center relative z-10 reveal">
                    <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-8">
                        <span className="text-white font-black uppercase text-xs tracking-widest">⚡ Alta Performance</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight text-white">
                        Maestria Online<br />
                        <span className="text-[#fbd24c]">8 Semanas. 100% Ao Vivo.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Treinamento de alta performance sem sair de casa. 3 horas diárias ao vivo (19h-22h) com metodologia Lexis adaptada para o ambiente digital.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button primary onClick={openModal}>Solicitar Cronograma</Button>
                        <Button onClick={() => document.getElementById('ferramentas')?.scrollIntoView({ behavior: 'smooth' })}>Ver Ferramentas</Button>
                    </div>
                </div>
            </header>

            {/* DIFERENCIAIS */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-black text-center mb-16 text-[#0f172a]">Por que o Maestria Online?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: "🖥️", title: "100% Online", desc: "Acessível de qualquer lugar. Aulas ao vivo das 19h às 22h." },
                            { icon: "🎥", title: "Aulas Gravadas", desc: "Todas as aulas ficam disponíveis para revisão e reposição." },
                            { icon: "🔄", title: "Garantia Vitalícia", desc: "Refaça o curso quantas vezes quiser, sem custo adicional." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 reveal">
                                <div className="text-5xl mb-4">{item.icon}</div>
                                <h3 className="text-xl font-black mb-3 text-[#0f172a]">{item.title}</h3>
                                <p className="text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FERRAMENTAS */}
            <section id="ferramentas" className="py-24 px-6 bg-[#0f172a] text-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-black text-center mb-16">Ferramentas Inclusas</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { name: "Plataforma Teaches", desc: "Central de conteúdos organizada e eficiente." },
                            { name: "Memrise", desc: "Repetição espaçada para fixação de vocabulário." },
                            { name: "Gab English IA", desc: "Treino de conversação via WhatsApp com IA." },
                            { name: "ChatClass", desc: "Simulações diárias de conversas reais." },
                            { name: "Aulas Gravadas", desc: "Revisão e reposição quando precisar." }
                        ].map((tool, i) => (
                            <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 reveal">
                                <h3 className="text-lg font-black text-[#fbd24c] mb-2">{tool.name}</h3>
                                <p className="text-slate-400 text-sm">{tool.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CRONOGRAMA */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-black text-center mb-12 text-[#0f172a]">Como Funciona</h2>
                    <div className="space-y-6">
                        {[
                            { title: "Duração", desc: "8 semanas (2 meses)" },
                            { title: "Carga Horária", desc: "120 horas totais" },
                            { title: "Horário", desc: "Segunda a sexta, 19h às 22h (3h/dia ao vivo)" },
                            { title: "Formato", desc: "Aulas ao vivo + ferramentas complementares" },
                            { title: "Nível", desc: "Básico a Intermediário (não recomendado para avançados)" }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border-2 border-slate-200 flex justify-between items-center">
                                <span className="font-black text-[#0f172a]">{item.title}</span>
                                <span className="text-slate-600">{item.desc}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <Button primary onClick={openModal}>Garantir Minha Vaga</Button>
                    </div>
                </div>
            </section>

            {/* METODOLOGIA */}
            <section className="py-24 px-6 bg-[#0f172a] text-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-black text-center mb-12">Metodologia Ativa</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            "Aula Invertida",
                            "Instrução por Pares",
                            "Repetição Espaçada",
                            "Aprendizagem Baseada em Problemas",
                            "Gamificação",
                            "Grupos Operativos"
                        ].map((method, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-[#0f172a] font-black text-sm">{i + 1}</div>
                                <span className="font-bold">{method}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default Maestria;
