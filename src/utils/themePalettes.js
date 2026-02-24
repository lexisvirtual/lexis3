// Ana's Palette Definitions (CEE Integration)
// Centralized source of truth for both WebGL and React components

export const palettes = {
    standard: {
        c1: [0.04, 0.07, 0.13],
        c2: [0.01, 0.01, 0.03],
        acc: [1.0, 0.84, 0.35], // Gold
        hexAcc: '#fbd24c'
    },
    christmas: {
        c1: [0.15, 0.02, 0.02],
        c2: [0.02, 0.08, 0.02],
        acc: [1.0, 1.0, 0.9],   // White Gold/Snow
        hexAcc: '#fef3c7'
    },
    carnival: {
        c1: [0.15, 0.02, 0.15],
        c2: [0.02, 0.1, 0.1],
        acc: [1.0, 0.9, 0.1],   // High Yellow
        hexAcc: '#fbbf24'
    },
    black_friday: {
        c1: [0.01, 0.01, 0.01],
        c2: [0.05, 0.05, 0.08],
        acc: [0.0, 0.6, 1.0],   // Electric Blue
        hexAcc: '#3b82f6'
    },
    valentine: {
        c1: [0.15, 0.01, 0.05],
        c2: [0.05, 0.01, 0.02],
        acc: [1.0, 0.4, 0.6],   // Pinkish
        hexAcc: '#f472b6'
    },
    independence: {
        c1: [0.0, 0.15, 0.05],
        c2: [0.0, 0.05, 0.15],
        acc: [1.0, 1.0, 0.0],   // Yellow (Brazil)
        hexAcc: '#eab308'
    },
    thanksgiving: {
        c1: [0.15, 0.08, 0.02],
        c2: [0.08, 0.04, 0.01],
        acc: [1.0, 0.6, 0.1],   // Orange
        hexAcc: '#f97316'
    },
    new_year: {
        c1: [0.1, 0.1, 0.12],
        c2: [0.02, 0.02, 0.05],
        acc: [1.0, 1.0, 1.0],   // Pure White
        hexAcc: '#ffffff'
    }
};

export function getActivePalette(event) {
    return palettes[event] || palettes.standard;
}
