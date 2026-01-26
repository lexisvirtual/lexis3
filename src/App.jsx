import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Imersao from './pages/Imersao';
import Maestria from './pages/Maestria';
import TheWay from './pages/TheWay';

const App = () => {
    return (
        <HelmetProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/imersao" element={<Imersao />} />
                    <Route path="/maestria" element={<Maestria />} />
                    <Route path="/the-way" element={<TheWay />} />
                </Routes>
            </BrowserRouter>
        </HelmetProvider>
    );
};

export default App;
