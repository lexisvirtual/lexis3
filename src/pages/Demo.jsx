import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const Demo = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://api.hubskill.com.br/v1/chat-widget/a7pfvbuIBH4C8mLSeDPH';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <>
            <Helmet>
                <title>Demo - Lexis Academy</title>
                <meta name="description" content="Experimente o chat da Lexis Academy" />
            </Helmet>
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
                <h1>Demo - Chat Lexis Academy</h1>
            </div>
        </>
    );
};

export default Demo;
