import React from 'react';

const Footer = () => {
    React.useEffect(() => {
        // Metricool Tracker
        function loadScript(a) { var b = document.getElementsByTagName("head")[0], c = document.createElement("script"); c.type = "text/javascript", c.src = "https://tracker.metricool.com/resources/be.js", c.onreadystatechange = a, c.onload = a, b.appendChild(c) }
        loadScript(function () { beTracker.t({ hash: "50a4ef3cd4e63ff18e7cd32ca7db9738" }) });
    }, []);

    return (
        <footer className="py-20 px-6 bg-[#0f172a] border-t border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10 text-center text-slate-600 text-xs">
                <p>&copy; 2026 Lexis Academy. Todos os direitos reservados.</p>
                <p className="mt-2 text-slate-700">Rua Visconde de Inhaúma, 1295 - São Carlos, SP</p>
                <p className="mt-2">
                    <a href="mailto:contato@lexis.academy" className="text-slate-500 hover:text-white transition-colors">
                        contato@lexis.academy
                    </a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
