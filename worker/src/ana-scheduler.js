/**
 * Ana Theme Scheduler
 * Determina qual tema JSON deve estar ativo com base na data atual.
 * Chamado pelo endpoint /theme-sync no Worker.
 *
 * Regras:
 * - Máximo 6 ativações nível 3 por ano
 * - Mínimo 10 dias base após nível 3 / 5 dias após nível 2
 * - hero_only obrigatório quando intensity >= 2
 */

export function getActiveThemeName(date = new Date()) {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Helper: verifica se mmdd está dentro de um range (suporta virada de ano)
    const inRange = (start, end) => {
        if (start <= end) return mmdd >= start && mmdd <= end;
        return mmdd >= start || mmdd <= end; // virada de ano ex: 12-26 a 01-05
    };

    // Ordem de prioridade: Campaign > Seasonal > Base

    // ── CAMPAIGN (nível 3) ──────────────────────────────
    if (inRange('12-26', '01-05')) return 'new_year';
    if (inRange('12-10', '12-25')) return 'christmas';
    if (inRange('10-24', '10-31')) return 'halloween';

    // Black Friday: 10 dias antes da última sexta de novembro
    const blackFridayStart = getBlackFridayRange(date.getFullYear());
    if (inRange(blackFridayStart.start, blackFridayStart.end)) return 'black_friday';

    // Independence Day USA
    if (inRange('06-25', '07-05')) return 'independence_us';

    // ── SEASONAL (nível 2) ─────────────────────────────
    if (inRange('09-01', '09-10')) return 'independence_br';
    if (inRange('06-05', '06-12')) return 'valentine_br';
    if (inRange('02-07', '02-15')) return 'valentine_us';

    // Carnaval: 7 dias antes (approx primeira semana de fev/março - cobre janela fixa)
    if (inRange('02-08', '03-05')) return 'carnival';

    // Dia das Mães: 2º domingo de Maio BR+EUA - ativação 7 dias antes
    const mothersDayRange = getMothersDayRange(date.getFullYear());
    if (inRange(mothersDayRange.start, mothersDayRange.end)) return 'mothers_day';

    // ── BASE (padrão anual) ────────────────────────────
    return 'base';
}

/**
 * Calcula range do Black Friday (10 dias antes até a data)
 */
function getBlackFridayRange(year) {
    // Última sexta de novembro
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
