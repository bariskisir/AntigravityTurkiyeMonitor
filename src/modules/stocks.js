import { scrape } from '../utils/browser.js';

export async function fetch() {
    const [scrapedIndices, bistIndex] = await Promise.all([
        scrapeIndices(),
        scrapeBist()
    ]);

    const indices = scrapedIndices || [];
    if (bistIndex && !indices.find(i => i.name.includes('BIST'))) {
        indices.unshift(bistIndex);
    }

    const targets = ['BIST 100', 'Nasdaq', 'S&P 500', 'Dow Jones', 'DAX', 'Nikkei 225', 'FTSE 100'];
    const filtered = [];

    for (const t of targets) {
        const found = indices.find(i => i.name.toLowerCase().includes(t.toLowerCase()));
        if (found) filtered.push(found);
    }

    if (filtered.length < 5) {
        for (const i of indices) {
            if (!filtered.find(f => f.name === i.name)) filtered.push(i);
            if (filtered.length >= 7) break;
        }
    }

    if (filtered.length === 0) {
        throw new Error('No stock indices data found');
    }

    return filtered.slice(0, 7);
}

async function scrapeIndices() {
    try {
        return await scrape(
            'https://www.investing.com/indices/major-indices',
            () => {
                const data = [];
                const rows = document.querySelectorAll('table tbody tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 7) return;
                    const name = cells[1]?.innerText?.trim()?.split('\n')[0];
                    const last = cells[2]?.innerText?.trim();
                    const changePercent = cells[6]?.innerText?.trim();
                    if (name && last) data.push({ name, last, changePercent });
                });
                return data;
            },
            'table tbody tr'
        );
    } catch (_) {
        return [];
    }
}

async function scrapeBist() {
    try {
        return await scrape(
            'https://www.investing.com/indices/ise-100',
            () => {
                const last = document.querySelector('[data-test="instrument-price-last"]')?.innerText?.trim();
                const cp = document.querySelector('[data-test="instrument-price-change-percent"]')?.innerText?.trim();
                if (last) return { name: 'BIST 100', last, changePercent: cp };
                return null;
            },
            '[data-test="instrument-price-last"]'
        );
    } catch (_) {
        return null;
    }
}
