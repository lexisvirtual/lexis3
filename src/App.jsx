import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Imersao from './pages/Imersao';
import Maestria from './pages/Maestria';
import TheWay from './pages/TheWay';
import BlogIndex from './pages/blog/BlogIndex';
import BlogPost from './pages/blog/BlogPost';

const App = () => {
    return (
        <HelmetProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/imersao" element={<Imersao />} />
                    <Route path="/maestria" element={<Maestria />} />
                    <Route path="/the-way" element={<TheWay />} />
                    <Route path="/blog" element={<BlogIndex />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                </Routes>
            </BrowserRouter>
        </HelmetProvider>
    );
};

export default App;
