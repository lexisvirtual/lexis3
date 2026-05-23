import React, { useState, useEffect } from 'react';

const LEADS_WEBAPP_URL = import.meta.env.VITE_LEADS_WEBAPP_URL;

const LeadModal = ({ isOpen, onClose, defaultCourse = "", mode = "course" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', course: defaultCourse, ageRange: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setFormData(prev => ({ ...prev, course: defaultCourse }));
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen, defaultCourse]);

    if (!isOpen && !isVisible) return null;

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 400);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const leadPayload = {
            nome: formData.name,
            whatsapp: formData.phone,
            email: formData.email,
            nivel: formData.course,
            idade: mode === 'level' ? formData.ageRange : ''
        };

        const sheetsPromise = LEADS_WEBAPP_URL
            ? fetch(LEADS_WEBAPP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(leadPayload)
            })
            : Promise.resolve();

        await Promise.race([sheetsPromise, new Promise(resolve => setTimeout(resolve, 1500))]).catch(() => null);

        setIsSubmitting(false);
        handleClose();
    };

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 modal-overlay transition-opacity duration-400 ${isVisible ? 'animate-overlay-in' : 'opacity-0 pointer-events-none'}`}>
            <div
                className={`bg-[#0f172a] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 relative shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto text-white text-center transform transition-all duration-500 ${isVisible ? 'animate-modal-in' : 'scale-95 opacity-0 translate-y-4'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#fbd24c] to-[#f59e0b]"></div>
                <button onClick={handleClose} className="absolute top-6 right-6 text-white/40 hover:text-[#fbd24c] transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="mb-8">
                    <h3 className="text-2xl font-black mb-3 tracking-tight uppercase leading-none">
                        Destrave sua <span className="text-[#fbd24c]">Fluência</span> agora
                    </h3>
                    <p className="text-white/60 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
                        Preencha os detalhes e receba um plano de treinamento personalizado em minutos.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#fbd24c] mb-1.5">Nome Completo</label>
                        <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#fbd24c] focus:outline-none transition-colors font-medium placeholder-white/20" placeholder="Ex: João Silva" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#fbd24c] mb-1.5">E-mail</label>
                        <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#fbd24c] focus:outline-none transition-colors font-medium placeholder-white/20" placeholder="Ex: joao@email.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#fbd24c] mb-1.5">WhatsApp</label>
                        <input required type="tel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#fbd24c] focus:outline-none transition-colors font-medium placeholder-white/20" placeholder="(00) 00000-0000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#fbd24c] mb-1.5">{mode === 'level' ? 'Como considera seu nível?' : 'Escolha seu Caminho'}</label>
                        <select required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#fbd24c] focus:outline-none transition-colors appearance-none font-medium" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })}>
                            {mode === 'level' ? (
                                <>
                                    <option value="" className="bg-[#0f172a]">Selecione seu nível</option>
                                    <option value="Não sei nada" className="bg-[#0f172a]">Não sei nada</option>
                                    <option value="Básico" className="bg-[#0f172a]">Básico</option>
                                    <option value="Intermediário" className="bg-[#0f172a]">Intermediário</option>
                                    <option value="Avançado" className="bg-[#0f172a]">Avançado</option>
                                </>
                            ) : (
                                <>
                                    <option value="" className="bg-[#0f172a]">Selecione uma modalidade</option>
                                    <option value="Maestria Online" className="bg-[#0f172a]">Maestria Online (Intensivo)</option>
                                    <option value="Imersão Presencial" className="bg-[#0f172a]">Imersão Presencial (S. Carlos)</option>
                                    <option value="The Way Cíclico" className="bg-[#0f172a]">The Way Cíclico (Flexível)</option>
                                </>
                            )}
                        </select>
                    </div>
                    {mode === 'level' && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#fbd24c] mb-1.5">Qual sua faixa etária?</label>
                            <select required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#fbd24c] focus:outline-none transition-colors appearance-none font-medium" value={formData.ageRange} onChange={e => setFormData({ ...formData, ageRange: e.target.value })}>
                                <option value="" className="bg-[#0f172a]">Selecione sua faixa</option>
                                <option value="menos 18 anos" className="bg-[#0f172a]">menos 18 anos</option>
                                <option value="18 a 25" className="bg-[#0f172a]">18 a 25</option>
                                <option value="26 a 30" className="bg-[#0f172a]">26 a 30</option>
                                <option value="31 a 40" className="bg-[#0f172a]">31 a 40</option>
                                <option value="41 a 50" className="bg-[#0f172a]">41 a 50</option>
                                <option value="mais de 50" className="bg-[#0f172a]">mais de 50</option>
                            </select>
                        </div>
                    )}
                    <button type="submit" disabled={isSubmitting} className={`w-full px-10 py-6 rounded-full font-extrabold text-sm transition-all active:scale-95 text-center inline-block relative overflow-hidden group tracking-tight bg-[#fbd24c] text-[#0f172a] cta-shadow hover:bg-yellow-400 mt-4 ${isSubmitting ? 'opacity-70 cursor-wait pointer-events-none' : ''}`}>
                        <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-wide">
                            {isSubmitting ? "Enviando Requisição..." : "Garantir minha Consultoria"}
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LeadModal;
