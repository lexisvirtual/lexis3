import React from 'react';

const FloatingWhatsAppButton = ({ phoneE164 = '5519988197383', message = 'Quero mais informações' }) => {
    const handleClick = () => {
        const url = `https://wa.me/${phoneE164}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-[500] w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl shadow-black/30 flex items-center justify-center hover:brightness-110 active:scale-95 transition"
            aria-label="WhatsApp"
            title="WhatsApp"
        >
            <svg viewBox="0 0 32 32" className="w-7 h-7" fill="currentColor" aria-hidden="true">
                <path d="M19.11 17.2c-.27-.14-1.58-.78-1.82-.87-.25-.09-.43-.14-.61.14-.18.27-.7.87-.86 1.05-.16.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.14-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.47.07-.71.34-.25.27-.93.91-.93 2.22s.95 2.58 1.08 2.76c.14.18 1.88 2.87 4.56 4.03.64.28 1.15.45 1.54.57.65.21 1.24.18 1.71.11.52-.08 1.58-.65 1.8-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31z" />
                <path d="M16.02 3C9.39 3 4 8.39 4 15.02c0 2.12.55 4.18 1.6 6L4 29l8.2-1.56c1.75.95 3.71 1.45 5.82 1.45 6.63 0 12.02-5.39 12.02-12.02C30.04 8.39 22.65 3 16.02 3zm0 23.16c-1.95 0-3.74-.52-5.34-1.55l-.38-.24-4.87.93.95-4.75-.25-.39A10.06 10.06 0 0 1 5.9 15.02c0-5.59 4.54-10.13 10.13-10.13s10.13 4.54 10.13 10.13-4.54 11.14-10.14 11.14z" />
            </svg>
        </button>
    );
};

export default FloatingWhatsAppButton;
