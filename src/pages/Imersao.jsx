import React, { useState } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, Button } from '../components/shared';

const Imersao = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    useRevealOnScroll();

    const dates2026 = [
        "02/02 a 14/02", "02/03 a 14/03", "06/04 a 18/04", "04/05 a 16/05",
        "01/06 a 13/06", "06/07 a 18/07", "03/08 a 15/08", "07/09 a 19/09",
        "05/10 a 17/10", "02/11 a 14/11", "07/12 a 19/12"
    ];

    return (
        <>
            <SEO
                title="Imersão Presencial de Inglês em São Carlos | 14 Dias | 120h"
                description="Imersão presencial intensiva de 14 dias em São Carlos-SP. 10 horas diárias de prática. 120h totais. Business English. Fluência funcional em 2 semanas. Garantia vitalícia."
                keywords="imersão em inglês, curso intensivo presencial, inglês são carlos, business english, fluência rápida, 14 dias"
            />
            <Navbar onOpenModal={openModal} />
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse="Imersão Presencial" />

            {/* HERO */}
            <header className="relative pt-60 pb-32 px-6 overflow-hidden bg-gradient-to-br from-[#820AD1] via-[#0f172a] to-[#0f172a]">
                <div className="max-w-5xl mx-auto text-center relative z-10 reveal">
                    <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-8">
                        <span className="text-white font-black uppercase text-xs tracking-widest">🔥 Choque Cognitivo</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight text-white">
                        Imersão Presencial<br />
                        <span className="text-[#fbd24c]">14 Dias. 120 Horas.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                        A transformação mais rápida do mercado. 10 horas diárias de prática intensiva em São Carlos-SP para alcançar fluência funcional imediata.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button primary onClick={openModal}>Ver Vagas 2026</Button>
                        <Button onClick={() => document.getElementById('conteudo')?.scrollIntoView({ behavior: 'smooth' })}>Ver Conteúdo</Button>
                    </div>
                </div>
            </header>

            {/* DIFERENCIAIS */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-black text-center mb-16 text-[#0f172a]">Por que a Imersão Presencial?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: "⚡", title: "120h em 2 Semanas", desc: "Equivalente a meses de curso tradicional condensado em formato intensivo." },
                            { icon: "💼", title: "Business Focus", desc: "Simulações reais de reuniões, apresentações e viagens de negócios." },
                            { icon: "🔄", title: "Garantia Vitalícia", desc: "Refaça a imersão gratuitamente quantas vezes quiser." }
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

            {/* CONTEÚDO */}
            <section id="conteudo" className="py-24 px-6 bg-[#0f172a] text-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-black text-center mb-16">O que você vai dominar</h2>
                    <div className="space-y-6">
                        {[
                            { level: "Start", focus: "Fonética", desc: "Correção de vícios fonéticos e introdução aos phrasal verbs essenciais." },
                            { level: "Run", focus: "Estruturas", desc: "Domínio intensivo de estruturas gramaticais aplicadas à conversação." },
                            { level: "Fly", focus: "Vocabulário", desc: "600-700 palavras de alta frequência que compõem 80% do uso cotidiano." },
                            { level: "Liberty", focus: "Conversação", desc: "Fluência funcional e compreensão auditiva acima de 70% em situações reais." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 reveal">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl font-black text-[#fbd24c]">0{i + 1}</div>
                                    <div>
                                        <h3 className="text-xl font-black">{item.level} - {item.focus}</h3>
                                        <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DATAS 2026 */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-black mb-12 text-[#0f172a]">Turmas 2026</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {dates2026.map((date, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-[#820AD1] transition-colors">
                                <p className="font-black text-[#0f172a]">{date}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12">
                        <Button primary onClick={openModal}>Garantir Minha Vaga</Button>
                    </div>
                </div>
            </section>

            {/* LOGÍSTICA */}
            <section className="py-24 px-6 bg-[#0f172a] text-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-black text-center mb-12">Informações Práticas</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white/5 p-8 rounded-2xl">
                            <h3 className="text-xl font-black mb-4 text-[#fbd24c]">📍 Local</h3>
                            <p className="text-slate-300">São Carlos - SP<br />Rua Visconde de Inhaúma, 1295</p>
                        </div>
                        <div className="bg-white/5 p-8 rounded-2xl">
                            <h3 className="text-xl font-black mb-4 text-[#fbd24c]">⏰ Horário</h3>
                            <p className="text-slate-300">Segunda a Sábado<br />8h às 19h (10h/dia)</p>
                        </div>
                        <div className="bg-white/5 p-8 rounded-2xl">
                            <h3 className="text-xl font-black mb-4 text-[#fbd24c]">🏨 Hospedagem</h3>
                            <p className="text-slate-300">Indicação de acomodação estratégica próxima ao centro inclusa.</p>
                        </div>
                        <div className="bg-white/5 p-8 rounded-2xl">
                            <h3 className="text-xl font-black mb-4 text-[#fbd24c]">📱 Material</h3>
                            <p className="text-slate-300">100% digital. Acesse de qualquer dispositivo.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default Imersao;
