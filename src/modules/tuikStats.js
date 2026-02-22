import http from '../utils/http.js';

export async function fetch() {
    const res = await http.get('https://veriportali.tuik.gov.tr/api/tr/press/indicators', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });

    const body = res.data;
    const items = body.data || body;

    const cpiItem = items.find(i => {
        const title = i.graphics?.[0]?.title || '';
        return title.includes('Tüketici Fiyat Endeksi');
    });

    const unemploymentItem = items.find(i => {
        const title = i.graphics?.[0]?.title || '';
        return title.includes('İşsizlik');
    });

    const result = {};

    if (cpiItem) {
        result.cpi = {
            value: cpiItem.value,
            period: cpiItem.date
        };
    }

    if (unemploymentItem) {
        result.unemployment = {
            value: unemploymentItem.value,
            period: unemploymentItem.date
        };
    }

    if (!result.cpi && !result.unemployment) {
        throw new Error('No TUIK indicators found');
    }

    return result;
}
