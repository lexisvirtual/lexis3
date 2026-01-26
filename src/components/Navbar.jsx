import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ onOpenModal }) => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? "navbar-blur py-3 shadow-2xl" : "bg-transparent py-8"}`}>
            <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 group cursor-pointer">
                    <img src="/logo.png" alt="Logo Lexis Academy" className="w-10 h-10 object-contain group-hover:rotate-12 transition-transform duration-300" loading="eager" />
                    <span className="font-extrabold text-lg tracking-tighter hidden md:block group-hover:text-[#fbd24c] transition-colors uppercase text-white">Lexis Academy</span>
                </Link>
                <div className="hidden md:flex items-center gap-8 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#94a3b8]">
                    <Link to="/" className="hover:text-[#fbd24c] transition-colors">Início</Link>
                    <Link to="/imersao" className="hover:text-[#fbd24c] transition-colors">Imersão</Link>
                    <Link to="/maestria" className="hover:text-[#fbd24c] transition-colors">Maestria</Link>
                    <Link to="/the-way" className="hover:text-[#fbd24c] transition-colors">The Way</Link>
                </div>
                <button onClick={() => onOpenModal()} className="bg-[#fbd24c] text-[#0f172a] px-7 py-3 rounded-full font-extrabold text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-500/10">
                    Falar com consultor
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
