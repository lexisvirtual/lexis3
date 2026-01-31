import React from 'react';

const Footer = () => {
    return (
        <footer className="py-20 px-6 bg-[#0f172a] border-t border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="Lexis Academy" className="w-12 h-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
                    <div className="text-left">
                        <p className="text-white font-extrabold tracking-tight">LEXIS ACADEMY</p>
                        <p className="text-slate-500 text-xs text-[#fbd24c]">English as a Skill</p>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm font-bold text-slate-500">
                    <a href="https://www.instagram.com/lexis.ea" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                    <a href="https://www.linkedin.com/in/lexisenglish/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
                    <a href="https://www.facebook.com/LexisEA/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
                    <a href="https://www.youtube.com/lexisvirtual" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a>
                    <a href="https://g.page/LexisEA/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Maps</a>
                    <a href="https://g.co/kgs/aCZixEw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Google</a>
                </div>
            </div>
            <div className="mt-10 pt-10 border-t border-white/5 text-center text-slate-600 text-xs">
                <p>&copy; {new Date().getFullYear()} Lexis Academy. Todos os direitos reservados.</p>
                <p className="mt-2 text-slate-700">Rua Visconde de Inhaúma, 1295 - São Carlos, SP</p>
            </div>
        </footer>
    );
};

export default Footer;
