/**
 * Ana Theme Scheduler v3.8 - Intelligence Layer
 * Determina qual tema JSON deve estar ativo com base na data atual e contexto global.
 * 
 * Novos Princípios:
 * - Apple aesthetic priority: Whitespace over clutter.
 * - Google context awareness: Reactive to global events/doodles.
 */

export function getActiveThemeName(date = new Date(), externalContext = null) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const year = date.getFullYear();

    // 1. PRIORIDADE ZERO: Contexto Externo (Google/Doodles/News) Dynamic Sync
    // Se o sistema externo detectar algo "quente", ele sobrescreve o calendário fixo.
    if (externalContext?.event_id) {
        return externalContext.event_id;
    }

    // Helper: verifica se mmdd está dentro de um range
    const inRange = (start, end) => {
        if (start <= end) return mmdd >= start && mmdd <= end;
        return mmdd >= start || mmdd <= end;
    };

    // ── CAMPAIGN (nível 3) ──────────────────────────────
    if (inRange('12-26', '01-05')) return 'new_year';
    if (inRange('12-10', '12-25')) return 'christmas';
    if (inRange('10-24', '10-31')) return 'halloween';

    // Black Friday (Dinâmico)
    const bf = getBlackFridayRange(year);
    if (inRange(bf.start, bf.end)) return 'black_friday';

    // Independence Day USA
    if (inRange('06-25', '07-05')) return 'independence_us';

    // ── SEASONAL (nível 2) ─────────────────────────────
    if (inRange('09-01', '09-10')) return 'independence_br';

    // Saint Patrick's (Consciência Global)
    if (inRange('03-14', '03-17')) return 'st_patricks';

    if (inRange('06-05', '06-12')) return 'valentine_br';
    if (inRange('02-07', '02-15')) return 'valentine_us';

    // Carnaval (Móvel/Configurável)
    if (inRange('02-08', '03-05')) return 'carnival';

    // Dia das Mães (Dinâmico)
    const md = getMothersDayRange(year);
    if (inRange(md.start, md.end)) return 'mothers_day';

    // Apple Product Events (Placeholder para janelas de launch típicas de Set/Mar)
    if (inRange('09-11', '09-15')) return 'apple_event';

    // ── BASE (padrão anual) ────────────────────────────
    return 'base';
}

/**
 * Calcula range do Black Friday (10 dias antes até a última sexta de Nov)
 */
function getBlackFridayRange(year) {
    const nov30 = new Date(year, 10, 30);
    const dayOfWeek = nov30.getDay();
    const lastFriday = new Date(nov30);
    lastFriday.setDate(30 - (dayOfWeek === 5 ? 0 : (dayOfWeek + 2) % 7));
    const start = new Date(lastFriday);
    start.setDate(lastFriday.getDate() - 10);
    const fmt = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { start: fmt(start), end: fmt(lastFriday) };
}

/**
 * Calcula range do Dia das Mães (2º domingo de maio, ativação 7 dias antes)
 */
function getMothersDayRange(year) {
    const may1 = new Date(year, 4, 1);
    const firstSunday = 7 - may1.getDay();
    const secondSunday = firstSunday + 7;
    const mothersSunday = new Date(year, 4, secondSunday);
    const start = new Date(mothersSunday);
    start.setDate(mothersSunday.getDate() - 7);
    const fmt = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { start: fmt(start), end: fmt(mothersSunday) };
}
