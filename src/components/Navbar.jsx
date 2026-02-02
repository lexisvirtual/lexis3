import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ onOpenModal }) => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isHome = location.pathname === '/';

    const handleAnchorClick = (e, id) => {
        if (isHome) {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled || mobileMenuOpen ? "navbar-blur py-3 shadow-2xl bg-[#0f172a]/90 backdrop-blur-md" : "bg-transparent py-8"}`}>
            <div className="max-w-7xl mx-auto px-8 flex justify-between items-center relative">
                <Link to="/" className="flex items-center gap-3 group cursor-pointer z-50" onClick={(e) => handleAnchorClick(e, 'inicio')}>
                    <img src="/logo.png" alt="Logo Lexis Academy" className="w-10 h-10 object-contain group-hover:rotate-12 transition-transform duration-300" loading="eager" />
                    <span className="font-extrabold text-lg tracking-tighter hidden sm:block group-hover:text-[#fbd24c] transition-colors uppercase text-white">Lexis Academy</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#94a3b8]">
                    <Link to={isHome ? "#inicio" : "/"} onClick={(e) => handleAnchorClick(e, 'inicio')} className="hover:text-[#fbd24c] transition-colors">Início</Link>
                    <Link to="/imersao" className={`hover:text-[#fbd24c] transition-colors ${location.pathname === '/imersao' ? 'text-[#fbd24c]' : ''}`}>Imersão</Link>
                    <Link to="/maestria" className={`hover:text-[#fbd24c] transition-colors ${location.pathname === '/maestria' ? 'text-[#fbd24c]' : ''}`}>Maestria</Link>
                    <Link to="/the-way" className={`hover:text-[#fbd24c] transition-colors ${location.pathname === '/the-way' ? 'text-[#fbd24c]' : ''}`}>The Way</Link>
                    <Link to="/blog" className={`hover:text-[#fbd24c] transition-colors ${location.pathname.startsWith('/blog') ? 'text-[#fbd24c]' : ''}`}>Blog</Link>
                    <Link to={isHome ? "#metodo" : "/#metodo"} onClick={(e) => handleAnchorClick(e, 'metodo')} className="hover:text-[#fbd24c] transition-colors">Método</Link>
                    <Link to={isHome ? "#depoimentos" : "/#depoimentos"} onClick={(e) => handleAnchorClick(e, 'depoimentos')} className="hover:text-[#fbd24c] transition-colors">Depoimentos</Link>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => onOpenModal()} className="hidden sm:block bg-[#fbd24c] text-[#0f172a] px-5 py-2 md:px-7 md:py-3 rounded-full font-extrabold text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-500/10">
                        Consultor
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button onClick={toggleMobileMenu} className="md:hidden text-white p-2 z-50 focus:outline-none">
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-[#0f172a] border-t border-slate-800 flex flex-col p-8 gap-6 transition-all duration-300 transform origin-top ${mobileMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 h-0 overflow-hidden"}`}>
                <div className="flex flex-col gap-6 text-[13px] font-bold uppercase tracking-[0.15em] text-[#94a3b8]">
                    <Link to={isHome ? "#inicio" : "/"} onClick={(e) => { handleAnchorClick(e, 'inicio'); toggleMobileMenu(); }} className="hover:text-[#fbd24c]">Início</Link>
                    <Link to="/imersao" onClick={toggleMobileMenu} className={`hover:text-[#fbd24c] ${location.pathname === '/imersao' ? 'text-[#fbd24c]' : ''}`}>Imersão</Link>
                    <Link to="/maestria" onClick={toggleMobileMenu} className={`hover:text-[#fbd24c] ${location.pathname === '/maestria' ? 'text-[#fbd24c]' : ''}`}>Maestria</Link>
                    <Link to="/the-way" onClick={toggleMobileMenu} className={`hover:text-[#fbd24c] ${location.pathname === '/the-way' ? 'text-[#fbd24c]' : ''}`}>The Way</Link>
                    <Link to="/blog" onClick={toggleMobileMenu} className={`hover:text-[#fbd24c] ${location.pathname.startsWith('/blog') ? 'text-[#fbd24c]' : ''}`}>Blog</Link>
                    <Link to={isHome ? "#metodo" : "/#metodo"} onClick={(e) => { handleAnchorClick(e, 'metodo'); toggleMobileMenu(); }} className="hover:text-[#fbd24c]">Método</Link>
                </div>

                <div className="h-px w-full bg-slate-800 my-2"></div>

                <button onClick={() => { onOpenModal(); toggleMobileMenu(); }} className="bg-[#fbd24c] text-[#0f172a] px-7 py-4 rounded-xl font-extrabold text-[12px] uppercase tracking-widest hover:bg-yellow-400 w-full text-center">
                    Falar com Consultor
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
