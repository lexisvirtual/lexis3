import React, { useEffect } from 'react';

export const useRevealOnScroll = () => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal, .reveal-left').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);
};

export const Button = ({ children, primary = false, className = "", onClick }) => (
    <button className={`px-10 py-4.5 rounded-full font-extrabold text-sm transition-all active:scale-95 text-center inline-block relative overflow-hidden group tracking-tight ${primary ? "bg-[#fbd24c] text-[#0f172a] cta-shadow hover:bg-yellow-400" : "border-2 border-[#fbd24c] text-white hover:bg-[#fbd24c]/10"} ${className}`} onClick={onClick}>
        <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-wide">
            {children}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
        </span>
    </button>
);

export const SectionHeader = ({ tag, title, subtitle }) => (
    <div className="mb-20 text-center max-w-4xl mx-auto px-4 reveal">
        <span className="text-[#fbd24c] font-extrabold tracking-[0.3em] uppercase text-[11px] mb-5 block animate-pulse">{tag}</span>
        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">{title}</h2>
        <p className="text-[#94a3b8] text-lg md:text-xl font-medium max-w-2xl mx-auto">{subtitle}</p>
    </div>
);
