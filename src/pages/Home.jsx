import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, Button, SectionHeader } from '../components/shared';

const Home = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const openModal = (course = '') => { setSelectedCourse(course); setIsModalOpen(true); };

    useRevealOnScroll();

    return (
        <>
            <SEO
                title=""
                description="Aprenda inglês de verdade com a metodologia Lexis. Cursos de imersão presencial de 14 dias, Maestria Online de 8 semanas e modelo cíclico flexível. Automação cognitiva para fluência real em tempo recorde. São Carlos-SP."
                keywords="curso de inglês, imersão em inglês, aprender inglês rápido, fluência em inglês, curso intensivo de inglês, escola de inglês São Carlos"
            />
            <Navbar onOpenModal={openModal} />
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse={selectedCourse} />

            {/* HERO */}
            <header id="inicio" className="relative pt-60 pb-48 px-6 overflow-hidden bg-[#0f172a]">
                <div className="bg-mesh opacity-40"></div>
                <div className="max-w-6xl mx-auto text-center relative z-10 reveal">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.8rem] font-extrabold mb-10 leading-[1.05] tracking-tight text-white">
                        Inglês é uma <span className="text-[#fbd24c]">habilidade.</span> <br />
                        Treine como um atleta.
                    </h1>
                    <p className="text-[#94a3b8] text-lg md:text-2xl max-w-4xl mx-auto mb-16 leading-relaxed font-medium">
                        A Lexis English Academy transforma o aprendizado em automação cognitiva. Escolha seu caminho e alcance a fluência real em tempo recorde.
                    </p>
                    <div className="flex flex-col md:flex-row gap-6 justify-center reveal reveal-delay-2">
                        <Button primary onClick={() => openModal()}>Falar com um especialista</Button>
                        <Button onClick={() => document.getElementById('modalidades')?.scrollIntoView({ behavior: 'smooth' })}>Conhecer as modalidades</Button>
                    </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none"></div>
            </header>

            {/* MODALIDADES */}
            <section id="modalidades" className="py-32 px-6 bg-[#020617] scroll-mt-20 relative overflow-hidden text-white">
                <div className="max-w-7xl mx-auto relative z-10">
                    <SectionHeader
                        tag="Escolha sua Intensidade"
                        title="Arquiteturas de Sucesso"
                        subtitle="Sistemas de treinamento cognitivo desenhados para resultados concretos."
                    />

                    <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                        <Link to="/maestria" className="modality-card bg-slate-900/40 backdrop-blur-xl border-white/10 flex flex-col h-full group reveal hover:scale-105 transition-transform">
                            <div className="p-8 md:p-10 flex flex-col h-full">
                                <span className="bg-amber-400/20 text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 self-start">8 Semanas • 120h</span>
                                <h3 className="text-3xl font-black mb-6 uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">Maestria<br /><span className="text-amber-400/80">Online</span></h3>
                                <p className="text-slate-400 text-sm mb-8">Treinamento intensivo online. 3h diárias ao vivo (19h-22h). Garantia vitalícia.</p>
                                <button onClick={(e) => { e.preventDefault(); openModal('Maestria Online'); }} className="w-full bg-amber-400 text-[#0f172a] py-5 rounded-2xl font-black uppercase text-[11px] hover:bg-amber-300 transition-all mt-auto">Saiba Mais</button>
                            </div>
                        </Link>

                        <Link to="/imersao" className="modality-card bg-slate-900 border-lexisPurple/50 ring-1 ring-lexisPurple/30 flex flex-col h-full group reveal lg:scale-105 z-20 shadow-2xl hover:scale-110 transition-transform">
                            <div className="p-8 md:p-10 flex flex-col h-full relative">
                                <div className="absolute top-0 right-10 bg-lexisPurple text-white px-5 py-2 rounded-b-xl text-[10px] font-black uppercase">Choque Cognitivo</div>
                                <span className="bg-lexisPurple/20 text-lexisPurple px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 self-start">14 Dias • 120h</span>
                                <h3 className="text-3xl font-black mb-6 uppercase tracking-tight text-white group-hover:text-lexisPurple transition-colors">Imersão<br /><span className="text-lexisPurple/80">Presencial</span></h3>
                                <p className="text-slate-300 text-sm mb-8">Transformação rápida. 10h diárias presenciais em São Carlos-SP. Business English.</p>
                                <button onClick={(e) => { e.preventDefault(); openModal('Imersão Presencial'); }} className="w-full bg-lexisPurple text-white py-5 rounded-2xl font-black uppercase text-[11px] hover:bg-lexisPurple/80 transition-all mt-auto">Saiba Mais</button>
                            </div>
                        </Link>

                        <Link to="/the-way" className="modality-card bg-slate-900/40 backdrop-blur-xl border-white/10 flex flex-col h-full group reveal hover:scale-105 transition-transform">
                            <div className="p-8 md:p-10 flex flex-col h-full">
                                <span className="bg-blue-500/20 text-blue-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 self-start">Flexível • Ciclos</span>
                                <h3 className="text-3xl font-black mb-6 uppercase tracking-tight text-white group-hover:text-blue-500 transition-colors">The Way<br /><span className="text-blue-500/80">Cíclico</span></h3>
                                <p className="text-slate-400 text-sm mb-8">Modelo espiral. 5 horários disponíveis. Comece em qualquer dia do ano.</p>
                                <button onClick={(e) => { e.preventDefault(); openModal('The Way Cíclico'); }} className="w-full bg-blue-500 text-white py-5 rounded-2xl font-black uppercase text-[11px] hover:bg-blue-400 transition-all mt-auto">Saiba Mais</button>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default Home;
