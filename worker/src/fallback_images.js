export const FALLBACK_POOL = [
    // --- BUSINESS & OFFICE ---
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80", // Meeting
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80", // Team work
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80", // Brainstorming
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80", // Modern office
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80", // Handshake/Deal
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80", // Corporate
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80", // Strategy
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80", // Laptop typing
    "https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=1200&q=80", // Video call
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80", // Business woman

    // --- LIFESTYLE & PEOPLE ---
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80", // Happy people
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80", // Friends laughing
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80", // Friends study
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&q=80", // Group walking
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80", // Conversation evening
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80", // Smiling professional
    "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1200&q=80", // Diversity

    // --- TRAVEL & STREET ---
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80", // Plane wing
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80", // Beach
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80", // Swiss mountains
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80", // Road trip (Fixed one)
    "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80", // City rainy
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80", // London street
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80", // Paris

    // --- STUDY & LEARNING ---
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80", // Library
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1200&q=80", // Notes
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80", // Reading books
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80", // Studying
    "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=1200&q=80", // Laptop learning

    // --- MINDSET & BRAIN ---
    "https://images.unsplash.com/photo-1499209974431-2761e2523676?w=1200&q=80", // Relaxed
    "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&q=80", // Thinking
    "https://images.unsplash.com/photo-1555601568-c916f54b1046?w=1200&q=80", // Brain concept
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=80", // Meditation
    "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&q=80", // Focus

    // --- TECH & CONNECTION ---
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80", // Digital nomad
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80", // Work
    "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1200&q=80", // Coffee & Code
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80", // Matrix/Code

    // --- CINEMA & MEDIA ---
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80", // Cinema projector
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80", // Movie theater
    "https://images.unsplash.com/photo-1478720568477-152d9b164e63?w=1200&q=80", // Film reels

    // --- COFFEE & BREAK ---
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80", // Cafe vibes
    "https://images.unsplash.com/photo-1442512595331-e89e7385a861?w=1200&q=80", // Coffee cup
];

// Função Helper para pegar aleatório
export function getRandomFallbackImage() {
    return FALLBACK_POOL[Math.floor(Math.random() * FALLBACK_POOL.length)];
}
