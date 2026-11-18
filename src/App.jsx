import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { captureUtmParams } from './utils/utm';
import Home from './pages/Home';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';

const Imersao = lazy(() => import('./pages/Imersao'));
const PilarImersao = lazy(() => import('./pages/PilarImersao'));
const PilarIntensivo = lazy(() => import('./pages/PilarIntensivo'));
const PilarIntercambio = lazy(() => import('./pages/PilarIntercambio'));
const Maestria = lazy(() => import('./pages/Maestria'));
const TheWay = lazy(() => import('./pages/TheWay'));
const BlogIndex = lazy(() => import('./pages/blog/BlogIndex'));
const BlogPost = lazy(() => import('./pages/blog/BlogPost'));
const BlogPauta = lazy(() => import('./pages/blog/BlogPauta'));
const LeoInsights = lazy(() => import('./pages/LeoInsights'));
const Aplicacao = lazy(() => import('./pages/Aplicacao'));
const Demo = lazy(() => import('./pages/Demo'));

const App = () => {
    useEffect(() => {
        captureUtmParams();
    }, []);

    return (
        <HelmetProvider>
            <BrowserRouter>
                <Suspense fallback={null}>
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
                        <Route path="/aplicacao" element={<Aplicacao />} />
                        <Route path="/demo" element={<Demo />} />
                    </Routes>
                </Suspense>
                <FloatingWhatsAppButton phoneE164="5519988197383" message="Quero mais informações" />
            </BrowserRouter>
        </HelmetProvider>
    );
};

export default App;
