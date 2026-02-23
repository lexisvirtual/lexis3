const fs = require('fs');
const path = require('path');

const BLUEPRINT_PATH = path.join(__dirname, '../src/data/cee/blueprint.json');
const HISTORY_PATH = path.join(__dirname, '../src/data/cee/seasonal-history.json');
const ACTIVE_THEME_PATH = path.join(__dirname, '../src/data/cee/active-theme.json');

// Mapa de Janelas Sazonais (Exemplo de datas aproximadas)
const SEASONAL_WINDOWS = [
    { event: 'christmas', start: '12-01', end: '12-26' },
    { event: 'new_year', start: '12-27', end: '01-05' },
    { event: 'carnival', start: '02-10', end: '03-05' }, // Aproximado
    { event: 'black_friday', start: '11-15', end: '11-30' },
    { event: 'valentine', start: '06-01', end: '06-12' }, // Dia dos namorados Brasil
    { event: 'independence', start: '09-01', end: '09-10' },
    { event: 'thanksgiving', start: '11-20', end: '11-25' }
];

function getActiveEvent(date = new Date()) {
    const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return SEASONAL_WINDOWS.find(w => {
        if (w.start <= w.end) {
            return mmdd >= w.start && mmdd <= w.end;
        } else {
            // Caso vire o ano (ex: New Year)
            return mmdd >= w.start || mmdd <= w.end;
        }
    });
}

function calculateSimilarity(a, b, weights) {
    if (!b) return 0;
    let score = 0;
    if (a.movement_axis === b.movement_axis) score += weights.movement_axis;
    if (a.geometry_language === b.geometry_language) score += weights.geometry_language;
    if (a.rhythm_profile === b.rhythm_profile) score += weights.rhythm_profile;
    if (a.atmosphere_type === b.atmosphere_type) score += weights.atmosphere_type;
    if (Math.abs(a.intensity - b.intensity) < 0.01) score += weights.intensity;
    return score;
}

function generateTheme(event, year, blueprint, history) {
    const dimensions = blueprint.dimensions;
    const weights = blueprint.similarity_weights;
    const lastTheme = (history[year - 1] && history[year - 1][event]) || null;

    let attempts = 0;
    let bestCandidate = null;

    while (attempts < 100) {
        const candidate = {
            concept: blueprint.concept_map[event],
            movement_axis: dimensions.movement_axis[Math.floor(Math.random() * dimensions.movement_axis.length)],
            geometry_language: dimensions.geometry_language[Math.floor(Math.random() * dimensions.geometry_language.length)],
            rhythm_profile: dimensions.rhythm_profile[Math.floor(Math.random() * dimensions.rhythm_profile.length)],
            atmosphere_type: dimensions.atmosphere_type[Math.floor(Math.random() * dimensions.atmosphere_type.length)],
            intensity: dimensions.intensity_band[Math.floor(Math.random() * dimensions.intensity_band.length)]
        };

        // Regra de Ciclo Trienal
        const cyclePeriod = Object.keys(blueprint.rules.trienal_cycle).find(period => {
            const [start, end] = period.split('-').map(Number);
            return year >= start && year <= end;
        });
        if (cyclePeriod) {
            candidate.atmosphere_type = blueprint.rules.trienal_cycle[cyclePeriod];
        }

        const similarity = calculateSimilarity(candidate, lastTheme, weights);

        if (similarity <= blueprint.rules.max_similarity_score) {
            // Verificar se mudou pelo menos 2 dimensões (aproximado pelo score)
            bestCandidate = candidate;
            break;
        }
        attempts++;
    }

    return bestCandidate;
}

function sync() {
    console.log('--- Acionando Creative Evolution Engine (CEE) ---');

    const blueprint = JSON.parse(fs.readFileSync(BLUEPRINT_PATH, 'utf8'));
    let history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));

    const now = new Date();
    const year = now.getFullYear();
    const activeEvent = getActiveEvent(now);

    if (!activeEvent) {
        console.log('Modo Lexis Standard: Nenhuma janela sazonal ativa.');
        fs.writeFileSync(ACTIVE_THEME_PATH, JSON.stringify({ mode: 'standard' }, null, 2));
        return;
    }

    console.log(`Evento Detectado: ${activeEvent.event} (${blueprint.concept_map[activeEvent.event]})`);

    if (!history[year]) history[year] = {};

    if (!history[year][activeEvent.event]) {
        console.log('Gerando novo tema inédito via Ana CEE...');
        const newTheme = generateTheme(activeEvent.event, year, blueprint, history);
        history[year][activeEvent.event] = newTheme;
        fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
        console.log('Novo tema salvo no histórico.');
    }

    const currentTheme = history[year][activeEvent.event];
    currentTheme.mode = 'seasonal';
    currentTheme.event = activeEvent.event;

    fs.writeFileSync(ACTIVE_THEME_PATH, JSON.stringify(currentTheme, null, 2));
    console.log(`Tema Ativo Atualizado: ${currentTheme.geometry_language} / ${currentTheme.movement_axis}`);
}

if (require.main === module) {
    sync();
}
