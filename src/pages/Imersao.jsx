import React, { useState } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, Button, SectionHeader } from '../components/shared';

const DoubtsSection = () => {
    const categories = [
        { id: 'valor', label: 'Valores e Pagamento' },
        { id: 'tempo', label: 'Tempo e Agenda' },
        { id: 'metodo', label: 'Metodologia' },
        { id: 'nivel', label: 'Nível e Expectativas' },
        { id: 'logistica', label: 'Logística e Local' }
    ];

    const faqData = [
        // Valor
        { cat: 'valor', q: "Não tenho como pagar o valor total agora.", a: "Oferecemos parcelamento em até 12x no cartão e condições especiais para pagamento à vista. Fale com um consultor para encontrar a melhor forma." },
        { cat: 'valor', q: "É apenas um curso de duas semanas?", a: "É uma imersão transformadora de 120 horas. Em apenas 14 dias, você recebe a carga horária equivalente a 6 meses de um curso tradicional, mas com foco 100% em conversação." },
        { cat: 'valor', q: "Cursos online não são mais baratos?", a: "Cursos online oferecem conveniência, mas nada substitui o 'choque' da imersão presencial com 10h diárias de prática real e interação humana constante." },
        // Tempo
        { cat: 'tempo', q: "Não tenho 2 semanas livres.", a: "É um investimento curto para um resultado vitalício. Muitos alunos utilizam o período de férias ou licença para dar esse salto na carreira." },
        { cat: 'tempo', q: "Vou aguentar 10 horas por dia?", a: "Nossa metodologia é dinâmica e gamificada. Não são aulas tradicionais sentadas; o tempo voa entre práticas, grupos e atividades reais." },
        { cat: 'tempo', q: "Sábado também tem aula?", a: "Sim, o sábado é fundamental. É o momento de fechamento de módulos e consolidação de tudo o que foi treinado durante a semana." },
        // Metodo
        { cat: 'metodo', q: "Não aprendo sob pressão.", a: "O ambiente na Lexis é motivador e seguro. Não pressionamos com medo, mas engajamos com desafios que fazem você querer falar." },
        { cat: 'metodo', q: "E se eu não conseguir acompanhar?", a: "As turmas são reduzidas e o suporte é individualizado. Garantimos que todos os alunos, independente do ritmo, avancem a cada dia." },
        { cat: 'metodo', q: "Já estudei anos e não falo.", a: "Você provavelmente estudou 'sobre' inglês. Na imersão, você estuda 'o' inglês como uma habilidade motora. É um reset total no seu cérebro." },
        // Nivel
        { cat: 'nivel', q: "Meu inglês é zero absoluto.", a: "Perfeito! Começamos pela fonética (sons) para evitar vícios de pronúncia e construímos sua fluência funcional do zero." },
        { cat: 'nivel', q: "Sou muito tímido para falar em grupo.", a: "A imersão é o lugar mais seguro para errar. Nossas atividades ajudam a quebrar o gelo naturalmente e aumentar sua confiança social." },
        { cat: 'nivel', q: "Só quero conversação.", a: "O foco é 100% conversação, mas para falar bem você precisa de base fonética e estrutural, que ensinamos de forma aplicada e sem 'decoreba'." },
        // Logistica
        { cat: 'logistica', q: "Não moro em São Carlos.", a: "Recebemos alunos de todo o Brasil! Indicamos opções de hospedagem estratégica próximas à escola para facilitar sua rotina." },
        { cat: 'logistica', q: "Preciso levar algum material?", a: "Não. Fornecemos todo o material digital que você acessa pelo seu celular ou tablet. O foco é na sua fala." }
    ];

    const [activeCat, setActiveCat] = useState('valor');
    const [openIndex, setOpenIndex] = useState(null);

    const filteredFaq = faqData.filter(item => item.cat === activeCat);

    return (
        <section id="duvidas" className="py-32 px-6 bg-slate-900 overflow-hidden">
            <div className="max-w-4xl mx-auto">
                <SectionHeader
                    tag="Atendimento"
                    title="Tire suas Dúvidas"
                    subtitle="Separamos as perguntas mais comuns para você entender por que a Imersão Lexis é o investimento certo para sua carreira."
                />

                <div className="flex flex-wrap justify-center gap-3 mb-12 reveal">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCat(cat.id); setOpenIndex(null); }}
                            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeCat === cat.id ? 'bg-[#fbd24c] text-[#0f172a]' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 reveal">
                    {filteredFaq.map((item, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-[#fbd24c]/30">
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full p-6 text-left flex justify-between items-center group"
                            >
                                <span className={`font-bold text-lg pr-4 ${openIndex === idx ? 'text-[#fbd24c]' : 'text-white'}`}>{item.q}</span>
                                <span className={`text-[#fbd24c] transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </span>
                            </button>
                            <div className={`transition-all duration-300 ${openIndex === idx ? 'max-h-96 opacity-100 p-6 pt-0' : 'max-h-0 opacity-0'}`}>
                                <p className="text-slate-400 font-medium leading-relaxed">{item.a}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center reveal">
                    <p className="text-white/60 mb-6 font-medium italic">Ainda tem alguma dúvida específica?</p>
                    <a href="https://wa.me/5516988183210" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-[#fbd24c] font-black uppercase tracking-widest text-sm hover:underline">
                        <span>Falar direto com um consultor</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </a>
                </div>
            </div>
        </section>
    );
};

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
        <div className="bg-[#0f172a] text-white">
            <SEO
                title="Imersão Presencial de Inglês em São Carlos | 14 Dias | Lexis Academy"
                description="Imersão intensiva de 14 dias (120h) em São Carlos. Tratamos o inglês como habilidade, não como teoria. Alcance fluência funcional real em tempo recorde."
                keywords="imersão em inglês, inglês são carlos, curso intensivo, business english, fluência rápida"
            />
            <Navbar onOpenModal={openModal} />
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse="Imersão Presencial" />

            {/* HERO EXPERIENCE */}
            <header className="relative pt-64 pb-48 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#820AD1]/40 via-transparent to-transparent z-0"></div>
                <div className="bg-mesh opacity-20"></div>
                <div className="max-w-6xl mx-auto text-center relative z-10 reveal">
                    <div className="inline-flex items-center gap-2 bg-[#820AD1]/20 border border-[#820AD1]/30 backdrop-blur-xl px-4 py-2 rounded-full mb-10">
                        <span className="w-2 h-2 rounded-full bg-[#fbd24c] animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Vagas abertas para 2026</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black mb-10 leading-[1] tracking-tighter">
                        Imersão <br />
                        <span className="text-[#fbd24c]">Presencial.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
                        120 horas de choque cognitivo condensadas em 14 dias de prática intensiva.
                        Onde o inglês deixa de ser estudo e passa a ser sua ferramenta de trabalho.
                    </p>
                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <Button primary onClick={openModal}>Verificar Disponibilidade</Button>
                        <Button onClick={() => document.getElementById('metodo')?.scrollIntoView({ behavior: 'smooth' })}>Nossa Filosofia</Button>
                    </div>
                </div>
            </header>

            {/* O CONCEITO - HABILIDADE VS CONHECIMENTO */}
            <section id="metodo" className="py-32 px-6 bg-white text-[#0f172a] relative overflow-hidden">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="reveal-left">
                            <span className="text-[#820AD1] font-black uppercase tracking-widest text-xs mb-4 block">Metodologia Lexis</span>
                            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter">Inglês não se aprende. <br /><span className="italic text-[#820AD1]">Se treina.</span></h2>
                            <p className="text-lg text-slate-600 mb-10 font-medium leading-relaxed">
                                Idioma é uma habilidade cognitiva, como música ou esportes. Exige processamento em tempo real, tomada de decisão e resposta automática.
                                Na imersão, focamos na sua <strong>Memória Procedural</strong> — o lugar onde a fluência real acontece.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-[#820AD1]/30 transition-colors">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-[#820AD1] mb-2">Aquisição Ativa</h4>
                                    <p className="text-sm text-slate-500 font-medium">Você usa a língua em situações reais desde o minuto 1.</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-[#820AD1]/30 transition-colors">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-[#820AD1] mb-2">Português Estratégico</h4>
                                    <p className="text-sm text-slate-500 font-medium">Usamos sua lógica nativa para acelerar o entendimento, nunca como dependência.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative reveal">
                            <div className="bg-[#0f172a] p-12 rounded-[3.5rem] shadow-2xl text-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter border-l-4 border-[#fbd24c] pl-6 text-[#fbd24c]">O Diferencial</h3>
                                <ul className="space-y-8">
                                    {[
                                        { t: "120 Horas Presenciais", d: "Equivalente a anos de cursos tradicionais em 14 dias." },
                                        { t: "10 Horas por Dia", d: "Segunda a sábado, das 8h às 19h. Imersão Total." },
                                        { cat: "Business Focus", d: "Treino para reuniões, entrevistas e reposicionamento de carreira." }
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-4">
                                            <span className="text-[#fbd24c] font-black text-xl">0{i + 1}</span>
                                            <div>
                                                <h4 className="font-black uppercase text-sm tracking-widest text-white">{item.t}</h4>
                                                <p className="text-white/50 text-xs font-medium mt-1">{item.d}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* O CONTEÚDO - A JORNADA */}
            <section className="py-32 px-6 bg-slate-50 text-[#0f172a]">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        tag="Conteúdo Programático"
                        title="Os 4 Pilares do Domínio"
                        subtitle="Uma trajetória desenhada para levar você do 'conhecer' ao 'falar' de forma estruturada e mensurável."
                    />

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { step: "START", t: "Fonética", d: "Correção de vícios sonoros, ritmo e entonação. Onde a confiança começa." },
                            { step: "RUN", t: "Estruturas", d: "Domínio intensivo dos tempos verbais aplicados à fala funcional." },
                            { step: "FLY", t: "Vocabulário", d: "As 700 palavras que movem o mundo corporativo e cotidiano." },
                            { step: "LIBERTY", t: "Conversação", d: "O ápice: compreensão auditiva 70%+ e fala autônoma real." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm group hover:border-[#820AD1] transition-all duration-500 reveal">
                                <span className="text-[#820AD1] font-black text-xs tracking-widest mb-4 block underline decoration-yellow-400 decoration-4 underline-offset-4">{item.step}</span>
                                <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter">{item.t}</h4>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FERRAMENTAS E TÉCNICAS */}
            <section className="py-32 px-6 bg-[#0f172a] relative overflow-hidden">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="reveal-left">
                            <h2 className="text-4xl md:text-5xl font-black mb-10 leading-tight tracking-tighter">O Arsenal <br /><span className="text-[#fbd24c]">Tecnológico.</span></h2>
                            <p className="text-slate-400 text-lg font-medium mb-12">
                                Utilizamos o que há de mais moderno em IA e neuroaprendizado para estender sua prática para além da sala de aula.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-8">
                                {[
                                    { t: "Plataforma Teaches", d: "Gestão do seu treino." },
                                    { t: "Memrise", d: "Fixação via repetição espaçada." },
                                    { t: "Gab IA Teacher", d: "Conversação 24/7 no WhatsApp." },
                                    { t: "ChatClass", d: "Simulações de situações reais." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-xl bg-[#fbd24c]/10 flex items-center justify-center text-[#fbd24c] shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-1">{item.t}</h4>
                                            <p className="text-white/40 text-[10px] font-medium">{item.desc || item.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#820AD1]/20 to-transparent p-12 rounded-[4rem] border border-white/5 reveal">
                            <h3 className="text-2xl font-black mb-8 border-l-4 border-white pl-6">Técnicas Ativas</h3>
                            <div className="flex flex-wrap gap-3">
                                {["Prática Deliberada", "Instrução por Pares", "Gamificação", "Grupos Operativos", "Learning by Doing"].map(tag => (
                                    <span key={tag} className="bg-white/5 border border-white/10 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DÚVIDAS / FAQ */}
            <DoubtsSection />

            {/* CALENDÁRIO 2026 */}
            <section className="py-32 px-6 bg-white text-[#0f172a] relative overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <SectionHeader
                        tag="Agendamento"
                        title="Turmas de 2026"
                        subtitle="Turmas reduzidas para garantir a qualidade máxima do acompanhamento. Escolha seu mês e comece seu planejamento."
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-20">
                        {dates2026.map((date, i) => (
                            <div key={i} className="bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl hover:border-[#820AD1] hover:bg-[#820AD1]/5 transition-all text-center reveal reveal-delay-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Turma {i + 1}</p>
                                <p className="font-black text-sm text-[#0f172a]">{date.split(' ')[0]}<br /><span className="text-[#820AD1]">{date.split(' ')[2]}</span></p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#820AD1] rounded-[3.5rem] p-12 text-white relative overflow-hidden group reveal">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors"></div>
                        <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">Garanta sua <br /><span className="text-[#fbd24c]">Garantia Vitalícia.</span></h3>
                        <p className="text-white/70 max-w-2xl mx-auto mb-10 font-medium">Ao se matricular, você ganha o direito de refazer a imersão quantas vezes desejar, sem custos extras, para sempre. Sem riscos, apenas evolução.</p>
                        <Button primary onClick={openModal}>Falar com um Consultor Agora</Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Imersao;
