import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Imersao from './pages/Imersao';
import PilarImersao from './pages/PilarImersao';
import PilarIntensivo from './pages/PilarIntensivo';
import PilarIntercambio from './pages/PilarIntercambio';
import Maestria from './pages/Maestria';
import TheWay from './pages/TheWay';
import BlogIndex from './pages/blog/BlogIndex';
import BlogPost from './pages/blog/BlogPost';
import BlogPauta from './pages/blog/BlogPauta';
import LeoInsights from './pages/LeoInsights';

const App = () => {
    return (
        <HelmetProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/imersao" element={<Imersao />} />
                    <Route path="/ingles-por-imersao-brasil" element={<PilarImersao />} />
                    <Route path="/curso-ingles-intensivo-brasil" element={<PilarIntensivo />} />
                    <Route path="/intercambio-sem-sair-do-brasil" element={<PilarIntercambio />} />
                    <Route path="/maestria" element={<Maestria />} />
                    <Route path="/the-way" element={<TheWay />} />
                    <Route path="/blog" element={<BlogIndex />} />
                    <Route path="/blog/pauta" element={<BlogPauta />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/leo-insights" element={<LeoInsights />} />
                </Routes>
            </BrowserRouter>
        </HelmetProvider>
    );
};

export default App;
