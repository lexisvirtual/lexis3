const UTM_KEYS = ['utm_campaign', 'utm_medium', 'utm_source', 'utm_term', 'utm_content'];
const STORAGE_KEY = 'lexis_utm_params';

export function captureUtmParams() {
    try {
        const params = new URLSearchParams(window.location.search);
        const found = {};
        let hasAny = false;
        UTM_KEYS.forEach(key => {
            const value = params.get(key);
            if (value) {
                found[key] = value;
                hasAny = true;
            }
        });
        if (hasAny) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
        }
    } catch (e) {}
}

export function getUtmParams() {
    const empty = UTM_KEYS.reduce((acc, key) => ({ ...acc, [key]: '' }), {});
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...empty, ...JSON.parse(stored) };
        }
    } catch (e) {}
    return empty;
}
