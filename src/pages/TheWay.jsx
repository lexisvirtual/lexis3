import React, { useState } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, Button } from '../components/shared';

const TheWay = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    useRevealOnScroll();

    const schedules = ["7h", "12h", "18h", "20h", "21h"];

    return (
        <>
            <SEO
                title="The Way Cíclico | Curso de Inglês Flexível Online | Início Imediato"
                description="Curso de inglês online com modelo cíclico. 5 horários disponíveis. Comece em qualquer dia do ano. Aulas ao vivo de segunda a quinta. Flexibilidade total para sua rotina."
                keywords="curso de inglês flexível, modelo cíclico, início imediato, horários variados, inglês online"
            />
            <Navbar onOpenModal={openModal} />
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse="The Way Cíclico" />

            {/* HERO */}
            <header className="relative pt-60 pb-32 px-6 overflow-hidden bg-gradient-to-br from-blue-600 via-[#0f172a] to-[#0f172a]">
                <div className="max-w-5xl mx-auto text-center relative z-10 reveal">
                    <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-8">
                        <span className="text-white font-black uppercase text-xs tracking-widest">🔄 Flexibilidade Total</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight text-white">
                        The Way Cíclico<br />
                        <span className="text-[#fbd24c]">Comece Hoje Mesmo.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Modelo espiral contínuo. Escolha seu horário entre 5 opções diárias. Avance no seu ritmo sem prazos engessados.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button primary onClick={openModal}>Agendar Visita</Button>
                        <Button onClick={() => document.getElementById('horarios')?.scrollIntoView({ behavior: 'smooth' })}>Ver Horários</Button>
                    </div>
                </div>
            </header>

            {/* DIFERENCIAIS */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-black text-center mb-16 text-[#0f172a]">Por que The Way Cíclico?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: "🔄", title: "Modelo Cíclico", desc: "Comece em qualquer data. O conteúdo se repete em ciclos." },
                            { icon: "⏰", title: "5 Horários", desc: "Escolha entre 7h, 12h, 18h, 20h ou 21h. Alterne livremente." },
                            { icon: "📈", title: "Seu Ritmo", desc: "Avance somente após cumprir a carga horária de cada nível." }
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

            {/* HORÁRIOS */}
            <section id="horarios" className="py-24 px-6 bg-[#0f172a] text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-black mb-12">Horários Disponíveis</h2>
                    <p className="text-slate-400 mb-12 text-lg">Segunda a Quinta-feira • 1 hora por aula</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {schedules.map((time, i) => (
                            <div key={i} className="bg-blue-500/20 border-2 border-blue-500 p-6 rounded-2xl hover:bg-blue-500/30 transition-colors">
                                <p className="text-3xl font-black text-blue-400">{time}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-slate-500 mt-8 text-sm">Você pode alternar entre os horários conforme sua disponibilidade.</p>
                </div>
            </section>

            {/* COMO FUNCIONA */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-black text-center mb-16 text-[#0f172a]">Como Funciona o Modelo Cíclico</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { step: "1", title: "Início Imediato", desc: "Entre em qualquer momento do ano. Não precisa esperar turma fechar." },
                            { step: "2", title: "Aulas Repetidas", desc: "O mesmo conteúdo é ministrado diariamente em múltiplos horários." },
                            { step: "3", title: "Progressão por Carga", desc: "Você só avança após cumprir as horas necessárias do nível atual." },
                            { step: "4", title: "Sem Lacunas", desc: "Se perder uma aula, assiste no próximo ciclo. Ninguém fica para trás." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border-2 border-slate-200 reveal">
                                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-xl mb-4">{item.step}</div>
                                <h3 className="text-xl font-black mb-3 text-[#0f172a]">{item.title}</h3>
                                <p className="text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DURAÇÃO */}
            <section className="py-24 px-6 bg-[#0f172a] text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-black mb-8">Duração Média</h2>
                    <p className="text-2xl text-slate-300 mb-12">10 a 12 meses para completar todos os níveis</p>
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                        <h3 className="text-xl font-black mb-4 text-[#fbd24c]">Garantia de Adaptação</h3>
                        <p className="text-slate-400">Reembolso integral se você não se adaptar após as 5 primeiras aulas ao vivo.</p>
                    </div>
                    <div className="mt-12">
                        <Button primary onClick={openModal}>Começar Agora</Button>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default TheWay;
